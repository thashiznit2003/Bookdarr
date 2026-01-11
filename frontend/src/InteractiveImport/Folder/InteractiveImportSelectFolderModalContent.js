import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import PathInputConnector from 'Components/Form/PathInputConnector';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons, kinds, sizes } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import createAjaxRequest from 'Utilities/createAjaxRequest';
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
      folder: '',
      selectedFiles: [],
      uploadedFiles: [],
      isUploading: false,
      uploadError: null
    };
  }

  //
  // Listeners

  onPathChange = ({ value }) => {
    this.setState({ folder: value });
  };

  onUploadFilesChange = ({ files }) => {
    const selectedFiles = files ? Array.from(files) : [];
    this.setState({ selectedFiles, uploadError: null });
  };

  onUploadPress = () => {
    const { selectedFiles } = this.state;

    if (!selectedFiles.length) {
      this.setState({ uploadError: { message: translate('ManualImportUploadSelectFiles') } });
      return;
    }

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
      this.setState({
        folder: data?.path || '',
        uploadedFiles: data?.files || [],
        selectedFiles: []
      });
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
      onModalClose
    } = this.props;

    const folder = this.state.folder;
    const {
      selectedFiles,
      uploadedFiles,
      isUploading,
      uploadError
    } = this.state;

    const selectedNames = selectedFiles.map((file) => file.name);

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
                  />

                  <FormInputHelpText
                    text={translate('ManualImportUploadHelpText')}
                  />
                </FormGroup>

                <div className={styles.uploadActions}>
                  <SpinnerButton
                    kind={kinds.PRIMARY}
                    isSpinning={isUploading}
                    isDisabled={!selectedFiles.length}
                    onPress={this.onUploadPress}
                  >
                    {translate('ManualImportUploadButton')}
                  </SpinnerButton>

                  {
                    selectedNames.length ?
                      <div className={styles.uploadSummary}>
                        {translate('ManualImportUploadSelectedFiles', { count: selectedNames.length })}
                        <ul className={styles.uploadList}>
                          {selectedNames.map((name) => (
                            <li key={name} className={styles.uploadListItem}>{name}</li>
                          ))}
                        </ul>
                      </div> :
                      null
                  }

                  {
                    uploadedFiles.length ?
                      <div className={styles.uploadSummary}>
                        {translate('ManualImportUploadComplete', {
                          count: uploadedFiles.length,
                          path: folder
                        })}
                        <ul className={styles.uploadList}>
                          {uploadedFiles.map((name) => (
                            <li key={name} className={styles.uploadListItem}>{name}</li>
                          ))}
                        </ul>
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
  onModalClose: PropTypes.func.isRequired
};

InteractiveImportSelectFolderModalContent.defaultProps = {
  useBrowserUpload: false
};

export default InteractiveImportSelectFolderModalContent;
