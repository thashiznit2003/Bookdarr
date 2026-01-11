using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Validation;
using Readarr.Http;

namespace Readarr.Api.V1.Indexers
{
    [V1ApiController]
    public class IndexerController : ProviderControllerBase<IndexerResource, IndexerBulkResource, IIndexer, IndexerDefinition>
    {
        public static readonly IndexerResourceMapper ResourceMapper = new ();
        public static readonly IndexerBulkResourceMapper BulkResourceMapper = new ();

        private readonly IndexerFactory _indexerFactory;

        public IndexerController(IndexerFactory indexerFactory, DownloadClientExistsValidator<IndexerResource> downloadClientExistsValidator)
            : base(indexerFactory, "indexer", ResourceMapper, BulkResourceMapper)
        {
            _indexerFactory = indexerFactory;

            SharedValidator.RuleFor(c => c.Priority).InclusiveBetween(1, 50);
            SharedValidator.RuleFor(c => c.DownloadClientId).SetValidator(downloadClientExistsValidator);
        }

        [HttpGet("export")]
        [Produces("text/plain")]
        public IActionResult Export()
        {
            var exportText = BuildExport();

            return File(Encoding.UTF8.GetBytes(exportText), "text/plain", "bookdarr-indexers.txt");
        }

        private string BuildExport()
        {
            var indexers = _indexerFactory.All().OrderBy(indexer => indexer.Name).ToList();
            var builder = new StringBuilder();

            for (var i = 0; i < indexers.Count; i++)
            {
                var definition = indexers[i];

                _indexerFactory.SetProviderCharacteristics(definition);

                var resource = ResourceMapper.ToResource(definition);

                AppendLine(builder, "Name", resource.Name);
                AppendLine(builder, "Implementation", resource.ImplementationName);
                AppendLine(builder, "Implementation Id", resource.Implementation);
                AppendLine(builder, "Protocol", resource.Protocol.ToString());
                AppendLine(builder, "Priority", resource.Priority.ToString(CultureInfo.InvariantCulture));
                AppendLine(builder, "Enable RSS", resource.EnableRss.ToString());
                AppendLine(builder, "Enable Automatic Search", resource.EnableAutomaticSearch.ToString());
                AppendLine(builder, "Enable Interactive Search", resource.EnableInteractiveSearch.ToString());
                AppendLine(builder, "Download Client Id", resource.DownloadClientId.ToString(CultureInfo.InvariantCulture));
                AppendLine(builder, "Tags", FormatTags(resource.Tags));

                if (resource.Fields != null && resource.Fields.Count > 0)
                {
                    builder.AppendLine("Fields:");

                    foreach (var field in resource.Fields.OrderBy(f => f.Order).ThenBy(f => f.Label ?? f.Name))
                    {
                        var label = field.Label.IsNullOrWhiteSpace() ? field.Name : field.Label;

                        builder.AppendLine($"{label}: {FormatFieldValue(field.Value)}");
                    }
                }

                if (i < indexers.Count - 1)
                {
                    builder.AppendLine();
                    builder.AppendLine("---");
                    builder.AppendLine();
                }
            }

            return builder.ToString();
        }

        private static void AppendLine(StringBuilder builder, string label, string value)
        {
            builder.Append(label);
            builder.Append(": ");
            builder.AppendLine(value ?? string.Empty);
        }

        private static string FormatTags(IReadOnlyCollection<int> tags)
        {
            if (tags == null || tags.Count == 0)
            {
                return string.Empty;
            }

            return string.Join(", ", tags.OrderBy(tag => tag));
        }

        private static string FormatFieldValue(object value)
        {
            if (value == null)
            {
                return string.Empty;
            }

            if (value is string stringValue)
            {
                return stringValue;
            }

            if (value is IEnumerable<string> stringValues)
            {
                return string.Join(", ", stringValues);
            }

            if (value is IEnumerable<int> intValues)
            {
                return string.Join(", ", intValues);
            }

            return value.ToJson();
        }
    }
}
