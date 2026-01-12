using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Common.Processes;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles.Commands;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using PdfSharpCore.Pdf.IO;

namespace NzbDrone.Core.MediaFiles
{
    public class EbookConversionScanResult
    {
        public bool IsPdf { get; set; }
        public int TotalPages { get; set; }
        public int ImageOnlyPages { get; set; }
        public decimal ImageOnlyPercent { get; set; }
        public bool TextReadable { get; set; }
        public bool IsRough { get; set; }
        public string Warning { get; set; }
    }

    public interface IEbookConversionService
    {
        EbookConversionScanResult Scan(BookFile bookFile);
    }

    public class EbookConversionService : IEbookConversionService, IExecute<ConvertEbookCommand>
    {
        private static readonly Regex OcrTextPresentRegex = new Regex(@"page\s+(?<page>\d+)\s*:\s*text\s+is\s+present", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex OcrTextMissingRegex = new Regex(@"page\s+(?<page>\d+)\s*:\s*text\s+is\s+not\s+present", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex KindleDrmRegex = new Regex(@"drm|encrypted", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly HashSet<string> KindleExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".mobi",
            ".azw",
            ".azw3",
            ".azw4",
            ".kfx"
        };

        private static readonly HashSet<string> EpubExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".epub",
            ".kepub"
        };

        private readonly IBookService _bookService;
        private readonly IEditionService _editionService;
        private readonly IMediaFileService _mediaFileService;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly IDiskProvider _diskProvider;
        private readonly IProcessProvider _processProvider;
        private readonly IAppFolderInfo _appFolderInfo;
        private readonly Logger _logger;

        public EbookConversionService(IBookService bookService,
                                      IEditionService editionService,
                                      IMediaFileService mediaFileService,
                                      IBuildFileNames fileNameBuilder,
                                      IDiskProvider diskProvider,
                                      IProcessProvider processProvider,
                                      IAppFolderInfo appFolderInfo,
                                      Logger logger)
        {
            _bookService = bookService;
            _editionService = editionService;
            _mediaFileService = mediaFileService;
            _fileNameBuilder = fileNameBuilder;
            _diskProvider = diskProvider;
            _processProvider = processProvider;
            _appFolderInfo = appFolderInfo;
            _logger = logger;
        }

        public EbookConversionScanResult Scan(BookFile bookFile)
        {
            if (bookFile == null)
            {
                throw new ArgumentNullException(nameof(bookFile));
            }

            if (!_diskProvider.FileExists(bookFile.Path))
            {
                throw new InvalidOperationException("Ebook file not found.");
            }

            var extension = Path.GetExtension(bookFile.Path);
            if (!string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase))
            {
                return new EbookConversionScanResult
                {
                    IsPdf = false,
                    TotalPages = 0,
                    ImageOnlyPages = 0,
                    ImageOnlyPercent = 0,
                    TextReadable = true,
                    IsRough = false
                };
            }

            return ScanPdf(bookFile.Path);
        }

        public void Execute(ConvertEbookCommand command)
        {
            if (command == null)
            {
                throw new ArgumentNullException(nameof(command));
            }

            var bookFile = _mediaFileService.Get(command.BookFileId);
            if (bookFile == null)
            {
                throw new InvalidOperationException("Ebook file not found.");
            }

            if (!_diskProvider.FileExists(bookFile.Path))
            {
                throw new InvalidOperationException("Ebook file not found.");
            }

            var extension = Path.GetExtension(bookFile.Path);
            if (EpubExtensions.Contains(extension))
            {
                throw new InvalidOperationException("Ebook is already in EPUB format.");
            }

            var edition = _editionService.GetEdition(bookFile.EditionId);
            if (edition == null)
            {
                throw new InvalidOperationException("Ebook edition could not be found.");
            }

            var book = _bookService.GetBook(edition.BookId);
            var author = book.Author.Value;

            var outputPath = BuildEpubOutputPath(author, edition);
            _diskProvider.EnsureFolder(_diskProvider.GetParentFolder(outputPath));

            if (string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase))
            {
                ConvertPdfToEpub(bookFile.Path, outputPath, author, edition);
            }
            else if (KindleExtensions.Contains(extension))
            {
                ConvertKindleToEpub(bookFile.Path, outputPath);
            }
            else
            {
                throw new InvalidOperationException($"Unsupported ebook format for conversion: {extension}");
            }

