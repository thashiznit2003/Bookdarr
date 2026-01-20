using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Backup;
using NzbDrone.Core.Books.Commands;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Configuration.Events;
using NzbDrone.Core.Download;
using NzbDrone.Core.HealthCheck;
using NzbDrone.Core.Housekeeping;
using NzbDrone.Core.ImportLists;
using NzbDrone.Core.Lifecycle;
using NzbDrone.Core.MediaFiles.Commands;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Update.Commands;

namespace NzbDrone.Core.Jobs
{
    public interface ITaskManager
    {
        IList<ScheduledTask> GetPending();
        List<ScheduledTask> GetAll();
        DateTime GetNextExecution(Type type);
        List<ScheduledTaskDefinition> GetDefinitions();
        TaskState GetTaskState(string taskName);
        ScheduledTask SetTaskState(string taskName, TaskState state);
    }

    public class TaskManager : ITaskManager, IHandle<ApplicationStartedEvent>, IHandle<CommandExecutedEvent>, IHandleAsync<ConfigSavedEvent>
    {
        private readonly IScheduledTaskRepository _scheduledTaskRepository;
        private readonly IConfigService _configService;
        private readonly IConfigFileProvider _configFileProvider;
        private readonly Logger _logger;
        private readonly ICached<ScheduledTask> _cache;

        public TaskManager(IScheduledTaskRepository scheduledTaskRepository, IConfigService configService, IConfigFileProvider configFileProvider, ICacheManager cacheManager, Logger logger)
        {
            _scheduledTaskRepository = scheduledTaskRepository;
            _configService = configService;
            _configFileProvider = configFileProvider;
            _cache = cacheManager.GetCache<ScheduledTask>(GetType());
            _logger = logger;
        }

        public IList<ScheduledTask> GetPending()
        {
            return _cache.Values
                         .Where(c => c.Interval > 0 && c.LastExecution.AddMinutes(c.Interval) < DateTime.UtcNow)
                         .ToList();
        }

        public List<ScheduledTask> GetAll()
        {
            return _cache.Values.ToList();
        }

        public DateTime GetNextExecution(Type type)
        {
            var scheduledTask = _cache.Find(type.FullName);

            return scheduledTask.LastExecution.AddMinutes(scheduledTask.Interval);
        }

        public List<ScheduledTaskDefinition> GetDefinitions()
        {
            return new List<ScheduledTaskDefinition>
                {
                    new ScheduledTaskDefinition(typeof(RefreshMonitoredDownloadsCommand), 1, false, CommandPriority.High),
                    new ScheduledTaskDefinition(typeof(MessagingCleanupCommand), 5),
                    new ScheduledTaskDefinition(typeof(ApplicationUpdateCheckCommand), 6 * 60),
                    new ScheduledTaskDefinition(typeof(CheckHealthCommand), 6 * 60),
                    new ScheduledTaskDefinition(typeof(RefreshAuthorCommand), 24 * 60),
                    new ScheduledTaskDefinition(typeof(RescanFoldersCommand), 24 * 60),
                    new ScheduledTaskDefinition(typeof(HousekeepingCommand), 24 * 60),
                    new ScheduledTaskDefinition(typeof(BackupCommand), GetBackupInterval()),
                    new ScheduledTaskDefinition(typeof(ImportListSyncCommand), 5)
                };
        }

        public TaskState GetTaskState(string taskName)
        {
            var (disabledTasks, deletedTasks) = GetTaskStateLists();

            if (deletedTasks.Contains(taskName))
            {
                return TaskState.Deleted;
            }

            if (disabledTasks.Contains(taskName))
            {
                return TaskState.Disabled;
            }

            return TaskState.Enabled;
        }

        public ScheduledTask SetTaskState(string taskName, TaskState state)
        {
            var definitions = GetDefinitions();
            var definition = definitions.SingleOrDefault(def => def.TaskName.Equals(taskName, StringComparison.InvariantCultureIgnoreCase));

            if (definition == null)
            {
                throw new InvalidOperationException($"Unknown task '{taskName}'");
            }

            var (disabledTasks, deletedTasks) = GetTaskStateLists();

            switch (state)
            {
                case TaskState.Enabled:
                    disabledTasks.Remove(taskName);
                    deletedTasks.Remove(taskName);
                    break;
                case TaskState.Disabled:
                    disabledTasks.Add(taskName);
                    deletedTasks.Remove(taskName);
                    break;
                case TaskState.Deleted:
                    deletedTasks.Add(taskName);
                    disabledTasks.Remove(taskName);
                    break;
            }

            _configFileProvider.SaveConfigDictionary(new Dictionary<string, object>
            {
                { "DisabledTasks", SerializeTaskList(disabledTasks) },
                { "DeletedTasks", SerializeTaskList(deletedTasks) }
            });

            var interval = state == TaskState.Enabled ? definition.Interval : 0;
            UpdateTaskInterval(definition.CommandType, interval);

            return _cache.Find(definition.TypeName);
        }

