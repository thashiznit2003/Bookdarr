using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Http;
using Readarr.Http;

namespace Readarr.Api.V1.System
{
    [V1ApiController("system/throttle")]
    public class ThrottleController : Controller
    {
        private readonly IHttpThrottleNotificationService _throttleService;

        public ThrottleController(IHttpThrottleNotificationService throttleService)
        {
            _throttleService = throttleService;
        }

        [HttpGet]
        public ActionResult<ThrottleStatusResource> Get()
        {
            var status = _throttleService.GetStatus();

            return new ThrottleStatusResource
            {
                IsThrottled = status.IsThrottled,
                Host = status.Host,
                Url = status.Url,
                RetryAfterSeconds = status.RetryAfter?.TotalSeconds,
                LastThrottle = status.LastThrottle,
                Message = status.Message
            };
        }
    }
}
