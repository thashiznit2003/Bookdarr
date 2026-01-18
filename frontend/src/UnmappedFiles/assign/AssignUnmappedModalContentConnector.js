import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { executeCommand } from 'Store/Actions/commandActions';
import { clearSearchResults, getSearchResults } from 'Store/Actions/searchActions';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import AssignUnmappedModalContent from './AssignUnmappedModalContent';

function createMapStateToProps() {
  return createSelector(
    (state) => state.search,
    (searchState) => ({
      searchResults: searchState.items,
      isSearching: searchState.isFetching,
      searchError: searchState.error
    })
  );
}

const mapDispatchToProps = {
  getSearchResults,
  clearSearchResults,
  executeCommand
};

class AssignUnmappedModalContentConnector extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      books: [],
      isLoading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchBookPool();
  }

  componentWillUnmount() {
    this.props.clearSearchResults();
  }

  fetchBookPool = () => {
    this.setState({ isLoading: true, error: null });

    const { request } = createAjaxRequest({
      url: '/book',
      method: 'GET',
      data: {
        page: 1,
        pageSize: 5000,
        sortKey: 'title',
        sortDir: 'asc'
      },
      traditional: true
    });

    request.done((data) => {
      const items = Array.isArray(data) ? data : (data?.records || []);
      const books = items.map((book) => {
        return {
          id: book.id,
          title: book.title,
          authorName: book.author?.authorName,
          authorId: book.authorId,
          titleSlug: book.titleSlug,
          foreignEditionId: book.foreignEditionId
        };
      });

      this.setState({ books, isLoading: false });
    });

    request.fail((xhr) => {
      this.setState({ error: xhr, isLoading: false });
    });
  };

  onSearchChange = (term) => {
    const trimmed = term?.trim();

    if (!trimmed) {
      this.props.clearSearchResults();
      return;
    }

    this.props.clearSearchResults();
    this.props.getSearchResults({ term: trimmed });
  };

  onSearchClear = () => {
    this.props.clearSearchResults();
  };

  onAssign = (bookId) => {
    const book = this.state.books.find((b) => b.id === bookId);
    const authorId = book?.authorId || null;

    const files = (this.props.files || []).map((f) => ({
      path: f.path,
      bookId,
      authorId,
      foreignEditionId: book?.foreignEditionId,
      quality: f.quality,
      indexerFlags: f.indexerFlags || 0,
      disableReleaseSwitching: true
    }));

    if (!files.length) {
      this.props.onModalClose();
      return;
    }

    this.props.executeCommand({
      name: commandNames.INTERACTIVE_IMPORT,
      files,
      importMode: 'auto',
      replaceExistingFiles: false
    });

    if (this.props.onAssigned) {
      this.props.onAssigned();
    } else {
      this.props.onModalClose();
    }
  };

  onBookAdded = (result) => {
    if (result?.book) {
      const newBook = result.book;
      this.setState((state) => ({
        books: [
          ...state.books,
          {
            id: newBook.id,
            title: newBook.title,
            authorName: newBook.author?.authorName,
            authorId: newBook.author?.id,
            titleSlug: newBook.titleSlug
          }
        ]
      }), () => {
        this.onAssign(newBook.id);
      });
    }
  };

  render() {
    const { books, isLoading, error } = this.state;
    const {
      searchResults,
      isSearching,
      searchError
    } = this.props;

    return (
      <AssignUnmappedModalContent
        {...this.props}
        books={books}
        searchResults={searchResults}
        isSearching={isSearching}
        searchError={searchError}
        isLoading={isLoading}
        error={error}
        onAssign={this.onAssign}
        onBookAdded={this.onBookAdded}
        onSearchChange={this.onSearchChange}
        onSearchClear={this.onSearchClear}
      />
    );
  }
}

AssignUnmappedModalContentConnector.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  searchResults: PropTypes.arrayOf(PropTypes.object),
  isSearching: PropTypes.bool,
  searchError: PropTypes.object,
  getSearchResults: PropTypes.func.isRequired,
  clearSearchResults: PropTypes.func.isRequired,
  executeCommand: PropTypes.func.isRequired,
  onAssigned: PropTypes.func,
  onModalClose: PropTypes.func.isRequired
};

AssignUnmappedModalContentConnector.defaultProps = {
  files: [],
  searchResults: [],
  isSearching: false
};

export default connect(createMapStateToProps, mapDispatchToProps)(AssignUnmappedModalContentConnector);
