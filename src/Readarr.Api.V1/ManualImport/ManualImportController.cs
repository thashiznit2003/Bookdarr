using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.BookImport.Manual;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Qualities;
using Readarr.Http;

namespace Readarr.Api.V1.ManualImport
{
    [V1ApiController]
    public class ManualImportController : Controller
    {
        private readonly IAuthorService _authorService;
        private readonly IBookService _bookService;
        private readonly IEditionService _editionService;
        private readonly IManualImportService _manualImportService;
        private readonly IAppFolderInfo _appFolderInfo;
        private readonly IDiskProvider _diskProvider;
        private readonly Logger _logger;

        public ManualImportController(IManualImportService manualImportService,
                                  IAuthorService authorService,
                                  IEditionService editionService,
                                  IBookService bookService,
                                  IAppFolderInfo appFolderInfo,
                                  IDiskProvider diskProvider,
                                  Logger logger)
        {
            _authorService = authorService;
            _bookService = bookService;
            _editionService = editionService;
            _manualImportService = manualImportService;
            _appFolderInfo = appFolderInfo;
            _diskProvider = diskProvider;
            _logger = logger;
        }

        [HttpPost]
        public IActionResult UpdateItems(List<ManualImportUpdateResource> resource)
        {
            return Accepted(UpdateImportItems(resource));
        }

        [HttpGet]
        public List<ManualImportResource> GetMediaFiles(string folder, string downloadId, int? authorId, int? bookId, bool filterExistingFiles = true, bool replaceExistingFiles = true)
        {
            NzbDrone.Core.Books.Author author = null;
            Book book = null;
            Edition edition = null;

            if (authorId > 0)
            {
                author = _authorService.GetAuthor(authorId.Value);
            }

            if (bookId > 0)
            {
                book = _bookService.GetBook(bookId.Value);
                if (book != null)
                {
                    edition = _editionService.GetEditionsByBook(book.Id).SingleOrDefault(x => x.Monitored);
                    author = book.Author.Value;
                }
            }

            var filter = filterExistingFiles ? FilterFilesType.Matched : FilterFilesType.None;

            return _manualImportService.GetMediaFiles(folder, downloadId, author, book, edition, filter, replaceExistingFiles)
                .ToResource()
                .Select(AddQualityWeight)
                .ToList();
        }

        [HttpPost("upload")]
        [RequestFormLimits(MultipartBodyLengthLimit = 20L * 1024 * 1024 * 1024)]
        public IActionResult UploadFiles()
        {
            try
            {
                if (!Request.HasFormContentType)
                {
                    return BadRequest("Form data is required.");
                }

                var files = Request.Form?.Files;
                if (files == null || files.Count == 0)
                {
                    return BadRequest("No files uploaded.");
                }

                _logger.Info("Manual import upload started with {0} files", files.Count);

                var uploadRoot = Path.Combine(_appFolderInfo.AppDataFolder, "manual-import");
                _diskProvider.EnsureFolder(uploadRoot);

                var uploadFolder = Path.Combine(uploadRoot, $"{DateTime.UtcNow:yyyyMMdd-HHmmss}-{Guid.NewGuid():N}");
                _diskProvider.EnsureFolder(uploadFolder);

                var savedFiles = new List<string>();

                foreach (var file in files)
                {
                    if (file == null || file.Length == 0)
                    {
                        continue;
                    }

                    var originalName = Path.GetFileName(file.FileName);
                    var cleanName = FileNameBuilder.CleanFileName(originalName);

                    if (string.IsNullOrWhiteSpace(cleanName))
                    {
                        cleanName = "upload" + Path.GetExtension(originalName);
                    }

                    var destination = GetUniquePath(uploadFolder, cleanName);

                    using (var stream = file.OpenReadStream())
                    {
                        _diskProvider.SaveStream(stream, destination);
                    }

                    savedFiles.Add(destination);
                }

                if (!savedFiles.Any())
                {
                    return BadRequest("No files uploaded.");
                }

                _logger.Info("Manual import upload completed. Saved {0} files to {1}", savedFiles.Count, uploadFolder);

                return Ok(new
                {
                    path = uploadFolder,
                    files = savedFiles.Select(Path.GetFileName).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Manual import upload failed");
                return BadRequest($"Unable to upload files: {ex.Message}");
            }
        }

        private string GetUniquePath(string folder, string fileName)
        {
            var candidate = Path.Combine(folder, fileName);

            if (!_diskProvider.FileExists(candidate))
            {
                return candidate;
            }

            var baseName = Path.GetFileNameWithoutExtension(fileName);
            var extension = Path.GetExtension(fileName);

            for (var i = 1; i <= 100; i++)
            {
                candidate = Path.Combine(folder, $"{baseName}-{i}{extension}");

                if (!_diskProvider.FileExists(candidate))
                {
                    return candidate;
                }
            }

            throw new InvalidOperationException("Unable to create a unique upload path.");
        }

        private ManualImportResource AddQualityWeight(ManualImportResource item)
        {
            if (item.Quality != null)
            {
                item.QualityWeight = Quality.DefaultQualityDefinitions.Single(q => q.Quality == item.Quality.Quality).Weight;
                item.QualityWeight += item.Quality.Revision.Real * 10;
                item.QualityWeight += item.Quality.Revision.Version;
            }

            return item;
        }

        private List<ManualImportResource> UpdateImportItems(List<ManualImportUpdateResource> resources)
        {
            var items = new List<ManualImportItem>();
            foreach (var resource in resources)
            {
                items.Add(new ManualImportItem
                {
                    Id = resource.Id,
                    Path = resource.Path,
                    Name = resource.Name,
                    Author = resource.AuthorId.HasValue ? _authorService.GetAuthor(resource.AuthorId.Value) : null,
                    Book = resource.BookId.HasValue ? _bookService.GetBook(resource.BookId.Value) : null,
                    Edition = resource.ForeignEditionId == null ? null : _editionService.GetEditionByForeignEditionId(resource.ForeignEditionId),
                    Quality = resource.Quality,
                    ReleaseGroup = resource.ReleaseGroup,
                    IndexerFlags = resource.IndexerFlags,
                    DownloadId = resource.DownloadId,
                    AdditionalFile = resource.AdditionalFile,
                    ReplaceExistingFiles = resource.ReplaceExistingFiles,
                    DisableReleaseSwitching = resource.DisableReleaseSwitching
                });
            }

            return _manualImportService.UpdateItems(items).Select(x => x.ToResource()).ToList();
        }
    }
}
