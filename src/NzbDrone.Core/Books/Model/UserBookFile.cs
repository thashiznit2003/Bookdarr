using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Books
{
    public class UserBookFile : ModelBase
    {
        public int UserBookId { get; set; }
        public int BookFileId { get; set; }
        public UserBookFileRole Role { get; set; }
        public string Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
