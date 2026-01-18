import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import TextInput from 'Components/Form/TextInput';
import Alert from 'Components/Alert';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons, kinds, scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddManualBookModal from 'Book/Index/ManualAdd/AddManualBookModal';
import AddNewBookSearchResultConnector from 'Search/Book/AddNewBookSearchResultConnector';
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
      isManualModalOpen: false
    };
  }

  onFilterChange = ({ value }) => {
    this.setState({ filter: value });
  };

  onSearchChange = ({ value }) => {
    this.setState({ search: value });
    this.props.onSearchChange(value);
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
    const { filter, search, isManualModalOpen } = this.state;
    const filterLower = filter.toLowerCase();

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate('AssignToBook')}
        </ModalHeader>

        <ModalBody
          className={styles.modalBody}
          scrollDirection={scrollDirections.NONE}
        >
          <div className={styles.filters}>
            <TextInput
              className={styles.filterInput}
              placeholder={translate('FilterPlaceHolder')}
              name="filter"
              value={filter}
              onChange={this.onFilterChange}
            />

            <Button
              kind="primary"
              onPress={this.onManualModalOpen}
            >
              {translate('AddNewBook')}
            </Button>
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
              onPress={() => this.props.onSearchChange(search)}
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
                {translate('FailedLoadingSearchResults')}
              </Alert>
          }

          {
            !!searchResults.length &&
              <div className={styles.searchResults}>
                <div className={styles.sectionLabel}>
                  {translate('AddNewBook')}
                </div>
                {
                  searchResults.map((item) => {
                    if (!item.book) {
                      return null;
                    }

                    const book = item.book;

                    return (
                      <AddNewBookSearchResultConnector
                        key={item.id}
                        isExistingBook={'id' in book && book.id !== 0}
                        isExistingAuthor={'id' in book.author && book.author.id !== 0}
                        onBookAdded={this.props.onBookAdded}
                        {...book}
                      />
                    );
                  })
                }
              </div>
          }

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
  onSearchChange: PropTypes.func.isRequired,
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
