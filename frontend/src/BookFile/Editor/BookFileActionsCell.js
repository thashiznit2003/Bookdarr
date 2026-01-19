import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import BookFileAudioModal from 'BookFile/BookFileAudioModal';
import BookFileEbookConvertModal from 'BookFile/BookFileEbookConvertModal';
import BookFileReaderModal from 'BookFile/BookFileReaderModal';
import FileDetailsModal from 'BookFile/FileDetailsModal';
import * as commandNames from 'Commands/commandNames';
import Button from 'Components/Link/Button';
import IconButton from 'Components/Link/IconButton';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons, kinds, sizes } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import { clearAudioPlayer, dockAudioPlayer } from 'Store/Actions/audioPlayerActions';
import { isIOS, isMobile } from 'Utilities/browser';
import getPathWithUrlBase from 'Utilities/getPathWithUrlBase';
import translate from 'Utilities/String/translate';
import styles from './BookFileActionsCell.css';

class BookFileActionsCell extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isDetailsModalOpen: false,
      isConfirmDeleteModalOpen: false,
      isAudioModalOpen: false,
      isReaderModalOpen: false,
      isConvertModalOpen: false,
      isShareInProgress: false
    };
  }

  //
  // Listeners

  onDetailsPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  onDeleteFilePress = () => {
    this.setState({ isConfirmDeleteModalOpen: true });
  };

  onPlayPress = () => {
    this.props.clearAudioPlayer();
    this.setState({ isAudioModalOpen: true });
  };

  onReaderPress = () => {
    this.setState({ isReaderModalOpen: true });
  };

  onConfirmDelete = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
    this.props.deleteBookFile({ id: this.props.id });
  };

  onConfirmDeleteModalClose = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
  };

  onAudioModalClose = () => {
    this.setState({ isAudioModalOpen: false });
  };

  onDockPress = (payload) => {
    this.props.dockAudioPlayer(payload);
  };

  onReaderModalClose = () => {
    this.setState({ isReaderModalOpen: false });
  };

  onConvertPress = () => {
    this.setState({ isConvertModalOpen: true });
  };

  onConvertModalClose = () => {
    this.setState({ isConvertModalOpen: false });
  };

  onConvertConfirm = () => {
    const { executeCommand: dispatchExecuteCommand, id } = this.props;

    dispatchExecuteCommand({
      name: commandNames.CONVERT_EBOOK,
      bookFileId: id
    });

    this.setState({ isConvertModalOpen: false });
  };

  onOpenInBooksPress = async (fileStreamUrl) => {
    if (!fileStreamUrl) {
      return;
    }

    const fileName = this.getShareFileName();
    const canShare = navigator.share && navigator.canShare;
    const shouldFetchFile = canShare && typeof navigator.canShare === 'function';

    if (navigator.share && !this.state.isShareInProgress) {
      this.setState({ isShareInProgress: true });

      try {
        if (shouldFetchFile) {
          const response = await fetch(fileStreamUrl, { credentials: 'same-origin' });
          if (!response.ok) {
            throw new Error('Failed to fetch file');
          }

          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type || undefined });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title: fileName, files: [file] });
            return;
          }
        }

        await navigator.share({ title: fileName, url: fileStreamUrl });
        return;
      } catch (error) {
        // Fall back to opening the file directly.
      } finally {
        this.setState({ isShareInProgress: false });
      }
    }

    const opened = window.open(fileStreamUrl, '_blank', 'noopener');
    if (!opened) {
      window.location.href = fileStreamUrl;
    }
  };

  getShareFileName = () => {
    const { path } = this.props;

    if (!path) {
      return 'Bookdarr';
    }

    const parts = path.split(/[/\\\\]/);
    return parts[parts.length - 1] || 'Bookdarr';
  };

  //
  // Render

  render() {

    const {
      id,
      path,
      quality,
      mediaType,
      pageCount
    } = this.props;

    const {
      isDetailsModalOpen,
      isConfirmDeleteModalOpen,
      isAudioModalOpen,
      isReaderModalOpen,
      isConvertModalOpen,
      isShareInProgress
    } = this.state;

    const pathLower = path ? path.toLowerCase() : '';
    const mediaTypeValue = typeof mediaType === 'string' ? mediaType.toLowerCase().trim() : mediaType;
    const isAudioByMediaType = mediaTypeValue === 'audiobook' || mediaTypeValue === 2 || mediaTypeValue === '2';
    const isEbookByMediaType = mediaTypeValue === 'ebook' || mediaTypeValue === 1 || mediaTypeValue === '1';

    const qualityName = quality && quality.quality && quality.quality.name ?
      quality.quality.name.toLowerCase() :
      '';
    const isAudioByQuality = ['m4b', 'mp3', 'm4a', 'aac', 'audiobook'].some((value) => qualityName.includes(value));
    const isEbookByQuality = ['epub', 'pdf', 'ebook'].some((value) => qualityName.includes(value));

    const isAudioByExtension = ['.mp3', '.m4b', '.m4a', '.aac'].some((value) => pathLower.endsWith(value));
    const isEpub = pathLower.endsWith('.epub');
    const isKepub = pathLower.endsWith('.kepub');
    const isPdf = pathLower.endsWith('.pdf');
    const isEbookByExtension = isEpub || isPdf;
    const isM4b = pathLower.endsWith('.m4b');

    const isAudio = isAudioByExtension || isAudioByMediaType || isAudioByQuality;
    const isEbook = isEbookByExtension || isEbookByMediaType || isEbookByQuality;
    const canConvertEbook = isEbook && !isEpub && !isKepub;
    let fileType = 'unknown';

    const apiKey = window.Readarr && window.Readarr.apiKey;
    const apiKeyQuery = apiKey ? `?apikey=${encodeURIComponent(apiKey)}` : '';
    const fileStreamUrl = path ?
      getPathWithUrlBase(`/api/v1/bookfile/${id}/stream${apiKeyQuery}`) :
      null;

    const isMobileDevice = isMobile();
    const showOpenInBooks = isMobileDevice && isIOS() && fileStreamUrl && (isEpub || isM4b);
    const actionClassName = isMobileDevice ? styles.touchActionButton : styles.actionButton;
    const iconSize = isMobileDevice ? 16 : 12;

    if (isPdf)
    {
      fileType = 'pdf';
    }
    else if (isEpub)
    {
      fileType = 'epub';
    }

    return (
      <TableRowCell className={styles.TrackActionsCell}>
        <div className={styles.actions}>
          {
            path &&
              <IconButton
                name={icons.INFO}
                className={actionClassName}
                size={iconSize}
                onPress={this.onDetailsPress}
              />
          }
          {
            path && isAudio &&
              <IconButton
                name={icons.PLAY}
                className={actionClassName}
                size={iconSize}
                title={translate('PlayAudio')}
                onPress={this.onPlayPress}
              />
          }
          {
            path && isEbook &&
              <IconButton
                name={icons.BOOK_OPEN}
                className={actionClassName}
                size={iconSize}
                title={translate('ReadEbook')}
                onPress={this.onReaderPress}
              />
          }
          {
            showOpenInBooks &&
              <SpinnerButton
                size={sizes.SMALL}
                onPress={() => this.onOpenInBooksPress(fileStreamUrl)}
                className={styles.openInBooksButton}
                isSpinning={isShareInProgress}
              >
                {isShareInProgress ? translate('Opening') : translate('OpenInBooks')}
              </SpinnerButton>
          }
          {
            path && canConvertEbook &&
              <IconButton
                name={icons.UPDATE}
                className={actionClassName}
                size={iconSize}
                title={translate('ConvertEbook')}
                onPress={this.onConvertPress}
              />
          }
          {
            path && !isMobileDevice &&
              <IconButton
                name={icons.DELETE}
                className={actionClassName}
                size={iconSize}
                onPress={this.onDeleteFilePress}
              />
          }
        </div>

        <FileDetailsModal
          isOpen={isDetailsModalOpen}
          onModalClose={this.onDetailsModalClose}
          id={id}
        />

        {
          fileStreamUrl && isAudio &&
            <BookFileAudioModal
              isOpen={isAudioModalOpen}
              onModalClose={this.onAudioModalClose}
              onDock={this.onDockPress}
              streamUrl={fileStreamUrl}
              bookFileId={id}
              mediaType={2}
              title={path}
            />
        }
        {
          fileStreamUrl && isEbook &&
            <BookFileReaderModal
              isOpen={isReaderModalOpen}
              onModalClose={this.onReaderModalClose}
              streamUrl={fileStreamUrl}
              fileType={fileType}
              title={path}
              bookFileId={id}
              mediaType={1}
              pageCount={pageCount}
            />
        }
        {
          path && canConvertEbook &&
            <BookFileEbookConvertModal
              isOpen={isConvertModalOpen}
              bookFileId={id}
              path={path}
              onConvertPress={this.onConvertConfirm}
              onModalClose={this.onConvertModalClose}
            />
        }

        <ConfirmModal
          isOpen={isConfirmDeleteModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteBookFile')}
          message={translate('DeleteBookFileMessageText', [path])}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDelete}
          onCancel={this.onConfirmDeleteModalClose}
        />
      </TableRowCell>

    );
  }
}

BookFileActionsCell.propTypes = {
  id: PropTypes.number.isRequired,
  path: PropTypes.string,
  quality: PropTypes.object,
  mediaType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pageCount: PropTypes.number,
  deleteBookFile: PropTypes.func.isRequired,
  executeCommand: PropTypes.func.isRequired,
  clearAudioPlayer: PropTypes.func.isRequired,
  dockAudioPlayer: PropTypes.func.isRequired
};

export default connect(null, { executeCommand, clearAudioPlayer, dockAudioPlayer })(BookFileActionsCell);
