import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import InteractiveImportSelectFolderModalContentConnector from './Folder/InteractiveImportSelectFolderModalContentConnector';
import InteractiveImportModalContentConnector from './Interactive/InteractiveImportModalContentConnector';

class InteractiveImportModal extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      folder: props.folder || null
    };
  }

  componentDidUpdate(prevProps) {
    // Clear folder when modal closes
    if (prevProps.isOpen && !this.props.isOpen) {
      this.setState({ folder: null });
    }

    // Clear folder when modal opens if useBrowserUpload is true
    // This ensures upload mode is shown instead of folder view
    if (!prevProps.isOpen && this.props.isOpen && this.props.useBrowserUpload && !this.props.autoStartInteractive) {
      this.setState({ folder: null });
    }

    // If auto-starting and initialFolder changes, selection view will pick it up
  }

  //
  // Listeners

  onFolderSelect = (folder) => {
    this.setState({ folder });
  };

  //
  // Render

  render() {
    const {
      isOpen,
      folder,
      downloadId,
      useBrowserUpload,
      initialFolder,
      showPathInput,
      autoStartInteractive,
      onModalClose,
      ...otherProps
    } = this.props;

    const folderPath = folder || this.state.folder;

    return (
      <Modal
        isOpen={isOpen}
        size={sizes.EXTRA_EXTRA_LARGE}
        closeOnBackgroundClick={false}
        onModalClose={onModalClose}
      >
        {
          folderPath || downloadId ?
            <InteractiveImportModalContentConnector
              folder={folderPath}
              downloadId={downloadId}
              {...otherProps}
              onModalClose={onModalClose}
            /> :
            <InteractiveImportSelectFolderModalContentConnector
              {...otherProps}
              initialFolder={initialFolder}
              useBrowserUpload={useBrowserUpload}
              showPathInput={showPathInput}
              autoStartInteractive={autoStartInteractive}
              onFolderSelect={this.onFolderSelect}
              onModalClose={onModalClose}
            />
        }
      </Modal>
    );
  }
}

InteractiveImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  authorId: PropTypes.number,
  bookId: PropTypes.number,
  title: PropTypes.string,
  folder: PropTypes.string,
  downloadId: PropTypes.string,
  useBrowserUpload: PropTypes.bool,
  initialFolder: PropTypes.string,
  showPathInput: PropTypes.bool,
  autoStartInteractive: PropTypes.bool,
  modalTitle: PropTypes.string.isRequired,
  onModalClose: PropTypes.func.isRequired
};

InteractiveImportModal.defaultProps = {
  modalTitle: 'Manual Import'
};

export default InteractiveImportModal;
