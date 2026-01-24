using System;
using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Authentication;
using NzbDrone.Core.AuthorStats;
using NzbDrone.Core.Books;
using NzbDrone.Core.Books.Commands;
using NzbDrone.Core.Books.Events;
using NzbDrone.Core.Books.Services;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.RootFolders;
using NzbDrone.Core.Validation;
using NzbDrone.Core.Validation.Paths;
using NzbDrone.Http.REST.Attributes;
using NzbDrone.SignalR;
using Readarr.Http;
using Readarr.Http.REST;

namespace Readarr.Api.V1.Author
{
    [V1ApiController]
    public class AuthorController : RestControllerWithSignalR<AuthorResource, NzbDrone.Core.Books.Author>,
                                IHandle<BookImportedEvent>,
                                IHandle<BookEditedEvent>,
                                IHandle<BookFileDeletedEvent>,
                                IHandle<AuthorAddedEvent>,
                                IHandle<AuthorUpdatedEvent>,
                                IHandle<AuthorEditedEvent>,
                                IHandle<AuthorDeletedEvent>,
                                IHandle<AuthorRenamedEvent>,
                                IHandle<MediaCoversUpdatedEvent>
    {
        private readonly IAuthorService _authorService;
        private readonly IBookService _bookService;
        private readonly IAddAuthorService _addAuthorService;
        private readonly IAuthorStatisticsService _authorStatisticsService;
        private readonly IAuthorExtraMetadataProvider _authorExtraMetadataProvider;
        private readonly IAuthorMergeService _authorMergeService;
        private readonly IAuthorMetadataService _authorMetadataService;
        private readonly IMapCoversToLocal _coverMapper;
        private readonly IManageCommandQueue _commandQueueManager;
        private readonly IRootFolderService _rootFolderService;
        private readonly IUserService _userService;
        private readonly IUserLibraryService _userLibraryService;
        private readonly IUserAuthorService _userAuthorService;

        public AuthorController(IBroadcastSignalRMessage signalRBroadcaster,
                            IAuthorService authorService,
                            IBookService bookService,
                            IAddAuthorService addAuthorService,
                            IAuthorStatisticsService authorStatisticsService,
                            IAuthorExtraMetadataProvider authorExtraMetadataProvider,
                            IAuthorMergeService authorMergeService,
                            IAuthorMetadataService authorMetadataService,
                            IMapCoversToLocal coverMapper,
                            IManageCommandQueue commandQueueManager,
                            IRootFolderService rootFolderService,
                            IUserService userService,
                            IUserLibraryService userLibraryService,
                            IUserAuthorService userAuthorService,
                            RecycleBinValidator<AuthorResource> recycleBinValidator,
                            RootFolderValidator<AuthorResource> rootFolderValidator,
                            AuthorPathValidator<AuthorResource> authorPathValidator,
                            AuthorExistsValidator<AuthorResource> authorExistsValidator,
                            AuthorAncestorValidator<AuthorResource> authorAncestorValidator,
                            SystemFolderValidator<AuthorResource> systemFolderValidator,
                            QualityProfileExistsValidator<AuthorResource> qualityProfileExistsValidator,
                            MetadataProfileExistsValidator<AuthorResource> metadataProfileExistsValidator,
                            AuthorFolderAsRootFolderValidator<AuthorResource> authorFolderAsRootFolderValidator)
            : base(signalRBroadcaster)
        {
            _authorService = authorService;
            _bookService = bookService;
            _addAuthorService = addAuthorService;
            _authorStatisticsService = authorStatisticsService;
            _authorExtraMetadataProvider = authorExtraMetadataProvider;
            _authorMergeService = authorMergeService;
            _authorMetadataService = authorMetadataService;

            _coverMapper = coverMapper;
            _commandQueueManager = commandQueueManager;
            _rootFolderService = rootFolderService;
            _userService = userService;
            _userLibraryService = userLibraryService;
            _userAuthorService = userAuthorService;

            Http.Validation.RuleBuilderExtensions.ValidId(SharedValidator.RuleFor(s => s.QualityProfileId));
            Http.Validation.RuleBuilderExtensions.ValidId(SharedValidator.RuleFor(s => s.MetadataProfileId));

            SharedValidator.RuleFor(s => s.Path)
                           .Cascade(CascadeMode.Stop)
                           .IsValidPath()
                           .SetValidator(rootFolderValidator)
                           .SetValidator(authorPathValidator)
                           .SetValidator(authorAncestorValidator)
                           .SetValidator(recycleBinValidator)
                           .SetValidator(systemFolderValidator)
                           .When(s => !s.Path.IsNullOrWhiteSpace());

            SharedValidator.RuleFor(s => s.QualityProfileId).SetValidator(qualityProfileExistsValidator);
            SharedValidator.RuleFor(s => s.MetadataProfileId).SetValidator(metadataProfileExistsValidator);

            PostValidator.RuleFor(s => s.Path).IsValidPath().When(s => s.RootFolderPath.IsNullOrWhiteSpace());
            PostValidator.RuleFor(s => s.RootFolderPath)
                         .IsValidPath()
                         .SetValidator(authorFolderAsRootFolderValidator)
                         .When(s => s.Path.IsNullOrWhiteSpace());
            PostValidator.RuleFor(s => s.AuthorName).NotEmpty();
            PostValidator.RuleFor(s => s.ForeignAuthorId).NotEmpty().SetValidator(authorExistsValidator);

            PutValidator.RuleFor(s => s.Path).IsValidPath();
        }

        protected override AuthorResource GetResourceById(int id)
        {
            var author = _authorService.GetAuthor(id);
            return GetAuthorResource(author);
        }

        private AuthorResource GetAuthorResource(NzbDrone.Core.Books.Author author)
        {
            if (author == null)
            {
                return null;
            }

            EnsureAuthorExtras(author);

            var resource = author.ToResource();
            MapCoversToLocal(resource);
            FetchAndLinkAuthorStatistics(resource);
            LinkNextPreviousBooks(resource);

            LinkRootFolderPath(resource);
            ApplyUserLibraryInfo(resource);

            return resource;
        }

        [HttpGet]
        public List<AuthorResource> AllAuthors()
        {
            var userLibraryInfo = BuildUserAuthorInfo();
            var authorStats = _authorStatisticsService.AuthorStatistics();
            var authors = _authorService.GetAllAuthors();
            foreach (var author in authors)
            {
                EnsureAuthorExtras(author);
            }

            var authorResources = authors.ToResource();

            MapCoversToLocal(authorResources.ToArray());
            LinkNextPreviousBooks(authorResources.ToArray());
            LinkAuthorStatistics(authorResources, authorStats.ToDictionary(x => x.AuthorId));
            LinkRootFolderPath(authorResources.ToArray());
            ApplyUserLibraryInfo(authorResources, userLibraryInfo);

            return authorResources;
        }

        [RestPostById]
        public ActionResult<AuthorResource> AddAuthor(AuthorResource authorResource)
        {
            var author = _addAuthorService.AddAuthor(authorResource.ToModel(), authorResource.DoRefresh ?? true);
            var user = GetCurrentUser();
            _userAuthorService.AddOrGetUserAuthor(user.Id, author.Id);

            return Created(author.Id);
        }

        private class RatingAccumulator
        {
            public decimal Sum { get; set; }
            public int Count { get; set; }
        }

        private class UserAuthorInfo
        {
            public HashSet<int> AuthorIds { get; } = new HashSet<int>();
            public Dictionary<int, RatingAccumulator> UserRatings { get; } = new Dictionary<int, RatingAccumulator>();
            public Dictionary<int, RatingAccumulator> OpenLibraryRatings { get; } = new Dictionary<int, RatingAccumulator>();
        }

        private UserAuthorInfo BuildUserAuthorInfo()
        {
            var user = GetCurrentUser();
            var info = new UserAuthorInfo();
            var userAuthors = _userAuthorService.GetByUser(user.Id);

            foreach (var userAuthor in userAuthors.Where(x => !x.IsDeleted))
            {
                info.AuthorIds.Add(userAuthor.AuthorId);
            }

            var userBooks = _userLibraryService.GetUserLibrary(user.Id);
            if (!userBooks.Any())
            {
                return info;
            }

            var bookIds = userBooks.Select(x => x.BookId).Distinct().ToList();
            var books = _bookService.GetBooks(bookIds, allowMissing: true);
            var bookById = books.ToDictionary(x => x.Id);

            foreach (var userBook in userBooks)
            {
                if (!bookById.TryGetValue(userBook.BookId, out var book))
                {
                    continue;
                }

                var authorId = book.AuthorId;
                info.AuthorIds.Add(authorId);

                if (userBook.UserRating.HasValue && userBook.UserRating.Value > 0)
                {
                    AddRating(info.UserRatings, authorId, userBook.UserRating.Value);
                }

                if (book.Ratings?.Value > 0)
                {
                    AddRating(info.OpenLibraryRatings, authorId, book.Ratings.Value);
                }
            }

            return info;
        }

        private void ApplyUserLibraryInfo(AuthorResource resource)
        {
            var info = BuildUserAuthorInfo();
            ApplyUserLibraryInfo(new[] { resource }, info);
        }

        private void ApplyUserLibraryInfo(IEnumerable<AuthorResource> resources, UserAuthorInfo info)
        {
            foreach (var resource in resources)
            {
                if (resource == null)
                {
                    continue;
                }

                resource.InMyLibrary = info.AuthorIds.Contains(resource.Id);

                if (info.UserRatings.TryGetValue(resource.Id, out var userRatings))
                {
                    resource.UserAverageRating = userRatings.Sum / userRatings.Count;
                    resource.UserRatedBookCount = userRatings.Count;
                }

                if (info.OpenLibraryRatings.TryGetValue(resource.Id, out var openRatings))
                {
                    resource.OpenLibraryAverageRating = openRatings.Sum / openRatings.Count;
                    resource.OpenLibraryRatedBookCount = openRatings.Count;
                }
            }
        }

        private void AddRating(Dictionary<int, RatingAccumulator> ratings, int authorId, decimal value)
        {
            if (!ratings.TryGetValue(authorId, out var accumulator))
            {
                accumulator = new RatingAccumulator();
                ratings[authorId] = accumulator;
            }

            accumulator.Sum += value;
            accumulator.Count += 1;
        }

        [RestPutById]
        public ActionResult<AuthorResource> UpdateAuthor(AuthorResource authorResource, bool moveFiles = false)
        {
            var author = _authorService.GetAuthor(authorResource.Id);

            if (moveFiles)
            {
                var sourcePath = author.Path;
                var destinationPath = authorResource.Path;

                _commandQueueManager.Push(new MoveAuthorCommand
                {
                    AuthorId = author.Id,
                    SourcePath = sourcePath,
                    DestinationPath = destinationPath,
                    Trigger = CommandTrigger.Manual
                });
            }

            var model = authorResource.ToModel(author);

            _authorService.UpdateAuthor(model);

            BroadcastResourceChange(ModelAction.Updated, authorResource);

            return Accepted(authorResource.Id);
        }

        [RestDeleteById]
        public IActionResult DeleteAuthor(int id, bool deleteFiles = false, bool addImportListExclusion = false)
        {
            var currentUser = GetCurrentUser();
            if (!currentUser.IsAdmin)
            {
                return Forbid();
            }

            _authorService.DeleteAuthor(id, deleteFiles, addImportListExclusion);

            return NoContent();
        }

        private User GetCurrentUser()
        {
            var user = _userService.FindUser(HttpContext?.User);

            if (user == null)
            {
                throw new UnauthorizedException("User is not authenticated.");
            }

            return user;
        }

        [HttpPost("{id:int}/refresh-image")]
        public ActionResult<AuthorResource> RefreshAuthorImage(int id)
        {
            var author = _authorService.GetAuthor(id);
            if (author == null)
            {
                return NotFound();
            }

            var metadata = author.Metadata.Value;
            metadata.Images ??= new List<MediaCover>();
            metadata.Links ??= new List<Links>();

            var extras = _authorExtraMetadataProvider.RefreshAuthorExtraMetadata(metadata.Name);
            var updated = false;

            if (extras?.ImageUrl.IsNotNullOrWhiteSpace() == true)
            {
                metadata.Images.RemoveAll(x => x.CoverType == MediaCoverTypes.Poster);
                metadata.Images.Add(new MediaCover
                {
                    Url = extras.ImageUrl,
                    CoverType = MediaCoverTypes.Poster
                });
                updated = true;
            }

            if (extras?.Links != null)
            {
                foreach (var link in extras.Links)
                {
                    if (link?.Url.IsNullOrWhiteSpace() ?? true)
                    {
                        continue;
                    }

                    if (metadata.Links.Any(x => x.Url.Equals(link.Url, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    metadata.Links.Add(link);
                    updated = true;
                }
            }

            if (updated)
            {
                _authorMetadataService.Upsert(metadata);
            }

            author = _authorService.GetAuthor(id);
            return GetAuthorResource(author);
        }

        [HttpPost("merge")]
        public ActionResult<AuthorResource> MergeAuthors([FromBody] MergeAuthorsResource resource)
        {
            // lgtm [cs/user-controlled-bypass] API controller enforces auth; null guard isn't an auth bypass.
            if (resource == null)
            {
                return BadRequest();
            }

            if (resource.WinnerAuthorId == resource.LoserAuthorId)
            {
                return BadRequest("WinnerAuthorId and LoserAuthorId must be different.");
            }

            var winner = _authorService.GetAuthor(resource.WinnerAuthorId);
            var loser = _authorService.GetAuthor(resource.LoserAuthorId);

            var merged = _authorMergeService.MergeAuthors(winner, loser, resource.MoveFiles);

            return GetAuthorResource(merged);
        }

        private void MapCoversToLocal(params AuthorResource[] authors)
        {
            foreach (var authorResource in authors)
            {
                _coverMapper.ConvertToLocalUrls(authorResource.Id, MediaCoverEntity.Author, authorResource.Images);
            }
        }

        private void EnsureAuthorExtras(NzbDrone.Core.Books.Author author)
        {
            var metadata = author?.Metadata?.Value;
            if (metadata == null)
            {
                return;
            }

            metadata.Images ??= new List<MediaCover>();
            metadata.Links ??= new List<Links>();

            var hasPoster = metadata.Images.Any(x => x.CoverType == MediaCoverTypes.Poster && x.Url.IsNotNullOrWhiteSpace());
            var needsOverview = metadata.Overview.IsNullOrWhiteSpace();
            var hasWikipediaLink = metadata.Links.Any(x =>
                x.Url.IsNotNullOrWhiteSpace() &&
                x.Url.Contains("wikipedia.org", StringComparison.OrdinalIgnoreCase));

            if (hasPoster && !needsOverview && hasWikipediaLink)
            {
                return;
            }

            var extras = _authorExtraMetadataProvider.GetAuthorExtraMetadata(metadata.Name);
            if (extras == null)
            {
                return;
            }

            var changed = false;

            if (!hasPoster && extras.ImageUrl.IsNotNullOrWhiteSpace())
            {
                metadata.Images.Add(new MediaCover
                {
                    Url = extras.ImageUrl,
                    CoverType = MediaCoverTypes.Poster
                });
                changed = true;
            }

            if (needsOverview && extras.Overview.IsNotNullOrWhiteSpace())
            {
                metadata.Overview = extras.Overview;
                changed = true;
            }

            if (extras.Links != null)
            {
                foreach (var link in extras.Links)
                {
                    if (link?.Url.IsNullOrWhiteSpace() ?? true)
                    {
                        continue;
                    }

                    if (metadata.Links.Any(x => x.Url.Equals(link.Url, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    metadata.Links.Add(link);
                    changed = true;
                }
            }

            if (changed)
            {
                _authorMetadataService.Upsert(metadata);
            }
        }

        private void LinkNextPreviousBooks(params AuthorResource[] authors)
        {
            var nextBooks = _bookService.GetNextBooksByAuthorMetadataId(authors.Select(x => x.AuthorMetadataId));
            var lastBooks = _bookService.GetLastBooksByAuthorMetadataId(authors.Select(x => x.AuthorMetadataId));

            foreach (var authorResource in authors)
            {
                authorResource.NextBook = nextBooks.FirstOrDefault(x => x.AuthorMetadataId == authorResource.AuthorMetadataId);
                authorResource.LastBook = lastBooks.FirstOrDefault(x => x.AuthorMetadataId == authorResource.AuthorMetadataId);
            }
        }

        private void FetchAndLinkAuthorStatistics(AuthorResource resource)
        {
            LinkAuthorStatistics(resource, _authorStatisticsService.AuthorStatistics(resource.Id));
        }

        private void LinkAuthorStatistics(List<AuthorResource> resources, Dictionary<int, AuthorStatistics> authorStatistics)
        {
            foreach (var author in resources)
            {
                if (authorStatistics.TryGetValue(author.Id, out var stats))
                {
                    LinkAuthorStatistics(author, stats);
                }
            }
        }

        private void LinkAuthorStatistics(AuthorResource resource, AuthorStatistics authorStatistics)
        {
            resource.Statistics = authorStatistics.ToResource();
        }

        private void LinkRootFolderPath(params AuthorResource[] authors)
        {
            var rootFolders = _rootFolderService.All();

            foreach (var author in authors)
            {
                author.RootFolderPath = _rootFolderService.GetBestRootFolderPath(author.Path, rootFolders);
            }
        }

        [NonAction]
        public void Handle(BookImportedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.Author));
        }

        [NonAction]
        public void Handle(BookEditedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.Book.Author.Value));
        }

        [NonAction]
        public void Handle(BookFileDeletedEvent message)
        {
            if (message.Reason == DeleteMediaFileReason.Upgrade)
            {
                return;
            }

            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.BookFile.Author.Value));
        }

        [NonAction]
        public void Handle(AuthorAddedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.Author));
        }

        [NonAction]
        public void Handle(AuthorUpdatedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.Author));
        }

        [NonAction]
        public void Handle(AuthorEditedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.Author));
        }

        [NonAction]
        public void Handle(AuthorDeletedEvent message)
        {
            BroadcastResourceChange(ModelAction.Deleted, message.Author.ToResource());
        }

        [NonAction]
        public void Handle(AuthorRenamedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, message.Author.Id);
        }

        [NonAction]
        public void Handle(MediaCoversUpdatedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, GetAuthorResource(message.Author));
        }
    }
}
