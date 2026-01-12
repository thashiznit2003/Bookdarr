using System.Linq;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.DecisionEngine.Specifications
{
    public class UpgradeDiskSpecification : IDecisionEngineSpecification
    {
        private readonly UpgradableSpecification _upgradableSpecification;
        private readonly ICustomFormatCalculationService _formatService;
        private readonly IConfigService _configService;
        private readonly Logger _logger;

        public UpgradeDiskSpecification(UpgradableSpecification qualityUpgradableSpecification,
                                        ICacheManager cacheManager,
                                        ICustomFormatCalculationService formatService,
                                        IConfigService configService,
                                        Logger logger)
        {
            _upgradableSpecification = qualityUpgradableSpecification;
            _formatService = formatService;
            _configService = configService;
            _logger = logger;
        }

        public SpecificationPriority Priority => SpecificationPriority.Default;
        public RejectionType Type => RejectionType.Permanent;

        public virtual Decision IsSatisfiedBy(RemoteBook subject, SearchCriteriaBase searchCriteria)
        {
            var targetMediaType = GetMediaType(subject);
            var files = subject.Books.SelectMany(c => c.BookFiles.Value);
            if (targetMediaType != BookFileMediaType.Unknown)
            {
                files = files.Where(f => GetMediaType(f) == targetMediaType);
            }

            var filesList = files.ToList();

            // If automatic upgrades are disabled and files already exist, reject the upgrade
            if (!_configService.AllowAutomaticBookUpgrades && filesList.Any(f => f != null))
            {
                _logger.Debug("Automatic book upgrades are disabled and files already exist");
                return Decision.Reject("Automatic upgrades are disabled for books with existing files");
            }

            foreach (var file in filesList)
            {
                if (file == null)
                {
                    return Decision.Accept();
                }

                var customFormats = _formatService.ParseCustomFormat(file);

                if (!_upgradableSpecification.IsUpgradable(subject.Author.QualityProfile,
                                                           file.Quality,
                                                           customFormats,
                                                           subject.ParsedBookInfo.Quality,
                                                           subject.CustomFormats))
                {
                    return Decision.Reject("Existing files on disk is of equal or higher preference: {0}", file.Quality.Quality.Name);
                }
            }

            return Decision.Accept();
        }

        private static BookFileMediaType GetMediaType(RemoteBook subject)
        {
            return MediaFileExtensions.GetMediaTypeForQuality(subject?.ParsedBookInfo?.Quality?.Quality);
        }

        private static BookFileMediaType GetMediaType(BookFile file)
        {
            if (file == null)
            {
                return BookFileMediaType.Unknown;
            }

            if (file.MediaType != BookFileMediaType.Unknown)
            {
                return file.MediaType;
            }

            return MediaFileExtensions.GetMediaTypeForPath(file.Path);
        }
    }
}
