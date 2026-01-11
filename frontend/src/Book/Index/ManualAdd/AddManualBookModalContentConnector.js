import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { updateItem } from 'Store/Actions/baseActions';
import { setBookAddDefault } from 'Store/Actions/searchActions';
import { fetchRootFolders } from 'Store/Actions/settingsActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import AddManualBookModalContent from './AddManualBookModalContent';

function createMapStateToProps() {
  return createSelector(
    (state) => state.search,
    (state) => state.settings.metadataProfiles,
    createDimensionsSelector(),
    (searchState, metadataProfiles, dimensions) => {
      const {
        bookDefaults,
        addError
      } = searchState;

      const {
        settings,
        validationErrors,
        validationWarnings
      } = selectSettings(bookDefaults, {}, addError);

      return {
        showMetadataProfile: true,
        isSmallScreen: dimensions.isSmallScreen,
        validationErrors,
        validationWarnings,
        ...settings
      };
    }
  );
}

const mapDispatchToProps = {
  setBookAddDefault,
  fetchRootFolders,
  updateBookItem: (item) => updateItem({ section: 'books', ...item }),
  updateAuthorItem: (item) => updateItem({ section: 'authors', ...item })
};

class AddManualBookModalContentConnector extends Component {
  state = {
    isAdding: false,
    addError: null
  };

  componentDidMount() {
    this.props.fetchRootFolders();
  }

  onAuthorOptionsChange = ({ name, value }) => {
    this.props.setBookAddDefault({ [name]: value });
  };

  onAddManualBook = (bookFields) => {
    const {
      rootFolderPath,
      monitor,
      monitorNewItems,
      qualityProfileId,
      metadataProfileId,
      tags,
      onModalClose,
      updateBookItem,
      updateAuthorItem
    } = this.props;

    const monitorValue = monitor.value === 'specificBook' ? 'none' : monitor.value;

    const payload = {
      title: bookFields.title,
      authorName: bookFields.authorName,
      releaseDate: bookFields.releaseDate || null,
      overview: bookFields.overview,
      publisher: bookFields.publisher,
      language: bookFields.language,
      format: bookFields.format,
      isbn13: bookFields.isbn13,
      asin: bookFields.asin,
      pageCount: bookFields.pageCount ? parseInt(bookFields.pageCount, 10) : 0,
      isEbook: bookFields.isEbook,
      rootFolderPath: rootFolderPath.value,
      monitor: monitorValue,
      monitorNewItems: monitorNewItems.value,
      qualityProfileId: qualityProfileId.value,
      metadataProfileId: metadataProfileId.value,
      tags: tags.value
    };

    this.setState({ isAdding: true, addError: null });

    const request = createAjaxRequest({
      url: '/book/manual',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(payload)
    }).request;

    request.done((data) => {
      if (data?.author) {
        updateAuthorItem(data.author);
      }
      if (data?.id) {
        updateBookItem(data);
      }
      onModalClose();
    });

    request.fail((xhr) => {
      this.setState({ addError: xhr });
    });

    request.always(() => {
      this.setState({ isAdding: false });
    });
  };

  render() {
    return (
      <AddManualBookModalContent
        {...this.props}
        isAdding={this.state.isAdding}
        addError={this.state.addError}
        onAuthorOptionsChange={this.onAuthorOptionsChange}
        onAddManualBook={this.onAddManualBook}
      />
    );
  }
}

AddManualBookModalContentConnector.propTypes = {
  rootFolderPath: PropTypes.object,
  monitor: PropTypes.object.isRequired,
  monitorNewItems: PropTypes.object.isRequired,
  qualityProfileId: PropTypes.object,
  metadataProfileId: PropTypes.object,
  tags: PropTypes.object.isRequired,
  onModalClose: PropTypes.func.isRequired,
  setBookAddDefault: PropTypes.func.isRequired,
  fetchRootFolders: PropTypes.func.isRequired,
  updateBookItem: PropTypes.func.isRequired,
  updateAuthorItem: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(AddManualBookModalContentConnector);
