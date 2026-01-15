#nullable enable
using System;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.DecisionEngine
{
    public interface IMatchConfidenceService
    {
        decimal GetConfidence(RemoteBook remoteBook);
    }

    public class MatchConfidenceService : IMatchConfidenceService
    {
        private static readonly Regex NormalizeRegex = new Regex(@"[^a-z0-9]+", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public decimal GetConfidence(RemoteBook remoteBook)
        {
            if (remoteBook == null)
            {
                return 0;
            }

            var parsed = remoteBook.ParsedBookInfo;
            var target = $"{parsed?.AuthorName} {parsed?.BookTitle}";
            var releaseName = remoteBook.Release?.Title;

            var normalizedTarget = Normalize(target);
            var normalizedRelease = Normalize(releaseName);

            if (string.IsNullOrWhiteSpace(normalizedTarget) || string.IsNullOrWhiteSpace(normalizedRelease))
            {
                return 0;
            }

            var distance = ComputeLevenshteinDistance(normalizedTarget, normalizedRelease);
            var maxLength = Math.Max(normalizedTarget.Length, normalizedRelease.Length);

            if (maxLength == 0)
            {
                return 100;
            }

            var similarity = 1m - ((decimal)distance / maxLength);

            return Math.Max(0, Math.Min(100, Math.Round(similarity * 100, 1)));
        }

        private static string Normalize(string? value)
        {
            if (value.IsNullOrWhiteSpace())
            {
                return string.Empty;
            }

            var normalized = value.ToLowerInvariant();
            normalized = NormalizeRegex.Replace(normalized, " ");
            normalized = RemoveDiacritics(normalized);
            normalized = normalized.Trim();

            return normalized;
        }

        private static string RemoveDiacritics(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            var normalized = value.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (var ch in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(ch);
                }
            }

            return builder.ToString().Normalize(NormalizationForm.FormC);
        }

        private static int ComputeLevenshteinDistance(string source, string target)
        {
            if (string.Equals(source, target, StringComparison.InvariantCultureIgnoreCase))
            {
                return 0;
            }

            var sourceLength = source.Length;
            var targetLength = target.Length;

            if (sourceLength == 0)
            {
                return targetLength;
            }

            if (targetLength == 0)
            {
                return sourceLength;
            }

            var matrix = new int[sourceLength + 1, targetLength + 1];

            for (var i = 0; i <= sourceLength; i++)
            {
                matrix[i, 0] = i;
            }

            for (var j = 0; j <= targetLength; j++)
            {
                matrix[0, j] = j;
            }

            for (var i = 1; i <= sourceLength; i++)
            {
                for (var j = 1; j <= targetLength; j++)
                {
                    var cost = source[i - 1] == target[j - 1] ? 0 : 1;
                    matrix[i, j] = Math.Min(
                        Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                        matrix[i - 1, j - 1] + cost);
                }
            }

            return matrix[sourceLength, targetLength];
        }
    }
}
