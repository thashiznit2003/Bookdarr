using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.AuthorStats;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.RootFolders;
using NzbDrone.Http.REST.Attributes;
using Readarr.Api.V1.Author;
using Readarr.Http;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Books
{
    [V1ApiController("user/library")]
    public class UserLibraryController : RestController<UserLibraryResource>
    {
        private readonly IUserService _userService;
        private readonly IUserLibraryService _libraryService;
        private readonly IBookService _bookService;
        private readonly IBookPoolMapper _bookPoolMapper;
        private readonly IAuthorStatisticsService _authorStatisticsService;
        private readonly IAuthorService _authorService;
        private readonly IAuthorExtraMetadataProvider _authorExtraMetadataProvider;
        private readonly IAuthorMetadataService _authorMetadataService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IRootFolderService _rootFolderService;

        public UserLibraryController(IUserService userService,
                                     IUserLibraryService libraryService,
                                     IBookService bookService,
                                     IBookPoolMapper bookPoolMapper,
                                     IAuthorStatisticsService authorStatisticsService,
                                     IAuthorService authorService,
                                     IAuthorExtraMetadataProvider authorExtraMetadataProvider,
                                     IAuthorMetadataService authorMetadataService,
                                     IMapCoversToLocal coverMapper,
                                     IRootFolderService rootFolderService)
        {
            _userService = userService;
            _libraryService = libraryService;
            _bookService = bookService;
            _bookPoolMapper = bookPoolMapper;
            _authorStatisticsService = authorStatisticsService;
            _authorService = authorService;
            _authorExtraMetadataProvider = authorExtraMetadataProvider;
            _authorMetadataService = authorMetadataService;
            _coverMapper = coverMapper;
            _rootFolderService = rootFolderService;
        }

        [HttpGet]
        public ActionResult<List<UserLibraryResource>> GetUserLibrary()
        {
            var user = GetCurrentUser();
            var userBooks = _libraryService.GetUserLibrary(user.Id);

            var resources = userBooks.Select(MapUserBook).ToList();
            return resources;
        }

        [HttpPost]
        public ActionResult<UserLibraryResource> AddToLibrary(UserLibraryResource resource)
        {
            var user = GetCurrentUser();

            var userBook = _libraryService.AddOrGetUserBook(user.Id, resource.BookId, resource.WantsEbook, resource.WantsAudiobook);
            var mapped = MapUserBook(userBook);

            return Created(mapped.Id);
        }

        [HttpDelete("{bookId:int}")]
        public ActionResult RemoveFromLibrary(int bookId)
        {
            var user = GetCurrentUser();

            _libraryService.RemoveUserBook(user.Id, bookId);

            return NoContent();
        }

        [HttpPut("{bookId:int}/rating")]
        [SkipValidation]
        public ActionResult<UserLibraryResource> SetUserRating(int bookId, [FromBody] UserLibraryResource resource)
        {
            if (bookId <= 0)
            {
                return BadRequest("bookId is required");
            }

            if (resource == null)
            {
                return BadRequest("userRating is required");
            }

            var user = GetCurrentUser();
            var updated = _libraryService.SetUserRating(user.Id, bookId, resource?.UserRating);

            return Accepted(MapUserBook(updated));
        }

        [HttpGet("pool")]
        public ActionResult<List<BookPoolResource>> GetBookPool()
        {
            var user = GetCurrentUser();
            return _bookPoolMapper.GetPool(user.Id);
        }

        [HttpGet("pool/authors")]
        public ActionResult<List<AuthorResource>> GetBookPoolAuthors()
        {
            var books = _bookService.GetAllBooks();
            var authorIds = books.Select(book => book.AuthorId)
                .Where(authorId => authorId != 0)
                .Distinct()
                .ToList();

            if (!authorIds.Any())
            {
                return new List<AuthorResource>();
            }

            var authors = _authorService.GetAuthors(authorIds);
            foreach (var author in authors)
            {
                EnsureAuthorExtras(author);
            }

            var authorResources = authors.ToResource();
            MapCoversToLocal(authorResources.ToArray());
            LinkNextPreviousBooks(authorResources.ToArray());
            LinkAuthorStatistics(authorResources, _authorStatisticsService.AuthorStatistics().ToDictionary(x => x.AuthorId));
            LinkRootFolderPath(authorResources.ToArray());

            return authorResources;
        }

        [HttpGet("books")]
        public ActionResult<List<BookResource>> GetUserLibraryBooks()
        {
            var user = GetCurrentUser();
            var userBooks = _libraryService.GetUserLibrary(user.Id);

            if (userBooks == null || !userBooks.Any())
            {
                return new List<BookResource>();
            }

            var bookIds = userBooks.Select(x => x.BookId).Distinct().ToList();
            var books = _bookService.GetBooks(bookIds, allowMissing: true);

            var resources = books.ToResource();
            var userBookById = userBooks.ToDictionary(x => x.BookId);

            // Populate statistics (includes ebook/audiobook counts)
            var authorStats = _authorStatisticsService.AuthorStatistics();
            var statsDict = authorStats.SelectMany(x => x.BookStatistics).ToDictionary(x => x.BookId);

            foreach (var resource in resources)
            {
                if (userBookById.TryGetValue(resource.Id, out var userBook))
                {
                    resource.UserRating = userBook.UserRating;
                }

                if (statsDict.TryGetValue(resource.Id, out var stats))
                {
                    resource.Statistics = stats.ToResource();
                }
            }

            return resources;
        }

        protected override UserLibraryResource GetResourceById(int id)
        {
            var user = GetCurrentUser();
            var userBook = _libraryService.GetUserBookById(id, user.Id);

            return MapUserBook(userBook);
        }

        private UserLibraryResource MapUserBook(UserBook userBook)
        {
            var book = _bookService.GetBook(userBook.BookId);

            return new UserLibraryResource
            {
                Id = userBook.Id,
                BookId = book.Id,
                Book = book.ToResource(),
                Status = userBook.Status,
                WantsEbook = userBook.WantsEbook,
                WantsAudiobook = userBook.WantsAudiobook,
                HasEbook = _libraryService.UserBookHasMedia(userBook, BookFileMediaType.Ebook),
                HasAudiobook = _libraryService.UserBookHasMedia(userBook, BookFileMediaType.Audiobook),
                PoolHasBook = _libraryService.IsBookAvailableInPool(book.Id),
                UserRating = userBook.UserRating
            };
        }

        private void MapCoversToLocal(params AuthorResource[] authors)
        {
            foreach (var authorResource in authors)
            {
                _coverMapper.ConvertToLocalUrls(authorResource.Id, MediaCoverEntity.Author, authorResource.Images);
            }
        }

        private void EnsureAuthorExtras(NzbDrone.Core.Books.Author author)
        {
            var metadata = author?.Metadata?.Value;
            if (metadata == null)
            {
                return;
            }

            metadata.Images ??= new List<MediaCover>();
            metadata.Links ??= new List<Links>();

            var hasPoster = metadata.Images.Any(x => x.CoverType == MediaCoverTypes.Poster && x.Url.IsNotNullOrWhiteSpace());
            var needsOverview = metadata.Overview.IsNullOrWhiteSpace();
            var hasWikipediaLink = metadata.Links.Any(x =>
                x.Url.IsNotNullOrWhiteSpace() &&
                x.Url.Contains("wikipedia.org", StringComparison.OrdinalIgnoreCase));

            if (hasPoster && !needsOverview && hasWikipediaLink)
            {
                return;
            }

            var extras = _authorExtraMetadataProvider.GetAuthorExtraMetadata(metadata.Name);
            if (extras == null)
            {
                return;
            }

            var changed = false;

            if (!hasPoster && extras.ImageUrl.IsNotNullOrWhiteSpace())
            {
                metadata.Images.Add(new MediaCover
                {
                    Url = extras.ImageUrl,
                    CoverType = MediaCoverTypes.Poster
                });
                changed = true;
            }

            if (needsOverview && extras.Overview.IsNotNullOrWhiteSpace())
            {
                metadata.Overview = extras.Overview;
                changed = true;
            }

            if (extras.Links != null)
            {
                foreach (var link in extras.Links)
                {
                    if (link?.Url.IsNullOrWhiteSpace() ?? true)
                    {
                        continue;
                    }

                    if (metadata.Links.Any(x => x.Url.Equals(link.Url, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    metadata.Links.Add(link);
                    changed = true;
                }
            }

            if (changed)
            {
                _authorMetadataService.Upsert(metadata);
            }
        }

        private void LinkNextPreviousBooks(params AuthorResource[] authors)
        {
            var nextBooks = _bookService.GetNextBooksByAuthorMetadataId(authors.Select(x => x.AuthorMetadataId));
            var lastBooks = _bookService.GetLastBooksByAuthorMetadataId(authors.Select(x => x.AuthorMetadataId));

            foreach (var authorResource in authors)
            {
                authorResource.NextBook = nextBooks.FirstOrDefault(x => x.AuthorMetadataId == authorResource.AuthorMetadataId);
                authorResource.LastBook = lastBooks.FirstOrDefault(x => x.AuthorMetadataId == authorResource.AuthorMetadataId);
            }
        }

        private void LinkAuthorStatistics(List<AuthorResource> resources, Dictionary<int, AuthorStatistics> authorStatistics)
        {
            foreach (var author in resources)
            {
                if (authorStatistics.TryGetValue(author.Id, out var stats))
                {
                    author.Statistics = stats.ToResource();
                }
            }
        }

        private void LinkRootFolderPath(params AuthorResource[] authors)
        {
            var rootFolders = _rootFolderService.All();

            foreach (var author in authors)
            {
                author.RootFolderPath = _rootFolderService.GetBestRootFolderPath(author.Path, rootFolders);
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
