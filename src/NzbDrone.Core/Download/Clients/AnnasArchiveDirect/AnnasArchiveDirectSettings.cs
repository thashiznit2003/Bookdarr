using FluentValidation;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Download.Clients.AnnasArchiveDirect
{
    public class AnnasArchiveDirectSettingsValidator : AbstractValidator<AnnasArchiveDirectSettings>
    {
        public AnnasArchiveDirectSettingsValidator()
        {
            RuleFor(c => c.DownloadFolder).NotEmpty();
        }
    }

    public class AnnasArchiveDirectSettings : IProviderConfig
    {
        private static readonly AnnasArchiveDirectSettingsValidator Validator = new AnnasArchiveDirectSettingsValidator();

        public AnnasArchiveDirectSettings()
        {
            DownloadTimeout = AnnasArchiveDownloadTimeout.Seconds60;
        }

        [FieldDefinition(0, Label = "Download Folder", Type = FieldType.Path, HelpText = "Folder where Bookdarr will store slow downloads from Anna's Archive.")]
        public string DownloadFolder { get; set; }

        [FieldDefinition(1, Label = "Slow Download Timeout", Type = FieldType.Select, SelectOptions = typeof(AnnasArchiveDownloadTimeout), HelpText = "Time to wait for the slow download before falling back to Stacks.")]
        public AnnasArchiveDownloadTimeout DownloadTimeout { get; set; }

        [FieldDefinition(2, Label = "Stacks Fallback Client", Type = FieldType.Select, SelectOptionsProviderAction = "stacksDownloadClients", HelpText = "Optional Stacks download client to use when the slow download fails or times out.")]
        public int StacksDownloadClientId { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }

    public enum AnnasArchiveDownloadTimeout
    {
        [FieldOption("10 seconds")]
        Seconds10 = 10,

        [FieldOption("30 seconds")]
        Seconds30 = 30,

        [FieldOption("60 seconds")]
        Seconds60 = 60,

        [FieldOption("120 seconds")]
        Seconds120 = 120
    }
}
