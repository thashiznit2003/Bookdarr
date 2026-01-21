using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.IndexerSearch.Definitions;

namespace NzbDrone.Core.Indexers.AnnasArchive
{
    public class AnnasArchiveRequestGenerator : IIndexerRequestGenerator
    {
        public AnnasArchiveSettings Settings { get; set; }

        public IndexerPageableRequestChain GetRecentRequests()
        {
            return BuildSearchRequests("harry potter");
        }

        public IndexerPageableRequestChain GetSearchRequests(BookSearchCriteria searchCriteria)
        {
            var query = GetBookQuery(searchCriteria);

            return BuildSearchRequests(query);
        }

        public IndexerPageableRequestChain GetSearchRequests(AuthorSearchCriteria searchCriteria)
        {
            var query = searchCriteria.Author?.Name ?? string.Empty;

            return BuildSearchRequests(query);
        }

        private IndexerPageableRequestChain BuildSearchRequests(string query)
        {
            var chain = new IndexerPageableRequestChain();

            if (query.IsNullOrWhiteSpace())
            {
                return chain;
            }

            var first = true;

            foreach (var baseUrl in Settings.GetBaseUrls())
            {
                if (!first)
                {
                    chain.AddTier();
                }

                chain.Add(new[] { BuildRequest(baseUrl, query) });
                first = false;
            }

            return chain;
        }

        private IndexerRequest BuildRequest(string baseUrl, string query)
        {
            var searchUrl = new HttpUri(baseUrl.TrimEnd('/'))
                .CombinePath("/search")
                .AddQueryParam("q", query);

            return new IndexerRequest(searchUrl.FullUri, HttpAccept.Html);
        }

        private static string GetBookQuery(BookSearchCriteria searchCriteria)
        {
            if (searchCriteria.BookIsbn.IsNotNullOrWhiteSpace())
            {
                return searchCriteria.BookIsbn.Trim();
            }

            var queryParts = new List<string>();

            if (searchCriteria.Author?.Name.IsNotNullOrWhiteSpace() == true)
            {
                queryParts.Add(searchCriteria.Author.Name);
            }

            if (searchCriteria.BookTitle.IsNotNullOrWhiteSpace())
            {
                queryParts.Add(searchCriteria.BookTitle);
            }

            return string.Join(" ", queryParts.Where(part => part.IsNotNullOrWhiteSpace()));
        }
    }
}
