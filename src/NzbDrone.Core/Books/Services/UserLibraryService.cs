using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Books.Repositories;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles;

namespace NzbDrone.Core.Books
{
    public interface IUserLibraryService
    {
        UserBook AddOrGetUserBook(int userId, int bookId, bool wantsEbook = true, bool wantsAudiobook = true);
        UserBook GetUserBook(int userId, int bookId);
        IEnumerable<UserBook> GetUserLibrary(int userId);
        UserBook GetUserBookById(int id, int userId);
        void RemoveUserBook(int userId, int bookId);
        bool IsBookAvailableInPool(int bookId);
        LibraryStatus GetPoolStatus(int bookId, bool wantsEbook, bool wantsAudiobook);
        bool PoolHasMedia(int bookId, BookFileMediaType mediaType);
        bool UserBookHasMedia(UserBook userBook, BookFileMediaType mediaType);
    }

    public class UserLibraryService : IUserLibraryService
    {
        private readonly IUserBookRepository _userBookRepository;
        private readonly IUserBookFileRepository _userBookFileRepository;
        private readonly IMediaFileRepository _mediaFileRepository;
        private readonly IBookRepository _bookRepository;

        public UserLibraryService(IUserBookRepository userBookRepository,
                                  IUserBookFileRepository userBookFileRepository,
                                  IMediaFileRepository mediaFileRepository,
                                  IBookRepository bookRepository)
        {
            _userBookRepository = userBookRepository;
            _userBookFileRepository = userBookFileRepository;
            _mediaFileRepository = mediaFileRepository;
            _bookRepository = bookRepository;
        }

        public UserBook AddOrGetUserBook(int userId, int bookId, bool wantsEbook = true, bool wantsAudiobook = true)
        {
            var existing = _userBookRepository.GetByUserAndBook(userId, bookId);

            var status = ResolveStatus(bookId, wantsEbook, wantsAudiobook);

            if (existing != null)
            {
                existing.WantsEbook = wantsEbook;
                existing.WantsAudiobook = wantsAudiobook;
                existing.Status = status;

                if (status == LibraryStatus.Available && !existing.SharedCopyClaimed)
                {
                    ClaimSharedFiles(existing, wantsEbook, wantsAudiobook);
                }

                return _userBookRepository.Update(existing);
            }

            var userBook = new UserBook
            {
                UserId = userId,
                BookId = bookId,
                WantsEbook = wantsEbook,
                WantsAudiobook = wantsAudiobook,
                Status = status,
                CreatedAt = DateTime.UtcNow
            };

            userBook = _userBookRepository.Insert(userBook);

            if (status == LibraryStatus.Available)
            {
                ClaimSharedFiles(userBook, wantsEbook, wantsAudiobook);
            }

            return userBook;
        }

        public UserBook GetUserBook(int userId, int bookId)
        {
            return _userBookRepository.GetByUserAndBook(userId, bookId);
        }

        public IEnumerable<UserBook> GetUserLibrary(int userId)
        {
            return _userBookRepository.GetByUser(userId);
        }

        public UserBook GetUserBookById(int id, int userId)
        {
            var userBook = _userBookRepository.Find(id);

            if (userBook == null || userBook.UserId != userId)
            {
                throw new ModelNotFoundException(typeof(UserBook), id);
            }

            return userBook;
        }

        public void RemoveUserBook(int userId, int bookId)
        {
            var userBook = _userBookRepository.GetByUserAndBook(userId, bookId);

            if (userBook == null)
            {
                return;
            }

            var userBookFiles = _userBookFileRepository.GetByUserBook(userBook.Id);
            foreach (var userBookFile in userBookFiles)
            {
                _userBookFileRepository.Delete(userBookFile.Id);
            }

            _userBookRepository.Delete(userBook.Id);
        }

        public bool IsBookAvailableInPool(int bookId)
        {
            return _mediaFileRepository.GetFilesByBook(bookId)
                .Any(file => file.MediaType == BookFileMediaType.Ebook || file.MediaType == BookFileMediaType.Audiobook);
        }

        public LibraryStatus GetPoolStatus(int bookId, bool wantsEbook, bool wantsAudiobook)
        {
            var hasEbook = wantsEbook && PoolHasMedia(bookId, BookFileMediaType.Ebook);
            var hasAudiobook = wantsAudiobook && PoolHasMedia(bookId, BookFileMediaType.Audiobook);

            if (hasEbook || hasAudiobook)
            {
                return LibraryStatus.Available;
            }

            return LibraryStatus.NeedsManual;
        }

        public bool PoolHasMedia(int bookId, BookFileMediaType mediaType)
        {
            return _mediaFileRepository.GetFilesByBook(bookId)
                .Any(f => f.MediaType == mediaType);
        }

        public bool UserBookHasMedia(UserBook userBook, BookFileMediaType mediaType)
        {
            var fileIds = _userBookFileRepository.GetByUserBook(userBook.Id)
                .Select(x => x.BookFileId)
                .ToList();

            if (!fileIds.Any())
            {
                return false;
            }

            var files = _mediaFileRepository.Get(fileIds);
            return files.Any(f => f.MediaType == mediaType);
        }

        private LibraryStatus ResolveStatus(int bookId, bool wantsEbook, bool wantsAudiobook)
        {
            var files = _mediaFileRepository.GetFilesByBook(bookId)
                .ToList();

            var hasEbook = wantsEbook && files.Any(f => f.MediaType == BookFileMediaType.Ebook);
            var hasAudiobook = wantsAudiobook && files.Any(f => f.MediaType == BookFileMediaType.Audiobook);

            if (wantsEbook && wantsAudiobook)
            {
                return hasEbook && hasAudiobook ? LibraryStatus.Available : LibraryStatus.Pending;
            }

            if (wantsEbook)
            {
                return hasEbook ? LibraryStatus.Available : LibraryStatus.Pending;
            }

            if (wantsAudiobook)
            {
                return hasAudiobook ? LibraryStatus.Available : LibraryStatus.Pending;
            }

            return LibraryStatus.Pending;
        }

        private void ClaimSharedFiles(UserBook userBook, bool wantsEbook, bool wantsAudiobook)
        {
            var sharedFiles = _mediaFileRepository.GetFilesByBook(userBook.BookId)
                .Where(f => f.SharedWithAll)
                .ToList();

            if (wantsEbook)
            {
                var ebookFile = sharedFiles.FirstOrDefault(f => f.MediaType == BookFileMediaType.Ebook);
                if (ebookFile != null)
                {
                    AddUserBookFile(userBook.Id, ebookFile, UserBookFileRole.Primary);
                }
            }

            if (wantsAudiobook)
            {
                var audiobookFile = sharedFiles.FirstOrDefault(f => f.MediaType == BookFileMediaType.Audiobook);
                if (audiobookFile != null)
                {
                    AddUserBookFile(userBook.Id, audiobookFile, UserBookFileRole.Primary);
                }
            }

            userBook.SharedCopyClaimed = true;

            _userBookRepository.Update(userBook);
        }

        private void AddUserBookFile(int userBookId, BookFile file, UserBookFileRole role)
        {
            var existing = _userBookFileRepository.GetByUserBook(userBookId)
                .Any(f => f.BookFileId == file.Id);

            if (existing)
            {
                return;
            }

            var entry = new UserBookFile
            {
                UserBookId = userBookId,
                BookFileId = file.Id,
                Role = role,
                CreatedAt = DateTime.UtcNow
            };

            _userBookFileRepository.Insert(entry);
        }
    }
}
