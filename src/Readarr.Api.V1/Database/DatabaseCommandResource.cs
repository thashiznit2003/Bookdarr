using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.MediaFiles;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Database
{
    public class DatabaseCommandIssueResource : RestResource
    {
        public int BookFileId { get; set; }
        public string Path { get; set; }
        public int EditionId { get; set; }
        public int? BookId { get; set; }
        public string Reason { get; set; }
    }

    public class DatabaseCommandResultResource : RestResource
    {
        public string Action { get; set; }
        public string Message { get; set; }
        public int Count { get; set; }
        public List<DatabaseCommandIssueResource> Items { get; set; }
        public List<string> Logs { get; set; }
    }

    public static class DatabaseCommandResourceMapper
    {
        public static DatabaseCommandIssueResource ToResource(this InvalidBookFileLink model)
        {
            if (model == null)
            {
                return null;
            }

            return new DatabaseCommandIssueResource
            {
                BookFileId = model.BookFileId,
                Path = model.Path,
                EditionId = model.EditionId,
                BookId = model.BookId,
                Reason = model.Reason
            };
        }

        public static List<DatabaseCommandIssueResource> ToResource(this IEnumerable<InvalidBookFileLink> models)
        {
            return models?.Select(ToResource).ToList() ?? new List<DatabaseCommandIssueResource>();
        }
    }
}
