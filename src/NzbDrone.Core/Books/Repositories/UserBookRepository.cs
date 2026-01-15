using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Books.Repositories
{
    public interface IUserBookRepository : IBasicRepository<UserBook>
    {
        UserBook GetByUserAndBook(int userId, int bookId);
        List<UserBook> GetByUser(int userId);
    }

    public class UserBookRepository : BasicRepository<UserBook>, IUserBookRepository
    {
        public UserBookRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public UserBook GetByUserAndBook(int userId, int bookId)
        {
            var builder = Builder()
                .Where<UserBook>(b => b.UserId == userId)
                .Where<UserBook>(b => b.BookId == bookId);

            return Query(builder).SingleOrDefault();
        }

        public List<UserBook> GetByUser(int userId)
        {
            var builder = Builder().Where<UserBook>(b => b.UserId == userId);
            return Query(builder);
        }
    }
}
