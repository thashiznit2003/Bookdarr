using System.Collections.Generic;
using System.IO;
using System.Linq;
using Dapper;
using NzbDrone.Common;
using NzbDrone.Core.Books;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.MediaFiles
{
    public interface IMediaFileRepository : IBasicRepository<BookFile>
    {
        List<BookFile> GetFilesByAuthor(int authorId);
        List<BookFile> GetFilesByAuthorMetadataId(int authorMetadataId);
        List<BookFile> GetFilesByBook(int bookId);
        List<BookFile> GetFilesByEdition(int editionId);
        List<BookFile> GetUnmappedFiles();
        List<BookFile> GetFilesWithBasePath(string path);
        List<BookFile> GetFileWithPath(List<string> paths);
        BookFile GetFileWithPath(string path);
        void DeleteFilesByBook(int bookId);
        void UnlinkFilesByBook(int bookId);
        void DeleteFilesByEditionIds(List<int> editionIds);
        void UnlinkFilesByEditionIds(List<int> editionIds);
        List<InvalidBookFileLink> GetInvalidBookFileLinks();
        List<InvalidBookFileLink> ClearInvalidBookFileLinks();
        List<BookFileSummary> GetBookFileSummaries();
    }

    public class MediaFileRepository : BasicRepository<BookFile>, IMediaFileRepository
    {
        public MediaFileRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        // always join with all the other good stuff
        // needed more often than not so better to load it all now
        protected override SqlBuilder Builder() => new SqlBuilder(_database.DatabaseType)
            .LeftJoin<BookFile, Edition>((b, e) => b.EditionId == e.Id)
            .LeftJoin<Edition, Book>((e, b) => e.BookId == b.Id)
            .LeftJoin<Book, Author>((book, author) => book.AuthorMetadataId == author.AuthorMetadataId)
            .LeftJoin<Author, AuthorMetadata>((a, m) => a.AuthorMetadataId == m.Id);

        protected override List<BookFile> Query(SqlBuilder builder) => Query(_database, builder).ToList();

        public static IEnumerable<BookFile> Query(IDatabase database, SqlBuilder builder)
        {
            return database.QueryJoined<BookFile, Edition, Book, Author, AuthorMetadata>(builder, (file, edition, book, author, metadata) => Map(file, edition, book, author, metadata));
        }

        private static BookFile Map(BookFile file, Edition edition, Book book, Author author, AuthorMetadata metadata)
        {
            file.Edition = edition;

            if (edition != null)
            {
                edition.Book = book;
            }

            if (author != null)
            {
                author.Metadata = metadata;
            }

            file.Author = author;

            return file;
        }

        public List<BookFile> GetFilesByAuthor(int authorId)
        {
            return Query(Builder().Where<Author>(a => a.Id == authorId));
        }

        public List<BookFile> GetFilesByAuthorMetadataId(int authorMetadataId)
        {
            return Query(Builder().Where<Book>(b => b.AuthorMetadataId == authorMetadataId));
        }

        public List<BookFile> GetFilesByBook(int bookId)
        {
            return Query(Builder().Where<Book>(b => b.Id == bookId));
        }

        public List<BookFile> GetFilesByEdition(int editionId)
        {
            return Query(Builder().Where<BookFile>(f => f.EditionId == editionId));
        }

        public List<BookFile> GetUnmappedFiles()
        {
            return _database.Query<BookFile>(new SqlBuilder(_database.DatabaseType).Select(typeof(BookFile))
                                              .Where<BookFile>(t => t.EditionId == 0)).ToList();
        }

        public void DeleteFilesByBook(int bookId)
        {
            var fileIds = GetFilesByBook(bookId).Select(x => x.Id).ToList();
            Delete(x => fileIds.Contains(x.Id));
        }

        public void UnlinkFilesByBook(int bookId)
        {
            var files = GetFilesByBook(bookId);
            files.ForEach(x => x.EditionId = 0);
            SetFields(files, f => f.EditionId);
        }

        public void DeleteFilesByEditionIds(List<int> editionIds)
        {
            if (editionIds == null || editionIds.Count == 0)
            {
                return;
            }

            Delete(x => editionIds.Contains(x.EditionId));
        }

        public void UnlinkFilesByEditionIds(List<int> editionIds)
        {
            if (editionIds == null || editionIds.Count == 0)
            {
                return;
            }

            var files = _database.Query<BookFile>(new SqlBuilder(_database.DatabaseType)
                .Select(typeof(BookFile))
                .Where<BookFile>(x => editionIds.Contains(x.EditionId))).ToList();

            files.ForEach(x => x.EditionId = 0);
            SetFields(files, f => f.EditionId);
        }

        public List<InvalidBookFileLink> GetInvalidBookFileLinks()
        {
            using var mapper = _database.OpenConnection();

            var sql = @"SELECT bf.""Id"" AS ""BookFileId"",
                               bf.""Path"" AS ""Path"",
                               bf.""EditionId"" AS ""EditionId"",
                               b.""Id"" AS ""BookId"",
                               CASE
                                 WHEN e.""Id"" IS NULL THEN 'Edition not found'
                                 WHEN b.""Id"" IS NULL THEN 'Book not found'
                                 ELSE 'Unknown'
                               END AS ""Reason""
                        FROM ""BookFiles"" bf
                        LEFT JOIN ""Editions"" e ON bf.""EditionId"" = e.""Id""
                        LEFT JOIN ""Books"" b ON e.""BookId"" = b.""Id""
                        WHERE bf.""EditionId"" != 0
                          AND (e.""Id"" IS NULL OR b.""Id"" IS NULL)
                        ORDER BY bf.""Path"";";

            return mapper.Query<InvalidBookFileLink>(sql).ToList();
        }

        public List<InvalidBookFileLink> ClearInvalidBookFileLinks()
        {
            var invalidLinks = GetInvalidBookFileLinks();

            if (!invalidLinks.Any())
            {
                return invalidLinks;
            }

            using var mapper = _database.OpenConnection();
            var ids = invalidLinks.Select(x => x.BookFileId).Distinct().ToList();

            mapper.Execute(@"UPDATE ""BookFiles""
                             SET ""EditionId"" = 0
                             WHERE ""Id"" IN @ids",
                new { ids });

            return invalidLinks;
        }

        public List<BookFileSummary> GetBookFileSummaries()
        {
            using var mapper = _database.OpenConnection();

            var sql = @"SELECT ""Id"" AS ""BookFileId"",
                               ""Path"" AS ""Path"",
                               ""EditionId"" AS ""EditionId"",
                               ""DateAdded"" AS ""DateAdded""
                        FROM ""BookFiles""
                        WHERE ""Path"" IS NOT NULL
                        ORDER BY ""Path"";";

            return mapper.Query<BookFileSummary>(sql).ToList();
        }

        public List<BookFile> GetFilesWithBasePath(string path)
        {
            // ensure path ends with a single trailing path separator to avoid matching partial paths
            var safePath = path.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            return _database.Query<BookFile>(new SqlBuilder(_database.DatabaseType).Where<BookFile>(x => x.Path.StartsWith(safePath))).ToList();
        }

        public BookFile GetFileWithPath(string path)
        {
            return Query(x => x.Path == path).SingleOrDefault();
        }

        public List<BookFile> GetFileWithPath(List<string> paths)
        {
            // use more limited join for speed
            var builder = new SqlBuilder(_database.DatabaseType)
                .LeftJoin<BookFile, Edition>((f, t) => f.EditionId == t.Id);

            var all = _database.QueryJoined<BookFile, Edition>(builder, (file, book) => MapTrack(file, book)).ToList();

            var joined = all.Join(paths, x => x.Path, x => x, (file, path) => file, PathEqualityComparer.Instance).ToList();
            return joined;
        }

        private BookFile MapTrack(BookFile file, Edition book)
        {
            file.Edition = book;
            return file;
        }
    }
}
