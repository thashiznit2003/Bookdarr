using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(044)]
    public class remove_rss_functionality : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // Enable automatic search for indexers that only had RSS enabled
            // This provides a smooth migration path
            Execute.Sql(@"UPDATE Indexers
                          SET EnableAutomaticSearch = 1
                          WHERE EnableRss = 1
                          AND EnableAutomaticSearch = 0
                          AND EnableInteractiveSearch = 0");

            // Remove the RSS column from Indexers table
            Delete.Column("EnableRss").FromTable("Indexers");

            // Remove RssSyncInterval from Config table if it exists
            Delete.FromTable("Config").Row(new { Key = "rsssyncinterval" });
        }
    }
}
