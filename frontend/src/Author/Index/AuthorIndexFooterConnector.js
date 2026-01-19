import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import buildLibraryAuthorStats from 'Utilities/Author/buildLibraryAuthorStats';
import AuthorIndexFooter from './AuthorIndexFooter';

function createUnoptimizedSelector() {
  return createSelector(
    createClientSideCollectionSelector('authors', 'authorIndex'),
    (state) => state.books.items,
    (authors, books) => {
      const statsByAuthor = buildLibraryAuthorStats(books);
      const authorIds = new Set(
        books.filter((book) => book.inMyLibrary).map((book) => book.authorId)
      );

      return authors.items
        .filter((author) => authorIds.has(author.id))
        .map((author) => {
          const statistics = statsByAuthor[author.id]
            ? { ...author.statistics, ...statsByAuthor[author.id] }
            : author.statistics;

          return {
            monitored: author.monitored,
            status: author.status,
            statistics
          };
        });
    }
  );
}

function createAuthorSelector() {
  return createDeepEqualSelector(
    createUnoptimizedSelector(),
    (author) => author
  );
}

function createMapStateToProps() {
  return createSelector(
    createAuthorSelector(),
    (author) => {
      return {
        author
      };
    }
  );
}

export default connect(createMapStateToProps)(AuthorIndexFooter);
