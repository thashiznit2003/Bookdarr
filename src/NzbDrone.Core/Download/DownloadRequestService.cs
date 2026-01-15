using System;
using System.Collections.Generic;
using NzbDrone.Core.Books;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Download.Repositories;

namespace NzbDrone.Core.Download
{
    public interface IDownloadRequestService
    {
        DownloadRequest LogRequest(int userId, int bookId, BookFileMediaType mediaType, DownloadTriggerType trigger, decimal confidenceScore, bool markedForReview = false, string notes = null);
        DownloadRequest MarkCompleted(int requestId, bool succeeded, string notes = null);
        IEnumerable<DownloadRequest> GetPendingRequests(int userId);
        DownloadRequest GetById(int id);
    }

    public class DownloadRequestService : IDownloadRequestService
    {
        private readonly IDownloadRequestRepository _repository;

        public DownloadRequestService(IDownloadRequestRepository repository)
        {
            _repository = repository;
        }

        public DownloadRequest LogRequest(int userId, int bookId, BookFileMediaType mediaType, DownloadTriggerType trigger, decimal confidenceScore, bool markedForReview = false, string notes = null)
        {
            var request = new DownloadRequest
            {
                UserId = userId,
                BookId = bookId,
                RequestedMediaType = mediaType,
                TriggerType = trigger,
                ConfidenceScore = confidenceScore,
                MarkedForReview = markedForReview,
                Notes = notes,
                CreatedAt = DateTime.UtcNow
            };

            return _repository.Insert(request);
        }

        public DownloadRequest MarkCompleted(int requestId, bool succeeded, string notes = null)
        {
            var request = _repository.Find(requestId);

            if (request == null)
            {
                throw new ModelNotFoundException(typeof(DownloadRequest), requestId);
            }

            request.WasSuccessful = succeeded;
            request.Notes = notes ?? request.Notes;
            request.CompletedAt = DateTime.UtcNow;

            return _repository.Update(request);
        }

        public IEnumerable<DownloadRequest> GetPendingRequests(int userId)
        {
            return _repository.GetPendingByUser(userId);
        }

        public DownloadRequest GetById(int id)
        {
            return _repository.Find(id);
        }
    }
}
