/* eslint max-params: 0 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { deleteBookFile, deleteBookFiles, setBookFilesSort } from 'Store/Actions/bookFileActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import BookFileEditorTableContent from './BookFileEditorTableContent';

function createMapStateToProps() {
  return createSelector(
    createClientSideCollectionSelector('bookFiles'),
    createDimensionsSelector(),
    (
      bookFiles,
      dimensions
    ) => {
      const {
        items,
        ...otherProps
      } = bookFiles;
      return {
        items,
        ...otherProps,
        isSmallScreen: dimensions.isSmallScreen,
        isDeleting: bookFiles.isDeleting,
        isSaving: bookFiles.isSaving
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onSortPress(sortKey) {
      dispatch(setBookFilesSort({ sortKey }));
    },

    onDeletePress(bookFileIds) {
      dispatch(deleteBookFiles({ bookFileIds }));
    },

    dispatchDeleteBookFile(id) {
      dispatch(deleteBookFile(id));
    }
  };
}

class BookFileEditorTableContentConnector extends Component {

  //
  // Render

  render() {
    const {
      ...otherProps
    } = this.props;

    return (
      <BookFileEditorTableContent
        {...otherProps}
      />
    );
  }
}

BookFileEditorTableContentConnector.propTypes = {
  authorId: PropTypes.number.isRequired,
  bookId: PropTypes.number,
  dispatchDeleteBookFile: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, createMapDispatchToProps)(BookFileEditorTableContentConnector);
