import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import IconButton from 'Components/Link/IconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import { icons } from 'Helpers/Props';
import BookCover from 'Book/BookCover';
import BookTitleLink from 'Book/BookTitleLink';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
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

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

export default class BookPoolPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      books: [],
      isFetching: false,
      error: null,
      adding: {},
      filterKey: 'all',
      page: 0,
      pageSize: PAGE_SIZE_OPTIONS[0]
    };
  }

  componentDidMount() {
    this.fetchPool();
  }

  fetchPool = () => {
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

  getFilteredBooks = () => {
    return this.calculateFilteredBooks(this.state.books, this.state.filterKey);
  };

  calculateFilteredBooks = (books, filterKey) => {
    if (filterKey === 'all') {
      return books;
    }

    const normalizedFilter = (filterKey || '').toLowerCase();

    return books.filter((book) => {
      const status = (book.status || '').toLowerCase();
      return status === normalizedFilter;
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

  getPageCount = (total) => {
    const { pageSize } = this.state;
    const rawCount = Math.ceil(total / pageSize);
    return Math.max(1, rawCount);
  };

  getVisibleBooks = (filteredBooks, currentPage) => {
    const { pageSize } = this.state;
    const start = currentPage * pageSize;
    const end = start + pageSize;

    if (filteredBooks.length === 0) {
      return [];
    }

    return filteredBooks.slice(start, end);
  };

  setFilterKey = (filterKey) => {
    this.setState({ filterKey, page: 0 });
  };

  onAddToLibrary = (book) => {
    const { adding, books } = this.state;

    this.setState({
      adding: { ...adding, [book.bookId]: true }
    });

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
    });

    request.request.fail(() => {
      this.setState({ adding: { ...adding, [book.bookId]: false } });
    });
  };

  handlePrevPage = () => {
    const filteredBooks = this.getFilteredBooks();
    const pageCount = this.getPageCount(filteredBooks.length);
    this.setState(({ page }) => ({
      page: Math.max(0, Math.min(pageCount - 1, page - 1))
    }));
  };

  handleNextPage = () => {
    const filteredBooks = this.getFilteredBooks();
    const pageCount = this.getPageCount(filteredBooks.length);
    this.setState(({ page }) => ({
      page: Math.min(pageCount - 1, page + 1)
    }));
  };

  handlePageSizeChange = (event) => {
    const pageSize = parseInt(event.target.value, 10) || PAGE_SIZE_OPTIONS[0];
    this.setState({ pageSize, page: 0 });
  };

  renderFilterButtons = (counts, filterKey) => (
    FILTERS.map((filter) => {
      const normalizedKey = filter.key.toLowerCase();
      const count = counts[normalizedKey] ?? 0;

      return (
        <button
          key={filter.key}
          type="button"
          className={classNames(styles.filterButton, filterKey === filter.key && styles.filterButtonActive)}
          onClick={() => this.setFilterKey(filter.key)}
        >
          {filter.label()} ({count})
        </button>
      );
    })
  );

  renderPagination(filteredBooks, pageCount, currentPage) {
    const { pageSize } = this.state;

    if (filteredBooks.length === 0) {
      return null;
    }

    const total = filteredBooks.length;
    const start = currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, total);

    return (
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          {translate('BookPoolPaginationInfo', { start, end, total })}
        </div>
        <div className={styles.paginationControls}>
          <button
            type="button"
            className={styles.paginationButton}
            onClick={this.handlePrevPage}
            disabled={currentPage === 0}
          >
            {translate('BookPoolPaginationPrev')}
          </button>
          <span className={styles.paginationPage}>
            {translate('BookPoolPage', { current: currentPage + 1, total: pageCount })}
          </span>
          <button
            type="button"
            className={styles.paginationButton}
            onClick={this.handleNextPage}
            disabled={currentPage >= pageCount - 1}
          >
            {translate('BookPoolPaginationNext')}
          </button>
        </div>
        <div className={styles.paginationPageSize}>
          <label htmlFor="book-pool-page-size">{translate('BookPoolPageSize')}</label>
          <select
            id="book-pool-page-size"
            value={pageSize}
            onChange={this.handlePageSizeChange}
            className={styles.pageSizeSelect}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  renderStatus(resource) {
    const { status, needsAttention } = resource;
    const normalizedStatus = (status || '').toLowerCase();
    const label = STATUS_LABELS[normalizedStatus] ? STATUS_LABELS[normalizedStatus]() : translate('BookPoolStatusPending');

    return (
      <span className={needsAttention ? styles.statusAttention : styles.status}>
        {label}
      </span>
    );
  }

  render() {
    const {
      books,
      isFetching,
      error,
      adding,
      filterKey,
      page
    } = this.state;

    const filteredBooks = this.getFilteredBooks();
    const pageCount = this.getPageCount(filteredBooks.length);
    const currentPage = Math.min(page, pageCount - 1);
    const visibleBooks = this.getVisibleBooks(filteredBooks, currentPage);
    const statusCounts = this.getStatusCounts();
    const emptyMessage = books.length === 0
      ? translate('BookPoolEmpty')
      : translate('BookPoolEmptyFilter');

    return (
      <PageContent>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              name={icons.REFRESH}
              onPress={this.fetchPool}
              title={translate('Refresh')}
            />
          </PageToolbarSection>
          <PageToolbarSection>
            <span className={styles.description}>{translate('BookPoolDescription')}</span>
          </PageToolbarSection>
          <PageToolbarSection>
            <div className={styles.filterGroup}>
              {this.renderFilterButtons(statusCounts, filterKey)}
            </div>
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
                <>
                  <div className={styles.grid}>
                    {visibleBooks.map((item) => (
                      <BookPoolPoster
                        key={item.bookId}
                        resource={item}
                        onAdd={() => this.onAddToLibrary(item)}
                        isAdding={adding[item.bookId]}
                        renderStatus={() => this.renderStatus(item)}
                      />
                    ))}
                  </div>
                  {this.renderPagination(filteredBooks, pageCount, currentPage)}
                </>
              ) : (
                <div className={styles.emptyState}>{emptyMessage}</div>
              )}
            </>
          )}
        </PageContentBody>
      </PageContent>
    );
  }
}

