using System;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Users
{
    public class UserResource : RestResource
    {
        public string Username { get; set; }
        public Guid Identifier { get; set; }
        public bool IsAdmin { get; set; }
    }
}
