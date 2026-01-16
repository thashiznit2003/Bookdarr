using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;
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
        private readonly IMapCoversToLocal _coverMapper;

        public UserLibraryController(IUserService userService,
                                     IUserLibraryService libraryService,
                                     IBookService bookService,
                                     IMapCoversToLocal coverMapper)
        {
            _userService = userService;
            _libraryService = libraryService;
            _bookService = bookService;
            _coverMapper = coverMapper;
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

        [HttpGet("pool")]
        public ActionResult<List<BookPoolResource>> GetBookPool()
        {
            var user = GetCurrentUser();
            var books = _libraryService.GetBooksInPool();

            var resources = books.Select(book =>
            {
                try
                {
                    _coverMapper.EnsureBookCovers(book);
                }
                catch
                {
                    // ignore cover download issues so the pool still loads
                }

                var resource = MapPool(book, user.Id);

                if (resource.Book?.Images != null)
                {
                    _coverMapper.ConvertToLocalUrls(book.Id, MediaCoverEntity.Book, resource.Book.Images);
                }

                return resource;
            }).ToList();

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

        private BookPoolResource MapPool(Book book, int userId)
        {
            var userBook = _libraryService.GetUserBook(userId, book.Id);

            return new BookPoolResource
            {
                Id = book.Id,
                Book = book.ToResource(),
                Status = _libraryService.GetPoolStatus(book.Id, true, true),
                HasEbook = _libraryService.PoolHasMedia(book.Id, BookFileMediaType.Ebook),
                HasAudiobook = _libraryService.PoolHasMedia(book.Id, BookFileMediaType.Audiobook),
                InMyLibrary = userBook != null
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
