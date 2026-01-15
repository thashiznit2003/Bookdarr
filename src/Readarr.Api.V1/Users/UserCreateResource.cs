using Readarr.Http.REST;

namespace Readarr.Api.V1.Users
{
    public class UserCreateResource : RestResource
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; } = true;
        public string PreferredQualityMedia { get; set; } = "both";
    }
}
