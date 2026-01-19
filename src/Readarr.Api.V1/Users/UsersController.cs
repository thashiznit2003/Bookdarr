using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core;
using NzbDrone.Core.Authentication;
using Readarr.Http;
using ModelNotFoundException = NzbDrone.Core.Datastore.ModelNotFoundException;
using RestBadRequestException = Readarr.Http.REST.BadRequestException;

namespace Readarr.Api.V1.Users
{
    [V1ApiController("users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<List<UserResource>> GetUsers()
        {
            var currentUser = GetCurrentUser();

            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            var resources = _userService.GetUsers().Select(Map).ToList();
            return resources;
        }

        [HttpGet("{id:int}")]
        public ActionResult<UserResource> Get(int id)
        {
            var currentUser = GetCurrentUser();

            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            var user = _userService.FindUserById(id);

            if (user == null)
            {
                return NotFound();
            }

            return Map(user);
        }

        [HttpGet("me")]
        public ActionResult<UserResource> GetMe()
        {
            var currentUser = GetCurrentUser();
            return Map(currentUser);
        }

        [HttpPut("{id:int}")]
        public ActionResult<UserResource> Update(int id, UserUpdateResource resource)
        {
            if (resource == null)
            {
                throw new RestBadRequestException("Request body can't be empty");
            }

            if (resource.Username.IsNullOrWhiteSpace())
            {
                throw new RestBadRequestException("Username is required");
            }

            var currentUser = GetCurrentUser();

            if (!currentUser.IsAdmin && currentUser.Id != id)
            {
                return Forbid();
            }

            var user = _userService.FindUserById(id);

            if (user == null)
            {
                return NotFound();
            }

            var existing = _userService.FindUserByUsername(resource.Username);
            if (existing != null && existing.Id != id)
            {
                throw new RestBadRequestException("Username already exists");
            }

            user.Username = resource.Username.ToLowerInvariant();
            user.Email = resource.Email;

            if (resource.IsActive.HasValue)
            {
                user.IsActive = resource.IsActive.Value;
            }

            if (resource.Password.IsNotNullOrWhiteSpace())
            {
                user.Password = resource.Password.SHA256Hash();
            }

            user = _userService.Update(user);

            return Map(user);
        }

        [HttpPost]
        public ActionResult<UserResource> Create(UserCreateResource resource)
        {
            if (resource == null)
            {
                throw new RestBadRequestException("Request body can't be empty");
            }

            if (string.IsNullOrWhiteSpace(resource.Username) || string.IsNullOrWhiteSpace(resource.Password))
            {
                throw new RestBadRequestException("Username and password are required");
            }

            var currentUser = GetCurrentUser();

            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            var preferredMedia = string.IsNullOrWhiteSpace(resource.PreferredQualityMedia) ? "both" : resource.PreferredQualityMedia;
            var role = ParseRole(resource.Role, resource.IsAdmin);

            var created = _userService.Add(resource.Username, resource.Password, resource.IsAdmin, resource.Email, role, resource.IsActive, preferredMedia);

            return CreatedAtAction(nameof(Get), new { id = created.Id }, Map(created));
        }

        private UserResource Map(User user)
        {
            return new UserResource
            {
                Id = user.Id,
                Username = user.Username,
                Identifier = user.Identifier,
                IsAdmin = user.IsAdmin,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin,
                PreferredQualityMedia = user.PreferredQualityMedia
            };
        }

        private static UserRole ParseRole(string roleValue, bool fallbackToAdmin)
        {
            if (fallbackToAdmin)
            {
                return UserRole.Admin;
            }

            if (!string.IsNullOrWhiteSpace(roleValue) && Enum.TryParse<UserRole>(roleValue, true, out var parsed))
            {
                return parsed;
            }

            return UserRole.Standard;
        }

        private User GetCurrentUser()
        {
            var user = _userService.FindUser(HttpContext?.User);

            if (user == null)
            {
                throw new ModelNotFoundException(typeof(User), 0);
            }

            return user;
        }
    }
}
