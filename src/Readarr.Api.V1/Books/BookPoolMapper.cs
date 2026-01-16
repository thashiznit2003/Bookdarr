using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MediaFiles;

namespace Readarr.Api.V1.Books
{
    public interface IBookPoolMapper
    {
        List<BookPoolResource> GetPool(int userId);
        BookPoolResource Map(Book book, int userId);
    }

    public class BookPoolMapper : IBookPoolMapper
    {
        private readonly IBookService _bookService;
        private readonly IUserLibraryService _libraryService;
        private readonly IMapCoversToLocal _coverMapper;

        public BookPoolMapper(IBookService bookService,
                              IUserLibraryService libraryService,
                              IMapCoversToLocal coverMapper)
        {
            _bookService = bookService;
            _libraryService = libraryService;
            _coverMapper = coverMapper;
        }

        public List<BookPoolResource> GetPool(int userId)
        {
            var books = _bookService.GetAllBooks();

            return books
                .Select(book => Map(book, userId))
                .ToList();
        }

        public BookPoolResource Map(Book book, int userId)
        {
            var userBook = _libraryService.GetUserBook(userId, book.Id);
            var resource = new BookPoolResource
            {
                Id = book.Id,
                BookId = book.Id,
                Book = book.ToResource(),
                Status = _libraryService.GetPoolStatus(book.Id, true, true),
                HasEbook = _libraryService.PoolHasMedia(book.Id, BookFileMediaType.Ebook),
                HasAudiobook = _libraryService.PoolHasMedia(book.Id, BookFileMediaType.Audiobook),
                InMyLibrary = userBook != null
            };

            if (resource.Book?.Images != null)
            {
                _coverMapper.ConvertToLocalUrls(book.Id, MediaCoverEntity.Book, resource.Book.Images);
            }

            return resource;
        }
    }
}
