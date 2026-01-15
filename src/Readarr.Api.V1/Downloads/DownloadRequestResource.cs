using System;
using NzbDrone.Core.Download;
using NzbDrone.Core.MediaFiles;
using Readarr.Api.V1.Books;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Downloads
{
    public class DownloadRequestResource : RestResource
    {
        public int BookId { get; set; }
        public BookResource Book { get; set; }
        public DownloadTriggerType TriggerType { get; set; }
        public BookFileMediaType RequestedMediaType { get; set; }
        public decimal ConfidenceScore { get; set; }
        public bool MarkedForReview { get; set; }
        public bool WasSuccessful { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