function BookPoolPoster({
  resource,
  onAdd,
  isAdding,
  renderStatus
}) {
  const {
    book,
    hasEbook,
    hasAudiobook,
    inMyLibrary,
    needsAttention
  } = resource;

  return (
    <div className={classNames(styles.posterCard, needsAttention && styles.posterAttention)}>
      <div className={styles.posterWrapper}>
        <BookCover
          size={300}
          images={book.images || []}
          className={styles.posterImage}
        />
        <IconButton
          className={styles.addButton}
          name={icons.ADD}
          title={translate(inMyLibrary ? 'InMyLibrary' : 'AddToMyLibrary')}
          onPress={onAdd}
          isDisabled={inMyLibrary}
          isSpinning={isAdding}
        />
      </div>
      <div className={styles.posterMeta}>
        <div className={styles.posterTitle}>
          <BookTitleLink
            title={book.title}
            titleSlug={book.titleSlug}
            disambiguation={book.disambiguation}
          />
        </div>
        <div className={styles.posterAuthor}>{book.authorTitle}</div>
        <div className={styles.posterStatusRow}>
          {renderStatus()}
          {inMyLibrary && (
            <span className={styles.libraryBadge}>{translate('InMyLibrary')}</span>
          )}
        </div>
        <div className={styles.posterMetaRow}>
          <div className={styles.posterMetaItem}>
            <span className={styles.posterMetaLabel}>eBook</span>
            <span className={styles.posterMetaValue}>{hasEbook ? translate('Yes') : translate('No')}</span>
          </div>
          <div className={styles.posterMetaItem}>
            <span className={styles.posterMetaLabel}>Audiobook</span>
            <span className={styles.posterMetaValue}>{hasAudiobook ? translate('Yes') : translate('No')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
