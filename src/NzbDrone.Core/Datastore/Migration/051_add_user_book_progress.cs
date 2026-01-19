using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(051)]
    public class add_user_book_progress : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("UserBookProgress")
                .WithColumn("UserId").AsInt32().Indexed()
                .WithColumn("BookId").AsInt32().Indexed()
                .WithColumn("BookFileId").AsInt32().Indexed()
                .WithColumn("MediaType").AsInt32().WithDefaultValue(0)
                .WithColumn("Location").AsString().Nullable()
                .WithColumn("Position").AsDouble().Nullable()
                .WithColumn("Duration").AsDouble().Nullable()
                .WithColumn("Progress").AsDouble().Nullable()
                .WithColumn("CreatedAt").AsDateTime()
                .WithColumn("UpdatedAt").AsDateTime();
        }
    }
}
