import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import AuthorIndexFooter from 'Author/Index/AuthorIndexFooter';

function createUnoptimizedSelector() {
  return createSelector(
    createClientSideCollectionSelector('bookPoolAuthors', 'authorIndex'),
    (authors) => {
      return authors.items.map((author) => {
        const {
          monitored,
          status,
          statistics
        } = author;

        return {
          monitored,
          status,
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
