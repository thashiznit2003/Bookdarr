using Readarr.Http.REST;

namespace Readarr.Api.V1.System.Tasks
{
    public class TaskStateResource : RestResource
    {
        public string State { get; set; }
    }
}
