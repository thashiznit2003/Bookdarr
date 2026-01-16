using FluentMigrator;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    [Migration(049)]
    public class add_user_metadata : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            Alter.Table("Users")
                .AddColumn("Email").AsString(256).Nullable()
                .AddColumn("Role").AsInt32().WithDefaultValue((int)UserRole.Standard)
                .AddColumn("IsActive").AsBoolean().WithDefaultValue(true)
                .AddColumn("CreatedAt").AsDateTime().Nullable()
                .AddColumn("LastLogin").AsDateTime().Nullable()
                .AddColumn("PreferredQualityMedia").AsString(32).WithDefaultValue("both");

            Execute.Sql(@"UPDATE ""Users"" SET ""Role"" = 0 WHERE ""IsAdmin"" = TRUE");
            Execute.Sql(@"UPDATE ""Users"" SET ""Role"" = 1 WHERE ""Role"" IS NULL");
            Execute.Sql(@"UPDATE ""Users"" SET ""CreatedAt"" = CURRENT_TIMESTAMP WHERE ""CreatedAt"" IS NULL");
            Execute.Sql(@"UPDATE ""Users"" SET ""PreferredQualityMedia"" = 'both' WHERE ""PreferredQualityMedia"" IS NULL");
            Execute.Sql(@"UPDATE ""Users"" SET ""IsActive"" = TRUE WHERE ""IsActive"" IS NULL");
            Execute.Sql(@"UPDATE ""Users"" SET ""IsAdmin"" = CASE WHEN ""Role"" = 0 THEN TRUE ELSE FALSE END");

            Alter.Column("CreatedAt").OnTable("Users").AsDateTime().NotNullable();
        }
    }
}
