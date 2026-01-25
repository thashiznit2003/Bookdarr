using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Crypto;
using NzbDrone.Core.Books;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.Queue
{
    public interface IQueueService
    {
        List<Queue> GetQueue();
        Queue Find(int id);
        void Remove(int id);
    }

    public class QueueService : IQueueService, IHandle<TrackedDownloadRefreshedEvent>
    {
        private static readonly long FallbackTextMaxSize = 50.Megabytes();
        private static readonly long FallbackAudioMinSize = 150.Megabytes();

        private readonly IEventAggregator _eventAggregator;
        private static List<Queue> _queue = new ();
        private readonly IHistoryService _historyService;

        public QueueService(IEventAggregator eventAggregator,
                            IHistoryService historyService)
        {
            _eventAggregator = eventAggregator;
            _historyService = historyService;
        }

        public List<Queue> GetQueue()
        {
            return _queue;
        }

        public Queue Find(int id)
        {
            return _queue.SingleOrDefault(q => q.Id == id);
        }

        public void Remove(int id)
        {
            _queue.Remove(Find(id));
        }

        private IEnumerable<Queue> MapQueue(TrackedDownload trackedDownload)
        {
            if (trackedDownload.RemoteBook?.Books != null && trackedDownload.RemoteBook.Books.Any())
            {
                foreach (var book in trackedDownload.RemoteBook.Books)
                {
                    yield return MapQueueItem(trackedDownload, book);
                }
            }
            else
            {
                yield return MapQueueItem(trackedDownload, null);
            }
        }

        private Queue MapQueueItem(TrackedDownload trackedDownload, Book book)
        {
            var downloadForced = false;
            var history = _historyService.Find(trackedDownload.DownloadItem.DownloadId, EntityHistoryEventType.Grabbed).FirstOrDefault();
            if (history != null && history.Data.ContainsKey("downloadForced"))
            {
                downloadForced = bool.Parse(history.Data["downloadForced"]);
            }

            var qualityModel = trackedDownload.RemoteBook?.ParsedBookInfo?.Quality ??
                history?.Quality ??
                new QualityModel(Quality.Unknown);
            ApplyFallbackQualityHint(qualityModel, trackedDownload.DownloadItem.TotalSize);

            var queue = new Queue
            {
                Author = trackedDownload.RemoteBook?.Author,
                Book = book,
                Quality = qualityModel,
                Title = Parser.Parser.RemoveFileExtension(trackedDownload.DownloadItem.Title),
                Size = trackedDownload.DownloadItem.TotalSize,
                Sizeleft = trackedDownload.DownloadItem.RemainingSize,
                Timeleft = trackedDownload.DownloadItem.RemainingTime,
                Status = trackedDownload.DownloadItem.Status.ToString(),
                TrackedDownloadStatus = trackedDownload.Status,
                TrackedDownloadState = trackedDownload.State,
                StatusMessages = trackedDownload.StatusMessages.ToList(),
                ErrorMessage = trackedDownload.DownloadItem.Message,
                RemoteBook = trackedDownload.RemoteBook,
                DownloadId = trackedDownload.DownloadItem.DownloadId,
                Protocol = trackedDownload.Protocol,
                DownloadClient = trackedDownload.DownloadItem.DownloadClientInfo.Name,
                Indexer = trackedDownload.Indexer,
                OutputPath = trackedDownload.DownloadItem.OutputPath.ToString(),
                DownloadForced = downloadForced,
                DownloadClientHasPostImportCategory = trackedDownload.DownloadItem.DownloadClientInfo.HasPostImportCategory
            };

            queue.Id = HashConverter.GetHashInt31($"trackedDownload-{trackedDownload.DownloadClient}-{trackedDownload.DownloadItem.DownloadId}-book{book?.Id ?? 0}");

            if (queue.Timeleft.HasValue)
            {
                queue.EstimatedCompletionTime = DateTime.UtcNow.Add(queue.Timeleft.Value);
            }

            return queue;
        }

        private static void ApplyFallbackQualityHint(QualityModel qualityModel, long size)
        {
            if (qualityModel == null || size <= 0)
            {
                return;
            }

            if (qualityModel.Quality != Quality.Unknown && qualityModel.Quality != Quality.UnknownAudio)
            {
                return;
            }

            if (size <= FallbackTextMaxSize)
            {
                qualityModel.Quality = Quality.LikelyEbook;
                qualityModel.QualityDetectionSource = QualityDetectionSource.Heuristic;
                return;
            }

            if (size >= FallbackAudioMinSize)
            {
                qualityModel.Quality = Quality.LikelyAudiobook;
                qualityModel.QualityDetectionSource = QualityDetectionSource.Heuristic;
            }
        }

        public void Handle(TrackedDownloadRefreshedEvent message)
        {
            _queue = message.TrackedDownloads
                .Where(t => t.IsTrackable)
                .OrderBy(c => c.DownloadItem.RemainingTime)
                .SelectMany(MapQueue)
                .ToList();

            _eventAggregator.PublishEvent(new QueueUpdatedEvent());
        }
    }
}
