import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setUserBookRating } from 'Store/Actions/bookActions';
import createBookSelector from 'Store/Selectors/createBookSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import BookDetailsHeader from './BookDetailsHeader';

const selectOverview = createSelector(
  (state) => state.editions,
  (editions) => {
    const monitored = editions.items.find((e) => e.monitored === true);
    return monitored?.overview;
  }
);

function createMapStateToProps() {
  return createSelector(
    createBookSelector(),
    selectOverview,
    createUISettingsSelector(),
    createDimensionsSelector(),
    (book, overview, uiSettings, dimensions) => {

      return {
        ...book,
        overview,
        shortDateFormat: uiSettings.shortDateFormat,
        isSmallScreen: dimensions.isSmallScreen
      };
    }
  );
}

const mapDispatchToProps = {
  setUserBookRating
};

class BookDetailsHeaderConnector extends Component {

  //
  // Render

  render() {
    return (
      <BookDetailsHeader
        {...this.props}
        onUserRatingChange={this.onUserRatingChange}
      />
    );
  }

  onUserRatingChange = (rating) => {
    const { id, setUserBookRating } = this.props;
    setUserBookRating({ bookId: id, rating });
  };
}

BookDetailsHeaderConnector.propTypes = {
  bookId: PropTypes.number,
  author: PropTypes.object,
  id: PropTypes.number,
  setUserBookRating: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(BookDetailsHeaderConnector);
