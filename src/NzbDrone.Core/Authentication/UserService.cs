using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Authentication
{
    public interface IUserService
    {
        User Add(string username, string password, bool isAdmin = false, string email = null, UserRole role = UserRole.Standard, bool isActive = true, string preferredQualityMedia = "both");
        User Update(User user);
        User Upsert(string username, string password);
        User FindUser();
        User FindUser(string username, string password);
        User FindUserByUsername(string username);
        User FindUserById(int id);
        User FindUser(ClaimsPrincipal principal);
        User FindUser(Guid identifier);
        List<User> GetUsers();
        User RecordSuccessfulLogin(User user, bool incrementLoginCount);
        User IncrementWizardAutoShown(User user);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        private readonly IAppFolderInfo _appFolderInfo;
        private readonly IDiskProvider _diskProvider;

        public UserService(IUserRepository repo, IAppFolderInfo appFolderInfo, IDiskProvider diskProvider)
        {
            _repo = repo;
            _appFolderInfo = appFolderInfo;
            _diskProvider = diskProvider;
        }

        public User Add(string username, string password, bool isAdmin = false, string email = null, UserRole role = UserRole.Standard, bool isActive = true, string preferredQualityMedia = "both")
        {
            var hasUsers = _repo.HasItems();
            var finalRole = ResolveRole(hasUsers, isAdmin, role);

            var user = new User
            {
                Identifier = Guid.NewGuid(),
                Username = username.ToLowerInvariant(),
                Password = password.SHA256Hash(),
                Email = email,
                Role = finalRole,
                IsAdmin = finalRole == UserRole.Admin,
                IsActive = isActive,
                CreatedAt = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                LoginCount = 0,
                WizardAutoShownCount = 0,
                WizardAutoDisabled = false,
                PreferredQualityMedia = string.IsNullOrWhiteSpace(preferredQualityMedia) ? "both" : preferredQualityMedia
            };

            return _repo.Insert(user);
        }

        public User Update(User user)
        {
            user.IsAdmin = user.Role == UserRole.Admin;
            return _repo.Update(user);
        }

        public User Upsert(string username, string password)
        {
            var user = FindUser();

            if (user == null)
            {
                return Add(username, password);
            }

            if (user.Password != password)
            {
                user.Password = password.SHA256Hash();
            }

            user.Username = username.ToLowerInvariant();

            return Update(user);
        }

        public User FindUser()
        {
            var allUsers = _repo.All().ToList();
            var activeUsers = allUsers.Where(u => u.IsActive).ToList();
            var lookup = activeUsers.Any() ? activeUsers : allUsers;

            var admin = lookup.FirstOrDefault(u => u.Role == UserRole.Admin);
            if (admin != null)
            {
                return admin;
            }

            return lookup.FirstOrDefault();
        }

        public User FindUser(string username, string password)
        {
            if (username.IsNullOrWhiteSpace() || password.IsNullOrWhiteSpace())
            {
                return null;
            }

            var user = FindUserByUsername(username);

            if (user == null)
            {
                return null;
            }

            if (user.Password == password.SHA256Hash())
            {
                return user;
            }

            return null;
        }

        public User FindUserByUsername(string username)
        {
            if (username.IsNullOrWhiteSpace())
            {
                return null;
            }

            var user = _repo.FindUser(username.ToLowerInvariant());
            return user != null && user.IsActive ? user : null;
        }

        public User FindUserById(int id)
        {
            if (id <= 0)
            {
                return null;
            }

            return _repo.Find(id);
        }

        public User FindUser(ClaimsPrincipal principal)
        {
            if (!_repo.HasItems())
            {
                return CreateBootstrapUser();
            }

            if (principal?.Identity?.IsAuthenticated == true)
            {
                var identifierValue = principal.FindFirst("identifier")?.Value;

                if (Guid.TryParse(identifierValue, out var identifier))
                {
                    var userByIdentifier = FindUser(identifier);

                    if (userByIdentifier != null)
                    {
                        return userByIdentifier;
                    }
                }

                var username = principal.FindFirst("user")?.Value ?? principal.Identity.Name;

                if (username.IsNotNullOrWhiteSpace())
                {
                    var userByUsername = FindUserByUsername(username);

                    if (userByUsername != null)
                    {
                        return userByUsername;
                    }
                }
            }

            return FindUser();
        }

        private static User CreateBootstrapUser()
        {
            return new User
            {
                Id = 0,
                Identifier = Guid.Empty,
                Username = string.Empty,
                Role = UserRole.Admin,
                IsAdmin = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                LoginCount = 0,
                WizardAutoShownCount = 0,
                WizardAutoDisabled = false
            };
        }

        public User FindUser(Guid identifier)
        {
            var user = _repo.FindUser(identifier);
            return user != null && user.IsActive ? user : null;
        }

        public List<User> GetUsers()
        {
            return _repo.All().ToList();
        }

        public User RecordSuccessfulLogin(User user, bool incrementLoginCount)
        {
            if (user == null || user.Id <= 0)
            {
                return user;
            }

            if (!incrementLoginCount)
            {
                return user;
            }

            user.LastLogin = DateTime.UtcNow;

            if (user.IsAdmin && !user.WizardAutoDisabled)
            {
                user.LoginCount = Math.Max(0, user.LoginCount) + 1;

                if (user.LoginCount > 5)
                {
                    user.WizardAutoDisabled = true;
                }
            }

            return _repo.Update(user);
        }

        public User IncrementWizardAutoShown(User user)
        {
            if (user == null || user.Id <= 0)
            {
                return user;
            }

            if (user.WizardAutoDisabled)
            {
                return user;
            }

            user.WizardAutoShownCount = Math.Max(0, user.WizardAutoShownCount) + 1;
            return _repo.Update(user);
        }

        private static UserRole ResolveRole(bool hasUsers, bool isAdminRequested, UserRole requestedRole)
        {
            if (!hasUsers)
            {
                return UserRole.Admin;
            }

            if (isAdminRequested)
            {
                return UserRole.Admin;
            }

            return requestedRole;
        }
    }
}
