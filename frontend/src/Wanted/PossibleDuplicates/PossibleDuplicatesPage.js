import PropTypes from 'prop-types';
import React, { Component, useCallback } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import BookCover from 'Book/BookCover';
import BookTitleLink from 'Book/BookTitleLink';
import MergeBookModal from 'Book/Pool/Merge/MergeBookModal';
import Icon from 'Components/Icon';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import { icons } from 'Helpers/Props';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import styles from './PossibleDuplicatesPage.css';

function normalizeTitle(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isPossibleDuplicateTitle(left, right) {
  if (!left || !right) {
    return false;
  }

  if (left === right) {
    return true;
  }

  if (left.length < 4 || right.length < 4) {
    return false;
  }

  return left.includes(right) || right.includes(left);
}

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

class PossibleDuplicatesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      books: [],
      isFetching: false,
      error: null,
      selectedBookIds: [],
      isMergeModalOpen: false,
      isMerging: false,
      mergeError: null
    };
  }

  componentDidMount() {
    this.onFetchPool();
  }

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

  onMergeBooksPress = () => {
    this.setState({ isMergeModalOpen: true, mergeError: null });
  };

  onMergeModalClose = () => {
    this.setState({ isMergeModalOpen: false, mergeError: null });
  };

  onMergeConfirmed = (winnerBookId, loserBookId) => {
    this.setState({ isMerging: true, mergeError: null });

    const request = createAjaxRequest({
      url: '/book/merge',
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify({ winnerBookId, loserBookId })
    });

    request.request.done(() => {
      this.setState({
        isMerging: false,
        mergeError: null,
        isMergeModalOpen: false,
        selectedBookIds: []
      });
      this.onFetchPool();
    });

    request.request.fail((xhr) => {
      this.setState({ isMerging: false, mergeError: xhr });
    });
  };

  onToggleBookSelected = (bookId) => {
    this.setState((prevState) => {
      const selectedBookIds = prevState.selectedBookIds.includes(bookId)
        ? prevState.selectedBookIds.filter((id) => id !== bookId)
        : [...prevState.selectedBookIds, bookId];

      return { selectedBookIds };
    });
  };

  getDuplicateBooks = () => {
    const { books } = this.state;
    const normalized = books.map((resource) => {
      return {
        id: resource.bookId,
        title: normalizeTitle(resource?.book?.title)
      };
    });

    const duplicateIds = new Set();

    for (let i = 0; i < normalized.length; i += 1) {
      const left = normalized[i];
      if (!left?.title) {
        continue;
      }

      for (let j = i + 1; j < normalized.length; j += 1) {
        const right = normalized[j];
        if (!right?.title) {
          continue;
        }

        if (isPossibleDuplicateTitle(left.title, right.title)) {
          duplicateIds.add(left.id);
          duplicateIds.add(right.id);
        }
      }
    }

    return books
      .filter((resource) => duplicateIds.has(resource.bookId))
      .sort((left, right) => {
        const leftTitle = (left.book?.title || '').toLowerCase();
        const rightTitle = (right.book?.title || '').toLowerCase();
        return leftTitle.localeCompare(rightTitle);
      });
  };

  render() {
    const {
      isSmallScreen
    } = this.props;

    const {
      isFetching,
      error,
      selectedBookIds,
      isMergeModalOpen,
      isMerging,
      mergeError
    } = this.state;

    const duplicateBooks = this.getDuplicateBooks();
    const selectedResources = duplicateBooks.filter((resource) => selectedBookIds.includes(resource.bookId));
    const canMerge = selectedBookIds.length === 2 && selectedResources.length === 2;

    return (
      <PageContent>
        <PageToolbar>
          <PageToolbarSection collapseButtons={false}>
            <PageToolbarButton
              label={translate('Refresh')}
              iconName={icons.REFRESH}
              isSpinning={isFetching}
              onPress={this.onFetchPool}
            />

            {
              !isSmallScreen &&
                <>
                  <PageToolbarSeparator />

                  <PageToolbarButton
                    label={translate('MergeBooks')}
                    iconName={icons.CLONE}
                    isDisabled={!canMerge || isMerging}
                    onPress={this.onMergeBooksPress}
                  />
                </>
            }
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
              {duplicateBooks.length > 0 ? (
                <div className={styles.grid}>
                  {duplicateBooks.map((resource) => (
                    <PossibleDuplicateCard
                      key={resource.bookId}
                      resource={resource}
                      isSelected={selectedBookIds.includes(resource.bookId)}
                      showSelection={!isSmallScreen}
                      onToggleSelect={this.onToggleBookSelected}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>{translate('NoPossibleDuplicates')}</div>
              )}
            </>
          )}
        </PageContentBody>

        <MergeBookModal
          isOpen={isMergeModalOpen}
          books={selectedResources}
          isMerging={isMerging}
          mergeError={mergeError}
          onMergeConfirmed={this.onMergeConfirmed}
          onModalClose={this.onMergeModalClose}
        />
      </PageContent>
    );
  }
}

PossibleDuplicatesPage.propTypes = {
  isSmallScreen: PropTypes.bool.isRequired
};

function PossibleDuplicateCard({
  resource,
  isSelected,
  onToggleSelect,
  showSelection
}) {
  const { book } = resource;
  const authorName = formatAuthorName(getAuthorDisplayName(book));

  const onSelectPress = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onToggleSelect === 'function') {
      onToggleSelect(resource.bookId);
    }
  }, [onToggleSelect, resource]);

  return (
    <div className={`${styles.posterCard} ${isSelected ? styles.posterSelected : ''}`}>
      <div className={styles.posterWrapper}>
        {
          showSelection &&
            <button
              className={`${styles.selectToggle} ${isSelected ? styles.selectToggleSelected : ''}`}
              type="button"
              aria-pressed={isSelected}
              aria-label={translate('Select')}
              onClick={onSelectPress}
            >
              <Icon name={isSelected ? icons.CHECK : icons.CIRCLE_OUTLINE} />
            </button>
        }
        <BookCover
          size={162}
          images={book?.images || []}
          className={styles.posterImage}
          lazy={false}
        />
        <div className={styles.posterOverlay}>
          <div className={styles.posterTitle}>
            <BookTitleLink
              title={book?.title}
              titleSlug={book?.titleSlug}
              disambiguation={book?.disambiguation}
            />
          </div>
          {authorName && (
            <div className={styles.posterAuthor}>{authorName}</div>
          )}
        </div>
      </div>
    </div>
  );
}

PossibleDuplicateCard.propTypes = {
  resource: PropTypes.shape({
    bookId: PropTypes.number,
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
    })
  }).isRequired,
  isSelected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  showSelection: PropTypes.bool
};

function createMapStateToProps() {
  return createSelector(
    createDimensionsSelector(),
    (dimensions) => ({
      isSmallScreen: dimensions.isSmallScreen
    })
  );
}

export default connect(createMapStateToProps)(PossibleDuplicatesPage);
