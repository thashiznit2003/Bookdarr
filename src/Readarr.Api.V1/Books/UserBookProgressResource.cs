using System;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Books
{
    public class UserBookProgressResource : RestResource
    {
        public int BookId { get; set; }
        public int BookFileId { get; set; }
        public BookFileMediaType MediaType { get; set; }
        public string Location { get; set; }
        public double? Position { get; set; }
        public double? Duration { get; set; }
        public double? Progress { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public static class UserBookProgressResourceMapper
    {
        public static UserBookProgressResource ToResource(this UserBookProgress model)
        {
            if (model == null)
            {
                return null;
            }

            return new UserBookProgressResource
            {
                Id = model.Id,
                BookId = model.BookId,
                BookFileId = model.BookFileId,
                MediaType = model.MediaType,
                Location = model.Location,
                Position = model.Position,
                Duration = model.Duration,
                Progress = model.Progress,
                UpdatedAt = model.UpdatedAt
            };
        }
    }
}
