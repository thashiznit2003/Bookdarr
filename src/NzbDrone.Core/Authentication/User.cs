using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Authentication
{
    public class User : ModelBase
    {
        public Guid Identifier { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public string PreferredQualityMedia { get; set; }
        public string ResetToken { get; set; }
        public DateTime? ResetTokenExpiration { get; set; }
    }
}
