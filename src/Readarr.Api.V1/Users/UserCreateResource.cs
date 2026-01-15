using Readarr.Http.REST;

namespace Readarr.Api.V1.Users
{
    public class UserCreateResource : RestResource
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
    }
}
