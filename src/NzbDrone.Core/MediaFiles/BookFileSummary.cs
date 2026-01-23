using System;

namespace NzbDrone.Core.MediaFiles
{
    public class BookFileSummary
    {
        public int BookFileId { get; set; }
        public string Path { get; set; }
        public int EditionId { get; set; }
        public DateTime DateAdded { get; set; }
    }
}
