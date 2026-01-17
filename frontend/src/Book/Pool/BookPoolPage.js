import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component, useCallback } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import BookCover from 'Book/BookCover';
import BookTitleLink from 'Book/BookTitleLink';
import AddManualBookModal from 'Book/Index/ManualAdd/AddManualBookModal';
import IconButton from 'Components/Link/IconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import MenuContent from 'Components/Menu/MenuContent';
import SortMenu from 'Components/Menu/SortMenu';
import SortMenuItem from 'Components/Menu/SortMenuItem';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import Tooltip from 'Components/Tooltip/Tooltip';
import { align, icons, kinds, sortDirections } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import sortCollection from 'Utilities/Array/sortCollection';
import { executeCommand } from 'Store/Actions/commandActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import * as commandNames from 'Commands/commandNames';
import styles from './BookPoolPage.css';

const STATUS_LABELS = {
  pending: () => translate('BookPoolStatusPending'),
  available: () => translate('BookPoolStatusAvailable'),
  needsManual: () => translate('BookPoolStatusNeedsManual')
};

const FILTERS = [
  { key: 'all', label: () => translate('BookPoolFilterAll') },
  { key: 'available', label: () => translate('BookPoolFilterAvailable') },
  { key: 'needsManual', label: () => translate('BookPoolFilterNeedsManual') }
];

const SORT_OPTIONS = [
  { key: 'status', label: 'Status' },
  { key: 'title', label: 'Title' },
  { key: 'authorLastName', label: 'Author (Last Name)' },
  { key: 'releaseDate', label: 'Release Date' }
];

function stripBookTitle(authorText, title) {
  if (!authorText || !title) {
    return authorText;
  }

  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return authorText;
  }

  const normalizedAuthor = authorText.toLowerCase();
  const normalizedTitle = trimmedTitle.toLowerCase();

  if (normalizedAuthor.endsWith(normalizedTitle)) {
    return authorText.slice(0, authorText.length - trimmedTitle.length).trim();
  }

  return authorText;
}

function getAuthorDisplayName(book = {}) {
  const author = book.author;

  if (author?.authorName) {
    return author.authorName;
  }

  if (author?.authorNameLastFirst) {
    const [lastPart, firstPart] = author.authorNameLastFirst.split(',');

    if (firstPart) {
      return `${firstPart.trim()} ${lastPart.trim()}`.trim();
    }

    return lastPart?.trim() || author.authorNameLastFirst;
  }

  const authorTitle = stripBookTitle(book.authorTitle, book.title);

  if (authorTitle) {
    return authorTitle;
  }

  return book.authorTitle || '';
}

