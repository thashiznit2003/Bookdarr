import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import styles from './BookFileEbookConvertModal.css';

function getFileName(path) {
  if (!path) {
    return '';
  }

  const parts = path.split('/');
  return parts[parts.length - 1];
}

class BookFileEbookConvertModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isScanning: false,
      scanResult: null,
      scanError: null
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.loadScan();
    }
  }

  loadScan = () => {
    const { path, bookFileId } = this.props;
    const pathLower = path ? path.toLowerCase() : '';
    const isPdf = pathLower.endsWith('.pdf');

    if (isPdf) {
      this.setState({
        isScanning: true,
        scanResult: null,
        scanError: null
      });

      const { request } = createAjaxRequest({
        url: `/bookfile/${bookFileId}/convert/scan`,
        method: 'POST',
        dataType: 'json'
      });

      request.done((data) => {
        this.setState({
          isScanning: false,
          scanResult: data,
          scanError: null
        });
      });

      request.fail((xhr) => {
        this.setState({
          isScanning: false,
          scanError: getErrorMessage(xhr, translate('ConvertEbookScanError'))
        });
      });

      return;
    }

    this.setState({
      isScanning: false,
      scanResult: {
        isPdf: false
      },
      scanError: null
    });
  };

  onConvertPress = () => {
    const { onConvertPress } = this.props;
    onConvertPress();
  };

  renderScanDetails() {
    const { isScanning, scanResult, scanError } = this.state;

    if (isScanning) {
      return (
        <div className={styles.scanLoading}>
          <LoadingIndicator />
          <div className={styles.scanLoadingText}>
            {translate('ConvertEbookScanRunning')}
          </div>
        </div>
      );
    }

    if (scanError) {
      return (
        <Alert kind={kinds.DANGER}>
          {scanError}
        </Alert>
      );
    }

    const hasPdfResult = scanResult && scanResult.isPdf;

    if (hasPdfResult) {
      const hasImageOnlyPercent =
        scanResult.imageOnlyPercent !== null &&
        scanResult.imageOnlyPercent !== undefined;
      const imagePercent = hasImageOnlyPercent ?
        scanResult.imageOnlyPercent.toFixed(1) :
        '0.0';
      const textReadable = scanResult.textReadable ? translate('Yes') : translate('No');

      return (
        <div>
          <div className={styles.scanRow}>
            <span className={styles.scanLabel}>
              {translate('ConvertEbookScanImagePercent', [
                imagePercent,
                scanResult.imageOnlyPages,
                scanResult.totalPages
              ])}
            </span>
          </div>
          <div className={styles.scanRow}>
            <span className={styles.scanLabel}>
              {translate('ConvertEbookScanTextReadable', [textReadable])}
            </span>
          </div>
          {
            scanResult.warning &&
              <Alert kind={kinds.WARNING} className={styles.scanWarning}>
                {scanResult.warning}
              </Alert>
          }
        </div>
      );
    }

    return (
      <div className={styles.scanNote}>
        {translate('ConvertEbookScanNotPdf')}
      </div>
    );
  }

  render() {
    const {
      isOpen,
      path,
      onModalClose
    } = this.props;

    const { isScanning, scanResult, scanError } = this.state;
    const pathLower = path ? path.toLowerCase() : '';
    const isPdf = pathLower.endsWith('.pdf');
    const isConvertDisabled = isPdf && (isScanning || scanError || !scanResult);

    return (
      <Modal
        isOpen={isOpen}
        onModalClose={onModalClose}
      >
        <ModalContent onModalClose={onModalClose}>
          <ModalHeader>
            {translate('ConvertEbookModalTitle')}
          </ModalHeader>

          <ModalBody>
            <div className={styles.description}>
              {translate('ConvertEbookModalDescription')}
            </div>

            <div className={styles.fileName}>
              {getFileName(path)}
            </div>

            <div className={styles.scanSection}>
              <div className={styles.scanTitle}>
                {translate('ConvertEbookScanTitle')}
              </div>
              {this.renderScanDetails()}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button onPress={onModalClose}>
              {translate('Cancel')}
            </Button>

            <SpinnerButton
              isDisabled={isConvertDisabled}
              onPress={this.onConvertPress}
            >
              {translate('ConvertEbook')}
            </SpinnerButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

BookFileEbookConvertModal.propTypes = {
  bookFileId: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  onConvertPress: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default BookFileEbookConvertModal;