            EnsureOutputValid(outputPath);

            var outputFile = CreateOutputBookFile(author, edition, outputPath);
            _mediaFileService.Add(outputFile);
        }

        private EbookConversionScanResult ScanPdf(string sourcePath)
        {
            var tempFolder = CreateTempFolder("bookdarr-ebook-scan");
            var sidecarPath = Path.Combine(tempFolder, "scan.txt");
            var outputPath = Path.Combine(tempFolder, "scan.pdf");

            try
            {
                var output = RunProcess("ocrmypdf", BuildOcrScanArguments(sourcePath, outputPath, sidecarPath));
                if (output.ExitCode != 0)
                {
                    throw new InvalidOperationException("OCR scan failed. Ensure ocrmypdf is installed.");
                }

                var totalPages = GetPdfPageCount(sourcePath);
                var scanSummary = ParseOcrOutput(output.Lines);
                var textReadable = HasReadableText(sidecarPath);
                var imageOnlyPages = scanSummary.ImageOnlyPages.Count;
                var imagePercent = totalPages > 0 ? Math.Round(imageOnlyPages * 100m / totalPages, 1) : 0m;
                var isRough = (totalPages > 0 && imagePercent >= 80m) || !textReadable;

                var warning = BuildScanWarning(totalPages, imagePercent, textReadable);

                return new EbookConversionScanResult
                {
                    IsPdf = true,
                    TotalPages = totalPages,
                    ImageOnlyPages = imageOnlyPages,
                    ImageOnlyPercent = imagePercent,
                    TextReadable = textReadable,
                    IsRough = isRough,
                    Warning = warning
                };
            }
            finally
            {
                SafeDeleteFolder(tempFolder);
            }
        }

        private void ConvertPdfToEpub(string sourcePath, string outputPath, Author author, Edition edition)
        {
            var tempFolder = CreateTempFolder("bookdarr-ebook-convert");
            var sidecarPath = Path.Combine(tempFolder, "ocr.txt");
            var ocrOutputPath = Path.Combine(tempFolder, "ocr.pdf");
            var imagesFolder = Path.Combine(tempFolder, "images");

            try
            {
                _logger.Info("Converting PDF ebook to EPUB: {0}", sourcePath);
                _logger.ProgressInfo("Starting PDF to EPUB conversion...");

                _logger.ProgressInfo("Performing OCR text extraction...");
                var output = RunProcess("ocrmypdf", BuildOcrConversionArguments(sourcePath, ocrOutputPath, sidecarPath));
                if (output.ExitCode != 0)
                {
                    throw new InvalidOperationException("OCR conversion failed. Ensure ocrmypdf is installed.");
                }

                var textContent = _diskProvider.FileExists(sidecarPath) ? _diskProvider.ReadAllText(sidecarPath) : string.Empty;

                _logger.ProgressInfo("Extracting images from PDF...");
                _diskProvider.EnsureFolder(imagesFolder);
                var imageFiles = ExtractPdfImages(sourcePath, imagesFolder);

                _logger.ProgressInfo("Creating EPUB file...");
                CreateEpubFromTextAndImages(textContent, imageFiles, outputPath, author, edition);

                _logger.ProgressInfo("PDF to EPUB conversion completed successfully");
            }
            finally
            {
                SafeDeleteFolder(tempFolder);
            }
        }

