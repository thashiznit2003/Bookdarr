using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Readarr.Http.Extensions;

namespace Readarr.Http.Middleware
{
    public class CacheHeaderMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ICacheableSpecification _cacheableSpecification;

        public CacheHeaderMiddleware(RequestDelegate next, ICacheableSpecification cacheableSpecification)
        {
            _next = next;
            _cacheableSpecification = cacheableSpecification;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value ?? string.Empty;
            var lowered = path.ToLowerInvariant();
            var forceDisable = lowered.EndsWith(".js") ||
                               lowered.EndsWith(".css") ||
                               lowered.EndsWith(".json") ||
                               lowered.EndsWith(".html");

            if (context.Request.Method != "OPTIONS" && !forceDisable)
            {
                if (_cacheableSpecification.IsCacheable(context.Request))
                {
                    context.Response.Headers.EnableCache();
                }
                else
                {
                    context.Response.Headers.DisableCache();
                }
            }

            await _next(context);

            if (forceDisable && context.Request.Method != "OPTIONS")
            {
                context.Response.Headers.DisableCache();
            }
        }
    }
}
