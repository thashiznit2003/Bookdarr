import { push } from 'connected-react-router';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import NotFound from 'Components/NotFound';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import translate from 'Utilities/String/translate';
import { fetchBooks } from 'Store/Actions/bookActions';
import BookDetailsConnector from './BookDetailsConnector';

function createMapStateToProps() {
  return createSelector(
    (state, { match }) => match,
    (state) => state.books,
    (state) => state.authors,
    (match, books, author) => {
      const titleSlug = match.params.titleSlug;
      const isFetching = books.isFetching || author.isFetching;
      const isPopulated = books.isPopulated && author.isPopulated;
      const bookExists = _.some(books.items, { titleSlug });

      return {
        titleSlug,
        isFetching,
        isPopulated,
        bookExists
      };
    }
  );
}

const mapDispatchToProps = {
  push,
  fetchBooks
};

class BookDetailsPageConnector extends Component {

  constructor(props) {
    super(props);
    this.state = { hasMounted: false };
  }
  //
  // Lifecycle

  componentDidMount() {
    this.populate();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.titleSlug !== this.props.titleSlug) {
      this.populate();
    }
  }

  //
  // Control

  populate = () => {
    this.setState({ hasMounted: true });

    if (this.props.titleSlug) {
      this.props.fetchBooks({ titleSlug: this.props.titleSlug, useUserLibrary: false });
    }
  };

  //
  // Render

  render() {
    const {
      titleSlug,
      isFetching,
      isPopulated,
      bookExists
    } = this.props;

    if (!titleSlug) {
      return (
        <NotFound
          message={translate('SorryThatBookCannotBeFound')}
        />
      );
    }

    if (isFetching || !this.state.hasMounted) {
      return (
        <PageContent title={translate('Loading')}>
          <PageContentBody>
            <LoadingIndicator />
          </PageContentBody>
        </PageContent>
      );
    }

    if (!bookExists && !isFetching) {
      return (
        <NotFound
          message={translate('SorryThatBookCannotBeFound')}
        />
      );
    }

    if (!isFetching && isPopulated && this.state.hasMounted && bookExists) {
      return (
        <BookDetailsConnector
          titleSlug={titleSlug}
        />
      );
    }
  }
}

BookDetailsPageConnector.propTypes = {
  titleSlug: PropTypes.string,
  match: PropTypes.shape({ params: PropTypes.shape({ titleSlug: PropTypes.string.isRequired }).isRequired }).isRequired,
  push: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(BookDetailsPageConnector);
