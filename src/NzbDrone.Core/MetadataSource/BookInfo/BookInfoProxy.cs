using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using Newtonsoft.Json.Linq;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Books;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Http;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource.GoogleBooks;
using NzbDrone.Core.Parser;

namespace NzbDrone.Core.MetadataSource.BookInfo
{
    public class BookInfoProxy : IProvideAuthorInfo, IProvideBookInfo, ISearchForNewBook, ISearchForNewAuthor, ISearchForNewEntity, IAuthorExtraMetadataProvider
    {
        private const string GoogleBookPrefix = "gb:";
        private const string GoogleAuthorPrefix = "gba:";
        private const string OpenLibraryWorkPrefix = "olw:";
        private const string OpenLibraryAuthorPrefix = "ola:";
        private const int GoogleBooksMaxResultsPerRequest = 40;
        private const int GoogleBooksAuthorMaxResults = 200;
        private const int GoogleBooksAuthorMinResults = 5;
        private const int AuthorImageCacheDays = 7;
        private const string OpenLibrarySeriesPrefix = "ol-series:";
        private const int OpenLibraryMaxGenres = 25;
        private const int OpenLibraryMaxCovers = 1;
        private const int OpenLibraryAuthorLookupLimit = 5;
        private readonly IHttpClient _httpClient;
        private readonly ICachedHttpResponseService _cachedHttpClient;
        private readonly IConfigService _configService;
        private readonly Logger _logger;
        private readonly IHttpRequestBuilderFactory _googleBooksRequestBuilder;
        private readonly ICached<HashSet<string>> _cache;
        private readonly ICached<AuthorExtraMetadata> _authorExtrasCache;
        private readonly ICached<OpenLibraryBookData> _openLibraryBookCache;

        public BookInfoProxy(IHttpClient httpClient,
                             ICachedHttpResponseService cachedHttpClient,
                             IConfigService configService,
                             Logger logger,
                             ICacheManager cacheManager)
        {
            _httpClient = httpClient;
            _cachedHttpClient = cachedHttpClient;
            _configService = configService;
            _cache = cacheManager.GetCache<HashSet<string>>(GetType());
            _authorExtrasCache = cacheManager.GetCache<AuthorExtraMetadata>(GetType(), "authorImage");
            _openLibraryBookCache = cacheManager.GetCache<OpenLibraryBookData>(GetType(), "openLibraryBook");
            _logger = logger;

            _googleBooksRequestBuilder = new HttpRequestBuilder("https://www.googleapis.com/books/v1/{route}")
                .KeepAlive()
                .CreateFactory();
        }

        private bool UseGoogleBooks
        {
            get { return string.Equals(_configService.MetadataProvider, "googlebooks", StringComparison.OrdinalIgnoreCase); }
        }

        private string GetUiLanguageCode()
        {
            var isoLanguage = IsoLanguages.Get((Language)_configService.UILanguage) ?? IsoLanguages.Get(Language.English);
            return isoLanguage?.TwoLetterCode;
        }

        public HashSet<string> GetChangedAuthors(DateTime startTime)
        {
            return null;
        }

        public Author GetAuthorInfo(string foreignAuthorId, bool useCache = false)
        {
            _logger.Debug("Getting author details for {0}", foreignAuthorId);

            try
            {
                if (UseGoogleBooks && TryParseGoogleAuthorId(foreignAuthorId, out var authorName))
                {
                    return GetGoogleAuthorInfo(authorName);
                }

                return GetOpenLibraryAuthorInfo(foreignAuthorId);
            }
            catch (BookInfoException e)
            {
                _logger.Warn(e, "Unexpected error getting author info: {foreignAuthorId}", foreignAuthorId);
                throw;
            }
        }

        public HashSet<string> GetChangedBooks(DateTime startTime)
        {
            return _cache.Get("ChangedBooks", () => GetChangedBooksUncached(startTime), TimeSpan.FromMinutes(30));
        }

        private HashSet<string> GetChangedBooksUncached(DateTime startTime)
        {
            return null;
        }

        public Tuple<string, Book, List<AuthorMetadata>> GetBookInfo(string foreignBookId)
        {
            try
            {
                if (UseGoogleBooks && TryParseGoogleBookId(foreignBookId, out var volumeId))
                {
                    return GetGoogleBookInfo(volumeId);
                }

                return GetOpenLibraryBookInfo(foreignBookId);
            }
            catch (BookInfoException e)
            {
                _logger.Warn(e, "Unexpected error getting book info: {foreignBookId}", foreignBookId);
                throw;
            }
        }

        public List<object> SearchForNewEntity(string title)
        {
            var books = SearchForNewBook(title, null, false);

            var result = new List<object>();
            foreach (var book in books)
            {
                var author = book.Author.Value;

                if (!result.Contains(author))
                {
                    result.Add(author);
                }

                result.Add(book);
            }

            return result;
        }

        public List<Author> SearchForNewAuthor(string title)
        {
            if (UseGoogleBooks)
            {
                var query = title?.Trim();
                if (query.IsNullOrWhiteSpace())
                {
                    return new List<Author>();
                }

                try
                {
                    var googleBooks = SearchGoogleBooks($"inauthor:{query}");

                    return googleBooks
                        .Select(x => x.Author.Value)
                        .DistinctBy(x => x.ForeignAuthorId)
                        .ToList();
                }
                catch (NzbDroneClientException ex) when (IsGoogleBooksQuotaStatus(ex.StatusCode))
                {
                    _logger.Warn(ex, "Google Books quota exceeded, falling back to backup metadata provider for author search.");
                }
            }

            var openLibraryAuthors = SearchOpenLibraryAuthors(title);
            if (openLibraryAuthors.Any())
            {
                return openLibraryAuthors;
            }

            var books = SearchForNewBookFallback(title, null, true);

            return books
                .Select(x => x.Author.Value)
                .DistinctBy(x => x.ForeignAuthorId)
                .ToList();
        }

        public List<Book> SearchForNewBook(string title, string author, bool getAllEditions = true)
        {
            if (UseGoogleBooks)
            {
                var query = title?.Trim() ?? string.Empty;
                if (query.IsNullOrWhiteSpace())
                {
                    return new List<Book>();
                }

                if (author.IsNotNullOrWhiteSpace())
                {
                    query = $"{query} inauthor:{author.Trim()}";
                }

                try
                {
                    return SearchGoogleBooks(query);
                }
                catch (NzbDroneClientException ex) when (IsGoogleBooksQuotaStatus(ex.StatusCode))
                {
                    _logger.Warn(ex, "Google Books quota exceeded, falling back to backup metadata provider for book search.");
                    return SearchForNewBookFallback(title, author, getAllEditions);
                }
            }

            return SearchForNewBookFallback(title, author, getAllEditions);
        }

