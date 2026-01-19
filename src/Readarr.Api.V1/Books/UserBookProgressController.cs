using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Books.Services;
using NzbDrone.Http.REST.Attributes;
using Readarr.Http;
using Readarr.Http.REST;
using ModelNotFoundException = NzbDrone.Core.Datastore.ModelNotFoundException;

namespace Readarr.Api.V1.Books
{
    [V1ApiController("user/progress")]
    public class UserBookProgressController : RestController<UserBookProgressResource>
    {
        private readonly IUserService _userService;
        private readonly IUserBookProgressService _progressService;

        public UserBookProgressController(IUserService userService,
                                          IUserBookProgressService progressService)
        {
            _userService = userService;
            _progressService = progressService;
        }

        [HttpGet]
        public ActionResult<UserBookProgressResource> GetProgress([FromQuery] int bookFileId)
        {
            if (bookFileId <= 0)
            {
                return BadRequest("bookFileId is required");
            }

            var user = GetCurrentUser();
            var progress = _progressService.GetByUserAndBookFile(user.Id, bookFileId);

            if (progress == null)
            {
                return NotFound();
            }

            return progress.ToResource();
        }

        [HttpPut]
        [SkipValidation]
        public ActionResult<UserBookProgressResource> UpsertProgress([FromBody] UserBookProgressResource resource)
        {
            if (resource == null || resource.BookFileId <= 0)
            {
                return BadRequest("bookFileId is required");
            }

            var user = GetCurrentUser();
            var progress = _progressService.UpsertProgress(
                user.Id,
                resource.BookFileId,
                resource.BookId,
                resource.MediaType,
                resource.Location,
                resource.Position,
                resource.Duration,
                resource.Progress);

            return Accepted(progress.ToResource());
        }

        protected override UserBookProgressResource GetResourceById(int id)
        {
            var user = GetCurrentUser();
            var progress = _progressService.GetByUserAndBookFile(user.Id, id);

            if (progress == null)
            {
                return null;
            }

            return progress.ToResource();
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
