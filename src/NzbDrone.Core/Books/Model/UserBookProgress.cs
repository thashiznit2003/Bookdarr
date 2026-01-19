using System;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles;

namespace NzbDrone.Core.Books
{
    public class UserBookProgress : ModelBase
    {
        public int UserId { get; set; }
        public int BookId { get; set; }
        public int BookFileId { get; set; }
        public BookFileMediaType MediaType { get; set; }
        public string Location { get; set; }
        public double? Position { get; set; }
        public double? Duration { get; set; }
        public double? Progress { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
