using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Configuration;
using Readarr.Http.Extensions;
using Readarr.Http.Frontend.Mappers;

namespace Readarr.Http.Frontend
{
    [Authorize(Policy="UI")]
    [ApiController]
    public class StaticResourceController : Controller
    {
        private readonly IEnumerable<IMapHttpRequestsToDisk> _requestMappers;
        private readonly Logger _logger;
        private readonly IConfigFileProvider _configFileProvider;

        public StaticResourceController(IEnumerable<IMapHttpRequestsToDisk> requestMappers,
            IConfigFileProvider configFileProvider,
            Logger logger)
        {
            _requestMappers = requestMappers;
            _configFileProvider = configFileProvider;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet("login")]
        public IActionResult LoginPage()
        {
            return MapResource("login");
        }

        [AllowAnonymous]
        [HttpGet("reset-password")]
        public IActionResult ResetPasswordPage()
        {
            return MapResource("reset-password");
        }

        [EnableCors("AllowGet")]
        [AllowAnonymous]
        [HttpGet("content/{**path:regex(^(?!/*api/).*)}")]
        public IActionResult IndexContent([FromRoute] string path)
        {
            return MapResource("Content/" + path);
        }

        [AllowAnonymous]
        [HttpGet("")]
        [HttpGet("/{**path:regex(^(?!(api|feed)/).*)}")]
        public IActionResult Index([FromRoute] string path)
        {
            // Allow static assets (js/css/ico/etc.) to be served without redirecting to /login.
            // When the user is not authenticated we still want the login page to have access
            // to its scripts/styles so it can render instead of going blank.
            if (!path.IsNullOrWhiteSpace() && Path.HasExtension(path))
            {
                return MapResource(path);
            }

            if (!User.Identity.IsAuthenticated && !IsAuthenticationBypassAllowed(HttpContext))
            {
                var returnUrl = $"{Request.PathBase}{Request.Path}{Request.QueryString}";
                var urlBase = GetSafeUrlBase();
                var loginUrl = $"{urlBase}/login?returnUrl={Uri.EscapeDataString(returnUrl)}";

                // lgtm [cs/web/unvalidated-url-redirection] url base and return URL are normalized/sanitized above.
                return Redirect(loginUrl);
            }

            return MapResource(path);
        }

        private bool IsAuthenticationBypassAllowed(HttpContext context)
        {
            if (_configFileProvider.AuthenticationMethod == AuthenticationType.None)
            {
                return true;
            }

            if (_configFileProvider.AuthenticationRequired == AuthenticationRequiredType.DisabledForLocalAddresses &&
                IPAddress.TryParse(context.GetRemoteIP(), out var ipAddress))
            {
                if (ipAddress.IsLocalAddress() ||
                    (_configFileProvider.TrustCgnatIpAddresses && ipAddress.IsCgnatIpAddress()))
                {
                    return true;
                }
            }

            return false;
        }

        private string GetSafeUrlBase()
        {
            var urlBase = _configFileProvider.UrlBase;
            if (urlBase.IsNullOrWhiteSpace())
            {
                return string.Empty;
            }

            var trimmed = urlBase.Trim();

            if (trimmed.Contains("://") || trimmed.StartsWith("//"))
            {
                return string.Empty;
            }

            if (trimmed == "/")
            {
                return string.Empty;
            }

            if (!trimmed.StartsWith("/"))
            {
                trimmed = "/" + trimmed;
            }

            return trimmed.TrimEnd('/');
        }

        private static bool ShouldDisableCache(string path, FileResult fileResult)
        {
            if (fileResult?.ContentType == null)
            {
                return false;
            }

            if (fileResult.ContentType.Equals("text/html", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (path.IsNullOrWhiteSpace())
            {
                return false;
            }

            var lowered = path.ToLowerInvariant();
            return lowered.EndsWith(".js") ||
                   lowered.EndsWith(".css") ||
                   lowered.EndsWith(".json");
        }

        private IActionResult MapResource(string path)
        {
            path = "/" + (path ?? "");

            var mapper = _requestMappers.SingleOrDefault(m => m.CanHandle(path));

            if (mapper != null)
            {
                var result = mapper.GetResponse(path);

                if (result != null)
                {
                    var fileResult = result as FileResult;

                    if (ShouldDisableCache(path, fileResult))
                    {
                        Response.Headers.DisableCache();
                    }

                    return result;
                }

                return NotFound();
            }

            _logger.Warn("Couldn't find handler for {0}", path);

            return NotFound();
        }
    }
}
