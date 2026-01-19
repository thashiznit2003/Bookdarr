using System;
using NzbDrone.Core.Books.Repositories;
using NzbDrone.Core.MediaFiles;

namespace NzbDrone.Core.Books.Services
{
    public interface IUserBookProgressService
    {
        UserBookProgress GetByUserAndBookFile(int userId, int bookFileId);
        UserBookProgress UpsertProgress(int userId, int bookFileId, int? bookId, BookFileMediaType mediaType, string location, double? position, double? duration, double? progress);
    }

    public class UserBookProgressService : IUserBookProgressService
    {
        private readonly IUserBookProgressRepository _progressRepository;
        private readonly IMediaFileService _mediaFileService;
        private readonly IEditionService _editionService;

        public UserBookProgressService(IUserBookProgressRepository progressRepository,
                                       IMediaFileService mediaFileService,
                                       IEditionService editionService)
        {
            _progressRepository = progressRepository;
            _mediaFileService = mediaFileService;
            _editionService = editionService;
        }

        public UserBookProgress GetByUserAndBookFile(int userId, int bookFileId)
        {
            return _progressRepository.GetByUserAndBookFile(userId, bookFileId);
        }

        public UserBookProgress UpsertProgress(int userId,
                                               int bookFileId,
                                               int? bookId,
                                               BookFileMediaType mediaType,
                                               string location,
                                               double? position,
                                               double? duration,
                                               double? progress)
        {
            var now = DateTime.UtcNow;
            var bookFile = _mediaFileService.Get(bookFileId);

            var resolvedMediaType = mediaType != BookFileMediaType.Unknown
                ? mediaType
                : bookFile.MediaType != BookFileMediaType.Unknown
                    ? bookFile.MediaType
                    : MediaFileExtensions.GetMediaTypeForPath(bookFile.Path);

            var resolvedBookId = bookId ?? 0;
            if (resolvedBookId == 0 && bookFile.EditionId > 0)
            {
                var edition = _editionService.GetEdition(bookFile.EditionId);
                resolvedBookId = edition?.BookId ?? 0;
            }

            var existing = _progressRepository.GetByUserAndBookFile(userId, bookFileId);

            if (existing == null)
            {
                var created = new UserBookProgress
                {
                    UserId = userId,
                    BookId = resolvedBookId,
                    BookFileId = bookFileId,
                    MediaType = resolvedMediaType,
                    Location = location,
                    Position = position,
                    Duration = duration,
                    Progress = progress,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                return _progressRepository.Insert(created);
            }

            existing.BookId = resolvedBookId == 0 ? existing.BookId : resolvedBookId;
            existing.MediaType = resolvedMediaType;
            existing.Location = location;
            existing.Position = position;
            existing.Duration = duration;
            existing.Progress = progress;
            existing.UpdatedAt = now;

            return _progressRepository.Update(existing);
        }
    }
}