        private void ConvertKindleToEpub(string sourcePath, string outputPath)
        {
            var tempFolder = CreateTempFolder("bookdarr-kindle-unpack");

            try
            {
                _logger.Info("Converting Kindle ebook to EPUB: {0}", sourcePath);
                _logger.ProgressInfo("Starting Kindle to EPUB conversion...");

                _logger.ProgressInfo("Unpacking Kindle format...");
                var output = RunProcess("kindleunpack", $"\"{sourcePath}\" \"{tempFolder}\"");

                if (output.Lines.Any(line => KindleDrmRegex.IsMatch(line.Content)))
                {
                    throw new InvalidOperationException("KindleUnpack reported DRM/encryption. Unable to convert.");
                }

                if (output.ExitCode != 0)
                {
                    throw new InvalidOperationException("KindleUnpack conversion failed. Ensure kindleunpack is installed.");
                }

                _logger.ProgressInfo("Extracting EPUB file...");
                var epubFile = _diskProvider.GetFiles(tempFolder, true)
                    .FirstOrDefault(file => file.EndsWith(".epub", StringComparison.OrdinalIgnoreCase));

                if (epubFile.IsNullOrWhiteSpace())
                {
                    throw new InvalidOperationException("KindleUnpack did not produce an EPUB file.");
                }

                _diskProvider.CopyFile(epubFile, outputPath, true);

                _logger.ProgressInfo("Kindle to EPUB conversion completed successfully");
            }
            finally
            {
                SafeDeleteFolder(tempFolder);
            }
        }

        private string BuildEpubOutputPath(Author author, Edition edition)
        {
            var namingBookFile = new BookFile
            {
                Part = 1,
                PartCount = 1,
                Quality = new QualityModel(Quality.EPUB),
                MediaInfo = new MediaInfoModel()
            };

            var fileName = _fileNameBuilder.BuildBookFileName(author, edition, namingBookFile);
            var outputPath = _fileNameBuilder.BuildBookFilePath(author, edition, fileName, ".epub");

            return EnsureUniqueOutputPath(outputPath);
        }

        private string EnsureUniqueOutputPath(string outputPath)
        {
            if (!_diskProvider.FileExists(outputPath))
            {
                return outputPath;
            }

            var folder = _diskProvider.GetParentFolder(outputPath);
            var fileName = Path.GetFileNameWithoutExtension(outputPath);
            var extension = Path.GetExtension(outputPath);

            for (var i = 1; i <= 100; i++)
            {
                var suffix = i == 1 ? "-converted" : $"-converted-{i}";
                var candidate = Path.Combine(folder, $"{fileName}{suffix}{extension}");

                if (!_diskProvider.FileExists(candidate))
                {
                    return candidate;
                }
            }

            throw new InvalidOperationException("Unable to create a unique EPUB output path.");
        }

        private BookFile CreateOutputBookFile(Author author, Edition edition, string outputPath)
        {
            var outputInfo = _diskProvider.GetFileInfo(outputPath);
            var outputQuality = new QualityModel(MediaFileExtensions.GetQualityForExtension(Path.GetExtension(outputPath)));

            return new BookFile
            {
                Path = outputPath,
                Size = outputInfo.Length,
                Modified = outputInfo.LastWriteTimeUtc,
                DateAdded = DateTime.UtcNow,
                Quality = outputQuality,
                MediaInfo = new MediaInfoModel(),
                MediaType = BookFileMediaType.Ebook,
                Part = 1,
                PartCount = 1,
                EditionId = edition.Id,
                Author = author,
                Edition = edition
            };
        }

        private void EnsureOutputValid(string outputPath)
        {
            if (!_diskProvider.FileExists(outputPath))
            {
                throw new InvalidOperationException("Converted EPUB output file was not created.");
            }

            var outputInfo = _diskProvider.GetFileInfo(outputPath);
            if (outputInfo.Length <= 0)
            {
                throw new InvalidOperationException("Converted EPUB output file is empty.");
            }
        }

        private string CreateTempFolder(string prefix)
        {
            var tempFolder = Path.Combine(_appFolderInfo.TempFolder, $"{prefix}-{Guid.NewGuid():N}");
            _diskProvider.EnsureFolder(tempFolder);
            return tempFolder;
        }

        private void SafeDeleteFolder(string folder)
        {
            if (folder.IsNullOrWhiteSpace())
            {
                return;
            }

            try
            {
                if (_diskProvider.FolderExists(folder))
                {
                    _diskProvider.DeleteFolder(folder, true);
                }
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Failed to clean up temp folder: {0}", folder);
            }
        }

        private string BuildOcrScanArguments(string sourcePath, string outputPath, string sidecarPath)
        {
            var builder = new StringBuilder();
            builder.Append("--skip-text ");
            builder.Append($"--sidecar \"{sidecarPath}\" ");
            builder.Append($"\"{sourcePath}\" ");
            builder.Append($"\"{outputPath}\"");
            return builder.ToString();
        }

