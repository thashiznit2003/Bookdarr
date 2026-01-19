using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Books.Repositories
{
    public interface IUserBookProgressRepository : IBasicRepository<UserBookProgress>
    {
        UserBookProgress GetByUserAndBookFile(int userId, int bookFileId);
        List<UserBookProgress> GetByUserAndBook(int userId, int bookId);
    }

    public class UserBookProgressRepository : BasicRepository<UserBookProgress>, IUserBookProgressRepository
    {
        public UserBookProgressRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public UserBookProgress GetByUserAndBookFile(int userId, int bookFileId)
        {
            var builder = Builder()
                .Where<UserBookProgress>(p => p.UserId == userId)
                .Where<UserBookProgress>(p => p.BookFileId == bookFileId);

            return Query(builder).SingleOrDefault();
        }

        public List<UserBookProgress> GetByUserAndBook(int userId, int bookId)
        {
            var builder = Builder()
                .Where<UserBookProgress>(p => p.UserId == userId)
                .Where<UserBookProgress>(p => p.BookId == bookId);

            return Query(builder);
        }
    }
}
