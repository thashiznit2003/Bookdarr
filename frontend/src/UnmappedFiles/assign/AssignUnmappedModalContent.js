import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import TextInput from 'Components/Form/TextInput';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons, kinds, scrollDirections } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AddManualBookModal from 'Book/Index/ManualAdd/AddManualBookModal';
import AddNewBookModal from 'Search/Book/AddNewBookModal';
import styles from './AssignUnmappedModalContent.css';

const columns = [
  { name: 'title', label: 'Book Title', isVisible: true },
  { name: 'author', label: 'Author', isVisible: true }
];

class AssignUnmappedModalContent extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      filter: '',
      search: '',
      isManualModalOpen: false,
      searchBookToAdd: null
    };
  }

  onFilterChange = ({ value }) => {
    this.setState({ filter: value });
  };

  onSearchChange = ({ value }) => {
    this.setState({ search: value });
  };

  onSearchSubmit = () => {
    this.props.onSearchSubmit(this.state.search);
  };

  onSearchClear = () => {
    this.setState({ search: '' });
    this.props.onSearchClear();
  };

  onBookSelect = (bookId) => {
    this.props.onAssign(bookId);
  };

  onManualModalOpen = () => {
    this.setState({ isManualModalOpen: true });
  };

  onManualModalClose = (book) => {
    this.setState({ isManualModalOpen: false });

    if (book?.id) {
      this.props.onBookAdded?.({ book });
    }
  };

  onSearchResultPress = (book) => {
    const isExisting = book?.id && book.id !== 0;
    if (isExisting) {
      this.props.onAssign(book.id);
      return;
    }

    this.setState({ searchBookToAdd: book });
  };

  onSearchAddModalClose = (created) => {
    this.setState({ searchBookToAdd: null });

    if (created && created.id) {
      this.props.onBookAdded?.({ book: created });
    }
  };

  render() {
    const {
      books,
      onModalClose,
      folder,
      isLoading,
      searchResults,
      isSearching,
      searchError
    } = this.props;
    const { filter, search, isManualModalOpen, searchBookToAdd } = this.state;
    const filterLower = filter.toLowerCase();
    const showMetadataResults = !!search;
    const searchColumns = [
      { name: 'title', label: translate('Title'), isVisible: true },
      { name: 'author', label: translate('Author'), isVisible: true },
      { name: 'year', label: translate('ReleaseDate'), isVisible: true },
      { name: 'edition', label: translate('Edition'), isVisible: true },
      { name: 'action', label: translate('Actions'), isVisible: true }
    ];

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate('AssignToBook')}
        </ModalHeader>

        <ModalBody
          className={styles.modalBody}
          scrollDirection={scrollDirections.NONE}
        >
          {
            !showMetadataResults &&
              <>
                <div className={styles.sectionLabel}>
                  {translate('Library')}
                </div>

                <div className={styles.filters}>
                  <TextInput
                    className={styles.filterInput}
                    placeholder={translate('FilterLibraryList')}
                    name="filter"
                    value={filter}
                    onChange={this.onFilterChange}
                  />

                  <Button
                    kind="primary"
                    onPress={this.onManualModalOpen}
                  >
                    {translate('AddBookManually')}
                  </Button>
                </div>
              </>
          }

          <div className={styles.sectionLabel}>
            {translate('MetadataSearch')}
          </div>

          <div className={styles.searchRow}>
            <TextInput
              className={styles.filterInput}
              placeholder={translate('SearchBoxPlaceHolder')}
              name="search"
              value={search}
              onChange={this.onSearchChange}
            />

            <SpinnerIconButton
              name={icons.SEARCH}
              isSpinning={isSearching}
              onPress={this.onSearchSubmit}
            />

            <Button
              onPress={this.onSearchClear}
            >
              {translate('Clear')}
            </Button>
          </div>

          {
            searchError &&
              <Alert kind={kinds.WARNING}>
                {getErrorMessage(searchError, translate('FailedLoadingSearchResults'))}
              </Alert>
          }

          {
            showMetadataResults &&
              <div className={styles.resultsContainer}>
                {
                  isSearching &&
                    <LoadingIndicator />
                }

                {
                  !isSearching && !searchError && !searchResults.length &&
                    <div className={styles.emptyResults} />
                }

                {
                  !isSearching && !searchError && !!searchResults.length &&
                    <div className={styles.searchResults}>
                      <div className={styles.sectionLabel}>
                        {translate('MetadataResults')}
                      </div>
                      <Table columns={searchColumns}>
                        <TableBody>
                          {
                            searchResults.map((item) => {
                              if (!item.book) {
                                return null;
                              }

                              const book = item.book;
                              const editions = book.editions || [];
                              const edition = editions.find((ed) => ed.monitored) || editions[0];
                              const editionInfo = [
                                edition?.format,
                                edition?.isbn13 || edition?.asin,
                                edition?.disambiguation
                              ].filter(Boolean).join(' • ');
                              const releaseYear = book.releaseDate ? new Date(book.releaseDate).getFullYear() : '';
                              const isExisting = book.id && book.id !== 0;

                              return (
                                <TableRow
                                  key={item.id}
                                  onClick={() => this.onSearchResultPress(book)}
                                  className={styles.bookRow}
                                >
                                  <TableRowCell>{book.title}</TableRowCell>
                                  <TableRowCell>{book.author?.authorName}</TableRowCell>
                                  <TableRowCell>{releaseYear || '-'}</TableRowCell>
                                  <TableRowCell>{editionInfo || '-'}</TableRowCell>
                                  <TableRowCell>
                                    <Button
                                      kind="primary"
                                      onPress={() => this.onSearchResultPress(book)}
                                    >
                                      {isExisting ? translate('AssignToBook') : translate('AddBook')}
                                    </Button>
                                  </TableRowCell>
                                </TableRow>
                              );
                            })
                          }
                        </TableBody>
                      </Table>
                    </div>
                }
              </div>
          }

          {
            !showMetadataResults &&
              <div className={styles.libraryList}>
                <Table
                  columns={columns}
                >
                  <TableBody>
                    {
                      (books || []).map((book) => {
                        const text = `${book.title} ${book.authorName || ''}`.toLowerCase();
                        if (!text.includes(filterLower)) {
                          return null;
                        }

                        return (
                          <TableRow
                            key={book.id}
                            onClick={() => this.onBookSelect(book.id)}
                            className={styles.bookRow}
                          >
                            <TableRowCell>{book.title}</TableRowCell>
                            <TableRowCell>{book.authorName}</TableRowCell>
                          </TableRow>
                        );
                      })
                    }

                    {
                      !isLoading && (!books || books.length === 0) &&
                        <TableRow>
                          <TableRowCell colSpan={2}>
                            {translate('NoBooksFound')}
                          </TableRowCell>
                        </TableRow>
                    }
                  </TableBody>
                </Table>
              </div>
          }
        </ModalBody>

        <ModalFooter>
          <Button onPress={onModalClose}>
            {translate('Cancel')}
          </Button>
        </ModalFooter>

        <AddManualBookModal
          isOpen={isManualModalOpen}
          onModalClose={() => this.onManualModalClose()}
          onBookAdded={({ book }) => this.onManualModalClose(book)}
          initialFolder={folder}
        />

        <AddNewBookModal
          isOpen={!!searchBookToAdd}
          isExistingAuthor={searchBookToAdd?.author?.id ? searchBookToAdd.author.id !== 0 : false}
          foreignBookId={searchBookToAdd?.foreignBookId}
          bookTitle={searchBookToAdd?.title}
          seriesTitle={searchBookToAdd?.seriesTitle}
          disambiguation={searchBookToAdd?.disambiguation}
          authorName={searchBookToAdd?.author?.authorName}
          overview={searchBookToAdd?.overview}
          folder={searchBookToAdd?.author?.folder}
          images={searchBookToAdd?.images || []}
          onBookAdded={this.onSearchAddModalClose}
          onModalClose={this.onSearchAddModalClose}
        />
      </ModalContent>
    );
  }
}

AssignUnmappedModalContent.propTypes = {
  books: PropTypes.arrayOf(PropTypes.object).isRequired,
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object),
  isSearching: PropTypes.bool,
  searchError: PropTypes.object,
  isLoading: PropTypes.bool,
  folder: PropTypes.string,
  onAssign: PropTypes.func.isRequired,
  onBookAdded: PropTypes.func,
  onSearchSubmit: PropTypes.func.isRequired,
  onSearchClear: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

AssignUnmappedModalContent.defaultProps = {
  books: [],
  files: [],
  searchResults: [],
  isLoading: false,
  isSearching: false
};

export default AssignUnmappedModalContent;
