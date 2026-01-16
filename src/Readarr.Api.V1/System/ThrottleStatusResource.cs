using System;
using Readarr.Http.REST;

namespace Readarr.Api.V1.System
{
    public class ThrottleStatusResource : RestResource
    {
        public bool IsThrottled { get; set; }
        public string Host { get; set; }
        public string Url { get; set; }
        public double? RetryAfterSeconds { get; set; }
        public DateTime? LastThrottle { get; set; }
        public string Message { get; set; }
    }
}
