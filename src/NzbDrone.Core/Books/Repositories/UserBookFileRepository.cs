using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Books;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Books.Repositories
{
    public interface IUserBookFileRepository : IBasicRepository<UserBookFile>
    {
        List<UserBookFile> GetByUserBook(int userBookId);
    }

    public class UserBookFileRepository : BasicRepository<UserBookFile>, IUserBookFileRepository
    {
        public UserBookFileRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<UserBookFile> GetByUserBook(int userBookId)
        {
            var builder = Builder().Where<UserBookFile>(f => f.UserBookId == userBookId);
            return Query(builder);
        }
    }
}
