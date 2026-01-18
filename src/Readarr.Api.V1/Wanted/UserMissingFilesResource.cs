using Readarr.Api.V1.Books;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Wanted
{
    public class UserMissingFilesResource : RestResource
    {
        public int BookId { get; set; }
        public BookResource Book { get; set; }
        public bool MissingEbook { get; set; }
        public bool MissingAudiobook { get; set; }
    }
}
