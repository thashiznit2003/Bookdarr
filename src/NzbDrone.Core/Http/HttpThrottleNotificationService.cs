using System;
using System.Text;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;

namespace NzbDrone.Core.Http
{
    public class HttpThrottleNotificationService : IHttpThrottleNotificationService
    {
        private readonly object _locker = new ();
        private readonly TimeSpan _activeWindow = TimeSpan.FromMinutes(5);
        private DateTime? _lastThrottle;
        private string _host;
        private string _url;
        private TimeSpan? _retryAfter;

        public void RecordThrottle(HttpRequest request, TimeSpan? retryAfter)
        {
            if (request == null)
            {
                return;
            }

            lock (_locker)
            {
                _lastThrottle = DateTime.UtcNow;
                _host = request.Url.Host;
                _url = request.Url.FullUri;
                _retryAfter = retryAfter;
            }
        }

        public ThrottleStatus GetStatus()
        {
            lock (_locker)
            {
                if (!_lastThrottle.HasValue)
                {
                    return new ThrottleStatus();
                }

                var elapsed = DateTime.UtcNow - _lastThrottle.Value;

                if (elapsed > _activeWindow)
                {
                    return new ThrottleStatus();
                }

                var retryWindow = _retryAfter.HasValue
                    ? _retryAfter.Value - elapsed
                    : (TimeSpan?)null;

                var messageBuilder = new StringBuilder();
                if (_host.IsNullOrWhiteSpace())
                {
                    messageBuilder.Append("Throttling detected.");
                }
                else
                {
                    messageBuilder.Append("Throttled while calling ");
                    messageBuilder.Append(_host);
                }

                if (retryWindow.HasValue && retryWindow.Value.TotalSeconds > 0)
                {
                    messageBuilder.Append($". Retry in {retryWindow.Value.ToString("m\\:ss")}");
                }

                return new ThrottleStatus
                {
                    IsThrottled = true,
                    LastThrottle = _lastThrottle,
                    Host = _host,
                    Url = _url,
                    RetryAfter = _retryAfter,
                    Message = messageBuilder.ToString()
                };
            }
        }
    }
}
