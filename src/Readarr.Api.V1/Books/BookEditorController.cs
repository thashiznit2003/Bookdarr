using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Books;
using ModelNotFoundException = NzbDrone.Core.Datastore.ModelNotFoundException;
using NzbDrone.Core.Messaging.Commands;
using Readarr.Http;

namespace Readarr.Api.V1.Books
{
    [V1ApiController("book/editor")]
    public class BookEditorController : Controller
    {
        private readonly IBookService _bookService;
        private readonly IManageCommandQueue _commandQueueManager;
        private readonly IUserService _userService;

        public BookEditorController(IBookService bookService, IManageCommandQueue commandQueueManager, IUserService userService)
        {
            _bookService = bookService;
            _commandQueueManager = commandQueueManager;
            _userService = userService;
        }

        [HttpPut]
        public IActionResult SaveAll([FromBody] BookEditorResource resource)
        {
            var booksToUpdate = _bookService.GetBooks(resource.BookIds);

            foreach (var book in booksToUpdate)
            {
                if (resource.Monitored.HasValue)
                {
                    book.Monitored = resource.Monitored.Value;
                }
            }

            _bookService.UpdateMany(booksToUpdate);
            return Accepted(booksToUpdate.ToResource());
        }

        [HttpDelete]
        public IActionResult DeleteBook([FromBody] BookEditorResource resource)
        {
            var currentUser = GetCurrentUser();
            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            foreach (var bookId in resource.BookIds)
            {
                _bookService.DeleteBook(bookId, resource.DeleteFiles ?? false, resource.AddImportListExclusion ?? false);
            }

            return NoContent();
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
