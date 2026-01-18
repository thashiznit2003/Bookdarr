using System;
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
    [V1ApiController("user/wanted/file-upgrades")]
    public class UserFileUpgradesController : RestController<UserFileUpgradeResource>
    {
        private readonly IUserService _userService;
        private readonly IUserLibraryService _userLibraryService;
        private readonly IBookService _bookService;
        private readonly IMediaFileRepository _mediaFileRepository;
        private readonly IMapCoversToLocal _coverMapper;

        public UserFileUpgradesController(IUserService userService,
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
        public ActionResult<List<UserFileUpgradeResource>> Get()
        {
            var user = GetCurrentUser();
            var userBooks = _userLibraryService.GetUserLibrary(user.Id);

            if (userBooks == null || !userBooks.Any())
            {
                return new List<UserFileUpgradeResource>();
            }

            var bookIds = userBooks.Select(x => x.BookId).Distinct().ToList();
            var books = _bookService.GetBooks(bookIds);

            var results = new List<UserFileUpgradeResource>();

            foreach (var book in books)
            {
                var bookFiles = _mediaFileRepository.GetFilesByBook(book.Id);
                var ebookFiles = bookFiles.Where(f => f.MediaType == BookFileMediaType.Ebook).ToList();
                var audioFiles = bookFiles.Where(f => f.MediaType == BookFileMediaType.Audiobook).ToList();

                var needsEpub = ebookFiles.Any() && !ebookFiles.Any(IsEpubFile);
                var needsM4b = audioFiles.Any() && !audioFiles.Any(IsM4bFile);

                if (!needsEpub && !needsM4b)
                {
                    continue;
                }

                var resource = new UserFileUpgradeResource
                {
                    BookId = book.Id,
                    Book = book.ToResource(),
                    NeedsEpub = needsEpub,
                    NeedsM4b = needsM4b
                };

                if (resource.Book?.Images != null)
                {
                    _coverMapper.ConvertToLocalUrls(book.Id, MediaCoverEntity.Book, resource.Book.Images);
                }

                results.Add(resource);
            }

            return results;
        }

        protected override UserFileUpgradeResource GetResourceById(int id)
        {
            throw new ModelNotFoundException(typeof(UserFileUpgradeResource), id);
        }

        private static bool IsEpubFile(BookFile file)
        {
            var path = file.Path ?? string.Empty;
            return path.EndsWith(".epub", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsM4bFile(BookFile file)
        {
            var path = file.Path ?? string.Empty;
            return path.EndsWith(".m4b", StringComparison.OrdinalIgnoreCase);
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
