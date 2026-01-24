using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(053)]
    public class add_user_author_library : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("UserAuthors")
                .WithColumn("UserId").AsInt32().Indexed()
                .WithColumn("AuthorId").AsInt32().Indexed()
                .WithColumn("CreatedAt").AsDateTime()
                .WithColumn("IsDeleted").AsBoolean().WithDefaultValue(false);
        }
    }
}