        private string BuildOcrConversionArguments(string sourcePath, string outputPath, string sidecarPath)
        {
            var builder = new StringBuilder();
            builder.Append("--force-ocr ");
            builder.Append($"--sidecar \"{sidecarPath}\" ");
            builder.Append($"\"{sourcePath}\" ");
            builder.Append($"\"{outputPath}\"");
            return builder.ToString();
        }

        private ProcessOutput RunProcess(string tool, string args)
        {
            try
            {
                return _processProvider.StartAndCapture(tool, args);
            }
            catch (Win32Exception ex)
            {
                throw new InvalidOperationException($"Required tool '{tool}' was not found on the system path.", ex);
            }
        }

        private int GetPdfPageCount(string sourcePath)
        {
            try
            {
                var pdf = PdfReader.Open(sourcePath, PdfDocumentOpenMode.InformationOnly);
                return pdf.PageCount;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Unable to read PDF page count for scan.");
                return 0;
            }
        }

        private ScanSummary ParseOcrOutput(List<ProcessOutputLine> lines)
        {
            var summary = new ScanSummary();

            foreach (var line in lines)
            {
                var presentMatch = OcrTextPresentRegex.Match(line.Content ?? string.Empty);
                if (presentMatch.Success && int.TryParse(presentMatch.Groups["page"].Value, out var presentPage))
                {
                    summary.TextPresentPages.Add(presentPage);
                    continue;
                }

                var missingMatch = OcrTextMissingRegex.Match(line.Content ?? string.Empty);
                if (missingMatch.Success && int.TryParse(missingMatch.Groups["page"].Value, out var missingPage))
                {
                    summary.ImageOnlyPages.Add(missingPage);
                }
            }

            return summary;
        }

        private bool HasReadableText(string sidecarPath)
        {
            if (!_diskProvider.FileExists(sidecarPath))
            {
                return false;
            }

            var contents = _diskProvider.ReadAllText(sidecarPath);
            return !contents.IsNullOrWhiteSpace();
        }

        private string BuildScanWarning(int totalPages, decimal imagePercent, bool textReadable)
        {
            if (totalPages <= 0)
            {
                return "Unable to determine page makeup. Conversion quality may vary.";
            }

            if (imagePercent >= 80m || !textReadable)
            {
                return "This PDF is likely to convert roughly because it is mostly images or the text could not be read.";
            }

            return null;
        }

        private List<string> ExtractPdfImages(string sourcePath, string outputFolder)
        {
            var imagePrefix = Path.Combine(outputFolder, "page");

            try
            {
                var output = RunProcess("pdfimages", $"-all \"{sourcePath}\" \"{imagePrefix}\"");
                if (output.ExitCode != 0)
                {
                    _logger.Warn("pdfimages extraction failed or returned non-zero exit code. Continuing without images.");
                    return new List<string>();
                }

                var imageFiles = _diskProvider.GetFiles(outputFolder, false)
                    .Where(f => IsValidImageExtension(Path.GetExtension(f)))
                    .OrderBy(f => f)
                    .ToList();

                _logger.Info("Extracted {0} images from PDF", imageFiles.Count);
                return imageFiles;
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Failed to extract images from PDF. Continuing without images.");
                return new List<string>();
            }
        }

        private bool IsValidImageExtension(string extension)
        {
            var validExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ppm", ".pbm", ".pgm" };
            return validExtensions.Contains(extension.ToLowerInvariant());
        }

