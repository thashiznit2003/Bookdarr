using System;

namespace NzbDrone.Common.Http
{
    public interface IHttpThrottleNotificationService
    {
        void RecordThrottle(HttpRequest request, TimeSpan? retryAfter);
        ThrottleStatus GetStatus();
    }

    public class ThrottleStatus
    {
        public bool IsThrottled { get; set; }
        public DateTime? LastThrottle { get; set; }
        public string Host { get; set; }
        public string Url { get; set; }
        public TimeSpan? RetryAfter { get; set; }
        public string Message { get; set; }
    }

    public sealed class NullHttpThrottleNotificationService : IHttpThrottleNotificationService
    {
        public static readonly NullHttpThrottleNotificationService Instance = new ();

        private NullHttpThrottleNotificationService()
        {
        }

        public void RecordThrottle(HttpRequest request, TimeSpan? retryAfter)
        {
        }

        public ThrottleStatus GetStatus()
        {
            return new ThrottleStatus();
        }
    }
}
