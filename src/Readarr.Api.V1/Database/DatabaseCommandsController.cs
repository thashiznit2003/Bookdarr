using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.MediaFiles;
using Readarr.Http;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Database
{
    [V1ApiController("database/commands")]
    public class DatabaseCommandsController : Controller
    {
        private readonly IUserService _userService;
        private readonly IMediaFileRepository _mediaFileRepository;
        private readonly IDiskProvider _diskProvider;
        private readonly Logger _logger;

        public DatabaseCommandsController(IUserService userService,
                                          IMediaFileRepository mediaFileRepository,
                                          IDiskProvider diskProvider,
                                          Logger logger)
        {
            _userService = userService;
            _mediaFileRepository = mediaFileRepository;
            _diskProvider = diskProvider;
            _logger = logger;
        }

        [HttpGet("invalid-file-links")]
        public ActionResult<DatabaseCommandResultResource> GetInvalidFileLinks()
        {
            EnsureAdmin();

            var issues = _mediaFileRepository.GetInvalidBookFileLinks();
            var logs = BuildLogs("Scan", issues);

            return new DatabaseCommandResultResource
            {
                Action = "find-invalid-file-links",
                Message = issues.Any()
                    ? $"Found {issues.Count} file(s) linked to missing editions/books."
                    : "No invalid file links found.",
                Count = issues.Count,
                Items = issues.ToResource(),
                Logs = logs
            };
        }

        [HttpPost("clear-invalid-file-links")]
        public ActionResult<DatabaseCommandResultResource> ClearInvalidFileLinks()
        {
            EnsureAdmin();

            var issues = _mediaFileRepository.ClearInvalidBookFileLinks();
            var logs = BuildLogs("Clear", issues);

            return new DatabaseCommandResultResource
            {
                Action = "clear-invalid-file-links",
                Message = issues.Any()
                    ? $"Cleared {issues.Count} invalid file link(s)."
                    : "No invalid file links to clear.",
                Count = issues.Count,
                Items = issues.ToResource(),
                Logs = logs
            };
        }

        [HttpGet("missing-file-paths")]
        public ActionResult<DatabaseCommandResultResource> GetMissingFilePaths()
        {
            EnsureAdmin();

            var missing = GetMissingFilePathIssues();

            var logs = BuildLogs("MissingFilePaths", missing.Select(issue => issue.Path).ToList());

            return new DatabaseCommandResultResource
            {
                Action = "find-missing-file-paths",
                Message = missing.Any()
                    ? $"Found {missing.Count} file(s) missing on disk."
                    : "No missing file paths found.",
                Count = missing.Count,
                Items = missing,
                Logs = logs
            };
        }

        [HttpPost("clear-missing-file-paths")]
        public ActionResult<DatabaseCommandResultResource> ClearMissingFilePaths()
        {
            EnsureAdmin();

            var missing = GetMissingFilePathIssues();

            if (missing.Any())
            {
                _mediaFileRepository.DeleteMany(missing.Select(issue => issue.BookFileId));
            }

            var logs = BuildLogs("ClearMissingFilePaths", missing.Select(issue => issue.Path).ToList());

            return new DatabaseCommandResultResource
            {
                Action = "clear-missing-file-paths",
                Message = missing.Any()
                    ? $"Removed {missing.Count} file entr{(missing.Count == 1 ? "y" : "ies")} with missing paths."
                    : "No missing file paths to remove.",
                Count = missing.Count,
                Items = missing,
                Logs = logs
            };
        }

        [HttpGet("duplicate-file-paths")]
        public ActionResult<DatabaseCommandResultResource> GetDuplicateFilePaths()
        {
            EnsureAdmin();

            var summaries = _mediaFileRepository.GetBookFileSummaries()
                .Where(item => item.Path.IsNotNullOrWhiteSpace())
                .ToList();

            var decisions = BuildDuplicateFileDecisions(summaries);
            var duplicates = decisions.SelectMany(decision => decision.Remove).ToList();
            var logs = BuildDuplicateLogs("FindDuplicateFilePaths", decisions);

            return new DatabaseCommandResultResource
            {
                Action = "find-duplicate-file-paths",
                Message = duplicates.Any()
                    ? $"Found {duplicates.Count} duplicate file entr{(duplicates.Count == 1 ? "y" : "ies")}."
                    : "No duplicate file entries found.",
                Count = duplicates.Count,
                Items = duplicates.Select(item => new DatabaseCommandIssueResource
                {
                    BookFileId = item.BookFileId,
                    Path = item.Path,
                    EditionId = item.EditionId,
                    Reason = "Duplicate file path detected."
                }).ToList(),
                Logs = logs
            };
        }

        [HttpPost("remove-duplicate-file-paths")]
        public ActionResult<DatabaseCommandResultResource> RemoveDuplicateFilePaths()
        {
            EnsureAdmin();

            var summaries = _mediaFileRepository.GetBookFileSummaries()
                .Where(item => item.Path.IsNotNullOrWhiteSpace())
                .ToList();

            var decisions = BuildDuplicateFileDecisions(summaries);
            var removed = decisions.SelectMany(decision => decision.Remove).ToList();
            var logs = BuildDuplicateLogs("RemoveDuplicateFilePaths", decisions);

            if (removed.Any())
            {
                _mediaFileRepository.DeleteMany(removed.Select(item => item.BookFileId));
                logs.Add($"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss 'UTC'} - RemoveDuplicateFilePaths completed. Removed {removed.Count} entry(ies).");
            }
            else
            {
                logs.Add($"{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss 'UTC'} - RemoveDuplicateFilePaths completed. No entries removed.");
            }

            return new DatabaseCommandResultResource
            {
                Action = "remove-duplicate-file-paths",
                Message = removed.Any()
                    ? $"Removed {removed.Count} duplicate file entry(ies)."
                    : "No duplicate file entries found.",
                Count = removed.Count,
                Items = removed.Select(item => new DatabaseCommandIssueResource
                {
                    BookFileId = item.BookFileId,
                    Path = item.Path,
                    EditionId = item.EditionId,
                    Reason = "Duplicate file path removed."
                }).ToList(),
                Logs = logs
            };
        }

        private void EnsureAdmin()
        {
            var user = _userService.FindUser(HttpContext?.User);

            if (user == null || !user.IsAdmin)
            {
                throw new UnauthorizedException("Admin access required.");
            }
        }

        private List<string> BuildLogs(string action, List<InvalidBookFileLink> issues)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss 'UTC'");
            var logs = new List<string>
            {
                $"{timestamp} - {action} started.",
                $"{timestamp} - {issues.Count} issue(s) detected."
            };

            if (issues.Any())
            {
                logs.AddRange(issues.Select(issue =>
                    $"{timestamp} - File {issue.BookFileId}: {issue.Path} (Edition {issue.EditionId}, Book {issue.BookId?.ToString() ?? "none"}): {issue.Reason}"));
            }

            _logger.Info("Database command {0} completed. Issues: {1}", action, issues.Count);

            return logs;
        }

        private List<string> BuildLogs(string action, List<string> paths)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss 'UTC'");
            var logs = new List<string>
            {
                $"{timestamp} - {action} started.",
                $"{timestamp} - {paths.Count} issue(s) detected."
            };

            if (paths.Any())
            {
                logs.AddRange(paths.Select(path => $"{timestamp} - {path}"));
            }

            _logger.Info("Database command {0} completed. Issues: {1}", action, paths.Count);

            return logs;
        }

        private List<string> BuildDuplicateLogs(string action, List<DuplicateFileDecision> decisions)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss 'UTC'");
            var duplicateCount = decisions.Sum(decision => decision.Remove.Count);
            var logs = new List<string>
            {
                $"{timestamp} - {action} started.",
                $"{timestamp} - {duplicateCount} duplicate entry(ies) detected."
            };

            if (decisions.Any())
            {
                logs.AddRange(decisions.Select(decision =>
                    $"{timestamp} - {decision.Path}: kept {decision.Keep.BookFileId}, duplicates {string.Join(", ", decision.Remove.Select(item => item.BookFileId))}"));
            }

            _logger.Info("Database command {0} completed. Duplicates: {1}", action, duplicateCount);

            return logs;
        }

        private List<DatabaseCommandIssueResource> GetMissingFilePathIssues()
        {
            var summaries = _mediaFileRepository.GetBookFileSummaries();

            return summaries
                .Where(item => item.Path.IsNotNullOrWhiteSpace())
                .Where(item => IsMissingOnDisk(item.Path))
                .Select(item => new DatabaseCommandIssueResource
                {
                    BookFileId = item.BookFileId,
                    Path = item.Path,
                    EditionId = item.EditionId,
                    Reason = "File path not found on disk."
                })
                .ToList();
        }

        private List<DuplicateFileDecision> BuildDuplicateFileDecisions(List<BookFileSummary> summaries)
        {
            var duplicateGroups = summaries
                .GroupBy(item => item.Path, PathEqualityComparer.Instance)
                .Where(group => group.Count() > 1)
                .ToList();

            return duplicateGroups.Select(group =>
            {
                var ordered = group
                    .OrderByDescending(item => item.EditionId > 0)
                    .ThenByDescending(item => item.DateAdded)
                    .ThenByDescending(item => item.BookFileId)
                    .ToList();

                return new DuplicateFileDecision
                {
                    Path = group.Key,
                    Keep = ordered.First(),
                    Remove = ordered.Skip(1).ToList()
                };
            }).ToList();
        }

        private class DuplicateFileDecision
        {
            public string Path { get; set; }
            public BookFileSummary Keep { get; set; }
            public List<BookFileSummary> Remove { get; set; }
        }

        private bool IsMissingOnDisk(string path)
        {
            try
            {
                return !_diskProvider.FileExists(path);
            }
            catch (Exception)
            {
                return true;
            }
        }
    }
}
