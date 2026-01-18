import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import PathInputConnector from 'Components/Form/PathInputConnector';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons, kinds, sizes } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import RecentFolderRow from './RecentFolderRow';
import styles from './InteractiveImportSelectFolderModalContent.css';

const recentFoldersColumns = [
  {
    name: 'folder',
    label: 'Folder'
  },
  {
    name: 'lastUsed',
    label: 'Last Used'
  },
  {
    name: 'actions',
    label: ''
  }
];

class InteractiveImportSelectFolderModalContent extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      folder: props.initialFolder || '',
      selectedFiles: [],
      isUploading: false,
      uploadError: null
    };
  }

  //
  // Listeners

  componentDidUpdate(prevProps) {
    if (
      this.state.folder === '' &&
      this.props.initialFolder &&
      this.props.initialFolder !== prevProps.initialFolder
    ) {
      this.setState({ folder: this.props.initialFolder });
    }
  }

  onPathChange = ({ value }) => {
    this.setState({ folder: value });
  };

  onUploadFilesChange = ({ files }) => {
    const selectedFiles = files ? Array.from(files) : [];
    this.setState({ selectedFiles, uploadError: null });

    // Auto-upload when files are selected
    if (selectedFiles.length > 0) {
      this.uploadFiles(selectedFiles);
    }
  };

  uploadFiles = (selectedFiles) => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    this.setState({ isUploading: true, uploadError: null });

    const request = createAjaxRequest({
      url: '/manualimport/upload',
      method: 'POST',
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false
    }).request;

    request.done((data) => {
      const uploadPath = data?.path || '';
      this.setState({
        folder: uploadPath,
        selectedFiles: []
      });

      // Auto-transition to Interactive Import view
      if (uploadPath) {
        this.props.onInteractiveImportPress(uploadPath);
      }
    });

    request.fail((xhr) => {
      this.setState({ uploadError: xhr });
    });

    request.always(() => {
      this.setState({ isUploading: false });
    });
  };

  onRecentPathPress = (folder) => {
    this.setState({ folder });
  };

  onQuickImportPress = () => {
    this.props.onQuickImportPress(this.state.folder);
  };

  onInteractiveImportPress = () => {
    this.props.onInteractiveImportPress(this.state.folder);
  };

  //
  // Render

  render() {
    const {
      recentFolders,
      onRemoveRecentFolderPress,
      useBrowserUpload,
      showPathInput,
      onModalClose
    } = this.props;

    const folder = this.state.folder;
    const {
      isUploading,
      uploadError
    } = this.state;

    const uploadErrorMessage = getErrorMessage(uploadError, translate('ManualImportUploadFailed'));

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate(useBrowserUpload ? 'ManualImportUploadHeader' : 'ManualImportSelectFolderHeader')}
        </ModalHeader>

        <ModalBody>
          {
            useBrowserUpload ?
              <div className={styles.uploadSection}>
                <FormGroup>
                  <FormLabel>
                    {translate('ManualImportUploadLabel')}
                  </FormLabel>

                  <TextInput
                    className={styles.fileInput}
                    name="uploadFiles"
                    type="file"
                    multiple={true}
                    onChange={this.onUploadFilesChange}
                    disabled={isUploading}
                  />

                  <FormInputHelpText
                    text={translate('ManualImportUploadAutoHelpText')}
                  />
                </FormGroup>

                <div className={styles.uploadActions}>
                  {
                    isUploading ?
                      <div className={styles.uploadProgress}>
                        <Icon name={icons.SPINNER} isSpinning={true} />
                        {translate('ManualImportUploading')}
                      </div> :
                      null
                  }

                  {
                    uploadError ?
                      <div className={styles.uploadError}>
                        {uploadErrorMessage}
                      </div> :
                      null
                  }
                </div>
              </div> :
              null
          }

          {
            (!useBrowserUpload || showPathInput) &&
              <PathInputConnector
                name="folder"
                value={folder}
                onChange={this.onPathChange}
              />
          }

          {
            !useBrowserUpload && !!recentFolders.length &&
              <div className={styles.recentFoldersContainer}>
                <Table
                  columns={recentFoldersColumns}
                >
                  <TableBody>
                    {
                      recentFolders.slice(0).reverse().map((recentFolder) => {
                        return (
                          <RecentFolderRow
                            key={recentFolder.folder}
                            folder={recentFolder.folder}
                            lastUsed={recentFolder.lastUsed}
                            onPress={this.onRecentPathPress}
                            onRemoveRecentFolderPress={onRemoveRecentFolderPress}
                          />
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </div>
          }

          {
            !useBrowserUpload &&
              <div className={styles.buttonsContainer}>
                <div className={styles.buttonContainer}>
                  <Button
                    className={styles.button}
                    kind={kinds.PRIMARY}
                    size={sizes.LARGE}
                    isDisabled={!folder}
                    onPress={this.onQuickImportPress}
                  >
                    <Icon
                      className={styles.buttonIcon}
                      name={icons.QUICK}
                    />

                    Move Automatically
                  </Button>
                </div>

                <div className={styles.buttonContainer}>
                  <Button
                    className={styles.button}
                    kind={kinds.PRIMARY}
                    size={sizes.LARGE}
                    isDisabled={!folder}
                    onPress={this.onInteractiveImportPress}
                  >
                    <Icon
                      className={styles.buttonIcon}
                      name={icons.INTERACTIVE}
                    />

                    Interactive Import
                  </Button>
                </div>
              </div>
          }
        </ModalBody>

        <ModalFooter>
          <Button onPress={onModalClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  }
}

InteractiveImportSelectFolderModalContent.propTypes = {
  recentFolders: PropTypes.arrayOf(PropTypes.object).isRequired,
  onQuickImportPress: PropTypes.func.isRequired,
  onInteractiveImportPress: PropTypes.func.isRequired,
  onRemoveRecentFolderPress: PropTypes.func.isRequired,
  useBrowserUpload: PropTypes.bool,
  showPathInput: PropTypes.bool,
  initialFolder: PropTypes.string,
  onModalClose: PropTypes.func.isRequired
};

InteractiveImportSelectFolderModalContent.defaultProps = {
  useBrowserUpload: false
};

export default InteractiveImportSelectFolderModalContent;
