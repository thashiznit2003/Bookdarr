using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using Readarr.Http;

namespace Readarr.Api.V1.Diagnostics
{
    [V1ApiController("diagnostics/config")]
    public class DiagnosticsConfigController : Controller
    {
        private readonly IConfigFileProvider _configFileProvider;

        public DiagnosticsConfigController(IConfigFileProvider configFileProvider)
        {
            _configFileProvider = configFileProvider;
        }

        [HttpGet]
        public DiagnosticsConfigResource GetConfig()
        {
            return DiagnosticsConfigResourceMapper.ToResource(_configFileProvider);
        }

        [HttpPut]
        public ActionResult<DiagnosticsConfigResource> SaveConfig([FromBody] DiagnosticsConfigResource resource)
        {
            if (resource == null)
            {
                return BadRequest("Request body can't be empty");
            }

            var configValues = new Dictionary<string, object>
            {
                { "DiagnosticsRepo", resource.Repo ?? string.Empty },
                { "DiagnosticsGitUserName", resource.GitUserName ?? string.Empty },
                { "DiagnosticsGitUserEmail", resource.GitUserEmail ?? string.Empty }
            };

            if (resource.Token.IsNotNullOrWhiteSpace())
            {
                configValues["DiagnosticsToken"] = resource.Token;
            }

            _configFileProvider.SaveConfigDictionary(configValues);

            return Accepted(DiagnosticsConfigResourceMapper.ToResource(_configFileProvider));
        }
    }
}
