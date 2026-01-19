using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using PdfSharpCore.Pdf.IO;
using VersOne.Epub;
using VersOne.Epub.Internal;
using VersOne.Epub.Schema;

namespace NzbDrone.Core.MediaFiles
{
    public interface IEbookPageCountService
    {
        int? GetPageCount(BookFile bookFile);
    }

    public class EbookPageCountService : IEbookPageCountService
    {
        private const int WordsPerPage = 275;
        private static readonly Regex ScriptStyleRegex = new Regex("(?is)<(script|style)[^>]*>.*?</\\1>", RegexOptions.Compiled);
        private static readonly Regex TagRegex = new Regex("<[^>]+>", RegexOptions.Compiled);
        private static readonly Regex WordRegex = new Regex("\\b[\\p{L}\\p{N}]+\\b", RegexOptions.Compiled);

        private static readonly HashSet<string> EpubExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".epub",
            ".kepub"
        };

        private readonly Logger _logger;

        public EbookPageCountService(Logger logger)
        {
            _logger = logger;
        }

        public int? GetPageCount(BookFile bookFile)
        {
            if (bookFile == null || bookFile.Path.IsNullOrWhiteSpace())
            {
                return null;
            }

            var mediaType = bookFile.MediaType != BookFileMediaType.Unknown
                ? bookFile.MediaType
                : MediaFileExtensions.GetMediaTypeForPath(bookFile.Path);

            if (mediaType != BookFileMediaType.Ebook)
            {
                return null;
            }

            var extension = Path.GetExtension(bookFile.Path);
            if (extension.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase))
            {
                return GetPdfPageCount(bookFile.Path);
            }

            if (EpubExtensions.Contains(extension))
            {
                return GetEpubPageCount(bookFile.Path);
            }

            return null;
        }

        private int? GetPdfPageCount(string path)
        {
            try
            {
                var document = PdfReader.Open(path, PdfDocumentOpenMode.InformationOnly);
                return document.PageCount;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Unable to read PDF page count for {0}", path);
                return null;
            }
        }

        private int? GetEpubPageCount(string path)
        {
            try
            {
                var metaPageCount = TryReadEpubPageCountFromMetadata(path);
                if (metaPageCount.HasValue && metaPageCount.Value > 0)
                {
                    return metaPageCount.Value;
                }

                using (var epubArchive = ZipFile.OpenRead(path))
                {
                    var rootFilePath = RootFilePathReader.GetRootFilePathAsync(epubArchive).GetAwaiter().GetResult();
                    var wordCount = CountEpubWords(epubArchive, rootFilePath);

                    if (wordCount <= 0)
                    {
                        return null;
                    }

                    return Math.Max(1, (int)Math.Ceiling(wordCount / (double)WordsPerPage));
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Unable to read EPUB page count for {0}", path);
                return null;
            }
        }

        private int? TryReadEpubPageCountFromMetadata(string path)
        {
            try
            {
                using (var bookRef = EpubReader.OpenBook(path))
                {
                    return ExtractPageCount(bookRef.Schema?.Package?.Metadata?.MetaItems);
                }
            }
            catch (Exception ex)
            {
                _logger.Debug(ex, "EPUB metadata page count not available for {0}", path);
                return null;
            }
        }

        private static int? ExtractPageCount(IEnumerable<EpubMetadataMeta> metaItems)
        {
            if (metaItems == null)
            {
                return null;
            }

            foreach (var item in metaItems)
            {
                if (!IsPageCountMeta(item))
                {
                    continue;
                }

                if (int.TryParse(item.Content, out var pageCount) && pageCount > 0)
                {
                    return pageCount;
                }
            }

            return null;
        }

        private static bool IsPageCountMeta(EpubMetadataMeta item)
        {
            if (item == null)
            {
                return false;
            }

            return ContainsPageCountKey(item.Name) || ContainsPageCountKey(item.Property);
        }

        private static bool ContainsPageCountKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            return value.Equals("page-count", StringComparison.OrdinalIgnoreCase)
                || value.Equals("pagecount", StringComparison.OrdinalIgnoreCase)
                || value.Equals("schema:pageCount", StringComparison.OrdinalIgnoreCase)
                || value.Equals("calibre:page_count", StringComparison.OrdinalIgnoreCase)
                || (value.Contains("page", StringComparison.OrdinalIgnoreCase) && value.Contains("count", StringComparison.OrdinalIgnoreCase));
        }

        private static int CountEpubWords(ZipArchive epubArchive, string rootFilePath)
        {
            var rootDir = ZipPathUtils.GetDirectoryPath(rootFilePath);
            var packageEntry = epubArchive.GetEntry(rootFilePath);
            if (packageEntry == null)
            {
                return 0;
            }

            XDocument packageDocument;
            using (var packageStream = packageEntry.Open())
            {
                packageDocument = XmlUtils.LoadDocumentAsync(packageStream).GetAwaiter().GetResult();
            }

            var opfNamespace = packageDocument.Root?.GetDefaultNamespace() ?? XNamespace.None;
            var manifest = packageDocument.Root?.Element(opfNamespace + "manifest");
            var spine = packageDocument.Root?.Element(opfNamespace + "spine");
            if (manifest == null || spine == null)
            {
                return 0;
            }

            var manifestItems = manifest.Elements(opfNamespace + "item")
                .Select(item => new
                {
                    Id = item.Attribute("id")?.Value,
                    Href = item.Attribute("href")?.Value,
                    MediaType = item.Attribute("media-type")?.Value
                })
                .Where(item => item.Id.IsNotNullOrWhiteSpace() && item.Href.IsNotNullOrWhiteSpace())
                .ToDictionary(item => item.Id, item => item, StringComparer.OrdinalIgnoreCase);

            var spineItemRefs = spine.Elements(opfNamespace + "itemref")
                .Select(item => item.Attribute("idref")?.Value)
                .Where(idref => idref.IsNotNullOrWhiteSpace())
                .ToList();

            var wordCount = 0;

            foreach (var idref in spineItemRefs)
            {
                if (!manifestItems.TryGetValue(idref, out var manifestItem))
                {
                    continue;
                }

                if (!IsHtmlMediaType(manifestItem.MediaType))
                {
                    continue;
                }

                var entryPath = ZipPathUtils.Combine(rootDir, manifestItem.Href);
                var entry = epubArchive.GetEntry(entryPath);
                if (entry == null)
                {
                    continue;
                }

                using (var entryStream = entry.Open())
                using (var reader = new StreamReader(entryStream))
                {
                    var html = reader.ReadToEnd();
                    var text = StripHtml(html);
                    wordCount += CountWords(text);
                }
            }

            return wordCount;
        }

        private static bool IsHtmlMediaType(string mediaType)
        {
            if (mediaType.IsNullOrWhiteSpace())
            {
                return false;
            }

            return mediaType.Contains("html", StringComparison.OrdinalIgnoreCase)
                || mediaType.Contains("xhtml", StringComparison.OrdinalIgnoreCase);
        }

        private static string StripHtml(string html)
        {
            if (html.IsNullOrWhiteSpace())
            {
                return string.Empty;
            }

            var withoutScripts = ScriptStyleRegex.Replace(html, " ");
            var withoutTags = TagRegex.Replace(withoutScripts, " ");
            var decoded = WebUtility.HtmlDecode(withoutTags);
            return decoded ?? string.Empty;
        }

        private static int CountWords(string text)
        {
            if (text.IsNullOrWhiteSpace())
            {
                return 0;
            }

            return WordRegex.Matches(text).Count;
        }
    }
}
