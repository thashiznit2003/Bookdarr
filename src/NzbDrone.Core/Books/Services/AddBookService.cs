using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.ImportLists.Exclusions;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource;

namespace NzbDrone.Core.Books
{
    public interface IAddBookService
    {
        Book AddBook(Book book, bool doRefresh = true);
        List<Book> AddBooks(List<Book> books, bool doRefresh = true);
    }

    public class AddBookService : IAddBookService
    {
        private readonly IAuthorService _authorService;
        private readonly IAddAuthorService _addAuthorService;
        private readonly IBookService _bookService;
        private readonly IProvideBookInfo _bookInfo;
        private readonly IImportListExclusionService _importListExclusionService;
        private readonly IMapCoversToLocal _mediaCoverService;
        private readonly Logger _logger;

        public AddBookService(IAuthorService authorService,
                               IAddAuthorService addAuthorService,
                               IBookService bookService,
                               IProvideBookInfo bookInfo,
                               IImportListExclusionService importListExclusionService,
                               IMapCoversToLocal mediaCoverService,
                               Logger logger)
        {
            _authorService = authorService;
            _addAuthorService = addAuthorService;
            _bookService = bookService;
            _bookInfo = bookInfo;
            _importListExclusionService = importListExclusionService;
            _mediaCoverService = mediaCoverService;
            _logger = logger;
        }

        public Book AddBook(Book book, bool doRefresh = true)
        {
            _logger.Debug($"Adding book {book}");

            book = AddSkyhookData(book);

            // we allow adding extra editions, so check if the book already exists
            var dbBook = _bookService.FindById(book.ForeignBookId);
            if (dbBook != null)
            {
                book.UseDbFieldsFrom(dbBook);
            }

            // Remove any import list exclusions preventing addition
            _importListExclusionService.Delete(book.ForeignBookId);
            _importListExclusionService.Delete(book.AuthorMetadata.Value.ForeignAuthorId);

            // Note it's a manual addition so it's not deleted on next refresh
            book.AddOptions.AddType = BookAddType.Manual;

            var editions = book.Editions?.Value;
            if (editions == null || editions.Count == 0)
            {
                editions = new List<Edition>
                {
                    new Edition
                    {
                        ForeignEditionId = book.ForeignBookId,
                        Title = book.Title,
                        TitleSlug = book.TitleSlug,
                        Ratings = new Ratings { Votes = 0, Value = 0 },
                        Monitored = true
                    }
                };
                book.Editions = editions;
            }

            var monitoredEdition = editions.FirstOrDefault(x => x.Monitored) ?? editions.FirstOrDefault();
            if (monitoredEdition != null)
            {
                editions.ForEach(x => x.Monitored = false);
                monitoredEdition.Monitored = true;
                monitoredEdition.ManualAdd = true;
            }

            // Add the author if necessary
            var dbAuthor = _authorService.FindById(book.AuthorMetadata.Value.ForeignAuthorId);
            if (dbAuthor == null)
            {
                var author = book.Author.Value;

                author.Metadata.Value.ForeignAuthorId = book.AuthorMetadata.Value.ForeignAuthorId;

                dbAuthor = _addAuthorService.AddAuthor(author, false);
            }

            book.Author = dbAuthor;
            book.AuthorMetadataId = dbAuthor.AuthorMetadataId;
            var shouldRefresh = doRefresh && book.AddOptions.AddType != BookAddType.Manual;
            _bookService.AddBook(book, shouldRefresh);

            _mediaCoverService.EnsureBookCovers(book);

            return book;
        }

        public List<Book> AddBooks(List<Book> books, bool doRefresh = true)
        {
            var added = DateTime.UtcNow;
            var addedBooks = new List<Book>();

            foreach (var a in books)
            {
                a.Added = added;
                try
                {
                    addedBooks.Add(AddBook(a, doRefresh));
                }
                catch (Exception ex)
                {
                    // Could be a bad id from an import list
                    _logger.Error(ex, "Failed to import id: {0} - {1}", a.ForeignBookId.SanitizeForLog(), a.Title.SanitizeForLog()); // lgtm [cs/log-forging]
                }
            }

            return addedBooks;
        }

        private Book AddSkyhookData(Book newBook)
        {
            var existingAuthorMetadata = newBook.AuthorMetadata?.Value;
            var existingAuthorId = existingAuthorMetadata?.ForeignAuthorId;
            var editionId = newBook.Editions?.Value?.FirstOrDefault(x => x.Monitored)?.ForeignEditionId ??
                newBook.Editions?.Value?.FirstOrDefault()?.ForeignEditionId;

            Tuple<string, Book, List<AuthorMetadata>> tuple = null;
            try
            {
                tuple = _bookInfo.GetBookInfo(newBook.ForeignBookId);
            }
            catch (BookNotFoundException)
            {
                if (newBook?.Editions?.Value?.Any() == true && newBook.AuthorMetadata?.Value != null)
                {
                    _logger.Warn("Book with foreign ID {0} was not found by the metadata provider. Using existing metadata payload.",
                        newBook.ForeignBookId.SanitizeForLog()); // lgtm [cs/log-forging]
                    return newBook;
                }

                _logger.Error("Book with foreign ID {0} was not found by the metadata provider.", newBook.ForeignBookId.SanitizeForLog()); // lgtm [cs/log-forging]

                throw new ValidationException(new List<ValidationFailure>
                                              {
                                                  new ValidationFailure("ForeignBookId", "A book with this ID was not found", newBook.ForeignBookId)
                                              });
            }

            newBook.UseMetadataFrom(tuple.Item2);
            newBook.Added = DateTime.UtcNow;

            newBook.Editions = tuple.Item2.Editions.Value;
            newBook.Editions.Value.ForEach(x => x.Monitored = false);
            var monitoredEdition = newBook.Editions.Value.FirstOrDefault(x => x.ForeignEditionId == editionId) ??
                newBook.Editions.Value.FirstOrDefault();
            if (monitoredEdition != null)
            {
                monitoredEdition.Monitored = true;
            }

            var metadata = tuple.Item3.FirstOrDefault(x => x.ForeignAuthorId == tuple.Item1) ??
                tuple.Item2.AuthorMetadata?.Value ??
                tuple.Item2.Author?.Value?.Metadata?.Value ??
                tuple.Item3.FirstOrDefault() ??
                newBook.AuthorMetadata?.Value;

            if (metadata == null)
            {
                metadata = new AuthorMetadata
                {
                    ForeignAuthorId = newBook.Author?.Value?.ForeignAuthorId ?? "unknown",
                    Name = newBook.Author?.Value?.Name ?? "Unknown Author",
                    Status = AuthorStatusType.Continuing,
                    Ratings = new Ratings { Votes = 0, Value = 0 }
                };
            }

            if (existingAuthorMetadata != null &&
                existingAuthorId.IsNotNullOrWhiteSpace() &&
                metadata?.ForeignAuthorId.IsNotNullOrWhiteSpace() == true &&
                !string.Equals(metadata.ForeignAuthorId, existingAuthorId, StringComparison.OrdinalIgnoreCase))
            {
                _logger.Warn("Metadata author {0} does not match expected author {1} for book {2}. Using expected author.",
                    metadata.ForeignAuthorId.SanitizeForLog(),
                    existingAuthorId.SanitizeForLog(),
                    newBook.ForeignBookId.SanitizeForLog()); // lgtm [cs/log-forging]
                metadata = existingAuthorMetadata;
            }

            newBook.AuthorMetadata = metadata;

            return newBook;
        }
    }
}
