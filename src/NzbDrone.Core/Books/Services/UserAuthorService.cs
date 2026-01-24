using System;
using System.Collections.Generic;
using NzbDrone.Core.Books.Repositories;

namespace NzbDrone.Core.Books.Services
{
    public interface IUserAuthorService
    {
        UserAuthor AddOrGetUserAuthor(int userId, int authorId);
        List<UserAuthor> GetByUser(int userId);
    }

    public class UserAuthorService : IUserAuthorService
    {
        private readonly IUserAuthorRepository _userAuthorRepository;

        public UserAuthorService(IUserAuthorRepository userAuthorRepository)
        {
            _userAuthorRepository = userAuthorRepository;
        }

        public UserAuthor AddOrGetUserAuthor(int userId, int authorId)
        {
            var existing = _userAuthorRepository.GetByUserAndAuthor(userId, authorId);
            if (existing != null)
            {
                if (existing.IsDeleted)
                {
                    existing.IsDeleted = false;
                    _userAuthorRepository.Update(existing);
                }

                return existing;
            }

            var userAuthor = new UserAuthor
            {
                UserId = userId,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            _userAuthorRepository.Insert(userAuthor);
            return userAuthor;
        }

        public List<UserAuthor> GetByUser(int userId)
        {
            return _userAuthorRepository.GetByUser(userId);
        }
    }
}
