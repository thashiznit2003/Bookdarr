using System;
using Microsoft.AspNetCore.Http;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace Readarr.Http.Middleware
{
    public interface ICacheableSpecification
    {
        bool IsCacheable(HttpRequest request);
    }

    public class CacheableSpecification : ICacheableSpecification
    {
        public bool IsCacheable(HttpRequest request)
        {
            if (!RuntimeInfo.IsProduction)
            {
                return false;
            }

            // Never cache core frontend assets (html/js/css/json) so clients always fetch fresh bundles.
            var path = request.Path.Value ?? string.Empty;
            var lowered = path.ToLowerInvariant();
            if (lowered.EndsWith(".js") ||
                lowered.EndsWith(".css") ||
                lowered.EndsWith(".json") ||
                lowered.EndsWith(".html"))
            {
                return false;
            }

            if (request.Query.ContainsKey("h"))
            {
                return true;
            }

            if (request.Path.StartsWithSegments("/api", StringComparison.CurrentCultureIgnoreCase))
            {
                if (request.Path.ToString().ContainsIgnoreCase("/MediaCover"))
                {
                    return true;
                }

                return false;
            }

            if (request.Path.StartsWithSegments("/signalr", StringComparison.CurrentCultureIgnoreCase))
            {
                return false;
            }

            if (path.EndsWith("/index.js"))
            {
                return false;
            }

            if (path.EndsWith("/initialize.json"))
            {
                return false;
            }

            if (path.StartsWith("/feed", StringComparison.CurrentCultureIgnoreCase))
            {
                return false;
            }

            if ((path.StartsWith("/logfile", StringComparison.CurrentCultureIgnoreCase) ||
                path.StartsWith("/updatelogfile", StringComparison.CurrentCultureIgnoreCase)) &&
                path.EndsWith(".txt", StringComparison.CurrentCultureIgnoreCase))
            {
                return false;
            }

            return true;
        }
    }
}