        private void CreateEpubFromTextAndImages(string textContent, List<string> imageFiles, string outputPath, Author author, Edition edition)
        {
            var tempFolder = CreateTempFolder("bookdarr-epub");
            var oebpsFolder = Path.Combine(tempFolder, "OEBPS");
            var oebpsImagesFolder = Path.Combine(oebpsFolder, "images");
            var metaInfFolder = Path.Combine(tempFolder, "META-INF");
            _diskProvider.EnsureFolder(oebpsFolder);
            _diskProvider.EnsureFolder(metaInfFolder);

            if (imageFiles != null && imageFiles.Any())
            {
                _diskProvider.EnsureFolder(oebpsImagesFolder);
            }

            var title = edition?.Title ?? "Bookdarr Conversion";
            var creator = author?.Name ?? "Bookdarr";
            var bookId = $"urn:uuid:{Guid.NewGuid()}";

            var containerXml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                               "<container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\">\n" +
                               "  <rootfiles>\n" +
                               "    <rootfile full-path=\"OEBPS/content.opf\" media-type=\"application/oebps-package+xml\" />\n" +
                               "  </rootfiles>\n" +
                               "</container>\n";

            var imageManifestItems = new StringBuilder();
            var copiedImagePaths = new List<string>();

            if (imageFiles != null)
            {
                for (var i = 0; i < imageFiles.Count; i++)
                {
                    var sourceImagePath = imageFiles[i];
                    var extension = Path.GetExtension(sourceImagePath).ToLowerInvariant();
                    var imageFileName = $"image-{i:D4}{extension}";
                    var destImagePath = Path.Combine(oebpsImagesFolder, imageFileName);

                    _diskProvider.CopyFile(sourceImagePath, destImagePath, false);
                    copiedImagePaths.Add($"images/{imageFileName}");

                    var mediaType = GetImageMediaType(extension);
                    imageManifestItems.AppendLine($"    <item id=\"img{i}\" href=\"images/{imageFileName}\" media-type=\"{mediaType}\" />");
                }
            }

            var contentOpf = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                             "<package xmlns=\"http://www.idpf.org/2007/opf\" version=\"3.0\" unique-identifier=\"bookid\">\n" +
                             "  <metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\">\n" +
                             $"    <dc:identifier id=\"bookid\">{WebUtility.HtmlEncode(bookId)}</dc:identifier>\n" +
                             $"    <dc:title>{WebUtility.HtmlEncode(title)}</dc:title>\n" +
                             $"    <dc:creator>{WebUtility.HtmlEncode(creator)}</dc:creator>\n" +
                             "    <dc:language>en</dc:language>\n" +
                             "  </metadata>\n" +
                             "  <manifest>\n" +
                             "    <item id=\"nav\" properties=\"nav\" href=\"nav.xhtml\" media-type=\"application/xhtml+xml\" />\n" +
                             "    <item id=\"content\" href=\"content.xhtml\" media-type=\"application/xhtml+xml\" />\n" +
                             imageManifestItems +
                             "  </manifest>\n" +
                             "  <spine>\n" +
                             "    <itemref idref=\"content\" />\n" +
                             "  </spine>\n" +
                             "</package>\n";

            var navXhtml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                           "<!DOCTYPE html>\n" +
                           "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
                           "<head><title>Navigation</title></head>\n" +
                           "<body>\n" +
                           "  <nav epub:type=\"toc\" id=\"toc\">\n" +
                           $"    <h1>{WebUtility.HtmlEncode(title)}</h1>\n" +
                           "    <ol>\n" +
                           "      <li><a href=\"content.xhtml\">Content</a></li>\n" +
                           "    </ol>\n" +
                           "  </nav>\n" +
                           "</body>\n" +
                           "</html>\n";

            var contentXhtml = BuildContentXhtmlWithImages(textContent, copiedImagePaths, title);

            _diskProvider.WriteAllText(Path.Combine(tempFolder, "mimetype"), "application/epub+zip");
            _diskProvider.WriteAllText(Path.Combine(metaInfFolder, "container.xml"), containerXml);
            _diskProvider.WriteAllText(Path.Combine(oebpsFolder, "content.opf"), contentOpf);
            _diskProvider.WriteAllText(Path.Combine(oebpsFolder, "nav.xhtml"), navXhtml);
            _diskProvider.WriteAllText(Path.Combine(oebpsFolder, "content.xhtml"), contentXhtml);

            try
            {
                WriteEpubArchive(outputPath, tempFolder);
            }
            finally
            {
                SafeDeleteFolder(tempFolder);
            }
        }

