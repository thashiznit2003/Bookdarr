using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;

namespace Readarr.Api.V1.Diagnostics
{
    public class DiagnosticsConfigResource
    {
        public string Repo { get; set; }
        public string Token { get; set; }
        public string GitUserName { get; set; }
        public string GitUserEmail { get; set; }
        public bool HasToken { get; set; }
    }

    public static class DiagnosticsConfigResourceMapper
    {
        public static DiagnosticsConfigResource ToResource(IConfigFileProvider config)
        {
            return new DiagnosticsConfigResource
            {
                Repo = config.DiagnosticsRepo ?? string.Empty,
                Token = string.Empty,
                GitUserName = config.DiagnosticsGitUserName ?? string.Empty,
                GitUserEmail = config.DiagnosticsGitUserEmail ?? string.Empty,
                HasToken = config.DiagnosticsToken.IsNotNullOrWhiteSpace()
            };
        }
    }
}