        public void Handle(ApplicationStartedEvent message)
        {
            var definitions = GetDefinitions();
            var defaultTasks = definitions.Select(definition => new ScheduledTask
            {
                Interval = definition.Interval,
                TypeName = definition.TypeName,
                Priority = definition.Priority
            }).ToList();

            ApplyTaskStateOverrides(defaultTasks, definitions);

            var currentTasks = _scheduledTaskRepository.All().ToList();

            _logger.Trace("Initializing jobs. Available: {0} Existing: {1}", defaultTasks.Count, currentTasks.Count);

            foreach (var job in currentTasks)
            {
                if (!defaultTasks.Any(c => c.TypeName == job.TypeName))
                {
                    _logger.Trace("Removing job from database '{0}'", job.TypeName);
                    _scheduledTaskRepository.Delete(job.Id);
                }
            }

            foreach (var defaultTask in defaultTasks)
            {
                var currentDefinition = currentTasks.SingleOrDefault(c => c.TypeName == defaultTask.TypeName) ?? defaultTask;

                currentDefinition.Interval = defaultTask.Interval;

                if (currentDefinition.Id == 0)
                {
                    currentDefinition.LastExecution = DateTime.UtcNow;
                }

                currentDefinition.Priority = defaultTask.Priority;

                _cache.Set(currentDefinition.TypeName, currentDefinition);
                _scheduledTaskRepository.Upsert(currentDefinition);
            }
        }

        private int GetBackupInterval()
        {
            var interval = _configService.BackupInterval;

            if (interval < 1)
            {
                interval = 1;
            }

            return interval * 60 * 24;
        }

        public void Handle(CommandExecutedEvent message)
        {
            var scheduledTask = _scheduledTaskRepository.All().SingleOrDefault(c => c.TypeName == message.Command.Body.GetType().FullName);

            if (scheduledTask != null && message.Command.Body.UpdateScheduledTask)
            {
                _logger.Trace("Updating last run time for: {0}", scheduledTask.TypeName);

                var lastExecution = DateTime.UtcNow;
                var startTime = message.Command.StartedAt.Value;

                _scheduledTaskRepository.SetLastExecutionTime(scheduledTask.Id, lastExecution, startTime);

                var cached = _cache.Find(scheduledTask.TypeName);

                cached.LastExecution = lastExecution;
                cached.LastStartTime = startTime;
            }
        }

        public void HandleAsync(ConfigSavedEvent message)
        {
            var backupDefinition = GetDefinitions().Single(def => def.CommandType == typeof(BackupCommand));
            var backupInterval = GetTaskState(backupDefinition.TaskName) == TaskState.Enabled ? backupDefinition.Interval : 0;

            UpdateTaskInterval(backupDefinition.CommandType, backupInterval);
        }

        private void UpdateTaskInterval(Type commandType, int interval)
        {
            var scheduledTask = _scheduledTaskRepository.GetDefinition(commandType);

            var update = new ScheduledTask
            {
                Id = scheduledTask.Id,
                Interval = interval
            };

            _scheduledTaskRepository.SetFields(update, task => task.Interval);

            var cached = _cache.Find(scheduledTask.TypeName);
            if (cached != null)
            {
                cached.Interval = interval;
            }
        }

        private void ApplyTaskStateOverrides(IList<ScheduledTask> tasks, IList<ScheduledTaskDefinition> definitions)
        {
            var (disabledTasks, deletedTasks) = GetTaskStateLists();

            foreach (var task in tasks)
            {
                var definition = definitions.SingleOrDefault(def => def.TypeName == task.TypeName);
                var taskName = definition?.TaskName ?? task.TypeName.Split('.').Last().Replace("Command", string.Empty);

                if (disabledTasks.Contains(taskName) || deletedTasks.Contains(taskName))
                {
                    task.Interval = 0;
                }
            }
        }

        private (HashSet<string> disabledTasks, HashSet<string> deletedTasks) GetTaskStateLists()
        {
            var disabledTasks = ParseTaskList(_configFileProvider.DisabledTasks);
            var deletedTasks = ParseTaskList(_configFileProvider.DeletedTasks);

            return (disabledTasks, deletedTasks);
        }

        private HashSet<string> ParseTaskList(string raw)
        {
            if (raw.IsNullOrWhiteSpace())
            {
                return new HashSet<string>(StringComparer.InvariantCultureIgnoreCase);
            }

            return raw.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                      .Select(entry => entry.Trim())
                      .Where(entry => entry.IsNotNullOrWhiteSpace())
                      .ToHashSet(StringComparer.InvariantCultureIgnoreCase);
        }

        private string SerializeTaskList(HashSet<string> tasks)
        {
            if (tasks == null || tasks.Count == 0)
            {
                return string.Empty;
            }

            return string.Join(",", tasks.OrderBy(task => task));
        }
    }
}