        private List<Book> SearchForNewBookFallback(string title, string author, bool getAllEditions)
        {
            if (title.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            var trimmed = title.Trim();
            var lowerTitle = trimmed.ToLowerInvariant();

            var split = lowerTitle.Split(':');
            if (split.Length == 2)
            {
                var prefix = split[0].Trim();
                var slug = split[1].Trim();

                if (slug.IsNullOrWhiteSpace())
                {
                    return new List<Book>();
                }

                if (prefix == "isbn")
                {
                    return SearchOpenLibraryByIsbn(slug);
                }

                if (prefix == "asin")
                {
                    return SearchOpenLibraryByAsin(slug);
                }

                if (prefix == "work")
                {
                    return SearchOpenLibraryByWorkId(slug);
                }

                if (prefix == "edition")
                {
                    return SearchOpenLibraryByEditionId(slug);
                }

                if (prefix == "author")
                {
                    return SearchOpenLibraryByAuthorId(slug);
                }
            }

            if (TryParseOpenLibraryWorkId(trimmed, out var workId))
            {
                return SearchOpenLibraryByWorkId(workId);
            }

            if (TryParseOpenLibraryAuthorId(trimmed, out var authorId))
            {
                return SearchOpenLibraryByAuthorId(authorId);
            }

            return SearchOpenLibrary(trimmed, author, getAllEditions);
        }

        public List<Book> SearchByIsbn(string isbn)
        {
            if (UseGoogleBooks)
            {
                try
                {
                    return SearchGoogleBooks($"isbn:{isbn}");
                }
                catch (NzbDroneClientException ex) when (IsGoogleBooksQuotaStatus(ex.StatusCode))
                {
                    _logger.Warn(ex, "Google Books quota exceeded, falling back to backup metadata provider for ISBN search.");
                }
            }

            return SearchOpenLibraryByIsbn(isbn);
        }

        public List<Book> SearchByAsin(string asin)
        {
            if (UseGoogleBooks)
            {
                try
                {
                    return SearchGoogleBooks(asin);
                }
                catch (NzbDroneClientException ex) when (IsGoogleBooksQuotaStatus(ex.StatusCode))
                {
                    _logger.Warn(ex, "Google Books quota exceeded, falling back to backup metadata provider for ASIN search.");
                }
            }

            return SearchOpenLibraryByAsin(asin);
        }

        private List<Book> SearchOpenLibrary(string title, string author, bool getAllEditions)
        {
            if (title.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            var queryParams = new Dictionary<string, string>
            {
                { "limit", "20" }
            };

            if (author.IsNotNullOrWhiteSpace())
            {
                queryParams["title"] = title;
                queryParams["author"] = author;
            }
            else
            {
                queryParams["q"] = title;
            }

            var docs = GetOpenLibrarySearchDocs(queryParams);
            return MapOpenLibrarySearchDocs(docs);
        }

        private List<Book> SearchOpenLibraryByIsbn(string isbn)
        {
            if (isbn.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            var normalized = NormalizeOpenLibraryIsbn(isbn);
            if (normalized.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            var docs = GetOpenLibrarySearchDocs(new Dictionary<string, string>
            {
                { "isbn", normalized },
                { "limit", "10" }
            });

            return MapOpenLibrarySearchDocs(docs);
        }

        private List<Book> SearchOpenLibraryByAsin(string asin)
        {
            if (asin.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            return SearchOpenLibrary(asin, null, true);
        }

        private List<Book> SearchOpenLibraryByWorkId(string workId)
        {
            try
            {
                var tuple = GetOpenLibraryBookInfo(BuildOpenLibraryWorkId(workId));
                return new List<Book> { tuple.Item2 };
            }
            catch (BookNotFoundException)
            {
                return new List<Book>();
            }
            catch (BookInfoException ex)
            {
                _logger.Warn(ex, "Error searching by Open Library work id");
                return new List<Book>();
            }
        }

        private List<Book> SearchOpenLibraryByEditionId(string editionId)
        {
            try
            {
                var tuple = GetOpenLibraryBookInfoFromEdition(editionId);
                if (tuple == null)
                {
                    return new List<Book>();
                }

                return new List<Book> { tuple.Item2 };
            }
            catch (BookNotFoundException)
            {
                return new List<Book>();
            }
            catch (BookInfoException ex)
            {
                _logger.Warn(ex, "Error searching by Open Library edition id");
                return new List<Book>();
            }
        }

        private List<Book> SearchOpenLibraryByAuthorId(string authorId)
        {
            try
            {
                var normalizedAuthorId = BuildOpenLibraryAuthorId(authorId, null) ?? authorId;
                var author = GetOpenLibraryAuthorInfo(normalizedAuthorId);
                return author?.Books?.Value ?? new List<Book>();
            }
            catch (AuthorNotFoundException)
            {
                return new List<Book>();
            }
            catch (BookInfoException ex)
            {
                _logger.Warn(ex, "Error searching by Open Library author id");
                return new List<Book>();
            }
        }

        private JArray GetOpenLibrarySearchDocs(Dictionary<string, string> queryParams)
        {
            var builder = new HttpRequestBuilder("https://openlibrary.org/search.json");

            foreach (var queryParam in queryParams)
            {
                builder.AddQueryParam(queryParam.Key, queryParam.Value);
            }

            var request = builder.Build();
            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _cachedHttpClient.Get(request, false, TimeSpan.FromHours(2));
            if (response.HasHttpError)
            {
                _logger.Warn("Open Library search returned {0} for query {1}", response.StatusCode, queryParams.ConcatToString());
                return new JArray();
            }

            var json = JObject.Parse(response.Content);
            return json["docs"] as JArray ?? new JArray();
        }

        private List<Book> MapOpenLibrarySearchDocs(JArray docs)
        {
            if (docs == null || docs.Count == 0)
            {
                return new List<Book>();
            }

            return docs
                .Select(MapOpenLibrarySearchDoc)
                .Where(x => x != null)
                .DistinctBy(x => x.ForeignBookId)
                .ToList();
        }

        private Book MapOpenLibrarySearchDoc(JToken doc)
        {
            var workKey = NormalizeOpenLibraryWorkKey(doc?["key"]?.ToString());
            if (workKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            var title = doc["title"]?.ToString() ?? doc["title_suggest"]?.ToString();
            if (title.IsNullOrWhiteSpace())
            {
                return null;
            }

            var authorName = doc["author_name"]?.FirstOrDefault()?.ToString();
            if (authorName.IsNullOrWhiteSpace())
            {
                authorName = "Unknown Author";
            }

            var authorKey = NormalizeOpenLibraryAuthorKey(doc["author_key"]?.FirstOrDefault()?.ToString());
            var authorMetadata = BuildOpenLibraryAuthorMetadataFromSearch(authorName, authorKey);

            var bookId = BuildOpenLibraryWorkId(workKey);
            var isbn = GetOpenLibrarySearchIsbn(doc["isbn"]);
            var edition = new Edition
            {
                ForeignEditionId = bookId,
                TitleSlug = bookId,
                Title = title,
                ReleaseDate = ParseOpenLibrarySearchPublishedDate(doc),
                PageCount = ParseOpenLibraryPageCount(doc["number_of_pages_median"]) ?? 0,
                Publisher = GetOpenLibraryPublisher(doc["publisher"]),
                Language = ParseOpenLibrarySearchLanguage(doc["language"]),
                Isbn13 = isbn,
                Ratings = new Ratings { Votes = 0, Value = 0 }
            };

            var coverId = doc["cover_i"]?.ToObject<int?>();
            if (coverId.HasValue)
            {
                edition.Images.Add(new MediaCover.MediaCover
                {
                    Url = $"https://covers.openlibrary.org/b/id/{coverId.Value}-L.jpg",
                    CoverType = MediaCoverTypes.Cover
                });
            }
            else if (isbn.IsNotNullOrWhiteSpace())
            {
                edition.Images.Add(new MediaCover.MediaCover
                {
                    Url = $"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg",
                    CoverType = MediaCoverTypes.Cover
                });
            }

            var editionKey = NormalizeOpenLibraryEditionKey(doc["edition_key"]?.FirstOrDefault()?.ToString());
            AddOpenLibraryLink(edition.Links, editionKey ?? workKey);

            edition.Monitored = true;

            var book = new Book
            {
                ForeignBookId = bookId,
                Title = title,
                TitleSlug = bookId,
                CleanTitle = Parser.Parser.CleanAuthorName(title),
                ReleaseDate = edition.ReleaseDate,
                Genres = NormalizeOpenLibrarySubjects(ParseOpenLibraryStringList(doc["subject"])),
                AnyEditionOk = true,
                Editions = new List<Edition> { edition },
                Author = new Author
                {
                    Metadata = authorMetadata,
                    CleanName = Parser.Parser.CleanAuthorName(authorName)
                },
                AuthorMetadata = authorMetadata
            };

            AddOpenLibraryLink(book.Links, workKey);

            return book;
        }

        private static string GetOpenLibrarySearchIsbn(JToken isbnToken)
        {
            if (isbnToken is JValue isbnValue)
            {
                return isbnValue.ToString();
            }

            if (isbnToken is not JArray isbns)
            {
                return null;
            }

            var isbn13 = isbns.Select(x => x.ToString()).FirstOrDefault(x => x.Length == 13);
            if (isbn13.IsNotNullOrWhiteSpace())
            {
                return isbn13;
            }

            return isbns.Select(x => x.ToString()).FirstOrDefault(x => x.Length == 10);
        }

        private static string ParseOpenLibrarySearchLanguage(JToken languageToken)
        {
            if (languageToken is not JArray languages)
            {
                return null;
            }

            return languages.Select(x => x.ToString()).FirstOrDefault();
        }

        private static DateTime? ParseOpenLibrarySearchPublishedDate(JToken doc)
        {
            var yearToken = doc?["first_publish_year"];
            if (yearToken != null && int.TryParse(yearToken.ToString(), out var year))
            {
                return TryBuildOpenLibraryDate(year);
            }

            if (doc?["publish_year"] is JArray years)
            {
                foreach (var yearValue in years.Select(x => x.ToString()))
                {
                    if (!int.TryParse(yearValue, out year))
                    {
                        continue;
                    }

                    var date = TryBuildOpenLibraryDate(year);
                    if (date.HasValue)
                    {
                        return date;
                    }
                }
            }

            return null;
        }

        private static DateTime? TryBuildOpenLibraryDate(int year)
        {
            if (year < 1 || year > 9999)
            {
                return null;
            }

            return new DateTime(year, 1, 1);
        }

        private List<Book> SearchGoogleBooks(string query, int maxResults = 20, int startIndex = 0)
        {
            HttpResponse<GoogleBooksVolumeResponse> response;

            try
            {
                var queryParams = new Dictionary<string, string>
                {
                    { "q", query },
                    { "maxResults", maxResults.ToString() }
                };

                if (startIndex > 0)
                {
                    queryParams["startIndex"] = startIndex.ToString();
                }

                var request = BuildGoogleBooksRequest("volumes", queryParams);

                request.SuppressHttpError = true;

                response = _httpClient.Get<GoogleBooksVolumeResponse>(request);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Error searching Google Books for {0}", query);
                return new List<Book>();
            }

            if (response.HasHttpError)
            {
                if (IsGoogleBooksQuotaError(response))
                {
                    throw new NzbDroneClientException(response.StatusCode,
                        "Google Books free tier quota exceeded. Please try again later.");
                }

                _logger.Warn("Google Books returned {0} for query {1}", response.StatusCode, query);
                return new List<Book>();
            }

            if (response.Resource?.Items == null)
            {
                return new List<Book>();
            }

            return response.Resource.Items
                .Select(MapGoogleVolume)
                .Where(x => x != null)
                .ToList();
        }

        private List<Book> SearchGoogleBooksPaged(string query, int maxResults)
        {
            var all = new List<Book>();
            var startIndex = 0;

            while (startIndex < maxResults)
            {
                var pageSize = Math.Min(GoogleBooksMaxResultsPerRequest, maxResults - startIndex);
                var page = SearchGoogleBooks(query, pageSize, startIndex);

                if (!page.Any())
                {
                    break;
                }

                all.AddRange(page);

                if (page.Count < pageSize)
                {
                    break;
                }

                startIndex += pageSize;
            }

            return all
                .DistinctBy(x => x.ForeignBookId)
                .ToList();
        }

        private Tuple<string, Book, List<AuthorMetadata>> GetGoogleBookInfo(string volumeId)
        {
            var volume = GetGoogleVolume(volumeId);
            if (volume == null)
            {
                throw new BookNotFoundException(volumeId);
            }

            var book = MapGoogleVolume(volume);
            if (book?.AuthorMetadata?.Value == null)
            {
                throw new BookNotFoundException(volumeId);
            }

            var authorMetadata = book.AuthorMetadata.Value;
            TryEnrichGoogleBookFromOpenLibrary(book, GetOpenLibraryIsbn(volume.VolumeInfo?.IndustryIdentifiers));
            return Tuple.Create(authorMetadata.ForeignAuthorId, book, new List<AuthorMetadata> { authorMetadata });
        }

        private Author GetGoogleAuthorInfo(string authorName)
        {
            var authorId = BuildGoogleAuthorId(authorName);
            var metadata = BuildGoogleAuthorMetadata(authorId, authorName);
            TryAddExternalAuthorImage(metadata);
            var books = SearchGoogleBooksAuthor(authorName);

            var author = new Author
            {
                Metadata = metadata,
                CleanName = Parser.Parser.CleanAuthorName(authorName),
                Books = books,
                Series = new List<Series>()
            };

            foreach (var book in books)
            {
                book.Author = author;
                book.AuthorMetadata = metadata;
            }

            TryEnrichGoogleAuthorBooksFromOpenLibrary(author);

            return author;
        }

        private Tuple<string, Book, List<AuthorMetadata>> GetOpenLibraryBookInfo(string foreignBookId)
        {
            if (!TryParseOpenLibraryWorkId(foreignBookId, out var workId))
            {
                throw new BookNotFoundException(foreignBookId);
            }

            var workKey = NormalizeOpenLibraryWorkKey(workId);
            if (workKey.IsNullOrWhiteSpace())
            {
                throw new BookNotFoundException(foreignBookId);
            }

            var workJson = GetOpenLibraryJson($"https://openlibrary.org{workKey}.json", TimeSpan.FromHours(12));
            if (workJson == null)
            {
                throw new BookNotFoundException(foreignBookId);
            }

            var title = workJson["title"]?.ToString();
            if (title.IsNullOrWhiteSpace())
            {
                title = "Unknown Title";
            }

            var authorKey = NormalizeOpenLibraryAuthorKey(workJson["authors"]?.FirstOrDefault()?["author"]?["key"]?.ToString());
            var authorMetadata = BuildOpenLibraryAuthorMetadata(authorKey, null);

            if (authorMetadata == null)
            {
                authorMetadata = BuildOpenLibraryAuthorMetadataFromSearch("Unknown Author", null);
            }

            var bookId = BuildOpenLibraryWorkId(workKey);
            var edition = new Edition
            {
                ForeignEditionId = bookId,
                TitleSlug = bookId,
                Title = title,
                Overview = GetOpenLibraryDescription(workJson["description"]) ?? string.Empty,
                ReleaseDate = ParseOpenLibraryPublishedDate(workJson["first_publish_date"]?.ToString()),
                Ratings = new Ratings { Votes = 0, Value = 0 }
            };

            var book = new Book
            {
                ForeignBookId = bookId,
                Title = title,
                TitleSlug = bookId,
                CleanTitle = Parser.Parser.CleanAuthorName(title),
                ReleaseDate = edition.ReleaseDate,
                Genres = NormalizeOpenLibrarySubjects(ParseOpenLibraryStringList(workJson["subjects"])),
                AnyEditionOk = true,
                Editions = new List<Edition> { edition },
                Author = new Author
                {
                    Metadata = authorMetadata,
                    CleanName = Parser.Parser.CleanAuthorName(authorMetadata.Name)
                },
                AuthorMetadata = authorMetadata
            };

            var data = new OpenLibraryBookData
            {
                WorkKey = workKey,
                WorkTitle = title,
                Description = GetOpenLibraryDescription(workJson["description"]),
                FirstPublishDate = ParseOpenLibraryPublishedDate(workJson["first_publish_date"]?.ToString()),
                Subjects = NormalizeOpenLibrarySubjects(ParseOpenLibraryStringList(workJson["subjects"])),
                Series = NormalizeOpenLibrarySeries(ParseOpenLibrarySeriesList(workJson["series"])),
                WorkCoverIds = ParseOpenLibraryCoverIds(workJson["covers"])
            };

            var editionJson = GetOpenLibraryEditionForWork(workId);
            if (editionJson != null)
            {
                ApplyOpenLibraryEditionData(edition, data, editionJson);
            }

            ApplyOpenLibraryMetadata(book, edition, data);
            edition.Monitored = true;

            var seriesById = new Dictionary<string, Series>(StringComparer.OrdinalIgnoreCase);
            ApplyOpenLibrarySeries(book, book.Author.Value, data, seriesById);
            if (seriesById.Any())
            {
                book.Author.Value.Series = seriesById.Values.ToList();
            }

            return Tuple.Create(authorMetadata.ForeignAuthorId, book, new List<AuthorMetadata> { authorMetadata });
        }

        private Tuple<string, Book, List<AuthorMetadata>> GetOpenLibraryBookInfoFromEdition(string editionId)
        {
            var editionKey = NormalizeOpenLibraryEditionKey(editionId);
            if (editionKey.IsNullOrWhiteSpace())
            {
                throw new BookNotFoundException(editionId);
            }

            var editionJson = GetOpenLibraryJson($"https://openlibrary.org{editionKey}.json", TimeSpan.FromHours(12));
            if (editionJson == null)
            {
                throw new BookNotFoundException(editionId);
            }

            var workKey = NormalizeOpenLibraryWorkKey(editionJson["works"]?.FirstOrDefault()?["key"]?.ToString());
            if (workKey.IsNullOrWhiteSpace())
            {
                throw new BookNotFoundException(editionId);
            }

            var tuple = GetOpenLibraryBookInfo(BuildOpenLibraryWorkId(workKey));
            var edition = GetPrimaryEdition(tuple.Item2);
            if (edition != null)
            {
                var data = new OpenLibraryBookData
                {
                    WorkKey = workKey,
                    WorkTitle = tuple.Item2.Title
                };

                ApplyOpenLibraryEditionData(edition, data, editionJson);
            }

            return tuple;
        }

        private Author GetOpenLibraryAuthorInfo(string foreignAuthorId)
        {
            var authorKey = NormalizeOpenLibraryAuthorKey(foreignAuthorId);
            if (authorKey.IsNullOrWhiteSpace())
            {
                if (!TryParseOpenLibraryAuthorId(foreignAuthorId, out var authorId) || !TryBase64UrlDecode(authorId, out var decodedName))
                {
                    throw new AuthorNotFoundException(foreignAuthorId);
                }

                var nameSearch = SearchOpenLibraryAuthors(decodedName);
                var match = nameSearch.FirstOrDefault();
                if (match?.Metadata?.Value?.ForeignAuthorId.IsNotNullOrWhiteSpace() == true &&
                    !match.Metadata.Value.ForeignAuthorId.Equals(foreignAuthorId, StringComparison.OrdinalIgnoreCase))
                {
                    return GetOpenLibraryAuthorInfo(match.Metadata.Value.ForeignAuthorId);
                }

                return match ?? new Author
                {
                    Metadata = BuildOpenLibraryAuthorMetadataFromSearch(decodedName, null),
                    CleanName = Parser.Parser.CleanAuthorName(decodedName),
                    Books = new List<Book>(),
                    Series = new List<Series>()
                };
            }

            var authorJson = GetOpenLibraryJson($"https://openlibrary.org{authorKey}.json", TimeSpan.FromHours(12));
            if (authorJson == null)
            {
                throw new AuthorNotFoundException(foreignAuthorId);
            }

            var name = authorJson["name"]?.ToString() ?? "Unknown Author";
            var metadata = BuildOpenLibraryAuthorMetadata(authorKey, name, authorJson);
            var books = SearchOpenLibraryWorksByAuthor(authorKey, metadata);

            var author = new Author
            {
                Metadata = metadata,
                CleanName = Parser.Parser.CleanAuthorName(metadata.Name),
                Books = books,
                Series = new List<Series>()
            };

            foreach (var book in books)
            {
                book.Author = author;
                book.AuthorMetadata = metadata;
            }

            return author;
        }

        private List<Author> SearchOpenLibraryAuthors(string authorName)
        {
            if (authorName.IsNullOrWhiteSpace())
            {
                return new List<Author>();
            }

            var request = new HttpRequestBuilder("https://openlibrary.org/search/authors.json")
                .AddQueryParam("q", authorName)
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _cachedHttpClient.Get(request, false, TimeSpan.FromHours(2));
            if (response.HasHttpError)
            {
                return new List<Author>();
            }

            var json = JObject.Parse(response.Content);
            var docs = json["docs"] as JArray ?? new JArray();

            return docs.Select(doc =>
                {
                    var name = doc["name"]?.ToString();
                    if (name.IsNullOrWhiteSpace())
                    {
                        return null;
                    }

                    var authorKey = NormalizeOpenLibraryAuthorKey(doc["key"]?.ToString());
                    var metadata = BuildOpenLibraryAuthorMetadataFromSearch(name, authorKey);
                    var photoToken = doc["photo_id"] ?? doc["photos"]?.FirstOrDefault();
                    var photoId = photoToken?.ToString();
                    if (photoId.IsNotNullOrWhiteSpace())
                    {
                        metadata.Images.RemoveAll(x => x.CoverType == MediaCoverTypes.Poster);
                        metadata.Images.Add(new MediaCover.MediaCover
                        {
                            Url = $"https://covers.openlibrary.org/a/id/{photoId}-L.jpg",
                            CoverType = MediaCoverTypes.Poster
                        });
                    }

                    return new Author
                    {
                        Metadata = metadata,
                        CleanName = Parser.Parser.CleanAuthorName(metadata.Name),
                        Books = new List<Book>(),
                        Series = new List<Series>()
                    };
                })
                .Where(x => x != null)
                .DistinctBy(x => x.Metadata.Value.ForeignAuthorId)
                .ToList();
        }

        private AuthorMetadata BuildOpenLibraryAuthorMetadata(string authorKey, string fallbackName, JObject authorJson = null)
        {
            var normalizedKey = NormalizeOpenLibraryAuthorKey(authorKey);
            var name = fallbackName;
            string overview = null;
            string imageUrl = null;
            var links = new List<Links>();

            if (normalizedKey.IsNotNullOrWhiteSpace())
            {
                if (authorJson == null)
                {
                    authorJson = GetOpenLibraryJson($"https://openlibrary.org{normalizedKey}.json", TimeSpan.FromHours(12));
                }

                if (authorJson != null)
                {
                    name = authorJson["name"]?.ToString() ?? name;
                    overview = ParseOpenLibraryAuthorOverview(authorJson["bio"]);
                    var photoToken = authorJson["photo_id"] ?? authorJson["photos"]?.FirstOrDefault();
                    var photoId = photoToken?.ToString();
                    imageUrl = photoId.IsNullOrWhiteSpace() ? null : $"https://covers.openlibrary.org/a/id/{photoId}-L.jpg";
                }

                links.Add(new Links { Name = "Open Library", Url = $"https://openlibrary.org{normalizedKey}" });
            }

            if (name.IsNullOrWhiteSpace())
            {
                name = "Unknown Author";
            }

            var authorId = BuildOpenLibraryAuthorId(normalizedKey, name);
            var metadata = new AuthorMetadata
            {
                ForeignAuthorId = authorId,
                TitleSlug = authorId,
                Name = name.CleanSpaces(),
                Overview = overview,
                Ratings = new Ratings { Votes = 0, Value = 0 },
                Status = AuthorStatusType.Continuing
            };

            metadata.SortName = metadata.Name.ToLowerInvariant();
            metadata.NameLastFirst = metadata.Name.ToLastFirst();
            metadata.SortNameLastFirst = metadata.NameLastFirst.ToLowerInvariant();

            if (imageUrl.IsNotNullOrWhiteSpace())
            {
                metadata.Images.Add(new MediaCover.MediaCover
                {
                    Url = imageUrl,
                    CoverType = MediaCoverTypes.Poster
                });
            }

            if (links.Any())
            {
                metadata.Links.AddRange(links);
            }

            TryAddExternalAuthorImage(metadata);

            return metadata;
        }

        private AuthorMetadata BuildOpenLibraryAuthorMetadataFromSearch(string authorName, string authorKey)
        {
            if (authorName.IsNullOrWhiteSpace())
            {
                authorName = "Unknown Author";
            }

            var normalizedKey = NormalizeOpenLibraryAuthorKey(authorKey);
            var authorId = BuildOpenLibraryAuthorId(normalizedKey, authorName);
            var metadata = new AuthorMetadata
            {
                ForeignAuthorId = authorId,
                TitleSlug = authorId,
                Name = authorName.CleanSpaces(),
                Ratings = new Ratings { Votes = 0, Value = 0 },
                Status = AuthorStatusType.Continuing
            };

            metadata.SortName = metadata.Name.ToLowerInvariant();
            metadata.NameLastFirst = metadata.Name.ToLastFirst();
            metadata.SortNameLastFirst = metadata.NameLastFirst.ToLowerInvariant();

            if (normalizedKey.IsNotNullOrWhiteSpace())
            {
                metadata.Links.Add(new Links { Name = "Open Library", Url = $"https://openlibrary.org{normalizedKey}" });
            }

            if (normalizedKey.IsNotNullOrWhiteSpace() && !metadata.Images.Any(x => x.CoverType == MediaCoverTypes.Poster))
            {
                var authorOlid = GetOpenLibraryAuthorOlid(normalizedKey);
                if (authorOlid.IsNotNullOrWhiteSpace())
                {
                    metadata.Images.Add(new MediaCover.MediaCover
                    {
                        Url = $"https://covers.openlibrary.org/a/olid/{authorOlid}-L.jpg",
                        CoverType = MediaCoverTypes.Poster
                    });
                }
            }

            return metadata;
        }

        private static string GetOpenLibraryAuthorOlid(string authorKey)
        {
            if (authorKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            var trimmed = authorKey.Trim('/');
            if (trimmed.IsNullOrWhiteSpace())
            {
                return null;
            }

            var parts = trimmed.Split('/');
            return parts.LastOrDefault();
        }

        private List<Book> SearchOpenLibraryWorksByAuthor(string authorKey, AuthorMetadata authorMetadata)
        {
            var normalizedKey = NormalizeOpenLibraryAuthorKey(authorKey);
            if (normalizedKey.IsNullOrWhiteSpace())
            {
                return new List<Book>();
            }

            var request = new HttpRequestBuilder($"https://openlibrary.org{normalizedKey}/works.json")
                .AddQueryParam("limit", "50")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _cachedHttpClient.Get(request, false, TimeSpan.FromHours(6));
            if (response.HasHttpError)
            {
                return new List<Book>();
            }

            var json = JObject.Parse(response.Content);
            var entries = json["entries"] as JArray ?? new JArray();

            return entries
                .Select(entry => MapOpenLibraryWorkEntry(entry, authorMetadata))
                .Where(book => book != null)
                .DistinctBy(book => book.ForeignBookId)
                .ToList();
        }

        private Book MapOpenLibraryWorkEntry(JToken entry, AuthorMetadata authorMetadata)
        {
            var workKey = NormalizeOpenLibraryWorkKey(entry?["key"]?.ToString());
            if (workKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            var title = entry["title"]?.ToString();
            if (title.IsNullOrWhiteSpace())
            {
                return null;
            }

            var bookId = BuildOpenLibraryWorkId(workKey);
            var edition = new Edition
            {
                ForeignEditionId = bookId,
                TitleSlug = bookId,
                Title = title,
                Overview = GetOpenLibraryDescription(entry["description"]) ?? string.Empty,
                ReleaseDate = ParseOpenLibraryPublishedDate(entry["first_publish_date"]?.ToString()),
                Ratings = new Ratings { Votes = 0, Value = 0 }
            };

            if (entry["covers"] is JArray covers)
            {
                var coverIds = ParseOpenLibraryCoverIds(covers);
                foreach (var image in coverIds.Select(id => new MediaCover.MediaCover
                         {
                             Url = $"https://covers.openlibrary.org/b/id/{id}-L.jpg",
                             CoverType = MediaCoverTypes.Cover
                         }))
                {
                    edition.Images.Add(image);
                }
            }

            AddOpenLibraryLink(edition.Links, workKey);
            edition.Monitored = true;

            var book = new Book
            {
                ForeignBookId = bookId,
                Title = title,
                TitleSlug = bookId,
                CleanTitle = Parser.Parser.CleanAuthorName(title),
                ReleaseDate = edition.ReleaseDate,
                Genres = NormalizeOpenLibrarySubjects(ParseOpenLibraryStringList(entry["subjects"])),
                AnyEditionOk = true,
                Editions = new List<Edition> { edition },
                Author = new Author
                {
                    Metadata = authorMetadata,
                    CleanName = Parser.Parser.CleanAuthorName(authorMetadata.Name)
                },
                AuthorMetadata = authorMetadata
            };

            AddOpenLibraryLink(book.Links, workKey);

            return book;
        }

        private JObject GetOpenLibraryEditionForWork(string workId)
        {
            if (workId.IsNullOrWhiteSpace())
            {
                return null;
            }

            var request = new HttpRequestBuilder($"https://openlibrary.org/works/{workId}/editions.json")
                .AddQueryParam("limit", "1")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return null;
            }

            var json = JObject.Parse(response.Content);
            return json["entries"]?.FirstOrDefault() as JObject;
        }

        private void ApplyOpenLibraryEditionData(Edition edition, OpenLibraryBookData data, JObject editionJson)
        {
            if (edition == null || data == null || editionJson == null)
            {
                return;
            }

            data.EditionKey = NormalizeOpenLibraryEditionKey(editionJson["key"]?.ToString());
            data.EditionTitle = editionJson["title"]?.ToString();
            data.PublishDate = ParseOpenLibraryPublishedDate(editionJson["publish_date"]?.ToString());
            data.Publisher = GetOpenLibraryPublisher(editionJson["publishers"]);
            data.PageCount = ParseOpenLibraryPageCount(editionJson["number_of_pages"]);
            data.Language = ParseOpenLibraryLanguage(editionJson["languages"]);
            data.EditionCoverIds = ParseOpenLibraryCoverIds(editionJson["covers"]);

            var isbn13 = GetOpenLibrarySearchIsbn(editionJson["isbn_13"]);
            var isbn10 = GetOpenLibrarySearchIsbn(editionJson["isbn_10"]);
            edition.Isbn13 ??= isbn13 ?? isbn10;

            if (edition.Title.IsNullOrWhiteSpace() && data.EditionTitle.IsNotNullOrWhiteSpace())
            {
                edition.Title = data.EditionTitle;
            }

            if (data.EditionKey.IsNotNullOrWhiteSpace())
            {
                AddOpenLibraryLink(edition.Links, data.EditionKey);
            }
        }

        private JObject GetOpenLibraryJson(string url, TimeSpan? ttl)
        {
            var request = new HttpRequestBuilder(url)
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var cacheTtl = ttl ?? TimeSpan.FromHours(12);
            var response = _cachedHttpClient.Get(request, false, cacheTtl);
            if (response.HasHttpError)
            {
                return null;
            }

            return JObject.Parse(response.Content);
        }

        private void TryEnrichGoogleBookFromOpenLibrary(Book book, string isbnOverride = null)
        {
            if (book?.Editions?.Value == null || !book.Editions.Value.Any())
            {
                return;
            }

            var edition = GetPrimaryEdition(book);
            if (edition == null)
            {
                return;
            }

            var isbn = isbnOverride.IsNotNullOrWhiteSpace() ? isbnOverride : edition.Isbn13;
            var data = GetOpenLibraryBookData(isbn);
            if (data == null)
            {
                return;
            }

            ApplyOpenLibraryMetadata(book, edition, data);
        }

        private void TryEnrichGoogleAuthorBooksFromOpenLibrary(Author author)
        {
            var books = author?.Books?.Value;
            if (books == null || !books.Any())
            {
                return;
            }

            var seriesById = new Dictionary<string, Series>(StringComparer.OrdinalIgnoreCase);
            if (author.Series?.Value != null)
            {
                foreach (var series in author.Series.Value)
                {
                    if (series?.ForeignSeriesId.IsNullOrWhiteSpace() == false)
                    {
                        seriesById[series.ForeignSeriesId] = series;
                    }
                }
            }

            foreach (var book in books)
            {
                var edition = GetPrimaryEdition(book);
                if (edition == null)
                {
                    continue;
                }

                var data = GetOpenLibraryBookData(edition.Isbn13);
                if (data == null)
                {
                    continue;
                }

                ApplyOpenLibraryMetadata(book, edition, data);
                ApplyOpenLibrarySeries(book, author, data, seriesById);
            }

            if (seriesById.Any())
            {
                author.Series = seriesById.Values.ToList();
            }
        }

        private GoogleBooksVolume GetGoogleVolume(string volumeId)
        {
            HttpResponse<GoogleBooksVolume> response;

            try
            {
                var request = BuildGoogleBooksRequest($"volumes/{volumeId}", null);
                request.SuppressHttpError = true;

                response = _httpClient.Get<GoogleBooksVolume>(request);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Error fetching Google Books volume {0}", volumeId);
                return null;
            }

            if (response.HasHttpError)
            {
                if (IsGoogleBooksQuotaError(response))
                {
                    throw new NzbDroneClientException(response.StatusCode,
                        "Google Books free tier quota exceeded. Please try again later.");
                }

                return null;
            }

            return response.Resource;
        }

        private Book MapGoogleVolume(GoogleBooksVolume volume)
        {
            if (volume?.VolumeInfo == null || volume.Id.IsNullOrWhiteSpace())
            {
                return null;
            }

            var volumeInfo = volume.VolumeInfo;

            var title = volumeInfo.Title;
            if (title.IsNullOrWhiteSpace())
            {
                title = volumeInfo.Subtitle;
            }

            if (title.IsNullOrWhiteSpace())
            {
                title = "Unknown Title";
            }

            var authorName = volumeInfo.Authors?.FirstOrDefault();
            if (authorName.IsNullOrWhiteSpace())
            {
                authorName = "Unknown Author";
            }

            var authorId = BuildGoogleAuthorId(authorName);
            var authorMetadata = BuildGoogleAuthorMetadata(authorId, authorName);
            TryAddExternalAuthorImage(authorMetadata);
            var bookId = BuildGoogleBookId(volume.Id);

            var edition = new Edition
            {
                ForeignEditionId = bookId,
                TitleSlug = bookId,
                Title = title,
                Language = volumeInfo.Language,
                Overview = volumeInfo.Description ?? string.Empty,
                Format = volumeInfo.PrintType,
                IsEbook = volume.SaleInfo?.IsEbook ?? false,
                Publisher = volumeInfo.Publisher,
                PageCount = volumeInfo.PageCount ?? 0,
                ReleaseDate = ParseGooglePublishedDate(volumeInfo.PublishedDate),
                Isbn13 = GetIndustryIdentifier(volumeInfo.IndustryIdentifiers, "ISBN_13"),
                Asin = GetIndustryIdentifier(volumeInfo.IndustryIdentifiers, "ASIN"),
                Ratings = new Ratings
                {
                    Votes = volumeInfo.RatingsCount ?? 0,
                    Value = volumeInfo.AverageRating ?? 0
                }
            };

            foreach (var image in BuildGoogleImages(volumeInfo.ImageLinks))
            {
                edition.Images.Add(image);
            }

            var link = volumeInfo.InfoLink ?? volumeInfo.PreviewLink;
            if (link.IsNotNullOrWhiteSpace())
            {
                edition.Links.Add(new Links { Url = link, Name = "Google Books" });
            }

            edition.Monitored = true;

            var book = new Book
            {
                ForeignBookId = bookId,
                Title = title,
                TitleSlug = bookId,
                CleanTitle = Parser.Parser.CleanAuthorName(title),
                ReleaseDate = ParseGooglePublishedDate(volumeInfo.PublishedDate),
                Genres = volumeInfo.Categories ?? new List<string>(),
                AnyEditionOk = true,
                Editions = new List<Edition> { edition },
                Author = new Author
                {
                    Metadata = authorMetadata,
                    CleanName = Parser.Parser.CleanAuthorName(authorName)
                },
                AuthorMetadata = authorMetadata
            };

            if (link.IsNotNullOrWhiteSpace())
            {
                book.Links.Add(new Links { Url = link, Name = "Google Books" });
            }

            return book;
        }

        private static Edition GetPrimaryEdition(Book book)
        {
            return book?.Editions?.Value?.FirstOrDefault(x => x.Monitored) ?? book?.Editions?.Value?.FirstOrDefault();
        }

        private void ApplyOpenLibraryMetadata(Book book, Edition edition, OpenLibraryBookData data)
        {
            if (book == null || edition == null || data == null)
            {
                return;
            }

            if (IsPlaceholderTitle(book.Title) && data.WorkTitle.IsNotNullOrWhiteSpace())
            {
                book.Title = data.WorkTitle;
            }

            if (IsPlaceholderTitle(edition.Title) && data.EditionTitle.IsNotNullOrWhiteSpace())
            {
                edition.Title = data.EditionTitle;
            }

            if (!book.ReleaseDate.HasValue)
            {
                book.ReleaseDate = data.FirstPublishDate ?? data.PublishDate;
            }

            if (!edition.ReleaseDate.HasValue)
            {
                edition.ReleaseDate = data.PublishDate ?? data.FirstPublishDate;
            }

            if ((book.Genres == null || !book.Genres.Any()) && data.Subjects?.Any() == true)
            {
                book.Genres = data.Subjects;
            }

            if (edition.Publisher.IsNullOrWhiteSpace() && data.Publisher.IsNotNullOrWhiteSpace())
            {
                edition.Publisher = data.Publisher;
            }

            if (edition.PageCount == 0 && data.PageCount.HasValue)
            {
                edition.PageCount = data.PageCount.Value;
            }

            if (edition.Overview.IsNullOrWhiteSpace() && data.Description.IsNotNullOrWhiteSpace())
            {
                edition.Overview = data.Description;
            }

            if (edition.Language.IsNullOrWhiteSpace() && data.Language.IsNotNullOrWhiteSpace())
            {
                edition.Language = data.Language;
            }

            if (data.AverageRating.HasValue && data.AverageRating.Value > 0)
            {
                var rating = new Ratings
                {
                    Value = data.AverageRating.Value,
                    Votes = data.RatingCount ?? 0
                };

                book.Ratings = rating;
                edition.Ratings = rating;
            }

            edition.Images ??= new List<MediaCover.MediaCover>();
            if (!edition.Images.Any())
            {
                foreach (var image in BuildOpenLibraryImages(data))
                {
                    if (edition.Images.Any(x => x.Url.Equals(image.Url, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    edition.Images.Add(image);
                }
            }

            AddOpenLibraryLink(book.Links, data.WorkKey);
            AddOpenLibraryLink(edition.Links, data.EditionKey ?? data.WorkKey);
        }

        private void ApplyOpenLibrarySeries(Book book, Author author, OpenLibraryBookData data, IDictionary<string, Series> seriesById)
        {
            if (book == null || author?.Metadata?.Value == null || data?.Series?.Any() != true)
            {
                return;
            }

            var links = book.SeriesLinks?.Value ?? new List<SeriesBookLink>();
            book.SeriesLinks = links;

            foreach (var seriesTitle in data.Series)
            {
                if (seriesTitle.IsNullOrWhiteSpace())
                {
                    continue;
                }

                var normalizedTitle = seriesTitle.CleanSpaces();
                var seriesId = BuildOpenLibrarySeriesId(author.Metadata.Value.ForeignAuthorId, normalizedTitle);
                if (seriesId.IsNullOrWhiteSpace())
                {
                    continue;
                }

                if (!seriesById.TryGetValue(seriesId, out var series))
                {
                    series = new Series
                    {
                        ForeignSeriesId = seriesId,
                        Title = normalizedTitle,
                        ForeignAuthorId = author.Metadata.Value.ForeignAuthorId,
                        LinkItems = new List<SeriesBookLink>()
                    };

                    seriesById[seriesId] = series;
                }

                var seriesLinks = series.LinkItems?.Value ?? new List<SeriesBookLink>();
                series.LinkItems = seriesLinks;

                if (links.Any(l => l.Series?.Value?.ForeignSeriesId == seriesId))
                {
                    continue;
                }

                var link = new SeriesBookLink
                {
                    Book = book,
                    Series = series,
                    IsPrimary = true,
                    Position = null,
                    SeriesPosition = 0
                };

                links.Add(link);
                seriesLinks.Add(link);
            }
        }

        private static string BuildOpenLibrarySeriesId(string authorForeignId, string seriesTitle)
        {
            if (authorForeignId.IsNullOrWhiteSpace() || seriesTitle.IsNullOrWhiteSpace())
            {
                return null;
            }

            var normalized = $"{authorForeignId}:{seriesTitle.Trim().ToLowerInvariant()}";
            return $"{OpenLibrarySeriesPrefix}{Base64UrlEncode(normalized)}";
        }

        private static bool IsPlaceholderTitle(string title)
        {
            return title.IsNullOrWhiteSpace() || title.Equals("Unknown Title", StringComparison.OrdinalIgnoreCase);
        }

        private static string GetOpenLibraryIsbn(List<GoogleBooksIndustryIdentifier> identifiers)
        {
            return GetIndustryIdentifier(identifiers, "ISBN_13") ??
                GetIndustryIdentifier(identifiers, "ISBN_10");
        }

        private OpenLibraryBookData GetOpenLibraryBookData(string isbn)
        {
            var normalizedIsbn = NormalizeOpenLibraryIsbn(isbn);
            if (normalizedIsbn.IsNullOrWhiteSpace())
            {
                return null;
            }

            return _openLibraryBookCache.Get(
                normalizedIsbn,
                () =>
                {
                    try
                    {
                        return LookupOpenLibraryBookData(normalizedIsbn);
                    }
                    catch (Exception ex)
                    {
                        _logger.Debug(ex, "Open Library lookup failed for ISBN {0}", normalizedIsbn);
                        return null;
                    }
                },
                TimeSpan.FromDays(1));
        }

        private OpenLibraryBookData LookupOpenLibraryBookData(string isbn)
        {
            var request = new HttpRequestBuilder($"https://openlibrary.org/isbn/{isbn}.json")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return null;
            }

            var editionJson = JObject.Parse(response.Content);
            var data = new OpenLibraryBookData
            {
                EditionKey = editionJson["key"]?.ToString(),
                EditionTitle = editionJson["title"]?.ToString(),
                Description = GetOpenLibraryDescription(editionJson["description"]),
                PublishDate = ParseOpenLibraryPublishedDate(editionJson["publish_date"]?.ToString()),
                Publisher = GetOpenLibraryPublisher(editionJson["publishers"]),
                PageCount = ParseOpenLibraryPageCount(editionJson["number_of_pages"]),
                Language = ParseOpenLibraryLanguage(editionJson["languages"]),
                EditionCoverIds = ParseOpenLibraryCoverIds(editionJson["covers"]),
                WorkKey = editionJson["works"]?.FirstOrDefault()?["key"]?.ToString()
            };

            if (data.WorkKey.IsNotNullOrWhiteSpace())
            {
                PopulateOpenLibraryWorkData(data);
            }

            data.Subjects = NormalizeOpenLibrarySubjects(data.Subjects);
            data.Series = NormalizeOpenLibrarySeries(data.Series);

            return data;
        }

        private void PopulateOpenLibraryWorkData(OpenLibraryBookData data)
        {
            var request = new HttpRequestBuilder($"https://openlibrary.org{data.WorkKey}.json")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return;
            }

            var workJson = JObject.Parse(response.Content);
            data.WorkTitle = workJson["title"]?.ToString();
            if (data.Description.IsNullOrWhiteSpace())
            {
                data.Description = GetOpenLibraryDescription(workJson["description"]);
            }

            data.FirstPublishDate = ParseOpenLibraryPublishedDate(workJson["first_publish_date"]?.ToString());
            data.Subjects = ParseOpenLibraryStringList(workJson["subjects"]);
            data.Series = ParseOpenLibrarySeriesList(workJson["series"]);
            data.WorkCoverIds = ParseOpenLibraryCoverIds(workJson["covers"]);

            var ratingsJson = GetOpenLibraryJson($"https://openlibrary.org{data.WorkKey}/ratings.json", TimeSpan.FromHours(12));
            if (ratingsJson != null)
            {
                var summary = ratingsJson["summary"];
                data.AverageRating = summary?["average"]?.Value<decimal?>();
                data.RatingCount = summary?["count"]?.Value<int?>();
            }
        }

        private static string NormalizeOpenLibraryIsbn(string isbn)
        {
            if (isbn.IsNullOrWhiteSpace())
            {
                return null;
            }

            var normalized = new string(isbn.Where(c => char.IsDigit(c) || c == 'X' || c == 'x').ToArray());
            if (normalized.Length != 10 && normalized.Length != 13)
            {
                return null;
            }

            return normalized;
        }

        private static string GetOpenLibraryDescription(JToken token)
        {
            if (token == null)
            {
                return null;
            }

            if (token.Type == JTokenType.String)
            {
                return token.ToString();
            }

            if (token.Type == JTokenType.Object)
            {
                return token["value"]?.ToString();
            }

            return null;
        }

        private static string GetOpenLibraryPublisher(JToken token)
        {
            if (token is not JArray publishers)
            {
                return null;
            }

            return publishers.FirstOrDefault()?.ToString();
        }

        private static int? ParseOpenLibraryPageCount(JToken token)
        {
            if (token == null)
            {
                return null;
            }

            if (token.Type == JTokenType.Integer)
            {
                return token.Value<int>();
            }

            if (int.TryParse(token.ToString(), out var pages))
            {
                return pages;
            }

            return null;
        }

        private static string ParseOpenLibraryLanguage(JToken token)
        {
            var key = token?.FirstOrDefault()?["key"]?.ToString();
            if (key.IsNullOrWhiteSpace())
            {
                return null;
            }

            return key.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
        }

        private static DateTime? ParseOpenLibraryPublishedDate(string publishedDate)
        {
            if (publishedDate.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (DateTime.TryParse(publishedDate,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.AssumeUniversal,
                    out var parsed))
            {
                return parsed;
            }

            return null;
        }

        private static List<int> ParseOpenLibraryCoverIds(JToken token)
        {
            if (token is not JArray covers)
            {
                return new List<int>();
            }

            var results = new List<int>();
            foreach (var cover in covers)
            {
                if (int.TryParse(cover.ToString(), out var id))
                {
                    results.Add(id);
                }
            }

            return results;
        }

        private static List<string> ParseOpenLibraryStringList(JToken token)
        {
            if (token is not JArray values)
            {
                return new List<string>();
            }

            return values
                .Select(x => x?.ToString())
                .Where(x => x.IsNotNullOrWhiteSpace())
                .ToList();
        }

        private static List<string> ParseOpenLibrarySeriesList(JToken token)
        {
            if (token == null)
            {
                return new List<string>();
            }

            if (token.Type == JTokenType.String)
            {
                return new List<string> { token.ToString() };
            }

            if (token is JArray values)
            {
                return values
                    .Select(x => x?.ToString())
                    .Where(x => x.IsNotNullOrWhiteSpace())
                    .ToList();
            }

            return new List<string>();
        }

        private static List<string> NormalizeOpenLibrarySubjects(IEnumerable<string> subjects)
        {
            if (subjects == null)
            {
                return new List<string>();
            }

            return subjects
                .Select(x => x.CleanSpaces())
                .Where(x => x.IsNotNullOrWhiteSpace())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(OpenLibraryMaxGenres)
                .ToList();
        }

        private static List<string> NormalizeOpenLibrarySeries(IEnumerable<string> series)
        {
            if (series == null)
            {
                return new List<string>();
            }

            return series
                .Select(x => x.CleanSpaces())
                .Where(x => x.IsNotNullOrWhiteSpace())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static List<MediaCover.MediaCover> BuildOpenLibraryImages(OpenLibraryBookData data)
        {
            var coverIds = data?.EditionCoverIds?.Any() == true ? data.EditionCoverIds : data?.WorkCoverIds;
            if (coverIds?.Any() != true)
            {
                return new List<MediaCover.MediaCover>();
            }

            return coverIds
                .Distinct()
                .Take(OpenLibraryMaxCovers)
                .Select(id => new MediaCover.MediaCover
                {
                    Url = $"https://covers.openlibrary.org/b/id/{id}-L.jpg",
                    CoverType = MediaCoverTypes.Cover
                })
                .ToList();
        }

        private static void AddOpenLibraryLink(List<Links> links, string key)
        {
            if (links == null || key.IsNullOrWhiteSpace())
            {
                return;
            }

            var url = key.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? key
                : $"https://openlibrary.org{key}";

            if (links.Any(x => x.Url.Equals(url, StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }

            links.Add(new Links
            {
                Name = "Open Library",
                Url = url
            });
        }

        private HttpRequest BuildGoogleBooksRequest(string route, Dictionary<string, string> queryParams)
        {
            var builder = _googleBooksRequestBuilder.Create()
                .SetSegment("route", route);

            if (_configService.GoogleBooksApiKey.IsNotNullOrWhiteSpace())
            {
                builder.AddQueryParam("key", _configService.GoogleBooksApiKey);
            }

            if (queryParams != null)
            {
                foreach (var pair in queryParams)
                {
                    builder.AddQueryParam(pair.Key, pair.Value);
                }
            }

            var languageCode = GetUiLanguageCode();
            if (languageCode.IsNotNullOrWhiteSpace())
            {
                builder.AddQueryParam("hl", languageCode);
                builder.SetHeader("Accept-Language", languageCode);
            }

            return builder.Build();
        }

        private static string BuildGoogleBookId(string volumeId)
        {
            return $"{GoogleBookPrefix}{volumeId}";
        }

        private static string BuildOpenLibraryWorkId(string workKey)
        {
            if (workKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (workKey.StartsWith(OpenLibraryWorkPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return workKey;
            }

            var normalized = NormalizeOpenLibraryWorkKey(workKey);
            if (normalized.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (normalized.StartsWith("/works/", StringComparison.OrdinalIgnoreCase))
            {
                normalized = normalized.Substring("/works/".Length);
            }

            return $"{OpenLibraryWorkPrefix}{normalized}";
        }

        private static bool TryParseOpenLibraryWorkId(string foreignBookId, out string workId)
        {
            workId = null;

            if (foreignBookId.IsNullOrWhiteSpace())
            {
                return false;
            }

            if (foreignBookId.StartsWith(OpenLibraryWorkPrefix, StringComparison.OrdinalIgnoreCase))
            {
                workId = foreignBookId.Substring(OpenLibraryWorkPrefix.Length);
            }
            else if (foreignBookId.StartsWith("/works/", StringComparison.OrdinalIgnoreCase))
            {
                workId = foreignBookId.Substring("/works/".Length);
            }
            else if (foreignBookId.StartsWith("OL", StringComparison.OrdinalIgnoreCase) && foreignBookId.EndsWith("W", StringComparison.OrdinalIgnoreCase))
            {
                workId = foreignBookId;
            }

            return workId.IsNotNullOrWhiteSpace();
        }

        private static bool TryParseGoogleBookId(string foreignBookId, out string volumeId)
        {
            volumeId = null;
            if (foreignBookId.IsNullOrWhiteSpace() || !foreignBookId.StartsWith(GoogleBookPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            volumeId = foreignBookId.Substring(GoogleBookPrefix.Length);
            return volumeId.IsNotNullOrWhiteSpace();
        }

        private static string BuildGoogleAuthorId(string authorName)
        {
            return $"{GoogleAuthorPrefix}{Base64UrlEncode(authorName)}";
        }

        private static string BuildOpenLibraryAuthorId(string authorKey, string authorName)
        {
            var normalizedKey = NormalizeOpenLibraryAuthorKey(authorKey);
            if (normalizedKey.IsNotNullOrWhiteSpace())
            {
                var id = normalizedKey.StartsWith("/authors/", StringComparison.OrdinalIgnoreCase)
                    ? normalizedKey.Substring("/authors/".Length)
                    : normalizedKey.TrimStart('/');

                return $"{OpenLibraryAuthorPrefix}{id}";
            }

            if (authorName.IsNullOrWhiteSpace())
            {
                return null;
            }

            var normalizedName = authorName.CleanSpaces().ToLowerInvariant();
            return $"{OpenLibraryAuthorPrefix}{Base64UrlEncode(normalizedName)}";
        }

        private static bool TryParseOpenLibraryAuthorId(string foreignAuthorId, out string authorId)
        {
            authorId = null;

            if (foreignAuthorId.IsNullOrWhiteSpace())
            {
                return false;
            }

            if (foreignAuthorId.StartsWith(OpenLibraryAuthorPrefix, StringComparison.OrdinalIgnoreCase))
            {
                authorId = foreignAuthorId.Substring(OpenLibraryAuthorPrefix.Length);
            }
            else if (foreignAuthorId.StartsWith("/authors/", StringComparison.OrdinalIgnoreCase))
            {
                authorId = foreignAuthorId.Substring("/authors/".Length);
            }
            else if (foreignAuthorId.StartsWith("OL", StringComparison.OrdinalIgnoreCase) && foreignAuthorId.EndsWith("A", StringComparison.OrdinalIgnoreCase))
            {
                authorId = foreignAuthorId;
            }

            return authorId.IsNotNullOrWhiteSpace();
        }

        private static bool TryParseGoogleAuthorId(string foreignAuthorId, out string authorName)
        {
            authorName = null;
            if (foreignAuthorId.IsNullOrWhiteSpace() || !foreignAuthorId.StartsWith(GoogleAuthorPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var encoded = foreignAuthorId.Substring(GoogleAuthorPrefix.Length);
            return TryBase64UrlDecode(encoded, out authorName);
        }

        private static AuthorMetadata BuildGoogleAuthorMetadata(string authorId, string authorName)
        {
            var metadata = new AuthorMetadata
            {
                ForeignAuthorId = authorId,
                TitleSlug = authorId,
                Name = authorName.CleanSpaces(),
                Status = AuthorStatusType.Continuing
            };

            metadata.SortName = metadata.Name.ToLowerInvariant();
            metadata.NameLastFirst = metadata.Name.ToLastFirst();
            metadata.SortNameLastFirst = metadata.NameLastFirst.ToLowerInvariant();

            return metadata;
        }

        public AuthorExtraMetadata GetAuthorExtraMetadata(string authorName)
        {
            if (authorName.IsNullOrWhiteSpace())
            {
                return new AuthorExtraMetadata();
            }

            var cacheKey = authorName.CleanSpaces().ToLowerInvariant();
            var result = _authorExtrasCache.Get(cacheKey,
                () => LookupAuthorExtraMetadata(authorName),
                TimeSpan.FromDays(AuthorImageCacheDays));

            return result ?? new AuthorExtraMetadata();
        }

        public AuthorExtraMetadata RefreshAuthorExtraMetadata(string authorName)
        {
            if (authorName.IsNullOrWhiteSpace())
            {
                return new AuthorExtraMetadata();
            }

            var cacheKey = authorName.CleanSpaces().ToLowerInvariant();
            _authorExtrasCache.Remove(cacheKey);

            var result = LookupAuthorExtraMetadata(authorName) ?? new AuthorExtraMetadata();
            _authorExtrasCache.Set(cacheKey, result, TimeSpan.FromDays(AuthorImageCacheDays));

            return result;
        }

        private void TryAddExternalAuthorImage(AuthorMetadata metadata)
        {
            if (metadata == null || metadata.Name.IsNullOrWhiteSpace())
            {
                return;
            }

            var hasPoster = metadata.Images.Any(x => x.CoverType == MediaCoverTypes.Poster && x.Url.IsNotNullOrWhiteSpace());
            var needsOverview = metadata.Overview.IsNullOrWhiteSpace();

            if (hasPoster && !needsOverview)
            {
                return;
            }

            var result = GetAuthorExtraMetadata(metadata.Name);

            if (result == null)
            {
                return;
            }

            if (!hasPoster && result.ImageUrl.IsNotNullOrWhiteSpace())
            {
                metadata.Images.Add(new MediaCover.MediaCover
                {
                    Url = result.ImageUrl,
                    CoverType = MediaCoverTypes.Poster
                });
            }

            if (needsOverview && result.Overview.IsNotNullOrWhiteSpace())
            {
                metadata.Overview = result.Overview;
            }

            if (result.Links != null)
            {
                foreach (var link in result.Links)
                {
                    AddLinkIfMissing(metadata, link.Name, link.Url);
                }
            }
        }

        private static void AddLinkIfMissing(AuthorMetadata metadata, string name, string url)
        {
            if (metadata == null || url.IsNullOrWhiteSpace() || name.IsNullOrWhiteSpace())
            {
                return;
            }

            if (metadata.Links.Any(x => x.Url.Equals(url, StringComparison.OrdinalIgnoreCase)))
            {
                return;
            }

            metadata.Links.Add(new Links
            {
                Name = name,
                Url = url
            });
        }

        private AuthorExtraMetadata LookupAuthorExtraMetadata(string authorName)
        {
            var combined = new AuthorExtraMetadata
            {
                Links = new List<Links>()
            };

            try
            {
                MergeAuthorExtras(combined, TryGetWikidataAuthorExtras(authorName));
            }
            catch (Exception ex)
            {
                _logger.Debug(ex, "Wikidata author image lookup failed for {0}", authorName);
            }

            try
            {
                MergeAuthorExtras(combined, TryGetOpenLibraryAuthorExtras(authorName));
            }
            catch (Exception ex)
            {
                _logger.Debug(ex, "Open Library author image lookup failed for {0}", authorName);
            }

            try
            {
                MergeAuthorExtras(combined, TryGetWikipediaAuthorExtrasByName(authorName));
            }
            catch (Exception ex)
            {
                _logger.Debug(ex, "Wikipedia author lookup failed for {0}", authorName);
            }

            var hasImage = combined.ImageUrl.IsNotNullOrWhiteSpace();
            var hasOverview = combined.Overview.IsNotNullOrWhiteSpace();
            var hasLinks = combined.Links != null && combined.Links.Any();

            return (hasImage || hasOverview || hasLinks) ? combined : new AuthorExtraMetadata();
        }

        private static void MergeAuthorExtras(AuthorExtraMetadata target, AuthorExtraMetadata source)
        {
            if (target == null || source == null)
            {
                return;
            }

            if (target.ImageUrl.IsNullOrWhiteSpace() && source.ImageUrl.IsNotNullOrWhiteSpace())
            {
                target.ImageUrl = source.ImageUrl;
            }

            if (target.Overview.IsNullOrWhiteSpace() && source.Overview.IsNotNullOrWhiteSpace())
            {
                target.Overview = source.Overview;
            }

            if (source.Links != null && source.Links.Any())
            {
                target.Links ??= new List<Links>();

                foreach (var link in source.Links)
                {
                    if (link?.Url.IsNullOrWhiteSpace() ?? true)
                    {
                        continue;
                    }

                    if (target.Links.Any(x => x.Url.Equals(link.Url, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    target.Links.Add(link);
                }
            }
        }

        private AuthorExtraMetadata TryGetWikidataAuthorExtras(string authorName)
        {
            var searchRequest = new HttpRequestBuilder("https://www.wikidata.org/w/api.php")
                .AddQueryParam("action", "wbsearchentities")
                .AddQueryParam("search", authorName)
                .AddQueryParam("language", "en")
                .AddQueryParam("format", "json")
                .AddQueryParam("limit", "1")
                .Build();

            searchRequest.AllowAutoRedirect = true;
            searchRequest.SuppressHttpError = true;

            var searchResponse = _httpClient.Get(searchRequest);
            if (searchResponse.HasHttpError)
            {
                return null;
            }

            var searchJson = JObject.Parse(searchResponse.Content);
            var entityId = searchJson["search"]?.FirstOrDefault()?["id"]?.ToString();
            if (entityId.IsNullOrWhiteSpace())
            {
                return null;
            }

            var entityRequest = new HttpRequestBuilder("https://www.wikidata.org/w/api.php")
                .AddQueryParam("action", "wbgetentities")
                .AddQueryParam("ids", entityId)
                .AddQueryParam("props", "claims|sitelinks")
                .AddQueryParam("format", "json")
                .Build();

            entityRequest.AllowAutoRedirect = true;
            entityRequest.SuppressHttpError = true;

            var entityResponse = _httpClient.Get(entityRequest);
            if (entityResponse.HasHttpError)
            {
                return null;
            }

            var entityJson = JObject.Parse(entityResponse.Content);
            var entity = entityJson["entities"]?[entityId];
            var imageName = entity?["claims"]?["P18"]?.FirstOrDefault()?["mainsnak"]?["datavalue"]?["value"]?.ToString();
            string imageUrl = null;

            var links = new List<Links>
            {
                new Links { Name = "Wikidata", Url = $"https://www.wikidata.org/wiki/{entityId}" }
            };

            if (imageName.IsNotNullOrWhiteSpace())
            {
                var fileName = imageName.Replace(' ', '_');
                var encodedFileName = Uri.EscapeDataString(fileName);
                imageUrl = $"https://commons.wikimedia.org/wiki/Special:FilePath/{encodedFileName}";
                links.Add(new Links { Name = "Wikimedia Commons", Url = $"https://commons.wikimedia.org/wiki/File:{encodedFileName}" });
            }

            var wikiTitle = entity?["sitelinks"]?["enwiki"]?["title"]?.ToString();
            WikipediaSummary summary = null;
            string overview = null;
            var hasWikipediaLink = false;
            if (wikiTitle.IsNotNullOrWhiteSpace())
            {
                summary = TryGetWikipediaSummary(wikiTitle);
                if (summary?.Overview.IsNotNullOrWhiteSpace() == true)
                {
                    overview = summary.Overview;
                }

                var wikipediaUrl = summary?.Url;
                if (wikipediaUrl.IsNullOrWhiteSpace())
                {
                    var encodedTitle = Uri.EscapeDataString(wikiTitle.Replace(' ', '_'));
                    wikipediaUrl = $"https://en.wikipedia.org/wiki/{encodedTitle}";
                }

                links.Add(new Links { Name = "Wikipedia", Url = wikipediaUrl });
                hasWikipediaLink = wikipediaUrl.IsNotNullOrWhiteSpace();
            }

            if (imageUrl.IsNullOrWhiteSpace() && summary?.ImageUrl.IsNotNullOrWhiteSpace() == true)
            {
                imageUrl = summary.ImageUrl;
            }

            if (imageUrl.IsNullOrWhiteSpace() && overview.IsNullOrWhiteSpace() && !hasWikipediaLink)
            {
                return null;
            }

            return new AuthorExtraMetadata
            {
                ImageUrl = imageUrl,
                Overview = overview,
                Links = links
            };
        }

        private AuthorExtraMetadata TryGetOpenLibraryAuthorExtras(string authorName)
        {
            var request = new HttpRequestBuilder("https://openlibrary.org/search/authors.json")
                .AddQueryParam("q", authorName)
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return null;
            }

            var json = JObject.Parse(response.Content);
            var docs = json["docs"] as JArray;
            if (docs == null)
            {
                return null;
            }

            foreach (var doc in docs.Take(OpenLibraryAuthorLookupLimit))
            {
                var linkKey = NormalizeOpenLibraryAuthorKey(doc["key"]?.ToString());
                if (linkKey.IsNotNullOrWhiteSpace())
                {
                    var byKey = TryGetOpenLibraryAuthorExtrasByKey(linkKey);
                    if (byKey?.ImageUrl.IsNotNullOrWhiteSpace() == true ||
                        byKey?.Overview.IsNotNullOrWhiteSpace() == true)
                    {
                        return byKey;
                    }
                }

                var photoToken = doc["photo_id"] ?? doc["photos"]?.FirstOrDefault();
                var photoId = photoToken?.ToString();

                if (photoId.IsNullOrWhiteSpace())
                {
                    continue;
                }

                var imageUrl = photoId.IsNullOrWhiteSpace() ? null : $"https://covers.openlibrary.org/a/id/{photoId}-L.jpg";
                var links = new List<Links>();

                if (linkKey.IsNotNullOrWhiteSpace())
                {
                    links.Add(new Links { Name = "Open Library", Url = $"https://openlibrary.org{linkKey}" });
                }

                return new AuthorExtraMetadata
                {
                    ImageUrl = imageUrl,
                    Overview = null,
                    Links = links
                };
            }

            return null;
        }

        private AuthorExtraMetadata TryGetOpenLibraryAuthorExtrasByKey(string authorKey)
        {
            authorKey = NormalizeOpenLibraryAuthorKey(authorKey);
            if (authorKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            var request = new HttpRequestBuilder($"https://openlibrary.org{authorKey}.json")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return null;
            }

            var json = JObject.Parse(response.Content);
            var overview = ParseOpenLibraryAuthorOverview(json["bio"]);
            var photoToken = json["photo_id"] ?? json["photos"]?.FirstOrDefault();
            var photoId = photoToken?.ToString();
            var imageUrl = photoId.IsNullOrWhiteSpace() ? null : $"https://covers.openlibrary.org/a/id/{photoId}-L.jpg";

            if (imageUrl.IsNullOrWhiteSpace() && overview.IsNullOrWhiteSpace())
            {
                return null;
            }

            var links = new List<Links>
            {
                new Links { Name = "Open Library", Url = $"https://openlibrary.org{authorKey}" }
            };

            return new AuthorExtraMetadata
            {
                ImageUrl = imageUrl,
                Overview = overview,
                Links = links
            };
        }

        private AuthorExtraMetadata TryGetWikipediaAuthorExtrasByName(string authorName)
        {
            var summary = TryGetWikipediaSummary(authorName);
            if (summary == null)
            {
                return null;
            }

            var url = summary.Url;
            if (url.IsNullOrWhiteSpace())
            {
                var encoded = Uri.EscapeDataString(authorName.Replace(' ', '_'));
                url = $"https://en.wikipedia.org/wiki/{encoded}";
            }

            return new AuthorExtraMetadata
            {
                ImageUrl = summary.ImageUrl,
                Overview = summary.Overview,
                Links = new List<Links>
                {
                    new Links { Name = "Wikipedia", Url = url }
                }
            };
        }

        private WikipediaSummary TryGetWikipediaSummary(string wikiTitle)
        {
            if (wikiTitle.IsNullOrWhiteSpace())
            {
                return null;
            }

            var encodedTitle = Uri.EscapeDataString(wikiTitle.Replace(' ', '_'));
            var request = new HttpRequestBuilder($"https://en.wikipedia.org/api/rest_v1/page/summary/{encodedTitle}")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return null;
            }

            var json = JObject.Parse(response.Content);
            var type = json["type"]?.ToString();
            if (string.Equals(type, "disambiguation", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            var extract = NormalizeOverview(json["extract"]?.ToString());
            var url = json["content_urls"]?["desktop"]?["page"]?.ToString();
            var imageUrl = json["thumbnail"]?["source"]?.ToString();

            if (extract.IsNullOrWhiteSpace() && url.IsNullOrWhiteSpace() && imageUrl.IsNullOrWhiteSpace())
            {
                return null;
            }

            return new WikipediaSummary
            {
                Overview = extract,
                ImageUrl = imageUrl,
                Url = url
            };
        }

        private string TryGetOpenLibraryAuthorOverview(string authorKey)
        {
            authorKey = NormalizeOpenLibraryAuthorKey(authorKey);
            if (authorKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            var request = new HttpRequestBuilder($"https://openlibrary.org{authorKey}.json")
                .Build();

            request.AllowAutoRedirect = true;
            request.SuppressHttpError = true;

            var response = _httpClient.Get(request);
            if (response.HasHttpError)
            {
                return null;
            }

            var json = JObject.Parse(response.Content);
            return ParseOpenLibraryAuthorOverview(json["bio"]);
        }

        private static string ParseOpenLibraryAuthorOverview(JToken bioToken)
        {
            if (bioToken == null)
            {
                return null;
            }

            if (bioToken.Type == JTokenType.String)
            {
                return NormalizeOverview(bioToken.ToString());
            }

            return NormalizeOverview(bioToken["value"]?.ToString());
        }

        private static string NormalizeOpenLibraryAuthorKey(string authorKey)
        {
            if (authorKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (authorKey.StartsWith(OpenLibraryAuthorPrefix, StringComparison.OrdinalIgnoreCase))
            {
                var id = authorKey.Substring(OpenLibraryAuthorPrefix.Length);
                if (id.StartsWith("OL", StringComparison.OrdinalIgnoreCase) && id.EndsWith("A", StringComparison.OrdinalIgnoreCase))
                {
                    return $"/authors/{id}";
                }

                return null;
            }

            if (authorKey.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(authorKey);
                authorKey = uri.AbsolutePath;
            }

            if (authorKey.StartsWith("/authors/", StringComparison.OrdinalIgnoreCase))
            {
                return authorKey;
            }

            if (authorKey.StartsWith("/", StringComparison.OrdinalIgnoreCase))
            {
                return authorKey;
            }

            return $"/authors/{authorKey}";
        }

        private static string NormalizeOpenLibraryWorkKey(string workKey)
        {
            if (workKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (workKey.StartsWith(OpenLibraryWorkPrefix, StringComparison.OrdinalIgnoreCase))
            {
                workKey = workKey.Substring(OpenLibraryWorkPrefix.Length);
            }

            if (workKey.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(workKey);
                workKey = uri.AbsolutePath;
            }

            if (workKey.StartsWith("/works/", StringComparison.OrdinalIgnoreCase))
            {
                return workKey;
            }

            if (workKey.StartsWith("/", StringComparison.OrdinalIgnoreCase))
            {
                return workKey;
            }

            return $"/works/{workKey}";
        }

        private static string NormalizeOpenLibraryEditionKey(string editionKey)
        {
            if (editionKey.IsNullOrWhiteSpace())
            {
                return null;
            }

            if (editionKey.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(editionKey);
                editionKey = uri.AbsolutePath;
            }

            if (editionKey.StartsWith("/books/", StringComparison.OrdinalIgnoreCase))
            {
                return editionKey;
            }

            if (editionKey.StartsWith("/", StringComparison.OrdinalIgnoreCase))
            {
                return editionKey;
            }

            return $"/books/{editionKey}";
        }

        private static string NormalizeOverview(string overview)
        {
            if (overview.IsNullOrWhiteSpace())
            {
                return overview;
            }

            var cleaned = overview.CleanSpaces();
            if (cleaned.Length > 600)
            {
                cleaned = cleaned.Substring(0, 600).Trim();
            }

            return cleaned;
        }

        private class OpenLibraryBookData
        {
            public string EditionKey { get; set; }
            public string WorkKey { get; set; }
            public string EditionTitle { get; set; }
            public string WorkTitle { get; set; }
            public string Description { get; set; }
            public DateTime? PublishDate { get; set; }
            public DateTime? FirstPublishDate { get; set; }
            public string Publisher { get; set; }
            public int? PageCount { get; set; }
            public string Language { get; set; }
            public decimal? AverageRating { get; set; }
            public int? RatingCount { get; set; }
            public List<string> Subjects { get; set; } = new List<string>();
            public List<string> Series { get; set; } = new List<string>();
            public List<int> EditionCoverIds { get; set; } = new List<int>();
            public List<int> WorkCoverIds { get; set; } = new List<int>();
        }

        private class WikipediaSummary
        {
            public string Overview { get; set; }
            public string ImageUrl { get; set; }
            public string Url { get; set; }
        }

        private static List<MediaCover.MediaCover> BuildGoogleImages(GoogleBooksImageLinks imageLinks)
        {
            var images = new List<MediaCover.MediaCover>();
            var url = imageLinks?.Thumbnail ?? imageLinks?.SmallThumbnail;
            url = NormalizeGoogleImageUrl(url);

            if (url.IsNotNullOrWhiteSpace())
            {
                images.Add(new MediaCover.MediaCover
                {
                    Url = url,
                    CoverType = MediaCoverTypes.Cover
                });
            }

            return images;
        }

        private static string NormalizeGoogleImageUrl(string url)
        {
            if (url.IsNullOrWhiteSpace())
            {
                return url;
            }

            if (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            {
                return "https://" + url.Substring("http://".Length);
            }

            return url;
        }

        private List<Book> SearchGoogleBooksAuthor(string authorName)
        {
            var results = new List<Book>();

            foreach (var query in BuildGoogleAuthorQueries(authorName))
            {
                var page = SearchGoogleBooksPaged(query, GoogleBooksAuthorMaxResults);
                results.AddRange(page);

                if (results.Count >= GoogleBooksAuthorMinResults)
                {
                    break;
                }
            }

            return results
                .DistinctBy(x => x.ForeignBookId)
                .ToList();
        }

        private static IEnumerable<string> BuildGoogleAuthorQueries(string authorName)
        {
            if (authorName.IsNullOrWhiteSpace())
            {
                yield break;
            }

            yield return $"inauthor:\"{authorName}\"";
            yield return $"inauthor:{authorName}";

            var normalized = NormalizeGoogleAuthorName(authorName);
            if (normalized.IsNotNullOrWhiteSpace() && !normalized.Equals(authorName, StringComparison.OrdinalIgnoreCase))
            {
                yield return $"inauthor:{normalized}";
            }

            var lastName = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries).LastOrDefault();
            if (lastName.IsNotNullOrWhiteSpace() && lastName.Length >= 4)
            {
                yield return $"inauthor:{lastName}";
            }
        }

        private static string NormalizeGoogleAuthorName(string authorName)
        {
            if (authorName.IsNullOrWhiteSpace())
            {
                return string.Empty;
            }

            var normalized = new string(authorName
                .Where(c => char.IsLetterOrDigit(c) || char.IsWhiteSpace(c))
                .ToArray());

            return normalized.CleanSpaces();
        }

        private static DateTime? ParseGooglePublishedDate(string publishedDate)
        {
            if (publishedDate.IsNullOrWhiteSpace())
            {
                return null;
            }

            var formats = new[] { "yyyy-MM-dd", "yyyy-MM", "yyyy" };
            if (DateTime.TryParseExact(publishedDate,
                    formats,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.AssumeUniversal,
                    out var parsed))
            {
                return parsed;
            }

            if (DateTime.TryParse(publishedDate,
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.AssumeUniversal,
                    out parsed))
            {
                return parsed;
            }

            return null;
        }

        private static string GetIndustryIdentifier(List<GoogleBooksIndustryIdentifier> identifiers, string type)
        {
            return identifiers?.FirstOrDefault(x => string.Equals(x.Type, type, StringComparison.OrdinalIgnoreCase))?.Identifier;
        }

        private static bool IsGoogleBooksQuotaError(HttpResponse response)
        {
            return IsGoogleBooksQuotaStatus(response.StatusCode);
        }

        private static bool IsGoogleBooksQuotaStatus(HttpStatusCode statusCode)
        {
            return statusCode == HttpStatusCode.TooManyRequests ||
                statusCode == HttpStatusCode.Forbidden;
        }

        private static string Base64UrlEncode(string value)
        {
            var bytes = Encoding.UTF8.GetBytes(value);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static bool TryBase64UrlDecode(string value, out string decoded)
        {
            decoded = null;

            if (value.IsNullOrWhiteSpace())
            {
                return false;
            }

            var padded = value.Replace('-', '+').Replace('_', '/');
            var mod = padded.Length % 4;
            if (mod == 2)
            {
                padded += "==";
            }
            else if (mod == 3)
            {
                padded += "=";
            }
            else if (mod != 0)
            {
                return false;
            }

            try
            {
                var bytes = Convert.FromBase64String(padded);
                decoded = Encoding.UTF8.GetString(bytes);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
        }
    }
}
