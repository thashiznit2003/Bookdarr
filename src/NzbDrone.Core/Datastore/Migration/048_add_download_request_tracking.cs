using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(048)]
    public class add_download_request_tracking : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Create.TableForModel("DownloadRequests")
                .WithColumn("UserId").AsInt32().Indexed()
                .WithColumn("BookId").AsInt32().Indexed()
                .WithColumn("TriggerType").AsInt32().WithDefaultValue(0)
                .WithColumn("RequestedMediaType").AsInt32().WithDefaultValue(0)
                .WithColumn("ConfidenceScore").AsDecimal().WithDefaultValue(0)
                .WithColumn("MarkedForReview").AsBoolean().WithDefaultValue(false)
                .WithColumn("Notes").AsString().Nullable()
                .WithColumn("WasSuccessful").AsBoolean().WithDefaultValue(false)
                .WithColumn("CreatedAt").AsDateTime().NotNullable()
                .WithColumn("CompletedAt").AsDateTime().Nullable();
        }
    }
}
