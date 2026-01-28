using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Books;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.ImportLists.Exclusions;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.Parser;
using Readarr.Api.V1.Books;
using Readarr.Http;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Author
{
    [V1ApiController("author/{authorId:int}/books")]
    public class AuthorBooksController : Controller
    {
        private readonly IAddBookService _addBookService;
        private readonly IAuthorService _authorService;
        private readonly IBookService _bookService;
        private readonly IConfigService _configService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IProvideAuthorInfo _authorInfo;
        private readonly IImportListExclusionService _importListExclusionService;
        private readonly IUserLibraryService _userLibraryService;
        private readonly IUserService _userService;

        public AuthorBooksController(IAddBookService addBookService,
                                     IAuthorService authorService,
                                     IBookService bookService,
                                     IConfigService configService,
                                     IMapCoversToLocal coverMapper,
                                     IProvideAuthorInfo authorInfo,
                                     IImportListExclusionService importListExclusionService,
                                     IUserLibraryService userLibraryService,
                                     IUserService userService)
        {
            _addBookService = addBookService;
            _authorService = authorService;
            _bookService = bookService;
            _configService = configService;
            _coverMapper = coverMapper;
            _authorInfo = authorInfo;
            _importListExclusionService = importListExclusionService;
            _userLibraryService = userLibraryService;
            _userService = userService;
        }

        [HttpGet]
        public PagingResource<BookResource> GetAvailable(int authorId, [FromQuery] PagingRequestResource paging)
        {
            var author = _authorService.GetAuthor(authorId);
            var books = GetAvailableBooks(author);
            var authorFiltered = FilterByAuthorName(books, author.Metadata?.Value?.Name ?? author.Name);
            if (authorFiltered.Any())
            {
                books = authorFiltered;
            }

            var languageFiltered = FilterByUiLanguage(books);
            if (languageFiltered.Any())
            {
                books = languageFiltered;
            }

            var coverFiltered = FilterByCoverPresence(books);
            if (coverFiltered.Any())
            {
                books = coverFiltered;
            }

            var pagingResource = new PagingResource<BookResource>(paging);
            var totalRecords = books.Count;
            var pageSize = pagingResource.PageSize;
            var totalPages = totalRecords == 0
                ? 1
                : (int)Math.Ceiling((decimal)totalRecords / pageSize);
            var page = pagingResource.Page;

            if (page < 1)
            {
                page = 1;
            }

            if (page > totalPages)
            {
                page = totalPages;
            }

            var records = books
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return new PagingResource<BookResource>
            {
                Page = page,
                PageSize = pageSize,
                SortKey = pagingResource.SortKey,
                SortDirection = pagingResource.SortDirection,
                TotalRecords = totalRecords,
                Records = MapToResource(records)
            };
        }

        [HttpPost]
        public ActionResult<List<BookResource>> AddBooks(int authorId, [FromBody] AuthorBooksAddResource resource)
        {
            var author = _authorService.GetAuthor(authorId);
            var books = GetAvailableBooks(author);

            var foreignIds = resource?.ForeignBookIds?
                .Where(id => id.IsNotNullOrWhiteSpace())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (foreignIds == null || foreignIds.Count == 0)
            {
                return BadRequest("foreignBookIds is required");
            }

            if (foreignIds.Any())
            {
                var selectedIds = new HashSet<string>(foreignIds, StringComparer.OrdinalIgnoreCase);
                books = books.Where(book => selectedIds.Contains(book.ForeignBookId)).ToList();
            }

            if (!books.Any())
            {
                return BadRequest("No matching books were found for the selected IDs.");
            }

            if (resource?.SearchForNewBook == true)
            {
                books.ForEach(book => book.AddOptions.SearchForNewBook = true);
            }

            books.ForEach(book => book.Monitored = true);

            var authorMetadata = author.Metadata?.Value;
            if (authorMetadata != null)
            {
                foreach (var book in books)
                {
                    book.AuthorMetadata = authorMetadata;
                    book.AuthorMetadataId = authorMetadata.Id;
                    book.Author = author;
                }
            }

            var added = _addBookService.AddBooks(books);
            var user = GetCurrentUser();

            foreach (var book in added)
            {
                _userLibraryService.AddOrGetUserBook(user.Id, book.Id, true, true);
            }

            return Ok(MapToResource(added));
        }

        [HttpPost("exclude")]
        public IActionResult ExcludeBooks(int authorId, [FromBody] AuthorBooksExcludeResource resource)
        {
            var author = _authorService.GetAuthor(authorId);

            if (resource?.ForeignBookIds == null || !resource.ForeignBookIds.Any())
            {
                return Ok(new { removedCount = 0 });
            }

            var remoteAuthor = _authorInfo.GetAuthorInfo(author.Metadata.Value.ForeignAuthorId, true);
            var remoteBooks = remoteAuthor?.Books?.Value ?? new List<Book>();
            var lookup = remoteBooks.ToDictionary(book => book.ForeignBookId, book => book);
            var removedCount = 0;

            foreach (var foreignId in resource.ForeignBookIds.Distinct())
            {
                if (_importListExclusionService.FindByForeignId(foreignId) != null)
                {
                    continue;
                }

                var title = lookup.TryGetValue(foreignId, out var book) ? book.Title : foreignId;

                _importListExclusionService.Add(new ImportListExclusion
                {
                    ForeignId = foreignId,
                    Name = $"{author.Name} - {title}"
                });

                removedCount++;
            }

            return Ok(new { removedCount });
        }

        private List<Book> GetAvailableBooks(NzbDrone.Core.Books.Author author)
        {
            var foreignAuthorId = author?.Metadata?.Value?.ForeignAuthorId;
            if (foreignAuthorId.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            var remoteAuthor = _authorInfo.GetAuthorInfo(foreignAuthorId, true);
            if (remoteAuthor?.Books?.Value == null)
            {
                return new List<Book>();
            }

            var existingBookIds = _bookService.GetBooksByAuthor(author.Id)
                .Select(book => book.ForeignBookId)
                .Where(id => id.IsNotNullOrWhiteSpace())
                .ToHashSet();

            var available = remoteAuthor.Books.Value
                .Where(book => book?.ForeignBookId.IsNotNullOrWhiteSpace() == true)
                .Where(book => !existingBookIds.Contains(book.ForeignBookId))
                .OrderByDescending(book => book.ReleaseDate ?? DateTime.MinValue)
                .ToList();

            if (!available.Any())
            {
                return available;
            }

            var excluded = _importListExclusionService
                .FindByForeignId(available.Select(book => book.ForeignBookId).ToList())
                .Select(exclusion => exclusion.ForeignId)
                .ToHashSet();

            return available.Where(book => !excluded.Contains(book.ForeignBookId)).ToList();
        }

        private List<Book> FilterByAuthorName(List<Book> books, string authorName)
        {
            if (books == null || books.Count == 0 || authorName.IsNullOrWhiteSpace())
            {
                return books;
            }

            var expectedTokens = NormalizeAuthorTokens(authorName);
            if (expectedTokens.Count == 0)
            {
                return books;
            }

            var filtered = books
                .Where(book => AuthorNameMatches(expectedTokens, book.AuthorMetadata?.Value?.Name ?? book.Author?.Value?.Metadata?.Value?.Name))
                .ToList();

            return filtered;
        }

        private List<Book> FilterByUiLanguage(List<Book> books)
        {
            if (books == null || books.Count == 0)
            {
                return books;
            }

            var isoLanguage = IsoLanguages.Get((Language)_configService.UILanguage) ?? IsoLanguages.Get(Language.English);
            if (isoLanguage == null)
            {
                return books;
            }

            var filtered = books
                .Where(book => book.Editions?.Value?.Any(edition => LanguageMatches(edition?.Language, isoLanguage)) == true)
                .ToList();

            return filtered;
        }

        private List<Book> FilterByCoverPresence(List<Book> books)
        {
            if (books == null || books.Count == 0)
            {
                return books;
            }

            var filtered = books
                .Where(book => book.Editions?.Value?.Any(edition => edition?.Images?.Any() == true) == true)
                .ToList();

            return filtered;
        }

        private static List<string> NormalizeAuthorTokens(string authorName)
        {
            var normalized = new string(authorName
                .Where(c => char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
                .ToArray());

            return normalized
                .ToLowerInvariant()
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .ToList();
        }

        private static bool AuthorNameMatches(IEnumerable<string> expectedTokens, string candidateName)
        {
            if (candidateName.IsNullOrWhiteSpace())
            {
                return false;
            }

            var candidateTokens = NormalizeAuthorTokens(candidateName);
            if (candidateTokens.Count == 0)
            {
                return false;
            }

            return expectedTokens.All(token => candidateTokens.Contains(token));
        }

        private static bool LanguageMatches(string editionLanguage, IsoLanguage uiLanguage)
        {
            if (editionLanguage.IsNullOrWhiteSpace())
            {
                return false;
            }

            var normalized = editionLanguage.Trim().Replace('_', '-').ToLowerInvariant();
            var uiTwoLetter = uiLanguage.TwoLetterCode?.ToLowerInvariant();
            var uiThreeLetter = uiLanguage.ThreeLetterCode?.ToLowerInvariant();
            var uiName = uiLanguage.EnglishName?.ToLowerInvariant();

            if (normalized == uiTwoLetter ||
                normalized == uiThreeLetter ||
                normalized == uiName)
            {
                return true;
            }

            if (uiTwoLetter.IsNotNullOrWhiteSpace() && normalized.StartsWith(uiTwoLetter + "-"))
            {
                return true;
            }

            var iso = IsoLanguages.Find(normalized);
            return iso != null && iso.Language == uiLanguage.Language;
        }

        private List<BookResource> MapToResource(IEnumerable<Book> books)
        {
            return books.Select(MapToResource).ToList();
        }

        private BookResource MapToResource(Book book)
        {
            var resource = book.ToResource();

            _coverMapper.ConvertToLocalUrls(resource.Id, MediaCoverEntity.Book, resource.Images);
            if (resource.Id == 0)
            {
                UseRemoteCoverUrls(resource.Images);
            }

            var cover = resource.Images.FirstOrDefault(c => c.CoverType == MediaCoverTypes.Cover);

            if (cover != null)
            {
                resource.RemoteCover = cover.RemoteUrl;
            }

            return resource;
        }

        private static void UseRemoteCoverUrls(IEnumerable<MediaCover> covers)
        {
            if (covers == null)
            {
                return;
            }

            foreach (var cover in covers)
            {
                if (cover.RemoteUrl.IsNotNullOrWhiteSpace())
                {
                    cover.Url = cover.RemoteUrl;
                }
            }
        }

        private User GetCurrentUser()
        {
            var user = _userService.FindUser(HttpContext?.User);

            if (user == null)
            {
                throw new UnauthorizedException("User is not authenticated.");
            }

            return user;
        }
    }
}
