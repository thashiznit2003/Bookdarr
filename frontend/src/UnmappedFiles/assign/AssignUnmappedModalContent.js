import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import TextInput from 'Components/Form/TextInput';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
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
      isAddNewModalOpen: false
    };
  }

  onFilterChange = ({ value }) => {
    this.setState({ filter: value });
  };

  onBookSelect = (bookId) => {
    this.props.onAssign(bookId);
  };

  onAddNewPress = () => {
    this.setState({ isAddNewModalOpen: true });
  };

  onAddNewModalClose = (created) => {
    this.setState({ isAddNewModalOpen: false });

    if (created && created.id) {
      this.props.onBookAdded?.({ book: created });
    }
  };

  render() {
    const { books, onModalClose, folder, isLoading } = this.props;
    const { filter, isAddNewModalOpen } = this.state;
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
              onPress={this.onAddNewPress}
            >
              {translate('AddNewBook')}
            </Button>
          </div>

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

        <AddNewBookModal
          isOpen={isAddNewModalOpen}
          onBookAdded={this.onAddNewModalClose}
          onModalClose={this.onAddNewModalClose}
          initialFolder={folder}
        />
      </ModalContent>
    );
  }
}

AssignUnmappedModalContent.propTypes = {
  books: PropTypes.arrayOf(PropTypes.object).isRequired,
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool,
  folder: PropTypes.string,
  onAssign: PropTypes.func.isRequired,
  onBookAdded: PropTypes.func,
  onModalClose: PropTypes.func.isRequired
};

AssignUnmappedModalContent.defaultProps = {
  books: [],
  files: [],
  isLoading: false
};

export default AssignUnmappedModalContent;
