using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Download.Repositories
{
    public interface IDownloadRequestRepository : IBasicRepository<DownloadRequest>
    {
        List<DownloadRequest> GetByUser(int userId);
        List<DownloadRequest> GetPendingByUser(int userId);
    }

    public class DownloadRequestRepository : BasicRepository<DownloadRequest>, IDownloadRequestRepository
    {
        public DownloadRequestRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<DownloadRequest> GetByUser(int userId)
        {
            var builder = Builder().Where<DownloadRequest>(r => r.UserId == userId);
            return Query(builder);
        }

        public List<DownloadRequest> GetPendingByUser(int userId)
        {
            var builder = Builder()
                .Where<DownloadRequest>(r => r.UserId == userId)
                .Where<DownloadRequest>(r => !r.WasSuccessful || r.CompletedAt == null);

            return Query(builder).OrderBy(r => r.CreatedAt).ToList();
        }
    }
}
