using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Configuration;

namespace Readarr.Http.Frontend.Mappers
{
    public class ResetPasswordHtmlMapper : HtmlMapperBase
    {
        public ResetPasswordHtmlMapper(IAppFolderInfo appFolderInfo,
                                       IDiskProvider diskProvider,
                                       Lazy<ICacheBreakerProvider> cacheBreakProviderFactory,
                                       IConfigFileProvider configFileProvider,
                                       Logger logger)
            : base(diskProvider, cacheBreakProviderFactory, logger)
        {
            HtmlPath = Path.Combine(appFolderInfo.StartUpFolder, configFileProvider.UiFolder, "reset-password.html");
            UrlBase = configFileProvider.UrlBase;
        }

        public override string Map(string resourceUrl)
        {
            return HtmlPath;
        }

        public override bool CanHandle(string resourceUrl)
        {
            return resourceUrl.StartsWith("/reset-password");
        }
    }
}
