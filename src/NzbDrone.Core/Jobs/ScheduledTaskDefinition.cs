using System;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Jobs
{
    public class ScheduledTaskDefinition
    {
        public ScheduledTaskDefinition(Type commandType, int interval, bool isCritical = false, CommandPriority priority = CommandPriority.Low)
        {
            CommandType = commandType;
            Interval = interval;
            IsCritical = isCritical;
            Priority = priority;
        }

        public Type CommandType { get; }
        public int Interval { get; }
        public bool IsCritical { get; }
        public CommandPriority Priority { get; }

        public string TaskName => CommandType.Name.Replace("Command", string.Empty);
        public string TypeName => CommandType.FullName;
    }
}
