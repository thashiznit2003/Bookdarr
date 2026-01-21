using System.Collections.Generic;
using System.Net.Http;
using Newtonsoft.Json;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;

namespace NzbDrone.Core.Download.Clients.Stacks
{
    public interface IStacksProxy
    {
        StacksHealthResponse GetHealth(StacksSettings settings);
        StacksKeyTestResponse TestApiKey(StacksSettings settings);
        StacksQueueAddResponse AddToQueue(StacksSettings settings, string md5OrUrl, string source);
        StacksStatusResponse GetStatus(StacksSettings settings);
        bool RemoveFromQueue(StacksSettings settings, string md5);
    }

    public class StacksProxy : IStacksProxy
    {
        private readonly IHttpClient _httpClient;

        public StacksProxy(IHttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public StacksHealthResponse GetHealth(StacksSettings settings)
        {
            var request = BuildRequest(settings, "api/health", HttpMethod.Get, requiresAuth: false);
            var response = _httpClient.Execute(request);

            return Json.Deserialize<StacksHealthResponse>(response.Content);
        }

        public StacksKeyTestResponse TestApiKey(StacksSettings settings)
        {
            var request = BuildRequest(settings, "api/key/test", HttpMethod.Post, requiresAuth: false);
            request.SetContent(new { key = settings.ApiKey }.ToJson());
            request.Headers.ContentType = "application/json";

            var response = _httpClient.Execute(request);

            return Json.Deserialize<StacksKeyTestResponse>(response.Content);
        }

        public StacksQueueAddResponse AddToQueue(StacksSettings settings, string md5OrUrl, string source)
        {
            var request = BuildRequest(settings, "api/queue/add", HttpMethod.Post, requiresAuth: true);
            request.SetContent(new { md5 = md5OrUrl, source }.ToJson());
            request.Headers.ContentType = "application/json";

            var response = _httpClient.Execute(request);

            return Json.Deserialize<StacksQueueAddResponse>(response.Content);
        }

        public StacksStatusResponse GetStatus(StacksSettings settings)
        {
            var request = BuildRequest(settings, "api/status", HttpMethod.Get, requiresAuth: true);
            var response = _httpClient.Execute(request);

            return Json.Deserialize<StacksStatusResponse>(response.Content);
        }

        public bool RemoveFromQueue(StacksSettings settings, string md5)
        {
            var request = BuildRequest(settings, "api/queue/remove", HttpMethod.Post, requiresAuth: true);
            request.SetContent(new { md5 }.ToJson());
            request.Headers.ContentType = "application/json";

            var response = _httpClient.Execute(request);
            var result = Json.Deserialize<StacksQueueRemoveResponse>(response.Content);

            return result.Success;
        }

        private HttpRequest BuildRequest(StacksSettings settings, string resourceUrl, HttpMethod method, bool requiresAuth)
        {
            var requestBuilder = new HttpRequestBuilder(settings.UseSsl, settings.Host, settings.Port, settings.UrlBase)
            {
                ResourceUrl = resourceUrl,
                Method = method,
                HttpAccept = HttpAccept.Json,
                LogResponseContent = true
            };

            if (requiresAuth)
            {
                requestBuilder.Headers.Set("X-API-Key", settings.ApiKey);
            }

            return requestBuilder.Build();
        }
    }

    public class StacksHealthResponse
    {
        public string Status { get; set; }
    }

    public class StacksKeyTestResponse
    {
        public bool Valid { get; set; }
        public string Type { get; set; }
    }

    public class StacksQueueAddResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Md5 { get; set; }
        public string Subfolder { get; set; }
        public string Error { get; set; }
    }

    public class StacksQueueRemoveResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class StacksStatusResponse
    {
        public StacksCurrentDownload Current { get; set; }
        public List<StacksQueueItem> Queue { get; set; }

        [JsonProperty("recent_history")]
        public List<StacksHistoryItem> RecentHistory { get; set; }

        public bool Paused { get; set; }
    }

    public class StacksQueueItem
    {
        public string Md5 { get; set; }
        public string Source { get; set; }

        [JsonProperty("added_at")]
        public string AddedAt { get; set; }

        public string Status { get; set; }
        public string Subfolder { get; set; }
    }

    public class StacksCurrentDownload : StacksQueueItem
    {
        [JsonProperty("started_at")]
        public string StartedAt { get; set; }

        public string Filename { get; set; }

        [JsonProperty("status_message")]
        public string StatusMessage { get; set; }

        public StacksProgress Progress { get; set; }
    }

    public class StacksHistoryItem
    {
        public string Md5 { get; set; }
        public string Filename { get; set; }

        [JsonProperty("completed_at")]
        public string CompletedAt { get; set; }

        public bool Success { get; set; }
        public string Filepath { get; set; }
        public string Error { get; set; }

        [JsonProperty("used_fast_download")]
        public bool UsedFastDownload { get; set; }

        public string Subfolder { get; set; }
    }

    public class StacksProgress
    {
        [JsonProperty("total_size")]
        public long TotalSize { get; set; }

        public long Downloaded { get; set; }
        public double Percent { get; set; }
        public long Speed { get; set; }
    }
}
