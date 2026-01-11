using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
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

        [HttpPost("import")]
        [Consumes("text/plain")]
        [Produces("application/json")]
        public IActionResult Import([FromBody] string payload, [FromQuery] bool forceSave = false)
        {
            if (payload.IsNullOrWhiteSpace())
            {
                return BadRequest(new IndexerImportResult
                {
                    Errors = new List<string> { "Import payload is empty." }
                });
            }

            var result = ImportIndexers(payload, forceSave);

            if (result.Created == 0 && result.Errors.Count > 0)
            {
                return BadRequest(result);
            }

            return Ok(result);
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

        private IndexerImportResult ImportIndexers(string payload, bool forceSave)
        {
            var result = new IndexerImportResult();
            var sections = ParseImportSections(payload);

            if (sections.Count == 0)
            {
                result.Errors.Add("No indexer entries found in the import file.");
                return result;
            }

            var existingNames = new HashSet<string>(_indexerFactory.All().Select(indexer => indexer.Name), StringComparer.InvariantCultureIgnoreCase);
            var defaultDefinitions = _indexerFactory.GetDefaultDefinitions().ToList();

            foreach (var section in sections)
            {
                if (!section.HeaderValues.TryGetValue("Name", out var name) || name.IsNullOrWhiteSpace())
                {
                    result.Errors.Add("Indexer entry is missing a Name.");
                    continue;
                }

                var implementation = GetImplementationId(section.HeaderValues);

                if (implementation.IsNullOrWhiteSpace())
                {
                    result.Errors.Add($"Indexer '{name}': missing Implementation Id.");
                    continue;
                }

                var defaultDefinition = defaultDefinitions.FirstOrDefault(definition =>
                    definition.Implementation.Equals(implementation, StringComparison.InvariantCultureIgnoreCase));

                if (defaultDefinition == null)
                {
                    result.Errors.Add($"Indexer '{name}': implementation '{implementation}' is not available.");
                    continue;
                }

                var resource = ResourceMapper.ToResource(defaultDefinition);

                resource.Id = 0;
                resource.Name = EnsureUniqueName(name, existingNames);
                ApplyHeaderValues(resource, section.HeaderValues);
                ApplyFieldValues(resource.Fields, section.FieldValues);

                try
                {
                    var definition = ResourceMapper.ToModel(resource);

                    ValidateDefinition(definition, forceSave);

                    if (definition.Enable && !forceSave)
                    {
                        Test(definition, true);
                    }

                    _indexerFactory.Create(definition);
                    existingNames.Add(resource.Name);
                    result.Created++;
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"Indexer '{name}': {ex.Message}");
                }
            }

            return result;
        }

        private void ValidateDefinition(IndexerDefinition definition, bool forceSave)
        {
            if (!definition.Enable)
            {
                return;
            }

            VerifyValidationResult(definition.Settings.Validate(), !forceSave);
        }

        private static List<IndexerImportSection> ParseImportSections(string payload)
        {
            var sections = new List<IndexerImportSection>();
            var currentLines = new List<string>();

            using var reader = new StringReader(payload);
            string line;

            while ((line = reader.ReadLine()) != null)
            {
                if (line.Trim().Equals("---", StringComparison.OrdinalIgnoreCase))
                {
                    AddSection(sections, currentLines);
                    currentLines.Clear();
                    continue;
                }

                if (!line.IsNullOrWhiteSpace())
                {
                    currentLines.Add(line);
                }
            }

            AddSection(sections, currentLines);

            return sections;
        }

        private static void AddSection(List<IndexerImportSection> sections, List<string> lines)
        {
            if (lines.Count == 0)
            {
                return;
            }

            sections.Add(ParseSection(lines));
        }

        private static IndexerImportSection ParseSection(IEnumerable<string> lines)
        {
            var section = new IndexerImportSection();
            var inFields = false;

            foreach (var rawLine in lines)
            {
                var line = rawLine.Trim();

                if (line.IsNullOrWhiteSpace())
                {
                    continue;
                }

                if (line.Equals("Fields:", StringComparison.OrdinalIgnoreCase))
                {
                    inFields = true;
                    continue;
                }

                var separatorIndex = line.IndexOf(':');

                if (separatorIndex <= 0)
                {
                    continue;
                }

                var key = line.Substring(0, separatorIndex).Trim();
                var value = line.Substring(separatorIndex + 1).Trim();

                if (inFields)
                {
                    section.FieldValues[key] = value;
                }
                else
                {
                    section.HeaderValues[key] = value;
                }
            }

            return section;
        }

        private static string GetImplementationId(IReadOnlyDictionary<string, string> headerValues)
        {
            if (headerValues.TryGetValue("Implementation Id", out var implementationId))
            {
                return implementationId;
            }

            if (headerValues.TryGetValue("Implementation", out var implementation))
            {
                return implementation;
            }

            return null;
        }

        private static void ApplyHeaderValues(IndexerResource resource, IReadOnlyDictionary<string, string> headerValues)
        {
            if (TryGetBool(headerValues, "Enable RSS", out var enableRss))
            {
                resource.EnableRss = enableRss;
            }

            if (TryGetBool(headerValues, "Enable Automatic Search", out var enableAutomaticSearch))
            {
                resource.EnableAutomaticSearch = enableAutomaticSearch;
            }

            if (TryGetBool(headerValues, "Enable Interactive Search", out var enableInteractiveSearch))
            {
                resource.EnableInteractiveSearch = enableInteractiveSearch;
            }

            if (TryGetInt(headerValues, "Priority", out var priority))
            {
                resource.Priority = priority;
            }

            if (TryGetInt(headerValues, "Download Client Id", out var downloadClientId))
            {
                resource.DownloadClientId = downloadClientId;
            }

            if (headerValues.TryGetValue("Tags", out var tags))
            {
                resource.Tags = ParseTags(tags);
            }
        }

        private static void ApplyFieldValues(List<Readarr.Http.ClientSchema.Field> fields, IReadOnlyDictionary<string, string> fieldValues)
        {
            if (fields == null || fieldValues.Count == 0)
            {
                return;
            }

            foreach (var field in fields)
            {
                if (fieldValues.TryGetValue(field.Name, out var value) ||
                    (!field.Label.IsNullOrWhiteSpace() && fieldValues.TryGetValue(field.Label, out value)))
                {
                    field.Value = ParseFieldValue(value);
                }
            }
        }

        private static bool TryGetBool(IReadOnlyDictionary<string, string> values, string key, out bool result)
        {
            result = false;

            if (values.TryGetValue(key, out var value))
            {
                return bool.TryParse(value, out result);
            }

            return false;
        }

        private static bool TryGetInt(IReadOnlyDictionary<string, string> values, string key, out int result)
        {
            result = 0;

            if (values.TryGetValue(key, out var value))
            {
                return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out result);
            }

            return false;
        }

        private static HashSet<int> ParseTags(string value)
        {
            var tags = new HashSet<int>();

            if (value.IsNullOrWhiteSpace())
            {
                return tags;
            }

            var parts = value.Split(',', StringSplitOptions.RemoveEmptyEntries);

            foreach (var part in parts)
            {
                if (int.TryParse(part.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var tag))
                {
                    tags.Add(tag);
                }
            }

            return tags;
        }

        private static object ParseFieldValue(string value)
        {
            if (value.IsNullOrWhiteSpace())
            {
                return null;
            }

            var trimmed = value.Trim();

            if (TryParseJsonValue(trimmed, out var element))
            {
                return element;
            }

            var json = STJson.ToJson(trimmed);
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.Clone();
        }

        private static bool TryParseJsonValue(string raw, out JsonElement element)
        {
            try
            {
                using var doc = JsonDocument.Parse(raw);
                element = doc.RootElement.Clone();
                return true;
            }
            catch (JsonException)
            {
                element = default;
                return false;
            }
        }

        private static string EnsureUniqueName(string name, ISet<string> existingNames)
        {
            if (!existingNames.Contains(name))
            {
                return name;
            }

            var index = 1;
            string candidate;

            do
            {
                candidate = index == 1 ? $"{name} (imported)" : $"{name} (imported {index})";
                index++;
            }
            while (existingNames.Contains(candidate));

            return candidate;
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

        private sealed class IndexerImportSection
        {
            public Dictionary<string, string> HeaderValues { get; } = new (StringComparer.OrdinalIgnoreCase);
            public Dictionary<string, string> FieldValues { get; } = new (StringComparer.OrdinalIgnoreCase);
        }

        private sealed class IndexerImportResult
        {
            public int Created { get; set; }
            public List<string> Errors { get; set; } = new ();
        }
    }
}
