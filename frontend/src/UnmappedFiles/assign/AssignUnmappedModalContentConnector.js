import PropTypes from 'prop-types';
import React, { Component } from 'react';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import AssignUnmappedModalContent from './AssignUnmappedModalContent';

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

  fetchBookPool = () => {
    this.setState({ isLoading: true, error: null });

    const { request } = createAjaxRequest({
      url: '/user/library/pool',
      method: 'GET'
    });

    request.done((data) => {
      const books = (data || []).map((x) => {
        const book = x.book || {};
        return {
          id: book.id,
          title: book.title,
          authorName: book.author?.authorName,
          authorId: book.authorId,
          titleSlug: book.titleSlug
        };
      });

      this.setState({ books, isLoading: false });
    });

    request.fail((xhr) => {
      this.setState({ error: xhr, isLoading: false });
    });
  };

  onAssign = (bookId) => {
    const book = this.state.books.find((b) => b.id === bookId);
    const authorId = book?.authorId || null;

    const items = (this.props.files || []).map((f) => ({
      path: f.path,
      bookId,
      authorId,
      replaceExistingFiles: false,
      additionalFile: false,
      disableReleaseSwitching: true
    }));

    if (!items.length) {
      this.props.onModalClose();
      return;
    }

    createAjaxRequest({
      url: '/manualimport',
      method: 'POST',
      data: JSON.stringify(items),
      contentType: 'application/json',
      dataType: 'json'
    }).request.always(() => {
      this.props.onModalClose();
    });
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

    return (
      <AssignUnmappedModalContent
        {...this.props}
        books={books}
        isLoading={isLoading}
        error={error}
        onAssign={this.onAssign}
        onBookAdded={this.onBookAdded}
      />
    );
  }
}

AssignUnmappedModalContentConnector.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  onModalClose: PropTypes.func.isRequired
};

AssignUnmappedModalContentConnector.defaultProps = {
  files: []
};

export default AssignUnmappedModalContentConnector;
