using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.AuthorStats;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles;
using Readarr.Http;
using Readarr.Http.REST;
using ModelNotFoundException = NzbDrone.Core.Datastore.ModelNotFoundException;

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

        public UserLibraryController(IUserService userService,
                                     IUserLibraryService libraryService,
                                     IBookService bookService,
                                     IBookPoolMapper bookPoolMapper,
                                     IAuthorStatisticsService authorStatisticsService)
        {
            _userService = userService;
            _libraryService = libraryService;
            _bookService = bookService;
            _bookPoolMapper = bookPoolMapper;
            _authorStatisticsService = authorStatisticsService;
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

        [HttpGet("pool")]
        public ActionResult<List<BookPoolResource>> GetBookPool()
        {
            var user = GetCurrentUser();
            return _bookPoolMapper.GetPool(user.Id);
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
            var books = _bookService.GetBooks(bookIds);

            var resources = books.ToResource();

            // Populate statistics (includes ebook/audiobook counts)
            var authorStats = _authorStatisticsService.AuthorStatistics();
            var statsDict = authorStats.SelectMany(x => x.BookStatistics).ToDictionary(x => x.BookId);

            foreach (var resource in resources)
            {
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
                PoolHasBook = _libraryService.IsBookAvailableInPool(book.Id)
            };
        }

        private User GetCurrentUser()
        {
            var user = _userService.FindUser(HttpContext?.User);

            if (user == null)
            {
                throw new ModelNotFoundException(typeof(User), 0);
            }

            return user;
        }
    }
}
