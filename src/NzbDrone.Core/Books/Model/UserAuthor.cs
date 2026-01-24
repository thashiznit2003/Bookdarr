using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Books
{
    public class UserAuthor : ModelBase
    {
        public int UserId { get; set; }
        public int AuthorId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
