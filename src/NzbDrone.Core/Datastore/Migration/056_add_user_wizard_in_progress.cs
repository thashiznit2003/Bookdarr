using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(056)]
    public class add_user_wizard_in_progress : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Users")
                .AddColumn("WizardInProgress").AsBoolean().WithDefaultValue(false);
        }
    }
}
