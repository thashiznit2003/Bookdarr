using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Annotations;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Download.Clients.Stacks;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RemotePathMappings;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Download.Clients.AnnasArchiveDirect
{
    public class AnnasArchiveDirect : DownloadClientBase<AnnasArchiveDirectSettings>
    {
        private static readonly Regex SlowDownloadRegex = new Regex("href\\s*=\\s*[\"'](?<url>[^\"']*slow_download[^\"']*)[\"']",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex DownloadNowRegex = new Regex("<a[^>]+href\\s*=\\s*[\"'](?<url>[^\"']+)[\"'][^>]*>\\s*(?:<[^>]+>\\s*)*Download\\s*Now\\s*(?:<[^>]+>\\s*)*</a>",
            RegexOptions.IgnoreCase | RegexOptions.Compiled | RegexOptions.Singleline);
        private static readonly Regex DataDownloadUrlRegex = new Regex("data-download-url\\s*=\\s*[\"'](?<url>[^\"']+)[\"']",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex DirectFileUrlRegex = new Regex("(?<url>https?://[^\"'\\s>]+\\.(?:epub|pdf|mobi|azw3|azw4|azw|kfx|djvu|fb2|txt|rtf|docx?|lit|prc|cbz|cbr|zip|rar|7z)(?:[^\"'\\s>]*)?)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex MetaRefreshRegex = new Regex("http-equiv\\s*=\\s*[\"']refresh[\"'][^>]*content\\s*=\\s*[\"'][^\"']*url=(?<url>[^\"'>]+)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex Md5Regex = new Regex("(?<md5>[a-f0-9]{32})", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private static readonly Regex ContentDispositionFileNameRegex = new Regex("filename\\*=(?<value>[^;]+)|filename=(?<fallback>[^;]+)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private readonly IHttpClient _httpClient;
        private readonly IStacksProxy _stacksProxy;
        private readonly IDownloadClientRepository _downloadClientRepository;
        private readonly IDiskScanService _diskScanService;
        private readonly ICached<HashSet<string>> _fallbackMd5Cache;

        public AnnasArchiveDirect(IHttpClient httpClient,
                                  IStacksProxy stacksProxy,
                                  IDownloadClientRepository downloadClientRepository,
                                  IDiskScanService diskScanService,
                                  ICacheManager cacheManager,
                                  IConfigService configService,
                                  IDiskProvider diskProvider,
                                  IRemotePathMappingService remotePathMappingService,
                                  Logger logger)
            : base(configService, diskProvider, remotePathMappingService, logger)
        {
            _httpClient = httpClient;
            _stacksProxy = stacksProxy;
            _downloadClientRepository = downloadClientRepository;
            _diskScanService = diskScanService;
            _fallbackMd5Cache = cacheManager.GetCache<HashSet<string>>(GetType(), "fallback-md5");
        }

        public override string Name => "Anna's Archive Direct";

        public override DownloadProtocol Protocol => DownloadProtocol.Direct;

        public override async Task<string> Download(RemoteBook remoteBook, IIndexer indexer)
        {
            if (Settings.DownloadFolder.IsNullOrWhiteSpace())
            {
                throw new DownloadClientException("Download folder must be set for Anna's Archive Direct.");
            }

            var infoUrl = remoteBook.Release.DownloadUrl.IsNotNullOrWhiteSpace()
                ? remoteBook.Release.DownloadUrl
                : remoteBook.Release.InfoUrl;

            if (infoUrl.IsNullOrWhiteSpace())
            {
                throw new DownloadClientException("Release does not have an Anna's Archive URL to download.");
            }

            try
            {
                var downloadUrl = await ResolveSlowDownloadUrl(infoUrl);
                var timeout = TimeSpan.FromSeconds((int)Settings.DownloadTimeout);
                var filePath = await DownloadSlowFile(remoteBook, downloadUrl, timeout, infoUrl);

                return GetDownloadClientId(filePath);
            }
            catch (Exception ex)
            {
                if (Settings.StacksDownloadClientId > 0)
                {
                    _logger.Warn(ex, "Slow download failed, falling back to Stacks.");
                    return DownloadWithStacks(remoteBook);
                }

                throw;
            }
        }

        public override IEnumerable<DownloadClientItem> GetItems()
        {
            var items = new List<DownloadClientItem>();

            items.AddRange(GetDirectDownloadItems());

            if (Settings.StacksDownloadClientId > 0)
            {
                items.AddRange(GetStacksFallbackItems());
            }

            return items;
        }

        public override void RemoveItem(DownloadClientItem item, bool deleteData)
        {
            if (item == null)
            {
                return;
            }

            if (Settings.StacksDownloadClientId > 0 && TryRemoveStacksItem(item))
            {
                return;
            }

            if (!deleteData)
            {
                throw new NotSupportedException("Anna's Archive Direct cannot remove items without deleting data.");
            }

            DeleteItemData(item);
        }

        public override DownloadClientInfo GetStatus()
        {
            var info = new DownloadClientInfo
            {
                IsLocalhost = true,
                RemovesCompletedDownloads = false
            };

            if (Settings.DownloadFolder.IsNotNullOrWhiteSpace())
            {
                info.OutputRootFolders.Add(new OsPath(Settings.DownloadFolder));
            }

            return info;
        }

        public override object RequestAction(string action, IDictionary<string, string> query)
        {
            if (action == "stacksDownloadClients")
            {
                var options = new List<FieldSelectOption>
                {
                    new FieldSelectOption
                    {
                        Value = 0,
                        Name = "Disabled",
                        Order = 0
                    }
                };

                var stacksClients = _downloadClientRepository.All()
                    .Where(c => c.Settings is StacksSettings)
                    .OrderBy(c => c.Name)
                    .ToList();

                var order = 1;
                foreach (var client in stacksClients)
                {
                    options.Add(new FieldSelectOption
                    {
                        Value = client.Id,
                        Name = client.Name,
                        Order = order++
                    });
                }

                return new
                {
                    options
                };
            }

            return base.RequestAction(action, query);
        }

        protected override void Test(List<ValidationFailure> failures)
        {
            failures.AddIfNotNull(TestFolder(Settings.DownloadFolder, "DownloadFolder"));

            if (Settings.StacksDownloadClientId <= 0)
            {
                return;
            }

            var stacksSettings = GetStacksSettings(failures);
            if (stacksSettings == null)
            {
                return;
            }

            failures.AddIfNotNull(TestStacksConnection(stacksSettings));

            if (failures.HasErrors())
            {
                return;
            }

            failures.AddIfNotNull(TestStacksApiKey(stacksSettings));
        }

        private async Task<string> ResolveSlowDownloadUrl(string infoUrl)
        {
            if (infoUrl.IsNullOrWhiteSpace())
            {
                return infoUrl;
            }

            if (infoUrl.Contains("/slow_download/", StringComparison.InvariantCultureIgnoreCase))
            {
                return infoUrl;
            }

            if (!infoUrl.Contains("/md5/", StringComparison.InvariantCultureIgnoreCase))
            {
                return infoUrl;
            }

            var request = new HttpRequest(infoUrl)
            {
                AllowAutoRedirect = true,
                RequestTimeout = TimeSpan.FromSeconds(30)
            };

            var response = await _httpClient.GetAsync(request);

            if (response.Headers.ContentType != null &&
                !response.Headers.ContentType.Contains("text/html", StringComparison.InvariantCultureIgnoreCase))
            {
                throw new DownloadClientException("Anna's Archive response did not contain HTML content.");
            }

            var downloadUrl = ExtractPreferredDownloadUrl(response.Content, response.Request.Url);
            downloadUrl = NormalizeDownloadUrl(downloadUrl, response.Request.Url.FullUri);
            if (downloadUrl.IsNotNullOrWhiteSpace())
            {
                return downloadUrl;
            }

            downloadUrl = ExtractSlowDownloadUrl(response.Content, response.Request.Url);
            downloadUrl = NormalizeDownloadUrl(downloadUrl, response.Request.Url.FullUri);
            if (downloadUrl.IsNullOrWhiteSpace())
            {
                throw new DownloadClientException("Unable to locate the slow download link on Anna's Archive.");
            }

            return downloadUrl;
        }

        private async Task<string> DownloadSlowFile(RemoteBook remoteBook, string downloadUrl, TimeSpan timeout, string refererUrl)
        {
            if (downloadUrl.IsNullOrWhiteSpace())
            {
                throw new DownloadClientException("Slow download URL was empty.");
            }

            downloadUrl = NormalizeDownloadUrl(downloadUrl, refererUrl);

            _diskProvider.EnsureFolder(Settings.DownloadFolder);

            var fileName = GetFileNameFromUrl(downloadUrl);
            var baseFileName = fileName.IsNullOrWhiteSpace()
                ? FileNameBuilder.CleanFileName(remoteBook.Release.Title)
                : FileNameBuilder.CleanFileName(fileName);

            var tempFilePath = Path.Combine(Settings.DownloadFolder, $"{Guid.NewGuid():N}.part");

            try
            {
                var response = await DownloadFileWithTimeout(downloadUrl, tempFilePath, timeout, refererUrl, 0);
                var resolvedFileName = GetFileNameFromResponse(response) ?? baseFileName;
                var finalFilePath = GetUniquePath(Path.Combine(Settings.DownloadFolder, resolvedFileName));

                if (File.Exists(finalFilePath))
                {
                    File.Delete(finalFilePath);
                }

                File.Move(tempFilePath, finalFilePath);

                return finalFilePath;
            }
            finally
            {
                if (File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }
        }

        private async Task<HttpResponse> DownloadFileWithTimeout(string url, string filePath, TimeSpan timeout, string refererUrl, int depth)
        {
            HttpResponse response;

            await using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.ReadWrite, FileShare.None))
            {
                var request = new HttpRequest(url)
                {
                    AllowAutoRedirect = true,
                    RequestTimeout = timeout,
                    ResponseStream = fileStream
                };

                if (refererUrl.IsNotNullOrWhiteSpace())
                {
                    request.Headers.Add("Referer", refererUrl);
                }

                response = await _httpClient.GetAsync(request);
            }

            if (response.Headers.ContentType != null &&
                response.Headers.ContentType.Contains("text/html", StringComparison.InvariantCultureIgnoreCase))
            {
                var html = File.ReadAllText(filePath);
                var downloadUrl = ExtractPreferredDownloadUrl(html, response.Request.Url);
                downloadUrl = NormalizeDownloadUrl(downloadUrl, response.Request.Url.FullUri);

                if (downloadUrl.IsNotNullOrWhiteSpace() && depth < 1)
                {
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }

                    if (downloadUrl.Equals(url, StringComparison.InvariantCultureIgnoreCase))
                    {
                        throw new DownloadClientException("Anna's Archive redirected to a loop instead of a file.");
                    }

                    return await DownloadFileWithTimeout(downloadUrl, filePath, timeout, response.Request.Url.FullUri, depth + 1);
                }

                throw new DownloadClientException("Anna's Archive returned HTML instead of a file.");
            }

            return response;
        }

        private IEnumerable<DownloadClientItem> GetDirectDownloadItems()
        {
            if (Settings.DownloadFolder.IsNullOrWhiteSpace() || !_diskProvider.FolderExists(Settings.DownloadFolder))
            {
                return Enumerable.Empty<DownloadClientItem>();
            }

            var files = _diskScanService.GetBookFiles(Settings.DownloadFolder, false);
            var filtered = _diskScanService.FilterFiles(Settings.DownloadFolder, files);
            var items = new List<DownloadClientItem>();

            foreach (var file in filtered)
            {
                var downloadId = GetDownloadClientId(file.FullName);

                items.Add(new DownloadClientItem
                {
                    DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                    DownloadId = downloadId,
                    Title = file.Name,
                    TotalSize = file.Length,
                    OutputPath = new OsPath(file.FullName),
                    Status = _diskProvider.IsFileLocked(file.FullName) ? DownloadItemStatus.Downloading : DownloadItemStatus.Completed,
                    CanMoveFiles = true,
                    CanBeRemoved = true
                });
            }

            return items;
        }

        private IEnumerable<DownloadClientItem> GetStacksFallbackItems()
        {
            var stacksSettings = GetStacksSettings(null);
            if (stacksSettings == null)
            {
                return Enumerable.Empty<DownloadClientItem>();
            }

            var fallbackMd5s = GetFallbackMd5s();
            if (fallbackMd5s.Count == 0)
            {
                return Enumerable.Empty<DownloadClientItem>();
            }

            var status = _stacksProxy.GetStatus(stacksSettings);
            var items = new List<DownloadClientItem>();

            if (status?.Current != null && fallbackMd5s.Contains(status.Current.Md5))
            {
                items.Add(MapCurrentItem(stacksSettings, status.Current, status.Paused));
            }

            if (status?.Queue != null)
            {
                foreach (var queueItem in status.Queue.Where(v => fallbackMd5s.Contains(v.Md5)))
                {
                    items.Add(MapQueueItem(queueItem));
                }
            }

            if (status?.RecentHistory != null)
            {
                foreach (var historyItem in status.RecentHistory.Where(v => fallbackMd5s.Contains(v.Md5)))
                {
                    items.Add(MapHistoryItem(stacksSettings, historyItem));
                }
            }

            return items;
        }

        private bool TryRemoveStacksItem(DownloadClientItem item)
        {
            var fallbackMd5s = GetFallbackMd5s();

            if (!fallbackMd5s.Contains(item.DownloadId))
            {
                return false;
            }

            var stacksSettings = GetStacksSettings(null);
            if (stacksSettings == null)
            {
                return false;
            }

            var removed = _stacksProxy.RemoveFromQueue(stacksSettings, item.DownloadId);
            if (!removed)
            {
                _logger.Debug("Failed to remove {0} from Stacks queue", item.DownloadId);
            }

            return true;
        }

        private string DownloadWithStacks(RemoteBook remoteBook)
        {
            var stacksSettings = GetStacksSettings(null);
            if (stacksSettings == null)
            {
                throw new DownloadClientException("Stacks fallback download client is not configured.");
            }

            var requestId = GetStacksRequestId(remoteBook);
            var response = _stacksProxy.AddToQueue(stacksSettings, requestId, "bookdarr");

            if (response == null || !response.Success)
            {
                var message = response?.Error ?? response?.Message ?? "Stacks rejected the download request";

                if (message.Contains("Already", StringComparison.InvariantCultureIgnoreCase) ||
                    message.Contains("Currently", StringComparison.InvariantCultureIgnoreCase) ||
                    message.Contains("Recently", StringComparison.InvariantCultureIgnoreCase))
                {
                    throw new DownloadClientRejectedReleaseException(remoteBook.Release, message);
                }

                throw new DownloadClientException(message);
            }

            var md5 = response.Md5.IsNotNullOrWhiteSpace() ? response.Md5 : requestId;
            TrackFallbackMd5(md5);

            return md5;
        }

        private StacksSettings GetStacksSettings(List<ValidationFailure> failures)
        {
            if (Settings.StacksDownloadClientId <= 0)
            {
                return null;
            }

            if (Definition?.Id > 0 && Definition.Id == Settings.StacksDownloadClientId)
            {
                failures?.Add(new NzbDroneValidationFailure("StacksDownloadClientId", "Stacks fallback cannot reference itself."));
                return null;
            }

            DownloadClientDefinition definition = null;

            try
            {
                definition = _downloadClientRepository.Get(Settings.StacksDownloadClientId);
            }
            catch
            {
                failures?.Add(new NzbDroneValidationFailure("StacksDownloadClientId", "Stacks download client not found."));
                return null;
            }

            if (definition.Settings is not StacksSettings stacksSettings)
            {
                failures?.Add(new NzbDroneValidationFailure("StacksDownloadClientId", "Selected download client is not a Stacks client."));
                return null;
            }

            return stacksSettings;
        }

        private ValidationFailure TestStacksConnection(StacksSettings stacksSettings)
        {
            try
            {
                var response = _stacksProxy.GetHealth(stacksSettings);
                if (!response?.Status.Equals("ok", StringComparison.InvariantCultureIgnoreCase) ?? true)
                {
                    return new NzbDroneValidationFailure("StacksDownloadClientId", "Stacks health check failed");
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unable to connect to Stacks");
                return new NzbDroneValidationFailure("StacksDownloadClientId", "Unable to connect to Stacks")
                {
                    DetailedDescription = ex.Message
                };
            }

            return null;
        }

        private ValidationFailure TestStacksApiKey(StacksSettings stacksSettings)
        {
            try
            {
                var response = _stacksProxy.TestApiKey(stacksSettings);
                if (response == null || !response.Valid)
                {
                    return new NzbDroneValidationFailure("StacksDownloadClientId", "Stacks API key is invalid");
                }

                if (!string.Equals(response.Type, "admin", StringComparison.InvariantCultureIgnoreCase))
                {
                    return new NzbDroneValidationFailure("StacksDownloadClientId", "Stacks admin API key is required for status and import");
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unable to validate Stacks API key");
                return new NzbDroneValidationFailure("StacksDownloadClientId", "Unable to validate Stacks API key")
                {
                    DetailedDescription = ex.Message
                };
            }

            return null;
        }

        private HashSet<string> GetFallbackMd5s()
        {
            var cacheKey = GetFallbackCacheKey();
            return _fallbackMd5Cache.Get(cacheKey, () => new HashSet<string>(StringComparer.InvariantCultureIgnoreCase));
        }

        private void TrackFallbackMd5(string md5)
        {
            if (md5.IsNullOrWhiteSpace())
            {
                return;
            }

            var fallbackMd5s = GetFallbackMd5s();
            if (fallbackMd5s.Add(md5))
            {
                _fallbackMd5Cache.Set(GetFallbackCacheKey(), fallbackMd5s, TimeSpan.FromDays(7));
            }
        }

        private string GetFallbackCacheKey()
        {
            var id = Definition?.Id ?? 0;
            return $"annas-archive-stacks-fallback:{id}";
        }

        private static string GetFileNameFromUrl(string downloadUrl)
        {
            if (downloadUrl.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (!Uri.TryCreate(downloadUrl, UriKind.Absolute, out var uri))
            {
                return null;
            }

            return Path.GetFileName(uri.LocalPath);
        }

        private static string GetFileNameFromResponse(HttpResponse response)
        {
            if (response == null)
            {
                return null;
            }

            var contentDisposition = response.Headers.GetSingleValue("Content-Disposition");
            if (contentDisposition.IsNullOrWhiteSpace())
            {
                return null;
            }

            var match = ContentDispositionFileNameRegex.Match(contentDisposition);
            if (!match.Success)
            {
                return null;
            }

            var value = match.Groups["value"].Success ? match.Groups["value"].Value : match.Groups["fallback"].Value;

            value = value.Trim().Trim('"');

            if (value.StartsWith("UTF-8''", StringComparison.InvariantCultureIgnoreCase))
            {
                value = value.Substring("UTF-8''".Length);
                value = Uri.UnescapeDataString(value);
            }

            return value;
        }

        private static string MakeAbsoluteUrl(HttpUri baseUri, string url)
        {
            if (url.IsNullOrWhiteSpace())
            {
                return url;
            }

            if (url.StartsWith("//"))
            {
                return $"{baseUri.Scheme}:{url}";
            }

            if (Uri.TryCreate(url, UriKind.Absolute, out var absolute))
            {
                return absolute.ToString();
            }

            var baseAbsolute = new Uri(baseUri.FullUri);
            return new Uri(baseAbsolute, url).ToString();
        }

        private static string ExtractPreferredDownloadUrl(string html, HttpUri baseUri)
        {
            if (html.IsNullOrWhiteSpace())
            {
                return null;
            }

            var downloadUrl = ExtractDownloadUrl(DownloadNowRegex, html, baseUri);
            if (downloadUrl.IsNotNullOrWhiteSpace())
            {
                return downloadUrl;
            }

            downloadUrl = ExtractDownloadUrl(DataDownloadUrlRegex, html, baseUri);
            if (downloadUrl.IsNotNullOrWhiteSpace())
            {
                return downloadUrl;
            }

            var directMatch = DirectFileUrlRegex.Match(html);
            if (directMatch.Success)
            {
                return WebUtility.HtmlDecode(directMatch.Groups["url"].Value).Trim();
            }

            downloadUrl = ExtractDownloadUrl(MetaRefreshRegex, html, baseUri);
            if (downloadUrl.IsNotNullOrWhiteSpace())
            {
                return downloadUrl;
            }

            return null;
        }

        private static string ExtractDownloadUrl(Regex regex, string html, HttpUri baseUri)
        {
            var match = regex.Match(html);
            if (!match.Success)
            {
                return null;
            }

            var rawUrl = WebUtility.HtmlDecode(match.Groups["url"].Value).Trim();
            return MakeAbsoluteUrl(baseUri, rawUrl);
        }

        private static string ExtractSlowDownloadUrl(string html, HttpUri baseUri)
        {
            if (html.IsNullOrWhiteSpace())
            {
                return null;
            }

            var match = SlowDownloadRegex.Match(html);
            if (!match.Success)
            {
                return null;
            }

            var rawUrl = WebUtility.HtmlDecode(match.Groups["url"].Value).Trim();
            return MakeAbsoluteUrl(baseUri, rawUrl);
        }

        private static string NormalizeDownloadUrl(string downloadUrl, string refererUrl)
        {
            if (downloadUrl.IsNullOrWhiteSpace())
            {
                return downloadUrl;
            }

            if (Uri.TryCreate(downloadUrl, UriKind.Absolute, out var absolute))
            {
                if (absolute.Scheme.Equals("http", StringComparison.InvariantCultureIgnoreCase) ||
                    absolute.Scheme.Equals("https", StringComparison.InvariantCultureIgnoreCase))
                {
                    return absolute.ToString();
                }

                if (absolute.Scheme.Equals("file", StringComparison.InvariantCultureIgnoreCase))
                {
                    downloadUrl = absolute.AbsolutePath + absolute.Query;
                }
            }

            if (refererUrl.IsNullOrWhiteSpace())
            {
                return downloadUrl;
            }

            if (!Uri.TryCreate(refererUrl, UriKind.Absolute, out var referer))
            {
                return downloadUrl;
            }

            return new Uri(referer, downloadUrl).ToString();
        }

        private static string GetStacksRequestId(RemoteBook remoteBook)
        {
            var url = remoteBook.Release.DownloadUrl.IsNotNullOrWhiteSpace()
                ? remoteBook.Release.DownloadUrl
                : remoteBook.Release.InfoUrl;

            if (url.IsNullOrWhiteSpace())
            {
                url = remoteBook.Release.Guid;
            }

            if (url.IsNullOrWhiteSpace())
            {
                return url;
            }

            var match = Md5Regex.Match(url);
            return match.Success ? match.Groups["md5"].Value : url;
        }

        private static string GetUniquePath(string filePath)
        {
            if (!File.Exists(filePath))
            {
                return filePath;
            }

            var directory = Path.GetDirectoryName(filePath);
            var name = Path.GetFileNameWithoutExtension(filePath);
            var extension = Path.GetExtension(filePath);

            for (var i = 1; i < 1000; i++)
            {
                var candidate = Path.Combine(directory ?? string.Empty, $"{name}-{i}{extension}");
                if (!File.Exists(candidate))
                {
                    return candidate;
                }
            }

            return filePath;
        }

        private string GetDownloadClientId(string filename)
        {
            return Definition.Name + "_" + Path.GetFileName(filename) + "_" + _diskProvider.FileGetLastWrite(filename).Ticks;
        }

        private DownloadClientItem MapQueueItem(StacksQueueItem queueItem)
        {
            return new DownloadClientItem
            {
                DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                DownloadId = queueItem.Md5,
                Title = GetDisplayName(queueItem.Md5, null),
                Status = DownloadItemStatus.Queued,
                CanMoveFiles = false,
                CanBeRemoved = true
            };
        }

        private DownloadClientItem MapCurrentItem(StacksSettings stacksSettings, StacksCurrentDownload current, bool isPaused)
        {
            var totalSize = current.Progress?.TotalSize ?? 0;
            var downloaded = current.Progress?.Downloaded ?? 0;
            var remaining = totalSize > 0 ? Math.Max(totalSize - downloaded, 0) : 0;
            var status = isPaused ? DownloadItemStatus.Paused : DownloadItemStatus.Downloading;

            return new DownloadClientItem
            {
                DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                DownloadId = current.Md5,
                Title = GetDisplayName(current.Md5, current.Filename),
                Status = status,
                TotalSize = totalSize,
                RemainingSize = remaining,
                RemainingTime = current.Progress?.Speed > 0 ? TimeSpan.FromSeconds(remaining / Math.Max(current.Progress.Speed, 1)) : null,
                OutputPath = GetOutputPath(stacksSettings, current.Filename, null),
                CanMoveFiles = false,
                CanBeRemoved = true
            };
        }

        private DownloadClientItem MapHistoryItem(StacksSettings stacksSettings, StacksHistoryItem history)
        {
            var status = history.Success ? DownloadItemStatus.Completed : DownloadItemStatus.Failed;

            return new DownloadClientItem
            {
                DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                DownloadId = history.Md5,
                Title = GetDisplayName(history.Md5, history.Filename),
                Status = status,
                TotalSize = 0,
                OutputPath = GetOutputPath(stacksSettings, history.Filename, history.Filepath),
                CanMoveFiles = history.Success,
                CanBeRemoved = false,
                Message = history.Error
            };
        }

        private OsPath GetOutputPath(StacksSettings stacksSettings, string filename, string filepath)
        {
            if (filepath.IsNotNullOrWhiteSpace())
            {
                return _remotePathMappingService.RemapRemoteToLocal(stacksSettings.Host, new OsPath(filepath));
            }

            if (stacksSettings.DownloadFolder.IsNotNullOrWhiteSpace() && filename.IsNotNullOrWhiteSpace())
            {
                var remotePath = new OsPath(stacksSettings.DownloadFolder).AsDirectory() + filename;
                return _remotePathMappingService.RemapRemoteToLocal(stacksSettings.Host, remotePath);
            }

            return new OsPath(null);
        }

        private static string GetDisplayName(string md5, string filename)
        {
            if (filename.IsNotNullOrWhiteSpace())
            {
                return filename;
            }

            return md5 ?? "Unknown";
        }
    }
}
