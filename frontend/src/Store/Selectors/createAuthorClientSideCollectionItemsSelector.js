import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import createClientSideCollectionSelector from './createClientSideCollectionSelector';

function createUnoptimizedSelector(uiSection) {
  return createSelector(
    createClientSideCollectionSelector('authors', uiSection),
    (state) => (state.books?.items || []).filter((b) => b.inMyLibrary),
    (authors, books) => {
      const hasLibraryFlag = authors.items.some((item) => item.inMyLibrary !== undefined);
      const authorIds = new Set(books.map((b) => b.authorId));

      const filteredItems = authors.items
        .filter((item) => {
          if (hasLibraryFlag) {
            return item.inMyLibrary;
          }

          return authorIds.has(item.id);
        })
        .map((item) => {
          const {
            id,
            authorName,
            authorNameLastFirst,
            sortName,
            sortNameLastFirst
          } = item;

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

function createAuthorClientSideCollectionItemsSelector(uiSection) {
  return createAuthorEqualSelector(
    createUnoptimizedSelector(uiSection),
    (author) => author
  );
}

export default createAuthorClientSideCollectionItemsSelector;
