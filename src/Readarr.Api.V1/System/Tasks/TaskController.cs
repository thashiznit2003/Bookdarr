using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.Jobs;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.SignalR;
using Readarr.Http;
using Readarr.Http.REST;

namespace Readarr.Api.V1.System.Tasks
{
    [V1ApiController("system/task")]
    public class TaskController : RestControllerWithSignalR<TaskResource, ScheduledTask>, IHandle<CommandExecutedEvent>
    {
        private readonly ITaskManager _taskManager;

        public TaskController(ITaskManager taskManager, IBroadcastSignalRMessage broadcastSignalRMessage)
            : base(broadcastSignalRMessage)
        {
            _taskManager = taskManager;
        }

        [HttpGet]
        public List<TaskResource> GetAll()
        {
            return _taskManager.GetAll()
                               .Select(ConvertToResource)
                               .OrderBy(t => t.Name)
                               .ToList();
        }

        protected override TaskResource GetResourceById(int id)
        {
            var task = _taskManager.GetAll()
                               .SingleOrDefault(t => t.Id == id);

            if (task == null)
            {
                return null;
            }

            return ConvertToResource(task);
        }

        private TaskResource ConvertToResource(ScheduledTask scheduledTask)
        {
            var taskName = scheduledTask.TypeName.Split('.').Last().Replace("Command", "");
            var definition = _taskManager.GetDefinitions().SingleOrDefault(def => def.TaskName == taskName);
            var taskState = _taskManager.GetTaskState(taskName);

            return new TaskResource
            {
                Id = scheduledTask.Id,
                Name = taskName.SplitCamelCase(),
                TaskName = taskName,
                State = taskState.ToString().ToLower(),
                IsCritical = definition?.IsCritical ?? false,
                Interval = scheduledTask.Interval,
                LastExecution = scheduledTask.LastExecution,
                LastStartTime = scheduledTask.LastStartTime,
                NextExecution = scheduledTask.LastExecution.AddMinutes(scheduledTask.Interval)
            };
        }

        [HttpPut("{id:int}/state")]
        public ActionResult<TaskResource> UpdateTaskState(int id, [FromBody] TaskStateResource resource)
        {
            if (resource == null || resource.State.IsNullOrWhiteSpace())
            {
                return BadRequest("Task state is required.");
            }

            var task = _taskManager.GetAll()
                                   .SingleOrDefault(t => t.Id == id);

            if (task == null)
            {
                return NotFound();
            }

            var taskName = task.TypeName.Split('.').Last().Replace("Command", "");
            var definition = _taskManager.GetDefinitions().SingleOrDefault(def => def.TaskName == taskName);

            if (definition == null)
            {
                return NotFound();
            }

            if (definition.IsCritical)
            {
                return BadRequest("Critical tasks cannot be modified.");
            }

            if (!System.Enum.TryParse(resource.State, true, out TaskState state))
            {
                return BadRequest("Invalid task state.");
            }

            _taskManager.SetTaskState(taskName, state);

            var updated = _taskManager.GetAll().SingleOrDefault(t => t.Id == id) ?? task;

            return Accepted(ConvertToResource(updated));
        }

        [NonAction]
        public void Handle(CommandExecutedEvent message)
        {
            BroadcastResourceChange(ModelAction.Sync);
        }
    }
}
