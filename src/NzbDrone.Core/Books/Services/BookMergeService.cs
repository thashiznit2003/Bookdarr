using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Core.Books.Events;
using NzbDrone.Core.Books.Repositories;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Books
{
    public interface IBookMergeService
    {
        Book MergeBooks(Book winner, Book loser);
    }

    public class BookMergeService : IBookMergeService
    {
        private readonly IBookService _bookService;
        private readonly IEditionService _editionService;
        private readonly ISeriesBookLinkService _seriesBookLinkService;
        private readonly IUserBookRepository _userBookRepository;
        private readonly IUserBookFileRepository _userBookFileRepository;
        private readonly IMediaFileService _mediaFileService;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        public BookMergeService(IBookService bookService,
                                IEditionService editionService,
                                ISeriesBookLinkService seriesBookLinkService,
                                IUserBookRepository userBookRepository,
                                IUserBookFileRepository userBookFileRepository,
                                IMediaFileService mediaFileService,
                                IEventAggregator eventAggregator,
                                Logger logger)
        {
            _bookService = bookService;
            _editionService = editionService;
            _seriesBookLinkService = seriesBookLinkService;
            _userBookRepository = userBookRepository;
            _userBookFileRepository = userBookFileRepository;
            _mediaFileService = mediaFileService;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public Book MergeBooks(Book winner, Book loser)
        {
            if (winner == null)
            {
                throw new ArgumentNullException(nameof(winner));
            }

            if (loser == null)
            {
                throw new ArgumentNullException(nameof(loser));
            }

            if (winner.Id == loser.Id)
            {
                throw new InvalidOperationException("Cannot merge a book into itself.");
            }

            _logger.Info("Merging book {0} into {1}", loser, winner);

            var winnerEditions = _editionService.GetEditionsByBook(winner.Id);
            var winnerHasMonitored = winnerEditions.Any(edition => edition.Monitored);
            var editionsToMove = _editionService.GetEditionsByBook(loser.Id);

            if (editionsToMove.Any())
            {
                if (winnerHasMonitored)
                {
                    foreach (var edition in editionsToMove)
                    {
                        edition.Monitored = false;
                    }
                }
                else
                {
                    var monitoredEdition = editionsToMove.FirstOrDefault(edition => edition.Monitored) ?? editionsToMove[0];
                    foreach (var edition in editionsToMove)
                    {
                        edition.Monitored = edition.Id == monitoredEdition.Id;
                    }
                }

                foreach (var edition in editionsToMove)
                {
                    edition.BookId = winner.Id;
                }

                _editionService.UpdateMany(editionsToMove);
            }

            var linksToMove = _seriesBookLinkService.GetLinksByBook(new List<int> { loser.Id });
            if (linksToMove.Any())
            {
                foreach (var link in linksToMove)
                {
                    link.BookId = winner.Id;
                }

                _seriesBookLinkService.UpdateMany(linksToMove);
            }

            MergeUserBooks(winner.Id, loser.Id);

            _bookService.DeleteBook(loser.Id, false, false);

            var updatedWinner = _bookService.GetBook(winner.Id);
            _eventAggregator.PublishEvent(new BookUpdatedEvent(updatedWinner));

            return updatedWinner;
        }

        private void MergeUserBooks(int winnerBookId, int loserBookId)
        {
            var loserUserBooks = _userBookRepository.GetByBook(loserBookId);
            if (!loserUserBooks.Any())
            {
                return;
            }

            var winnerFiles = _mediaFileService.GetFilesByBook(winnerBookId);

            foreach (var loserUserBook in loserUserBooks)
            {
                var winnerUserBook = _userBookRepository.GetByUserAndBook(loserUserBook.UserId, winnerBookId);

                if (winnerUserBook == null)
                {
                    loserUserBook.BookId = winnerBookId;
                    loserUserBook.Status = ResolveStatus(winnerFiles, loserUserBook.WantsEbook, loserUserBook.WantsAudiobook);
                    _userBookRepository.Update(loserUserBook);
                    continue;
                }

                winnerUserBook.WantsEbook = winnerUserBook.WantsEbook || loserUserBook.WantsEbook;
                winnerUserBook.WantsAudiobook = winnerUserBook.WantsAudiobook || loserUserBook.WantsAudiobook;
                winnerUserBook.SharedCopyClaimed = winnerUserBook.SharedCopyClaimed || loserUserBook.SharedCopyClaimed;
                winnerUserBook.Status = ResolveStatus(winnerFiles, winnerUserBook.WantsEbook, winnerUserBook.WantsAudiobook);

                _userBookRepository.Update(winnerUserBook);

                MoveUserBookFiles(loserUserBook.Id, winnerUserBook.Id);
                _userBookRepository.Delete(loserUserBook.Id);
            }
        }

        private void MoveUserBookFiles(int loserUserBookId, int winnerUserBookId)
        {
            var loserFiles = _userBookFileRepository.GetByUserBook(loserUserBookId);
            if (!loserFiles.Any())
            {
                return;
            }

            var winnerFiles = _userBookFileRepository.GetByUserBook(winnerUserBookId);
            var existingFileIds = new HashSet<int>(winnerFiles.Select(file => file.BookFileId));

            foreach (var file in loserFiles)
            {
                if (existingFileIds.Contains(file.BookFileId))
                {
                    _userBookFileRepository.Delete(file.Id);
                    continue;
                }

                file.UserBookId = winnerUserBookId;
                _userBookFileRepository.Update(file);
            }
        }

        private LibraryStatus ResolveStatus(List<BookFile> files, bool wantsEbook, bool wantsAudiobook)
        {
            var hasEbook = wantsEbook && files.Any(file => file.MediaType == BookFileMediaType.Ebook);
            var hasAudiobook = wantsAudiobook && files.Any(file => file.MediaType == BookFileMediaType.Audiobook);

            if (wantsEbook && wantsAudiobook)
            {
                return hasEbook && hasAudiobook ? LibraryStatus.Available : LibraryStatus.Pending;
            }

            if (wantsEbook)
            {
                return hasEbook ? LibraryStatus.Available : LibraryStatus.Pending;
            }

            if (wantsAudiobook)
            {
                return hasAudiobook ? LibraryStatus.Available : LibraryStatus.Pending;
            }

            return LibraryStatus.Pending;
        }
    }
}
