using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using Readarr.Http;

namespace Readarr.Api.V1.MediaCovers
{
    [V1ApiController]
    public class MediaCoverController : Controller
    {
        private static readonly Regex RegexResizedImage = new Regex(@"-\d+(?=\.(jpg|png|gif)$)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex RegexResizedNoExtension = new Regex(@"-\d+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private readonly IAppFolderInfo _appFolderInfo;
        private readonly IDiskProvider _diskProvider;
        private readonly IContentTypeProvider _mimeTypeProvider;

        public MediaCoverController(IAppFolderInfo appFolderInfo, IDiskProvider diskProvider)
        {
            _appFolderInfo = appFolderInfo;
            _diskProvider = diskProvider;
            _mimeTypeProvider = new FileExtensionContentTypeProvider();
        }

        [HttpGet(@"author/{authorId:int}/{filename}")]
        public IActionResult GetAuthorMediaCover(int authorId, string filename)
        {
            var folder = Path.Combine(_appFolderInfo.GetAppDataPath(), "MediaCover", authorId.ToString());

            if (!TryFindMediaCover(folder, filename, out var filePath))
            {
                return NotFound();
            }

            return PhysicalFile(filePath, GetContentType(filePath));
        }

        [HttpGet(@"book/{bookId:int}/{filename}")]
        public IActionResult GetBookMediaCover(int bookId, string filename)
        {
            var folder = Path.Combine(_appFolderInfo.GetAppDataPath(), "MediaCover", "Books", bookId.ToString());

            if (!TryFindMediaCover(folder, filename, out var filePath))
            {
                return NotFound();
            }

            return PhysicalFile(filePath, GetContentType(filePath));
        }

        private bool TryFindMediaCover(string folder, string filename, out string resolvedPath)
        {
            if (!_diskProvider.FolderExists(folder))
            {
                resolvedPath = null;
                return false;
            }

            var candidates = new List<string>();

            var directPath = Path.Combine(folder, filename);
            candidates.Add(directPath);

            var nameWithoutExtension = Path.GetFileNameWithoutExtension(filename);

            if (!string.Equals(nameWithoutExtension, filename, StringComparison.Ordinal))
            {
                candidates.Add(Path.Combine(folder, nameWithoutExtension));
            }

            var resizedWithExtension = RegexResizedImage.Replace(directPath, "");
            if (!resizedWithExtension.Equals(directPath, StringComparison.Ordinal))
            {
                candidates.Add(resizedWithExtension);
            }

            var noExtPath = Path.Combine(folder, nameWithoutExtension);
            var resizedNoExt = RegexResizedNoExtension.Replace(noExtPath, "");
            if (!resizedNoExt.Equals(noExtPath, StringComparison.Ordinal))
            {
                candidates.Add(resizedNoExt);
            }

            foreach (var candidate in candidates.Distinct())
            {
                if (TryUseFile(candidate, out resolvedPath))
                {
                    return true;
                }
            }

            resolvedPath = null;
            return false;
        }

        private bool TryUseFile(string path, out string resolvedPath)
        {
            if (_diskProvider.FileExists(path) && _diskProvider.GetFileSize(path) > 0)
            {
                resolvedPath = path;
                return true;
            }

            resolvedPath = null;
            return false;
        }

        private string GetContentType(string filePath)
        {
            if (!_mimeTypeProvider.TryGetContentType(filePath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
    }
}
