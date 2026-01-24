using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Books
{
    public class UserBook : ModelBase
    {
        public int UserId { get; set; }
        public int BookId { get; set; }
        public LibraryStatus Status { get; set; }
        public bool WantsEbook { get; set; }
        public bool WantsAudiobook { get; set; }
        public bool SharedCopyClaimed { get; set; }
        public decimal? UserRating { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastNotificationAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
