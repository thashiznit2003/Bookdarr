using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Indexers.AnnasArchive
{
    public class AnnasArchiveSettingsValidator : AbstractValidator<AnnasArchiveSettings>
    {
        public AnnasArchiveSettingsValidator()
        {
            RuleFor(c => c.BaseUrl).ValidRootUrl();
        }
    }

    public class AnnasArchiveSettings : IIndexerSettings
    {
        private static readonly AnnasArchiveSettingsValidator Validator = new AnnasArchiveSettingsValidator();

        private static readonly AnnasArchiveDomain[] DomainOrder =
        {
            AnnasArchiveDomain.Pm,
            AnnasArchiveDomain.Org,
            AnnasArchiveDomain.Li,
            AnnasArchiveDomain.Se,
            AnnasArchiveDomain.In
        };

        private static readonly Dictionary<AnnasArchiveDomain, string> DomainUrls = new Dictionary<AnnasArchiveDomain, string>
        {
            { AnnasArchiveDomain.Pm, "https://annas-archive.pm" },
            { AnnasArchiveDomain.Org, "https://annas-archive.org" },
            { AnnasArchiveDomain.Li, "https://annas-archive.li" },
            { AnnasArchiveDomain.Se, "https://annas-archive.se" },
            { AnnasArchiveDomain.In, "https://annas-archive.in" }
        };

        public AnnasArchiveSettings()
        {
            BaseUrl = DomainUrls[AnnasArchiveDomain.Pm];
            Domain = (int)AnnasArchiveDomain.Pm;
        }

        [FieldDefinition(0, Label = "Domain", Type = FieldType.Select, SelectOptions = typeof(AnnasArchiveDomain), HelpText = "Preferred Anna's Archive domain. Bookdarr will try other known domains if this one is unavailable.")]
        public int Domain { get; set; }

        [FieldDefinition(1, Label = "Website URL", Type = FieldType.Textbox, Advanced = true, Hidden = HiddenType.Hidden)]
        public string BaseUrl { get; set; }

        [FieldDefinition(2, Type = FieldType.Number, Label = "Early Download Limit", Unit = "days", HelpText = "Time before release date Bookdarr will download from this indexer, empty is no limit", Advanced = true)]
        public int? EarlyReleaseLimit { get; set; }

        public IEnumerable<string> GetBaseUrls()
        {
            var preferred = GetBaseUrl();
            var candidates = DomainOrder.Select(domain => DomainUrls[domain]).ToList();

            if (candidates.Contains(preferred))
            {
                candidates.Remove(preferred);
            }

            candidates.Insert(0, preferred);

            return candidates;
        }

        public string GetBaseUrl()
        {
            return DomainUrls.TryGetValue((AnnasArchiveDomain)Domain, out var baseUrl) ? baseUrl : BaseUrl;
        }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }

    public enum AnnasArchiveDomain
    {
        [FieldOption(Label = "annas-archive.pm")]
        Pm = 0,

        [FieldOption(Label = "annas-archive.org")]
        Org = 1,

        [FieldOption(Label = "annas-archive.li")]
        Li = 2,

        [FieldOption(Label = "annas-archive.se")]
        Se = 3,

        [FieldOption(Label = "annas-archive.in")]
        In = 4
    }
}
