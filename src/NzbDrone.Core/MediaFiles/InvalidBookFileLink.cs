namespace NzbDrone.Core.MediaFiles
{
    public class InvalidBookFileLink
    {
        public int BookFileId { get; set; }
        public string Path { get; set; }
        public int EditionId { get; set; }
        public int? BookId { get; set; }
        public string Reason { get; set; }
    }
}
