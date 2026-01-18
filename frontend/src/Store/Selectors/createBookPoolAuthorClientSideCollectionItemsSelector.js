import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import createClientSideCollectionSelector from './createClientSideCollectionSelector';

function createUnoptimizedSelector(uiSection) {
  return createSelector(
    createClientSideCollectionSelector('bookPoolAuthors', uiSection),
    (authors) => {
      const filteredItems = authors.items.map((author) => {
        const {
          id,
          authorName,
          authorNameLastFirst,
          sortName,
          sortNameLastFirst
        } = author;

        return {
          id,
          authorName,
          authorNameLastFirst,
          sortName,
          sortNameLastFirst
        };
      });

      return {
        ...authors,
        items: filteredItems
      };
    }
  );
}

function authorListEqual(a, b) {
  return hasDifferentItemsOrOrder(a, b);
}

const createAuthorEqualSelector = createSelectorCreator(
  defaultMemoize,
  authorListEqual
);

function createBookPoolAuthorClientSideCollectionItemsSelector(uiSection) {
  return createAuthorEqualSelector(
    createUnoptimizedSelector(uiSection),
    (author) => author
  );
}

export default createBookPoolAuthorClientSideCollectionItemsSelector;
