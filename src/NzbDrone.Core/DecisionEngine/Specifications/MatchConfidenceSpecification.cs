using System.Linq;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.Download;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.DecisionEngine.Specifications
{
    public class MatchConfidenceSpecification : IDecisionEngineSpecification
    {
        private const decimal MinimumConfidence = 95m;
        private readonly IMatchConfidenceService _confidenceService;
        private readonly IDownloadRequestService _downloadRequestService;

        public MatchConfidenceSpecification(IMatchConfidenceService confidenceService, IDownloadRequestService downloadRequestService)
        {
            _confidenceService = confidenceService;
            _downloadRequestService = downloadRequestService;
        }

        public SpecificationPriority Priority => SpecificationPriority.Parser;
        public RejectionType Type => RejectionType.Temp;

        public Decision IsSatisfiedBy(RemoteBook subject, SearchCriteriaBase searchCriteria)
        {
            if (subject == null)
            {
                return Decision.Accept();
            }

            if (searchCriteria != null && (searchCriteria.UserInvokedSearch || searchCriteria.InteractiveSearch))
            {
                return Decision.Accept();
            }

            if (subject.ReleaseSource == ReleaseSourceType.UserInvokedSearch ||
                subject.ReleaseSource == ReleaseSourceType.InteractiveSearch)
            {
                return Decision.Accept();
            }

            var confidence = _confidenceService.GetConfidence(subject);
            LogDownloadRequest(subject, searchCriteria, confidence);

            return confidence >= MinimumConfidence
                ? Decision.Accept()
                : Decision.Reject("Match confidence {0}% is below the {1}% threshold.", confidence.ToString("0.0"), MinimumConfidence);
        }

        private void LogDownloadRequest(RemoteBook subject, SearchCriteriaBase searchCriteria, decimal confidence)
        {
            if (subject?.Books == null || !subject.Books.Any())
            {
                return;
            }

            var book = subject.Books.FirstOrDefault();

            if (book == null || book.Id <= 0)
            {
                return;
            }

            var userId = searchCriteria?.RequestedByUserId ?? 0;
            var markedForReview = confidence < MinimumConfidence;

            _downloadRequestService.LogRequest(userId, book.Id, BookFileMediaType.Unknown, DownloadTriggerType.Automatic, confidence, markedForReview);
        }
    }
}
