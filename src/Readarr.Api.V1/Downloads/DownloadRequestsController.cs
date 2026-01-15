using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Download;
using NzbDrone.Http.REST.Attributes;
using Readarr.Api.V1.Books;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Downloads
{
    [V1ApiController("downloads/requests")]
    public class DownloadRequestsController : RestController<DownloadRequestResource>
    {
        private readonly IUserService _userService;
        private readonly IDownloadRequestService _downloadRequestService;
        private readonly IBookService _bookService;

        public DownloadRequestsController(IUserService userService,
                                          IDownloadRequestService downloadRequestService,
                                          IBookService bookService)
        {
            _userService = userService;
            _downloadRequestService = downloadRequestService;
            _bookService = bookService;
        }

        [HttpGet("pending")]
        public ActionResult<List<DownloadRequestResource>> GetPending()
        {
            var user = GetCurrentUser();
            var requests = _downloadRequestService.GetPendingRequests(user.Id);

            return requests.Select(Map).ToList();
        }

        protected override DownloadRequestResource GetResourceById(int id)
        {
            var request = _downloadRequestService.GetById(id);

            if (request == null)
            {
                throw new ModelNotFoundException(typeof(DownloadRequest), id);
            }

            return Map(request);
        }

        private DownloadRequestResource Map(DownloadRequest request)
        {
            var book = _bookService.GetBook(request.BookId);

            return new DownloadRequestResource
            {
                Id = request.Id,
                BookId = request.BookId,
                Book = book?.ToResource(),
                TriggerType = request.TriggerType,
                RequestedMediaType = request.RequestedMediaType,
                ConfidenceScore = request.ConfidenceScore,
                MarkedForReview = request.MarkedForReview,
                WasSuccessful = request.WasSuccessful,
                Notes = request.Notes,
                CreatedAt = request.CreatedAt
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
