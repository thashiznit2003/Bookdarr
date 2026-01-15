using System;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Users
{
    public class UserResource : RestResource
    {
        public string Username { get; set; }
        public Guid Identifier { get; set; }
        public bool IsAdmin { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public string PreferredQualityMedia { get; set; }
    }
}
