using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(046)]
    public class add_conversion_error_drm_flag : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("BookFiles").AddColumn("ConversionErrorIsDrm").AsBoolean().WithDefaultValue(false);
        }
    }
}
