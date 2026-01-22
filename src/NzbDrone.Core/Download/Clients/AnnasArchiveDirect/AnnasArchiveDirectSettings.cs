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
            RuleFor(c => c.FlareSolverrUrl).ValidRootUrl().When(c => c.UseFlareSolverr);
            RuleFor(c => c.FlareSolverrTimeoutSeconds).GreaterThan(0).When(c => c.UseFlareSolverr);
        }
    }

    public class AnnasArchiveDirectSettings : IProviderConfig
    {
        private static readonly AnnasArchiveDirectSettingsValidator Validator = new AnnasArchiveDirectSettingsValidator();

        public AnnasArchiveDirectSettings()
        {
            DownloadTimeout = AnnasArchiveDownloadTimeout.Seconds60;
            UseFlareSolverr = false;
            FlareSolverrUrl = "http://localhost:8191";
            FlareSolverrTimeoutSeconds = 60;
        }

        [FieldDefinition(0, Label = "Download Folder", Type = FieldType.Path, HelpText = "Folder where Bookdarr will store slow downloads from Anna's Archive.")]
        public string DownloadFolder { get; set; }

        [FieldDefinition(1, Label = "Slow Download Timeout", Type = FieldType.Select, SelectOptions = typeof(AnnasArchiveDownloadTimeout), HelpText = "Time to wait for the slow download before falling back to Stacks.")]
        public AnnasArchiveDownloadTimeout DownloadTimeout { get; set; }

        [FieldDefinition(2, Label = "Stacks Fallback Client", Type = FieldType.Select, SelectOptionsProviderAction = "stacksDownloadClients", HelpText = "Optional Stacks download client to use when the slow download fails or times out.")]
        public int StacksDownloadClientId { get; set; }

        [FieldDefinition(3, Label = "Use FlareSolverr", Type = FieldType.Checkbox, HelpText = "Use FlareSolverr to bypass browser verification for Anna's Archive.")]
        public bool UseFlareSolverr { get; set; }

        [FieldDefinition(4, Label = "FlareSolverr URL", Type = FieldType.Textbox, HelpText = "Base URL for FlareSolverr (for example, http://localhost:8191).", Advanced = true)]
        public string FlareSolverrUrl { get; set; }

        [FieldDefinition(5, Label = "FlareSolverr Timeout", Type = FieldType.Number, Unit = "seconds", HelpText = "Maximum time FlareSolverr will wait for a challenge to complete.", Advanced = true)]
        public int FlareSolverrTimeoutSeconds { get; set; }

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
