using System;
using System.Collections.Generic;
using System.Net;
using System.Text.RegularExpressions;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Indexers.Exceptions;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.Indexers.AnnasArchive
{
    public class AnnasArchiveParser : IParseIndexerResponse
    {
        private const int MaxSegmentLength = 6000;
        private static readonly Regex TitleRegex = new Regex(
            "<a\\s+href=\"/md5/(?<md5>[a-f0-9]{32})\"[^>]*>\\s*(?<title>[^<]+?)\\s*</a>",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex AuthorRegex = new Regex(
            "icon-\\[mdi--user-edit\\][^>]*></span>\\s*(?<author>[^<]+)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex SizeRegex = new Regex(
            "\\b(?<size>\\d+(?:\\.\\d+)?\\s*(?:KB|MB|GB|TB))\\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public AnnasArchiveParser(AnnasArchiveSettings settings)
        {
        }

        public IList<ReleaseInfo> ParseResponse(IndexerResponse indexerResponse)
        {
            if (indexerResponse.HttpResponse.StatusCode != HttpStatusCode.OK)
            {
                throw new IndexerException(indexerResponse, $"Unexpected response status {indexerResponse.HttpResponse.StatusCode}");
            }

            if (indexerResponse.HttpResponse.Headers.ContentType != null &&
                !indexerResponse.HttpResponse.Headers.ContentType.Contains("text/html"))
            {
                throw new IndexerException(indexerResponse, $"Unexpected response content type {indexerResponse.HttpResponse.Headers.ContentType}");
            }

            var releases = new List<ReleaseInfo>();
            var content = indexerResponse.Content;

            foreach (Match match in TitleRegex.Matches(content))
            {
                var md5 = match.Groups["md5"].Value;
                var title = WebUtility.HtmlDecode(match.Groups["title"].Value).Trim();

                if (md5.IsNullOrWhiteSpace() || title.IsNullOrWhiteSpace())
                {
                    continue;
                }

                var segment = ExtractSegment(content, match.Index, match.Length);
                var author = ExtractAuthor(segment);
                var size = ExtractSize(segment);
                var infoUrl = BuildInfoUrl(indexerResponse, md5);

                releases.Add(new ReleaseInfo
                {
                    Guid = $"AnnasArchive-{md5}",
                    Title = BuildTitle(author, title),
                    Author = author,
                    Book = title,
                    InfoUrl = infoUrl,
                    DownloadUrl = infoUrl,
                    Size = size,
                    PublishDate = DateTime.UtcNow
                });
            }

            return releases;
        }

        private static string BuildInfoUrl(IndexerResponse indexerResponse, string md5)
        {
            var requestUrl = indexerResponse.Request.Url;
            var port = requestUrl.Port.HasValue ? $":{requestUrl.Port.Value}" : string.Empty;
            var baseUrl = $"{requestUrl.Scheme}://{requestUrl.Host}{port}";

            return $"{baseUrl}/md5/{md5}";
        }

        private static string ExtractSegment(string content, int matchIndex, int matchLength)
        {
            var start = matchIndex;
            var nextIndex = content.IndexOf("/md5/", matchIndex + matchLength, StringComparison.OrdinalIgnoreCase);
            var end = nextIndex > start ? nextIndex : content.Length;
            var length = Math.Min(end - start, MaxSegmentLength);

            return content.Substring(start, length);
        }

        private static string ExtractAuthor(string segment)
        {
            var match = AuthorRegex.Match(segment);

            return match.Success ? WebUtility.HtmlDecode(match.Groups["author"].Value).Trim() : null;
        }

        private static long ExtractSize(string segment)
        {
            var match = SizeRegex.Match(segment);

            if (!match.Success)
            {
                return 0;
            }

            return RssParser.ParseSize(match.Groups["size"].Value, false);
        }

        private static string BuildTitle(string author, string title)
        {
            if (author.IsNullOrWhiteSpace())
            {
                return title;
            }

            return $"{author} - {title}";
        }
    }
}
