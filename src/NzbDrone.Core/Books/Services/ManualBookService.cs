using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.Books
{
    public interface IManualBookService
    {
        Book AddManualBook(ManualBookDefinition definition);
    }

    public class ManualBookService : IManualBookService
    {
        private const string DefaultAuthorName = "Unknown Author";
        private const string DefaultBookTitle = "Untitled Book";
        private const string ManualAuthorPrefix = "manual-author-";
        private const string ManualBookPrefix = "manual-book-";
        private const string ManualEditionPrefix = "manual-edition-";

        private readonly IAuthorService _authorService;
        private readonly IAuthorMetadataService _authorMetadataService;
        private readonly IBookService _bookService;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly IAddAuthorValidator _addAuthorValidator;
        private readonly IMapCoversToLocal _mediaCoverService;
        private readonly Logger _logger;

        public ManualBookService(IAuthorService authorService,
                                 IAuthorMetadataService authorMetadataService,
                                 IBookService bookService,
                                 IBuildFileNames fileNameBuilder,
                                 IAddAuthorValidator addAuthorValidator,
                                 IMapCoversToLocal mediaCoverService,
                                 Logger logger)
        {
            _authorService = authorService;
            _authorMetadataService = authorMetadataService;
            _bookService = bookService;
            _fileNameBuilder = fileNameBuilder;
            _addAuthorValidator = addAuthorValidator;
            _mediaCoverService = mediaCoverService;
            _logger = logger;
        }

        public Book AddManualBook(ManualBookDefinition definition)
        {
            if (definition == null)
            {
                throw new ArgumentNullException(nameof(definition));
            }

            var title = definition.Title?.Trim();
            if (title.IsNullOrWhiteSpace())
            {
                title = DefaultBookTitle;
            }

            var authorName = definition.AuthorName?.Trim();
            if (authorName.IsNullOrWhiteSpace())
            {
                authorName = DefaultAuthorName;
            }

            var author = FindOrCreateAuthor(authorName, definition);
            var book = BuildManualBook(definition, title, author);

            _logger.Info("Adding manual book {0} for author {1}", title, author.Name);

            _bookService.AddBook(book, false);
            _mediaCoverService.EnsureBookCovers(book);

            return book;
        }

        private Author FindOrCreateAuthor(string authorName, ManualBookDefinition definition)
        {
            var cleanName = authorName.CleanAuthorName();
            var existing = _authorService.FindByName(cleanName) ?? _authorService.FindByNameInexact(authorName);

            if (existing != null)
            {
                return existing;
            }

            if (definition.RootFolderPath.IsNullOrWhiteSpace())
            {
                throw new ValidationException(new List<ValidationFailure>
                {
                    new ValidationFailure("RootFolderPath", "Root folder is required")
                });
            }

            var metadata = BuildAuthorMetadata(authorName);
            _authorMetadataService.Upsert(metadata);

            var author = BuildAuthor(definition, metadata);
            var validationResult = _addAuthorValidator.Validate(author);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            _authorService.AddAuthor(author, false);
            return author;
        }

        private AuthorMetadata BuildAuthorMetadata(string authorName)
        {
            var nameLastFirst = authorName.ToLastFirst();
            var manualAuthorId = ManualAuthorPrefix + Guid.NewGuid().ToString("N");

            return new AuthorMetadata
            {
                ForeignAuthorId = manualAuthorId,
                TitleSlug = manualAuthorId,
                Name = authorName,
                NameLastFirst = nameLastFirst,
                SortName = authorName.ToLowerInvariant(),
                SortNameLastFirst = nameLastFirst?.ToLowerInvariant(),
                Status = AuthorStatusType.Continuing,
                Images = new List<MediaCover.MediaCover>(),
                Links = new List<Links>(),
                Genres = new List<string>(),
                Ratings = new Ratings()
            };
        }

        private Author BuildAuthor(ManualBookDefinition definition, AuthorMetadata metadata)
        {
            var author = new Author
            {
                Metadata = metadata,
                AuthorMetadataId = metadata.Id,
                RootFolderPath = definition.RootFolderPath,
                QualityProfileId = definition.QualityProfileId,
                MetadataProfileId = definition.MetadataProfileId,
                Tags = definition.Tags ?? new HashSet<int>(),
                Monitored = true,
                MonitorNewItems = definition.MonitorNewItems,
                AddOptions = new AddAuthorOptions
                {
                    Monitor = definition.Monitor,
                    SearchForMissingBooks = false
                },
                Added = DateTime.UtcNow
            };

            author.Path = ResolveAuthorPath(author);
            author.CleanName = metadata.Name.CleanAuthorName();

            if (author.AddOptions?.Monitor == MonitorTypes.None)
            {
                author.Monitored = false;
            }

            return author;
        }

        private string ResolveAuthorPath(Author author)
        {
            var path = author.Path;
            if (path.IsNullOrWhiteSpace())
            {
                var folderName = _fileNameBuilder.GetAuthorFolder(author);
                path = System.IO.Path.Combine(author.RootFolderPath, folderName);
            }

            if (_authorService.AuthorPathExists(path))
            {
                var disambiguation = author.Metadata.Value.Disambiguation;
                if (disambiguation.IsNotNullOrWhiteSpace())
                {
                    path += $" ({disambiguation})";
                }

                if (_authorService.AuthorPathExists(path))
                {
                    var basePath = path;
                    var i = 0;
                    do
                    {
                        i++;
                        path = basePath + $" ({i})";
                    }
                    while (_authorService.AuthorPathExists(path));
                }
            }

            return path;
        }

        private Book BuildManualBook(ManualBookDefinition definition, string title, Author author)
        {
            var manualBookId = ManualBookPrefix + Guid.NewGuid().ToString("N");
            var manualEditionId = ManualEditionPrefix + Guid.NewGuid().ToString("N");

            var book = new Book
            {
                ForeignBookId = manualBookId,
                ForeignEditionId = manualEditionId,
                TitleSlug = manualBookId,
                Title = title,
                ReleaseDate = definition.ReleaseDate,
                CleanTitle = title.CleanAuthorName(),
                Monitored = true,
                AnyEditionOk = true,
                Added = DateTime.UtcNow,
                Author = author,
                AuthorMetadata = author.Metadata.Value,
                AuthorMetadataId = author.AuthorMetadataId,
                AddOptions = new AddBookOptions
                {
                    AddType = BookAddType.Manual,
                    SearchForNewBook = false
                }
            };

            var edition = new Edition
            {
                ForeignEditionId = manualEditionId,
                TitleSlug = manualEditionId,
                Title = title,
                ReleaseDate = definition.ReleaseDate,
                Overview = definition.Overview ?? string.Empty,
                Publisher = definition.Publisher,
                Language = definition.Language,
                Format = definition.Format,
                Isbn13 = definition.Isbn13,
                Asin = definition.Asin,
                Disambiguation = definition.Disambiguation,
                PageCount = Math.Max(definition.PageCount, 0),
                IsEbook = definition.IsEbook,
                Monitored = true,
                ManualAdd = true,
                Images = new List<MediaCover.MediaCover>(),
                Links = new List<Links>(),
                Ratings = new Ratings()
            };

            book.Editions = new List<Edition> { edition };

            return book;
        }
    }
}
