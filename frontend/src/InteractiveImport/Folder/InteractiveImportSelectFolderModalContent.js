import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import PathInputConnector from 'Components/Form/PathInputConnector';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import ProgressBar from 'Components/ProgressBar';
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
      uploadError: null,
      uploadProgress: null
    };
  }

  componentDidMount() {
    if (this.props.autoStartInteractive && this.state.folder) {
      this.props.onInteractiveImportPress(this.state.folder);
    }
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

      if (this.props.autoStartInteractive) {
        this.props.onInteractiveImportPress(this.props.initialFolder);
      }
    }
  }

  onPathChange = ({ value }) => {
    this.setState({ folder: value });

    if (this.props.autoStartInteractive && value) {
      this.props.onInteractiveImportPress(value);
    }
  };

  onUploadFilesChange = (eventOrPayload) => {
    const files = eventOrPayload?.target?.files || eventOrPayload?.files;
    const selectedFiles = files ? Array.from(files) : [];
    if (!selectedFiles.length) {
      return;
    }

    this.setState({ selectedFiles, uploadError: null });

    // Auto-upload when files are selected
    this.uploadFiles(selectedFiles);
  };

  buildUploadBatches = (files) => {
    const maxBatchBytes = 1024 * 1024 * 1024;
    const maxBatchFiles = 20;
    const batches = [];
    let current = [];
    let currentBytes = 0;

    files.forEach((file) => {
      const size = file?.size || 0;
      const wouldOverflow = current.length >= maxBatchFiles || (currentBytes + size > maxBatchBytes && current.length > 0);

      if (wouldOverflow) {
        batches.push({ files: current, bytes: currentBytes });
        current = [];
        currentBytes = 0;
      }

      current.push(file);
      currentBytes += size;

      if (size > maxBatchBytes) {
        batches.push({ files: current, bytes: currentBytes });
        current = [];
        currentBytes = 0;
      }
    });

    if (current.length) {
      batches.push({ files: current, bytes: currentBytes });
    }

    return batches;
  };

  uploadBatch = (files, uploadFolder, onUploadProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (uploadFolder) {
      formData.append('folder', uploadFolder);
    }

    const request = createAjaxRequest({
      url: '/manualimport/upload',
      method: 'POST',
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false,
      onUploadProgress
    }).request;

    return new Promise((resolve, reject) => {
      request.done(resolve).fail(reject);
    });
  };

  uploadFiles = async (selectedFiles) => {
    const batches = this.buildUploadBatches(selectedFiles);
    const totalBytes = selectedFiles.reduce((sum, file) => sum + (file?.size || 0), 0);
    let uploadedBytes = 0;
    let uploadPath = '';

    this.setState({ isUploading: true, uploadError: null, uploadProgress: totalBytes ? 0 : null });

    try {
      for (const batch of batches) {
        const batchBytes = batch.bytes || 0;
        const data = await this.uploadBatch(batch.files, uploadPath, (event) => {
          if (!event || !event.lengthComputable || !totalBytes) {
            return;
          }

          const progressBytes = uploadedBytes + event.loaded;
          const progress = Math.min(100, (progressBytes / totalBytes) * 100);
          this.setState({ uploadProgress: progress });
        });

        uploadPath = data?.path || uploadPath;
        uploadedBytes += batchBytes;

        if (totalBytes) {
          const progress = Math.min(100, (uploadedBytes / totalBytes) * 100);
          this.setState({ uploadProgress: progress });
        }
      }

      this.setState({
        folder: uploadPath,
        selectedFiles: []
      });

      if (uploadPath) {
        this.props.onInteractiveImportPress(uploadPath);
      }
    } catch (xhr) {
      this.setState({ uploadError: xhr });
    } finally {
      this.setState({ isUploading: false });
    }
  };

  onRecentPathPress = (folder) => {
    this.setState({ folder });

    if (this.props.autoStartInteractive && folder) {
      this.props.onInteractiveImportPress(folder);
    }
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
      autoStartInteractive,
      onModalClose
    } = this.props;

    const folder = this.state.folder;
    const {
      isUploading,
      uploadError,
      uploadProgress,
      selectedFiles
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

                  <input
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
                        <div className={styles.uploadProgressHeader}>
                          <Icon name={icons.SPINNER} isSpinning={true} />
                          {translate('ManualImportUploading')}
                          {
                            selectedFiles.length > 0 ?
                              <span className={styles.uploadCount}>
                                {selectedFiles.length} files
                              </span> :
                              null
                          }
                        </div>

                        <ProgressBar
                          className={styles.uploadProgressBar}
                          progress={uploadProgress || 0}
                          isIndeterminate={uploadProgress === null}
                          showText={true}
                          size={sizes.SMALL}
                          kind={kinds.DEFAULT}
                          text={
                            uploadProgress === null ?
                              'Preparing upload...' :
                              `${uploadProgress.toFixed(0)}%`
                          }
                        />
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
              !autoStartInteractive &&
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
