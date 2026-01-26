using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Pending;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Queue;
using Readarr.Http;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Queue
{
    [V1ApiController("queue")]
    public class QueueActionController : Controller
    {
        private readonly IPendingReleaseService _pendingReleaseService;
        private readonly IDownloadService _downloadService;
        private readonly IQueueService _queueService;
        private readonly ITrackedDownloadService _trackedDownloadService;
        private readonly ICompletedDownloadService _completedDownloadService;

        public QueueActionController(IPendingReleaseService pendingReleaseService,
                                     IDownloadService downloadService,
                                     IQueueService queueService,
                                     ITrackedDownloadService trackedDownloadService,
                                     ICompletedDownloadService completedDownloadService)
        {
            _pendingReleaseService = pendingReleaseService;
            _downloadService = downloadService;
            _queueService = queueService;
            _trackedDownloadService = trackedDownloadService;
            _completedDownloadService = completedDownloadService;
        }

        [HttpPost("grab/{id:int}")]
        public async Task<object> Grab(int id)
        {
            var pendingRelease = _pendingReleaseService.FindPendingQueueItem(id);

            if (pendingRelease == null)
            {
                throw new NotFoundException();
            }

            await _downloadService.DownloadReport(pendingRelease.RemoteBook, null);

            return new { };
        }

        [HttpPost("grab/bulk")]
        [Consumes("application/json")]
        public async Task<object> Grab([FromBody] QueueBulkResource resource)
        {
            foreach (var id in resource.Ids)
            {
                var pendingRelease = _pendingReleaseService.FindPendingQueueItem(id);

                if (pendingRelease == null)
                {
                    throw new NotFoundException();
                }

                await _downloadService.DownloadReport(pendingRelease.RemoteBook, null);
            }

            return new { };
        }

        [HttpPost("import/{id:int}")]
        public object ForceImport(int id)
        {
            var trackedDownload = GetTrackedDownload(id);
            ValidateForceImport(trackedDownload);

            _completedDownloadService.Import(trackedDownload);

            return new { };
        }

        [HttpPost("import/bulk")]
        [Consumes("application/json")]
        public object ForceImport([FromBody] QueueBulkResource resource)
        {
            foreach (var id in resource.Ids)
            {
                var trackedDownload = GetTrackedDownload(id);
                ValidateForceImport(trackedDownload);
                _completedDownloadService.Import(trackedDownload);
            }

            return new { };
        }

        private TrackedDownload GetTrackedDownload(int queueId)
        {
            var queueItem = _queueService.Find(queueId);

            if (queueItem == null)
            {
                throw new NotFoundException();
            }

            var trackedDownload = _trackedDownloadService.Find(queueItem.DownloadId);

            if (trackedDownload == null)
            {
                throw new NotFoundException();
            }

            return trackedDownload;
        }

        private static void ValidateForceImport(TrackedDownload trackedDownload)
        {
            if (trackedDownload.DownloadItem.Status != DownloadItemStatus.Completed)
            {
                throw new BadRequestException("Download has not finished.");
            }

            if (trackedDownload.State != TrackedDownloadState.ImportPending &&
                trackedDownload.State != TrackedDownloadState.ImportFailed)
            {
                throw new BadRequestException("Download is not pending import.");
            }
        }
    }
}
