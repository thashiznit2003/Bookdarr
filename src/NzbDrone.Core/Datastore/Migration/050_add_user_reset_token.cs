using System;
using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(050)]
    public class add_user_reset_token : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Users")
                .AddColumn("ResetToken").AsString().Nullable()
                .AddColumn("ResetTokenExpiration").AsDateTime().Nullable();
        }
    }
}
