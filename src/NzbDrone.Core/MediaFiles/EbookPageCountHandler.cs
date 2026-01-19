using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Core.Books;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.MediaFiles
{
    public class EbookPageCountHandler : IHandle<BookImportedEvent>
    {
        private readonly IEbookPageCountService _pageCountService;
        private readonly IEditionRepository _editionRepository;
        private readonly Logger _logger;

        public EbookPageCountHandler(IEbookPageCountService pageCountService,
                                     IEditionRepository editionRepository,
                                     Logger logger)
        {
            _pageCountService = pageCountService;
            _editionRepository = editionRepository;
            _logger = logger;
        }

        public void Handle(BookImportedEvent message)
        {
            var importedBooks = message?.ImportedBooks ?? new List<BookFile>();
            if (!importedBooks.Any())
            {
                return;
            }

            foreach (var bookFile in importedBooks)
            {
                if (bookFile == null || bookFile.EditionId <= 0)
                {
                    continue;
                }

                var mediaType = bookFile.MediaType != BookFileMediaType.Unknown
                    ? bookFile.MediaType
                    : MediaFileExtensions.GetMediaTypeForPath(bookFile.Path);

                if (mediaType != BookFileMediaType.Ebook)
                {
                    continue;
                }

                var edition = _editionRepository.Get(bookFile.EditionId);
                if (edition == null || edition.PageCount > 0)
                {
                    continue;
                }

                var pageCount = _pageCountService.GetPageCount(bookFile);
                if (!pageCount.HasValue || pageCount.Value <= 0)
                {
                    continue;
                }

                edition.PageCount = pageCount.Value;
                _editionRepository.Update(edition);
                _logger.Info("Set ebook page count for edition {0} to {1}", edition.Id, edition.PageCount);
            }
        }
    }
}
