using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(054)]
    public class add_user_book_rating : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("UserBooks")
                .AddColumn("UserRating").AsDecimal().Nullable();
        }
    }
}
