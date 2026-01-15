using System;
using NzbDrone.Core.Books;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles;

namespace NzbDrone.Core.Download
{
    public class DownloadRequest : ModelBase
    {
        public int UserId { get; set; }
        public int BookId { get; set; }
        public DownloadTriggerType TriggerType { get; set; }
        public BookFileMediaType RequestedMediaType { get; set; }
        public decimal ConfidenceScore { get; set; }
        public bool MarkedForReview { get; set; }
        public bool WasSuccessful { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
