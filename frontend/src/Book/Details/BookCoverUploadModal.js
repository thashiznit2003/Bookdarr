import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import TextInput from 'Components/Form/TextInput';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { updateItem } from 'Store/Actions/baseActions';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import styles from './BookCoverUploadModal.css';

class BookCoverUploadModal extends Component {
  state = {
    file: null,
    isUploading: false,
    error: null
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isOpen && !this.props.isOpen) {
      this.setState({ file: null, isUploading: false, error: null });
    }
  }

  onFileChange = ({ files }) => {
    this.setState({ file: files && files.length ? files[0] : null, error: null });
  };

  onUploadPress = () => {
    const {
      bookId,
      onModalClose,
      updateBookItem
    } = this.props;

    const { file } = this.state;

    if (!file) {
      this.setState({ error: { message: translate('SelectCoverImageFirst') } });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.setState({ isUploading: true, error: null });

    const request = createAjaxRequest({
      url: `/book/${bookId}/cover`,
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false
    }).request;

    request.done((data) => {
      if (data?.id) {
        updateBookItem(data);
      }
      onModalClose();
    });

    request.fail((xhr) => {
      this.setState({ error: xhr });
    });

    request.always(() => {
      this.setState({ isUploading: false });
    });
  };

  render() {
    const {
      isOpen,
      onModalClose
    } = this.props;

    const {
      file,
      isUploading,
      error
    } = this.state;

    const errorMessage = getErrorMessage(error, translate('UploadCoverFailed'));

    return (
      <Modal isOpen={isOpen} onModalClose={onModalClose}>
        <ModalContent onModalClose={onModalClose}>
          <ModalHeader>
            {translate('UploadCover')}
          </ModalHeader>

          <ModalBody>
            <FormGroup>
              <FormLabel>
                {translate('CoverImage')}
              </FormLabel>

              <TextInput
                className={styles.fileInput}
                name="coverFile"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={this.onFileChange}
              />

              <FormInputHelpText
                text={translate('UploadCoverHelpText')}
              />
            </FormGroup>

            {
              file &&
                <div className={styles.fileName}>
                  {file.name}
                </div>
            }

            {
              error &&
                <div className={styles.error}>
                  {errorMessage}
                </div>
            }
          </ModalBody>

          <ModalFooter>
            <Button onPress={onModalClose}>
              {translate('Cancel')}
            </Button>

            <SpinnerButton
              kind={kinds.SUCCESS}
              isSpinning={isUploading}
              onPress={this.onUploadPress}
            >
              {translate('UploadCover')}
            </SpinnerButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

BookCoverUploadModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  bookId: PropTypes.number.isRequired,
  onModalClose: PropTypes.func.isRequired,
  updateBookItem: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  updateBookItem: (item) => updateItem({ section: 'books', ...item })
};

export default connect(null, mapDispatchToProps)(BookCoverUploadModal);
