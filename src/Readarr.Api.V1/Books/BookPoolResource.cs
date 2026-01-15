using NzbDrone.Core.Books;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Books
{
    public class BookPoolResource : RestResource
    {
        public BookResource Book { get; set; }
        public LibraryStatus Status { get; set; }
        public bool HasEbook { get; set; }
        public bool HasAudiobook { get; set; }
        public bool InMyLibrary { get; set; }
        public bool NeedsAttention => Status != LibraryStatus.Available;
    }
}
