using NzbDrone.Core.Books;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Books
{
    public class UserLibraryResource : RestResource
    {
        public int BookId { get; set; }
        public BookResource Book { get; set; }
        public LibraryStatus Status { get; set; }
        public bool WantsEbook { get; set; }
        public bool WantsAudiobook { get; set; }
        public bool HasEbook { get; set; }
        public bool HasAudiobook { get; set; }
        public bool PoolHasBook { get; set; }
        public bool NeedsAttention => Status != LibraryStatus.Available;
    }
}
