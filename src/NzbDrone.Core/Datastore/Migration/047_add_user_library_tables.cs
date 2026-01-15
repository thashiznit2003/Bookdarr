using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(047)]
    public class add_user_library_tables : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Users").AddColumn("IsAdmin").AsBoolean().WithDefaultValue(false);

            Create.TableForModel("UserBooks")
                .WithColumn("UserId").AsInt32().Indexed()
                .WithColumn("BookId").AsInt32().Indexed()
                .WithColumn("Status").AsInt32().WithDefaultValue(0)
                .WithColumn("WantsEbook").AsBoolean().WithDefaultValue(true)
                .WithColumn("WantsAudiobook").AsBoolean().WithDefaultValue(true)
                .WithColumn("SharedCopyClaimed").AsBoolean().WithDefaultValue(false)
                .WithColumn("CreatedAt").AsDateTime()
                .WithColumn("LastNotificationAt").AsDateTime().Nullable()
                .WithColumn("IsDeleted").AsBoolean().WithDefaultValue(false);

            Create.TableForModel("UserBookFiles")
                .WithColumn("UserBookId").AsInt32().Indexed()
                .WithColumn("BookFileId").AsInt32().Indexed()
                .WithColumn("Role").AsInt32().WithDefaultValue(0)
                .WithColumn("Note").AsString().Nullable()
                .WithColumn("CreatedAt").AsDateTime();

            Alter.Table("BookFiles").AddColumn("SharedWithAll").AsBoolean().WithDefaultValue(true);

            Execute.Sql(@"UPDATE ""Users"" SET ""IsAdmin"" = TRUE WHERE ""Id"" IN (SELECT ""Id"" FROM ""Users"" ORDER BY ""Id"" LIMIT 1)");
            Execute.Sql(@"UPDATE ""BookFiles"" SET ""SharedWithAll"" = TRUE WHERE ""SharedWithAll"" IS NULL");
        }
    }
}
