using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Http.CloudFlare;
using NzbDrone.Core.Indexers.Exceptions;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.Indexers.AnnasArchive
{
    public class AnnasArchive : HttpIndexerBase<AnnasArchiveSettings>
    {
        public override string Name => "Anna's Archive";
        public override DownloadProtocol Protocol => DownloadProtocol.Direct;

        public AnnasArchive(IHttpClient httpClient, IIndexerStatusService indexerStatusService, IConfigService configService, IParsingService parsingService, Logger logger)
            : base(httpClient, indexerStatusService, configService, parsingService, logger)
        {
        }

        public override IIndexerRequestGenerator GetRequestGenerator()
        {
            return new AnnasArchiveRequestGenerator { Settings = Settings };
        }

        public override IParseIndexerResponse GetParser()
        {
            return new AnnasArchiveParser(Settings);
        }

        protected override async Task<IList<ReleaseInfo>> FetchReleases(Func<IIndexerRequestGenerator, IndexerPageableRequestChain> pageableRequestChainSelector)
        {
            var releases = new List<ReleaseInfo>();
            var url = string.Empty;
            var minimumBackoff = TimeSpan.FromHours(1);
            Action recordFailure = null;
            var anyResponse = false;

            try
            {
                var generator = GetRequestGenerator();
                var parser = GetParser();
                var pageableRequestChain = pageableRequestChainSelector(generator);

                for (var i = 0; i < pageableRequestChain.Tiers; i++)
                {
                    var tierFailed = false;
                    var pageableRequests = pageableRequestChain.GetTier(i);

                    foreach (var pageableRequest in pageableRequests)
                    {
                        var pagedReleases = new List<ReleaseInfo>();

                        foreach (var request in pageableRequest)
                        {
                            url = request.Url.FullUri;

                            try
                            {
                                var page = await FetchPage(request, parser);
                                anyResponse = true;
                                pagedReleases.AddRange(page);

                                if (pagedReleases.Count >= MaxNumResultsPerQuery)
                                {
                                    break;
                                }

                                if (!IsFullPage(page))
                                {
                                    break;
                                }
                            }
                            catch (Exception ex)
                            {
                                tierFailed = true;
                                var failedUrl = url;
                                recordFailure = () => RecordFailure(ex, minimumBackoff, failedUrl);
                                break;
                            }
                        }

                        if (tierFailed)
                        {
                            break;
                        }

                        releases.AddRange(pagedReleases.Where(IsValidRelease));
                    }

                    if (releases.Any())
                    {
                        break;
                    }
                }

                if (releases.Any())
                {
                    _indexerStatusService.RecordSuccess(Definition.Id);
                }
                else if (anyResponse)
                {
                    _indexerStatusService.RecordSuccess(Definition.Id);
                }
                else if (recordFailure != null)
                {
                    recordFailure();
                }
                else
                {
                    _indexerStatusService.RecordSuccess(Definition.Id);
                }
            }
            catch (Exception ex)
            {
                _indexerStatusService.RecordFailure(Definition.Id);
                _logger.Error(ex, "An error occurred while processing Anna's Archive responses. {0}", url);
            }

            var cleaned = CleanupReleases(releases).ToList();
            await EnrichReleaseFileTypes(cleaned);
            return cleaned;
        }

        private void RecordFailure(Exception ex, TimeSpan minimumBackoff, string url)
        {
            switch (ex)
            {
                case WebException webException:
                    if (webException.Status is WebExceptionStatus.NameResolutionFailure or WebExceptionStatus.ConnectFailure)
                    {
                        _indexerStatusService.RecordConnectionFailure(Definition.Id);
                    }
                    else
                    {
                        _indexerStatusService.RecordFailure(Definition.Id);
                    }

                    if (webException.Message.Contains("502") || webException.Message.Contains("503") ||
                        webException.Message.Contains("504") || webException.Message.Contains("timed out"))
                    {
                        _logger.Warn("{0} server is currently unavailable. {1} {2}", this, url, webException.Message);
                    }
                    else
                    {
                        _logger.Warn("{0} {1} {2}", this, url, webException.Message);
                    }

                    break;
                case TooManyRequestsException tooManyRequestsException:
                    var retryAfter = tooManyRequestsException.RetryAfter != TimeSpan.Zero ? tooManyRequestsException.RetryAfter : minimumBackoff;
                    _indexerStatusService.RecordFailure(Definition.Id, retryAfter);
                    _logger.Warn("API Request Limit reached for {0}. Disabled for {1}", this, retryAfter);
                    break;
                case HttpException httpException:
                    _indexerStatusService.RecordFailure(Definition.Id);
                    if (httpException.Response.HasHttpServerError)
                    {
                        _logger.Warn("Unable to connect to {0} at [{1}]. Indexer's server is unavailable. Try again later. {2}", this, url, httpException.Message);
                    }
                    else
                    {
                        _logger.Warn("{0} {1}", this, httpException.Message);
                    }

                    break;
                case RequestLimitReachedException requestLimitException:
                    var retryTime = requestLimitException.RetryAfter != TimeSpan.Zero ? requestLimitException.RetryAfter : minimumBackoff;
                    _indexerStatusService.RecordFailure(Definition.Id, retryTime);
                    _logger.Warn("API Request Limit reached for {0}. Disabled for {1}", this, retryTime);
                    break;
                case ApiKeyException:
                    _indexerStatusService.RecordFailure(Definition.Id);
                    _logger.Warn("Invalid API Key for {0} {1}", this, url);
                    break;
                case CloudFlareCaptchaException captchaException:
                    _indexerStatusService.RecordFailure(Definition.Id);
                    captchaException.WithData("FeedUrl", url);
                    if (captchaException.IsExpired)
                    {
                        _logger.Error(captchaException, "Expired CAPTCHA token for {0}, please refresh in indexer settings.", this);
                    }
                    else
                    {
                        _logger.Error(captchaException, "CAPTCHA token required for {0}, check indexer settings.", this);
                    }

                    break;
                case TaskCanceledException taskCanceledException:
                    _indexerStatusService.RecordFailure(Definition.Id);
                    _logger.Warn(taskCanceledException, "Unable to connect to indexer, possibly due to a timeout. {0}", url);
                    break;
                case IndexerException indexerException:
                    _indexerStatusService.RecordFailure(Definition.Id);
                    _logger.Warn(indexerException, "{0}", url);
                    break;
                default:
                    _indexerStatusService.RecordFailure(Definition.Id);
                    _logger.Error(ex, "An error occurred while processing feed. {0}", url);
                    break;
            }
        }

        private async Task EnrichReleaseFileTypes(List<ReleaseInfo> releases)
        {
            if (releases == null || releases.Count == 0)
            {
                return;
            }

            for (var i = 0; i < releases.Count; i++)
            {
                var release = releases[i];
                var existingType = AnnasArchiveParser.ExtractFileType(release.Title);

                if (!existingType.IsNullOrWhiteSpace())
                {
                    continue;
                }

                if (release.InfoUrl.IsNullOrWhiteSpace())
                {
                    continue;
                }

                try
                {
                    var request = new HttpRequest(release.InfoUrl)
                    {
                        AllowAutoRedirect = true
                    };

                    var response = await _httpClient.GetAsync(request);
                    var fileType = AnnasArchiveParser.ExtractFileType(response.Content);

                    if (!fileType.IsNullOrWhiteSpace())
                    {
                        release.Title = AnnasArchiveParser.AppendFileTypeToTitle(release.Title, fileType);
                    }
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Failed to enrich Anna's Archive release metadata for {0}", release.InfoUrl);
                }
            }

            var ordered = releases
                .Select((release, index) => new { release, index })
                .OrderBy(item => AnnasArchiveParser.GetFileTypePriority(AnnasArchiveParser.ExtractFileType(item.release.Title)))
                .ThenBy(item => item.index)
                .Select(item => item.release)
                .ToList();

            releases.Clear();
            releases.AddRange(ordered);
        }
    }
}
