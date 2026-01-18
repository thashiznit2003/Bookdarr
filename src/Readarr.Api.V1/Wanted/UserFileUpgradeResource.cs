using Readarr.Api.V1.Books;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Wanted
{
    public class UserFileUpgradeResource : RestResource
    {
        public int BookId { get; set; }
        public BookResource Book { get; set; }
        public bool NeedsEpub { get; set; }
        public bool NeedsM4b { get; set; }
    }
}
