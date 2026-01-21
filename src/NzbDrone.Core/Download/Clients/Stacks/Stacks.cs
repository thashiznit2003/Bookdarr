using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RemotePathMappings;
using NzbDrone.Core.Validation;

namespace NzbDrone.Core.Download.Clients.Stacks
{
    public class Stacks : DownloadClientBase<StacksSettings>
    {
        private static readonly Regex Md5Regex = new Regex("(?<md5>[a-f0-9]{32})", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private readonly IStacksProxy _proxy;

        public Stacks(IStacksProxy proxy,
                      IConfigService configService,
                      IDiskProvider diskProvider,
                      IRemotePathMappingService remotePathMappingService,
                      Logger logger)
            : base(configService, diskProvider, remotePathMappingService, logger)
        {
            _proxy = proxy;
        }

        public override string Name => "Stacks";

        public override DownloadProtocol Protocol => DownloadProtocol.Stacks;

        public override Task<string> Download(RemoteBook remoteBook, IIndexer indexer)
        {
            var downloadLink = remoteBook.Release.DownloadUrl;
            var requestId = GetStacksRequestId(downloadLink);

            var response = _proxy.AddToQueue(Settings, requestId, "bookdarr");

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

            return Task.FromResult(response.Md5.IsNotNullOrWhiteSpace() ? response.Md5 : requestId);
        }

        public override IEnumerable<DownloadClientItem> GetItems()
        {
            var status = _proxy.GetStatus(Settings);
            var items = new List<DownloadClientItem>();
            var seen = new HashSet<string>(StringComparer.InvariantCultureIgnoreCase);

            if (status?.Current != null)
            {
                var currentItem = MapCurrentItem(status.Current, status.Paused);
                if (seen.Add(currentItem.DownloadId))
                {
                    items.Add(currentItem);
                }
            }

            if (status?.Queue != null)
            {
                foreach (var queueItem in status.Queue)
                {
                    var mapped = MapQueueItem(queueItem);
                    if (seen.Add(mapped.DownloadId))
                    {
                        items.Add(mapped);
                    }
                }
            }

            if (status?.RecentHistory != null)
            {
                foreach (var historyItem in status.RecentHistory)
                {
                    var mapped = MapHistoryItem(historyItem);
                    if (seen.Add(mapped.DownloadId))
                    {
                        items.Add(mapped);
                    }
                }
            }

            return items;
        }

        public override void RemoveItem(DownloadClientItem item, bool deleteData)
        {
            if (item == null || item.DownloadId.IsNullOrWhiteSpace())
            {
                return;
            }

            var removed = _proxy.RemoveFromQueue(Settings, item.DownloadId);

            if (!removed)
            {
                _logger.Debug("Failed to remove {0} from Stacks queue", item.DownloadId);
            }
        }

        public override DownloadClientInfo GetStatus()
        {
            var info = new DownloadClientInfo
            {
                IsLocalhost = Settings.Host == "127.0.0.1" || Settings.Host == "localhost",
                RemovesCompletedDownloads = false
            };

            if (Settings.DownloadFolder.IsNotNullOrWhiteSpace())
            {
                var remoteFolder = new OsPath(Settings.DownloadFolder);
                info.OutputRootFolders.Add(_remotePathMappingService.RemapRemoteToLocal(Settings.Host, remoteFolder));
            }

            return info;
        }

        protected override void Test(List<ValidationFailure> failures)
        {
            failures.AddIfNotNull(TestConnection());

            if (failures.HasErrors())
            {
                return;
            }

            failures.AddIfNotNull(TestApiKey());
        }

        private ValidationFailure TestConnection()
        {
            try
            {
                var response = _proxy.GetHealth(Settings);
                if (!response?.Status.Equals("ok", StringComparison.InvariantCultureIgnoreCase) ?? true)
                {
                    return new NzbDroneValidationFailure("Host", "Stacks health check failed");
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unable to connect to Stacks");
                return new NzbDroneValidationFailure("Host", "Unable to connect to Stacks")
                {
                    DetailedDescription = ex.Message
                };
            }

            return null;
        }

        private ValidationFailure TestApiKey()
        {
            try
            {
                var response = _proxy.TestApiKey(Settings);
                if (response == null || !response.Valid)
                {
                    return new NzbDroneValidationFailure("ApiKey", "API key is invalid");
                }

                if (!string.Equals(response.Type, "admin", StringComparison.InvariantCultureIgnoreCase))
                {
                    return new NzbDroneValidationFailure("ApiKey", "Admin API key is required for status and import");
                }
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unable to validate Stacks API key");
                return new NzbDroneValidationFailure("ApiKey", "Unable to validate API key")
                {
                    DetailedDescription = ex.Message
                };
            }

            return null;
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

        private DownloadClientItem MapCurrentItem(StacksCurrentDownload current, bool isPaused)
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
                Message = current.StatusMessage,
                Status = status,
                TotalSize = totalSize,
                RemainingSize = remaining,
                CanMoveFiles = false,
                CanBeRemoved = false
            };
        }

        private DownloadClientItem MapHistoryItem(StacksHistoryItem history)
        {
            var status = history.Success ? DownloadItemStatus.Completed : DownloadItemStatus.Failed;
            var outputPath = GetOutputPath(history.Filepath, history.Filename);

            return new DownloadClientItem
            {
                DownloadClientInfo = DownloadClientItemClientInfo.FromDownloadClient(this, false),
                DownloadId = history.Md5,
                Title = GetDisplayName(history.Md5, history.Filename),
                Message = history.Error,
                Status = status,
                CanMoveFiles = history.Success,
                CanBeRemoved = false,
                OutputPath = outputPath
            };
        }

        private OsPath GetOutputPath(string filepath, string filename)
        {
            if (filepath.IsNotNullOrWhiteSpace())
            {
                return _remotePathMappingService.RemapRemoteToLocal(Settings.Host, new OsPath(filepath));
            }

            if (Settings.DownloadFolder.IsNotNullOrWhiteSpace() && filename.IsNotNullOrWhiteSpace())
            {
                var remotePath = new OsPath(Settings.DownloadFolder).AsDirectory() + filename;
                return _remotePathMappingService.RemapRemoteToLocal(Settings.Host, remotePath);
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

        private static string GetStacksRequestId(string downloadLink)
        {
            if (downloadLink.IsNullOrWhiteSpace())
            {
                return downloadLink;
            }

            var match = Md5Regex.Match(downloadLink);

            return match.Success ? match.Groups["md5"].Value : downloadLink;
        }
    }
}
