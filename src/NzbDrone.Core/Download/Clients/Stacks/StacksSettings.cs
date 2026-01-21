using FluentValidation;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Download.Clients.Stacks
{
    public class StacksSettingsValidator : AbstractValidator<StacksSettings>
    {
        public StacksSettingsValidator()
        {
            RuleFor(c => c.Host).ValidHost();
            RuleFor(c => c.Port).InclusiveBetween(1, 65535);
            RuleFor(c => c.UrlBase).ValidUrlBase().When(c => c.UrlBase.IsNotNullOrWhiteSpace());
            RuleFor(c => c.ApiKey).NotEmpty();
        }
    }

    public class StacksSettings : IProviderConfig
    {
        private static readonly StacksSettingsValidator Validator = new StacksSettingsValidator();

        public StacksSettings()
        {
            Host = "localhost";
            Port = 7788;
            DownloadFolder = "/download";
        }

        [FieldDefinition(0, Label = "Host", Type = FieldType.Textbox)]
        public string Host { get; set; }

        [FieldDefinition(1, Label = "Port", Type = FieldType.Textbox)]
        public int Port { get; set; }

        [FieldDefinition(2, Label = "Use SSL", Type = FieldType.Checkbox, HelpText = "Use a secure connection to Stacks.")]
        public bool UseSsl { get; set; }

        [FieldDefinition(3, Label = "Url Base", Type = FieldType.Textbox, Advanced = true, HelpText = "Adds a prefix to the Stacks URL, e.g. http://[host]:[port]/[urlBase]/api")]
        public string UrlBase { get; set; }

        [FieldDefinition(4, Label = "API Key", Type = FieldType.Password, Privacy = PrivacyLevel.ApiKey, HelpText = "Stacks admin API key (required to read status and import).")]
        public string ApiKey { get; set; }

        [FieldDefinition(5, Label = "Download Folder", Type = FieldType.Textbox, HelpText = "Stacks download folder path (used for path mapping).")]
        public string DownloadFolder { get; set; }

        public NzbDroneValidationResult Validate()
        {
            return new NzbDroneValidationResult(Validator.Validate(this));
        }
    }
}
