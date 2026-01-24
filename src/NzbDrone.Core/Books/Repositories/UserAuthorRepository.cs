using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Books.Repositories
{
    public interface IUserAuthorRepository : IBasicRepository<UserAuthor>
    {
        UserAuthor GetByUserAndAuthor(int userId, int authorId);
        List<UserAuthor> GetByUser(int userId);
        List<UserAuthor> GetByAuthor(int authorId);
    }

    public class UserAuthorRepository : BasicRepository<UserAuthor>, IUserAuthorRepository
    {
        public UserAuthorRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public UserAuthor GetByUserAndAuthor(int userId, int authorId)
        {
            var builder = Builder()
                .Where<UserAuthor>(a => a.UserId == userId)
                .Where<UserAuthor>(a => a.AuthorId == authorId);

            return Query(builder).SingleOrDefault();
        }

        public List<UserAuthor> GetByUser(int userId)
        {
            var builder = Builder().Where<UserAuthor>(a => a.UserId == userId);
            return Query(builder);
        }

        public List<UserAuthor> GetByAuthor(int authorId)
        {
            var builder = Builder().Where<UserAuthor>(a => a.AuthorId == authorId);
            return Query(builder);
        }
    }
}
