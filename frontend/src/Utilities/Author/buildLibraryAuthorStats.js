function buildLibraryAuthorStats(books) {
  const statsByAuthor = {};

  if (!Array.isArray(books)) {
    return statsByAuthor;
  }

  books.forEach((book) => {
    if (!book?.inMyLibrary) {
      return;
    }

    const authorId = book.authorId;
    if (!authorId) {
      return;
    }

    const existing = statsByAuthor[authorId] || {
      bookCount: 0,
      bookFileCount: 0,
      availableBookCount: 0,
      totalBookCount: 0,
      sizeOnDisk: 0
    };

    const bookStats = book.statistics || {};
    const fileCount = bookStats.bookFileCount ?? 0;
    const sizeOnDisk = bookStats.sizeOnDisk ?? 0;

    existing.bookCount += 1;
    existing.totalBookCount += 1;
    existing.bookFileCount += fileCount;
    existing.sizeOnDisk += sizeOnDisk;

    if (fileCount > 0) {
      existing.availableBookCount += 1;
    }

    statsByAuthor[authorId] = existing;
  });

  return statsByAuthor;
}

export default buildLibraryAuthorStats;
