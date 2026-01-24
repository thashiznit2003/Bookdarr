using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(055)]
    public class add_user_wizard_tracking : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Users")
                .AddColumn("LoginCount").AsInt32().WithDefaultValue(0)
                .AddColumn("WizardAutoShownCount").AsInt32().WithDefaultValue(0)
                .AddColumn("WizardAutoDisabled").AsBoolean().WithDefaultValue(false);
        }
    }
}
