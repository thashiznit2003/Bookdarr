using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(052)]
    public class add_stacks_protocol_to_delay_profiles : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("DelayProfiles")
                .AddColumn("EnableStacks").AsBoolean().WithDefaultValue(false)
                .AddColumn("StacksDelay").AsInt32().WithDefaultValue(0);
        }
    }
}
