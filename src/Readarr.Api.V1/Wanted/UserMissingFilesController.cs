using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MediaFiles;
using Readarr.Api.V1.Books;
using Readarr.Http;
using Readarr.Http.REST;
using ModelNotFoundException = NzbDrone.Core.Datastore.ModelNotFoundException;

namespace Readarr.Api.V1.Wanted
{
    [V1ApiController("user/wanted/missing-files")]
    public class UserMissingFilesController : RestController<UserMissingFilesResource>
    {
        private readonly IUserService _userService;
        private readonly IUserLibraryService _userLibraryService;
        private readonly IBookService _bookService;
        private readonly IMediaFileRepository _mediaFileRepository;
        private readonly IMapCoversToLocal _coverMapper;

        public UserMissingFilesController(IUserService userService,
                                          IUserLibraryService userLibraryService,
                                          IBookService bookService,
                                          IMediaFileRepository mediaFileRepository,
                                          IMapCoversToLocal coverMapper)
        {
            _userService = userService;
            _userLibraryService = userLibraryService;
            _bookService = bookService;
            _mediaFileRepository = mediaFileRepository;
            _coverMapper = coverMapper;
        }

        [HttpGet]
        public ActionResult<List<UserMissingFilesResource>> Get()
        {
            var user = GetCurrentUser();
            var userBooks = _userLibraryService.GetUserLibrary(user.Id);

            if (userBooks == null || !userBooks.Any())
            {
                return new List<UserMissingFilesResource>();
            }

            var bookIds = userBooks.Select(x => x.BookId).Distinct().ToList();
            var books = _bookService.GetBooks(bookIds);

            var results = new List<UserMissingFilesResource>();

            foreach (var book in books)
            {
                var bookFiles = _mediaFileRepository.GetFilesByBook(book.Id);
                var hasEbook = bookFiles.Any(f => f.MediaType == BookFileMediaType.Ebook);
                var hasAudiobook = bookFiles.Any(f => f.MediaType == BookFileMediaType.Audiobook);

                var missingEbook = !hasEbook;
                var missingAudiobook = !hasAudiobook;

                if (!missingEbook && !missingAudiobook)
                {
                    continue;
                }

                var resource = new UserMissingFilesResource
                {
                    BookId = book.Id,
                    Book = book.ToResource(),
                    MissingEbook = missingEbook,
                    MissingAudiobook = missingAudiobook
                };

                if (resource.Book?.Images != null)
                {
                    _coverMapper.ConvertToLocalUrls(book.Id, MediaCoverEntity.Book, resource.Book.Images);
                }

                results.Add(resource);
            }

            return results;
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