function formatAuthorName(value) {
  const trimmedValue = (value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  if (trimmedValue !== trimmedValue.toLowerCase()) {
    return trimmedValue;
  }

  return titleCase(trimmedValue);
}

function getAuthorLastNameValue(resource) {
  const author = resource?.book?.author;

  if (author?.authorNameLastFirst) {
    const [lastName] = author.authorNameLastFirst.split(',');

    if (lastName) {
      return lastName.trim().toLowerCase();
    }
  }

  if (author?.authorName) {
    const segments = author.authorName.trim().split(/\s+/);
    const lastSegment = segments.pop();

    if (lastSegment) {
      return lastSegment.toLowerCase();
    }
  }

  const authorTitle = stripBookTitle(resource?.book?.authorTitle, resource?.book?.title);

  if (authorTitle) {
    return authorTitle.toLowerCase();
  }

  return '';
}

const SORT_PREDICATES = {
  title: (resource) => (resource?.book?.title || '').toLowerCase(),
  status: (resource) => (resource?.status || '').toLowerCase(),
  authorLastName: getAuthorLastNameValue,
  releaseDate: (resource) => {
    const dateValue = resource?.book?.releaseDate;

    if (!dateValue) {
      return Number.MAX_SAFE_INTEGER;
    }

    const parsed = Date.parse(dateValue);

    if (Number.isNaN(parsed)) {
      return Number.MAX_SAFE_INTEGER;
    }

    return parsed;
  }
};

class BookPoolPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      books: [],
      isFetching: false,
      error: null,
      adding: {},
      libraryAdded: {},
      filterKey: 'all',
      sortKey: 'title',
      sortDirection: sortDirections.ASCENDING,
      isManualBookModalOpen: false,
      isConfirmSearchModalOpen: false
    };
    this.poolRefreshTimeout = null;
  }

  componentDidMount() {
    this.onFetchPool();
    if (typeof window !== 'undefined') {
      window.addEventListener('bookPoolResourceUpdated', this.onBookPoolResourceUpdated);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('bookPoolResourceUpdated', this.onBookPoolResourceUpdated);
    }

    if (this.poolRefreshTimeout) {
      window.clearTimeout(this.poolRefreshTimeout);
      this.poolRefreshTimeout = null;
    }
  }

  onBookPoolResourceUpdated = () => {
    if (this.poolRefreshTimeout) {
      window.clearTimeout(this.poolRefreshTimeout);
    }

    this.poolRefreshTimeout = window.setTimeout(() => {
      this.onFetchPool();
      this.poolRefreshTimeout = null;
    }, 800);
  };

  onFetchPool = () => {
    this.setState({ isFetching: true, error: null });

    const request = createAjaxRequest({
      url: '/user/library/pool',
      method: 'GET'
    });

    request.request.done((data) => {
      this.setState({ books: data || [], isFetching: false });
    });

    request.request.fail((xhr) => {
      this.setState({ error: xhr, isFetching: false });
    });
  };

  onManualBookModalOpen = () => {
    this.setState({ isManualBookModalOpen: true });
  };

  onManualBookModalClose = () => {
    this.setState({ isManualBookModalOpen: false });
  };

  onSearchPress = () => {
    this.setState({ isConfirmSearchModalOpen: true });
  };

  onSearchConfirmed = () => {
    const filteredBooks = this.getFilteredBooks();
    const bookIds = filteredBooks.map((resource) => resource.bookId).filter(Boolean);

    if (bookIds.length > 0) {
      this.props.onSearchBooks(bookIds);
    }

    this.setState({ isConfirmSearchModalOpen: false });
  };

  onRefreshPress = () => {
    if (this.props.onRefreshBooks) {
      this.props.onRefreshBooks([]);
    }

    this.onFetchPool();
  };

  onConfirmSearchModalClose = () => {
    this.setState({ isConfirmSearchModalOpen: false });
  };

  getFilteredBooks = () => {
    const { books, filterKey } = this.state;

    if (filterKey === 'all') {
      return books;
    }

    const normalizedFilter = (filterKey || '').toLowerCase();

    return books.filter((book) => {
      const status = (book.status || '').toLowerCase();
      return status === normalizedFilter;
    });
  };

  getSortedBooks = (books) => {
    const {
      sortKey,
      sortDirection
    } = this.state;

    if (!sortKey) {
      return books;
    }

    return sortCollection(books, {
      sortKey,
      sortDirection,
      sortPredicates: SORT_PREDICATES
    });
  };

  getStatusCounts = () => {
    const { books } = this.state;
    const counts = {
      all: 0,
      available: 0,
      needsmanual: 0,
      pending: 0
    };

    books.forEach((book) => {
      const status = (book.status || '').toLowerCase();
      counts.all += 1;

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  };

  setFilterKey = (filterKey) => {
    this.setState({ filterKey });
  };

  onFilterSelect = (filterKey) => {
    this.setFilterKey(filterKey);
  };

  onSortSelect = (sortKey) => {
    this.setState((prevState) => {
      const sameKey = prevState.sortKey === sortKey;
      const sortDirection = sameKey
        ? (prevState.sortDirection === sortDirections.ASCENDING
          ? sortDirections.DESCENDING
          : sortDirections.ASCENDING)
        : sortDirections.ASCENDING;

      return {
        sortKey,
        sortDirection
      };
    });
  };

  onAddToLibrary = (book) => {
    const { adding, books, libraryAdded } = this.state;

    this.setState({
      adding: { ...adding, [book.bookId]: true }
    });

    if (book.inMyLibrary) {
      const removeRequest = createAjaxRequest({
        url: `/user/library/${book.bookId}`,
        method: 'DELETE'
      });

      removeRequest.request.done(() => {
        const updatedBooks = books.map((item) => {
          if (item.bookId === book.bookId) {
            return {
              ...item,
              inMyLibrary: false,
              status: item.status,
              hasEbook: item.hasEbook,
              hasAudiobook: item.hasAudiobook
            };
          }

          return item;
        });

        const nextLibraryAdded = { ...libraryAdded };
        delete nextLibraryAdded[book.bookId];

        this.setState({
          books: updatedBooks,
          adding: { ...adding, [book.bookId]: false },
          libraryAdded: nextLibraryAdded
        });
      });

      removeRequest.request.fail(() => {
        this.setState({ adding: { ...adding, [book.bookId]: false } });
      });

      return;
    }

    const request = createAjaxRequest({
      url: '/user/library',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        bookId: book.bookId,
        wantsEbook: true,
        wantsAudiobook: true
      })
    });

    request.request.done((data) => {
      const updatedBooks = books.map((item) => {
        if (item.bookId === data.bookId) {
          return {
            ...item,
            inMyLibrary: true,
            status: data.status,
            hasEbook: data.hasEbook,
            hasAudiobook: data.hasAudiobook
          };
        }

        return item;
      });

      this.setState({ books: updatedBooks, adding: { ...adding, [book.bookId]: false } });

      const nextLibraryAdded = { ...libraryAdded, [book.bookId]: true };
      this.setState({ libraryAdded: nextLibraryAdded });

      window.setTimeout(() => {
        this.setState((currentState) => {
          const updatedFlag = { ...currentState.libraryAdded };
          delete updatedFlag[book.bookId];
          return { libraryAdded: updatedFlag };
        });
      }, 5000);
    });

    request.request.fail(() => {
      this.setState({ adding: { ...adding, [book.bookId]: false } });
    });
  };

  render() {
    const {
      books,
      isFetching,
      error,
      adding,
      libraryAdded,
      filterKey,
      sortKey,
      sortDirection,
      isManualBookModalOpen,
      isConfirmSearchModalOpen
    } = this.state;

    const {
      isRefreshingBook,
      isSearching
    } = this.props;

    const filteredBooks = this.getFilteredBooks();
    const sortedBooks = this.getSortedBooks(filteredBooks);
    const statusCounts = this.getStatusCounts();
    const filterOptions = FILTERS.map((filter) => {
      const normalizedKey = filter.key.toLowerCase();
      const count = statusCounts[normalizedKey] ?? 0;

      return {
        key: filter.key,
        label: () => `${filter.label()} (${count})`
      };
    });
    const emptyMessage = books.length === 0
      ? translate('BookPoolEmpty')
      : translate('BookPoolEmptyFilter');
    const searchWarningCount = filteredBooks.length;
    const searchDisabled = isSearching || !filteredBooks.length;

    return (
      <PageContent>
        <PageToolbar>
          <PageToolbarSection collapseButtons={false}>
            <PageToolbarButton
              label={translate('UpdateAll')}
              iconName={icons.REFRESH}
              isSpinning={isRefreshingBook}
              onPress={this.onRefreshPress}
            />

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('AddBookManually')}
              iconName={icons.ADD}
              onPress={this.onManualBookModalOpen}
            />

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('SearchAll')}
              iconName={icons.SEARCH}
              isDisabled={searchDisabled}
              isSpinning={isSearching}
              onPress={this.onSearchPress}
            />

          </PageToolbarSection>
        <PageToolbarSection
          alignContent={align.RIGHT}
          collapseButtons={false}
        >
          <SortMenu
            className={styles.sortMenu}
            isDisabled={isFetching}
          >
            <MenuContent>
              {SORT_OPTIONS.map((option) => (
                <SortMenuItem
                  key={option.key}
                  name={option.key}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onPress={this.onSortSelect}
                >
                  {option.label}
                </SortMenuItem>
              ))}
            </MenuContent>
          </SortMenu>

          <PageToolbarSeparator />

          <FilterMenu
            selectedFilterKey={filterKey}
            filters={filterOptions}
            customFilters={[]}
            isDisabled={isFetching}
            alignMenu={align.RIGHT}
            onFilterSelect={this.onFilterSelect}
            className={styles.filterMenu}
          />
          </PageToolbarSection>
        </PageToolbar>
        <PageContentBody noPadding={true}>
          {isFetching && <LoadingIndicator />}
          {error && (
            <div className={styles.error}>
              {getErrorMessage(error, translate('UnableToLoadBookPool'))}
            </div>
          )}
          {!isFetching && !error && (
            <>
              {filteredBooks.length > 0 ? (
                <div className={styles.grid}>
                  {sortedBooks.map((item) => {
                    const decoratedResource = {
                      ...item,
                      libraryAdded: Boolean(libraryAdded[item.bookId])
                    };

                    return (
                    <BookPoolPoster
                      key={item.bookId}
                      resource={decoratedResource}
                      onAdd={this.onAddToLibrary}
                      isAdding={adding[item.bookId]}
                    />
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>{emptyMessage}</div>
              )}
            </>
          )}
        </PageContentBody>
        <AddManualBookModal
          isOpen={isManualBookModalOpen}
          onModalClose={this.onManualBookModalClose}
        />

        <ConfirmModal
          isOpen={isConfirmSearchModalOpen}
          kind={kinds.DANGER}
          title={translate('MassBookSearch')}
          message={
            <div>
              <div>
                {translate('MassBookSearchWarning', [searchWarningCount])}
              </div>
              <div>
                {translate('ThisCannotBeCancelled')}
              </div>
            </div>
          }
          confirmLabel={translate('Search')}
          onConfirm={this.onSearchConfirmed}
          onCancel={this.onConfirmSearchModalClose}
        />
      </PageContent>
    );
  }
}

function BookPoolPoster({
  resource,
  onAdd,
  isAdding
}) {
  const {
    book,
    hasEbook,
    hasAudiobook,
    inMyLibrary,
    needsAttention,
    libraryAdded
  } = resource;

  const onAddPress = useCallback(() => {
    if (typeof onAdd === 'function') {
      onAdd(resource);
    }
  }, [onAdd, resource]);

  const authorName = formatAuthorName(getAuthorDisplayName(book));

  return (
    <div className={classNames(styles.posterCard, needsAttention && styles.posterAttention)}>
      <div className={styles.posterWrapper}>
        <BookCover
          size={162}
          images={book.images || []}
          className={styles.posterImage}
          lazy={false}
        />
        <Tooltip content={translate(inMyLibrary ? 'RemoveFromMyLibrary' : 'AddToMyLibrary')}>
          <IconButton
            className={classNames(styles.addButton, inMyLibrary && styles.removeButton)}
            name={inMyLibrary ? icons.REMOVE : icons.ADD}
            onPress={onAddPress}
            isDisabled={isAdding}
            isSpinning={isAdding}
          />
        </Tooltip>
        <div className={styles.posterOverlay}>
          <div className={styles.posterOverlayContent}>
            <div className={styles.posterTitle}>
              <BookTitleLink
                title={book.title}
                titleSlug={book.titleSlug}
                disambiguation={book.disambiguation}
              />
            </div>
            {authorName && (
              <div className={styles.posterAuthor}>{authorName}</div>
            )}
          </div>
          <div className={styles.posterStatusRow}>
            <span
              className={classNames(
                styles.posterTypeBadge,
                hasEbook ? styles.posterTypeReady : styles.posterTypeMissing
              )}
              title={`eBook ${hasEbook ? translate('Yes') : translate('No')}`}
            >
              eBook
            </span>
            <span
              className={classNames(
                styles.posterTypeBadge,
                hasAudiobook ? styles.posterTypeReady : styles.posterTypeMissing
              )}
              title={`Audiobook ${hasAudiobook ? translate('Yes') : translate('No')}`}
            >
              Audiobook
            </span>
            {libraryAdded && (
              <span className={styles.libraryBadge}>
                {translate('InMyLibrary')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

BookPoolPoster.propTypes = {
  resource: PropTypes.shape({
    book: PropTypes.shape({
      images: PropTypes.arrayOf(PropTypes.object),
      title: PropTypes.string,
      titleSlug: PropTypes.string,
      disambiguation: PropTypes.string,
      authorTitle: PropTypes.string,
      author: PropTypes.shape({
        authorName: PropTypes.string,
        authorNameLastFirst: PropTypes.string
      })
    }).isRequired,
    hasEbook: PropTypes.bool,
    hasAudiobook: PropTypes.bool,
    inMyLibrary: PropTypes.bool,
    needsAttention: PropTypes.bool,
    libraryAdded: PropTypes.bool
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
  isAdding: PropTypes.bool,
};

BookPoolPage.propTypes = {
  isRefreshingBook: PropTypes.bool.isRequired,
  isSearching: PropTypes.bool.isRequired,
  onRefreshBooks: PropTypes.func.isRequired,
  onSearchBooks: PropTypes.func.isRequired
};

function createMapStateToProps() {
  return createSelector(
    createCommandExecutingSelector(commandNames.BULK_REFRESH_AUTHOR),
    createCommandExecutingSelector(commandNames.BULK_REFRESH_BOOK),
    createCommandExecutingSelector(commandNames.CUTOFF_UNMET_BOOK_SEARCH),
    createCommandExecutingSelector(commandNames.MISSING_BOOK_SEARCH),
    (
      isRefreshingAuthorCommand,
      isRefreshingBookCommand,
      isCutoffBooksSearch,
      isMissingBooksSearch
    ) => {
      const isRefreshingBook = isRefreshingBookCommand || isRefreshingAuthorCommand;
      const isSearching = isCutoffBooksSearch || isMissingBooksSearch;

      return {
        isRefreshingBook,
        isSearching
      };
    }
  );
}

function createMapDispatchToProps(dispatch) {
  return {
    onRefreshBooks(bookIds = []) {
      dispatch(executeCommand({
        name: commandNames.BULK_REFRESH_BOOK,
        bookIds
      }));
    },

    onSearchBooks(bookIds) {
      dispatch(executeCommand({
        name: commandNames.BOOK_SEARCH,
        bookIds
      }));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(BookPoolPage);