        private string GetImageMediaType(string extension)
        {
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".ppm" or ".pbm" or ".pgm" => "image/x-portable-pixmap",
                _ => "image/jpeg"
            };
        }

        private string BuildContentXhtmlWithImages(string textContent, List<string> imagePaths, string title)
        {
            var normalized = textContent ?? string.Empty;
            normalized = normalized.Replace("\r\n", "\n");
            var pages = normalized.Split('\f');
            var builder = new StringBuilder();

            var imageIndex = 0;
            var totalImages = imagePaths?.Count ?? 0;

            for (var i = 0; i < pages.Length; i++)
            {
                var pageText = pages[i].Trim();

                if (imageIndex < totalImages)
                {
                    builder.AppendLine($"    <div class=\"page-image\">");
                    builder.AppendLine($"      <img src=\"{imagePaths[imageIndex]}\" alt=\"Page {i + 1}\" />");
                    builder.AppendLine($"    </div>");
                    imageIndex++;
                }

                if (!pageText.IsNullOrWhiteSpace())
                {
                    var paragraphs = pageText.Split(new[] { "\n\n" }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var paragraph in paragraphs)
                    {
                        var escaped = WebUtility.HtmlEncode(paragraph.Trim());
                        escaped = escaped.Replace("\n", "<br />\n");
                        builder.AppendLine($"    <p>{escaped}</p>");
                    }
                }

                if (i < pages.Length - 1)
                {
                    builder.AppendLine("    <hr class=\"page-break\" />");
                }
            }

            while (imageIndex < totalImages)
            {
                builder.AppendLine($"    <div class=\"page-image\">");
                builder.AppendLine($"      <img src=\"{imagePaths[imageIndex]}\" alt=\"Image {imageIndex + 1}\" />");
                builder.AppendLine($"    </div>");
                imageIndex++;
            }

            if (builder.Length == 0)
            {
                builder.AppendLine("    <p>No readable text was extracted from the source file.</p>");
            }

            return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
                   "<!DOCTYPE html>\n" +
                   "<html xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
                   "<head>\n" +
                   $"  <title>{WebUtility.HtmlEncode(title)}</title>\n" +
                   "  <style>\n" +
                   "    .page-break{margin:1.5em 0;border:none;border-top:1px solid #ccc;}\n" +
                   "    .page-image{text-align:center;margin:1em 0;}\n" +
                   "    .page-image img{max-width:100%;height:auto;}\n" +
                   "  </style>\n" +
                   "</head>\n" +
                   "<body>\n" +
                   builder +
                   "</body>\n" +
                   "</html>\n";
        }

        private string BuildContentXhtml(string textContent, string title)
        {
            return BuildContentXhtmlWithImages(textContent, null, title);
        }

        private void WriteEpubArchive(string outputPath, string sourceFolder)
        {
            if (_diskProvider.FileExists(outputPath))
            {
                _diskProvider.DeleteFile(outputPath);
            }

            using var archive = ZipFile.Open(outputPath, ZipArchiveMode.Create);

            var mimetypePath = Path.Combine(sourceFolder, "mimetype");
            AddZipEntry(archive, "mimetype", mimetypePath, CompressionLevel.NoCompression);

            AddFolderToZip(archive, sourceFolder, "META-INF");
            AddFolderToZip(archive, sourceFolder, "OEBPS");
        }

        private void AddFolderToZip(ZipArchive archive, string rootFolder, string relativeFolder)
        {
            var fullPath = Path.Combine(rootFolder, relativeFolder);
            var files = _diskProvider.GetFiles(fullPath, true);

            foreach (var file in files)
            {
                var fileRelativePath = file.Substring(rootFolder.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                AddZipEntry(archive, fileRelativePath.Replace('\\', '/'), file, CompressionLevel.Optimal);
            }
        }

        private void AddZipEntry(ZipArchive archive, string entryName, string sourcePath, CompressionLevel compressionLevel)
        {
            var entry = archive.CreateEntry(entryName, compressionLevel);
            using var entryStream = entry.Open();
            using var fileStream = _diskProvider.OpenReadStream(sourcePath);
            fileStream.CopyTo(entryStream);
        }

        private class ScanSummary
        {
            public HashSet<int> TextPresentPages { get; } = new HashSet<int>();
            public HashSet<int> ImageOnlyPages { get; } = new HashSet<int>();
        }
    }
}
