import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import BookFileAudioModal from 'BookFile/BookFileAudioModal';
import BookFileEbookConvertModal from 'BookFile/BookFileEbookConvertModal';
import BookFileReaderModal from 'BookFile/BookFileReaderModal';
import FileDetailsModal from 'BookFile/FileDetailsModal';
import * as commandNames from 'Commands/commandNames';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons, kinds } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import { clearAudioPlayer, dockAudioPlayer } from 'Store/Actions/audioPlayerActions';
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
      isConvertModalOpen: false
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
      isConvertModalOpen
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

    const isAudio = isAudioByExtension || isAudioByMediaType || isAudioByQuality;
    const isEbook = isEbookByExtension || isEbookByMediaType || isEbookByQuality;
    const canConvertEbook = isEbook && !isEpub && !isKepub;
    let fileType = 'unknown';

    if (isPdf)
    {
      fileType = 'pdf';
    }
    else if (isEpub)
    {
      fileType = 'epub';
    }

    const apiKey = window.Readarr && window.Readarr.apiKey;
    const apiKeyQuery = apiKey ? `?apikey=${encodeURIComponent(apiKey)}` : '';
    const streamUrl = path ?
      getPathWithUrlBase(`/api/v1/bookfile/${id}/stream${apiKeyQuery}`) :
      null;

    return (
      <TableRowCell className={styles.TrackActionsCell}>
        {
          path &&
            <IconButton
              name={icons.INFO}
              onPress={this.onDetailsPress}
            />
        }
        {
          path && isAudio &&
            <IconButton
              name={icons.PLAY}
              title={translate('PlayAudio')}
              onPress={this.onPlayPress}
            />
        }
        {
          path && isEbook &&
            <IconButton
              name={icons.BOOK_OPEN}
              title={translate('ReadEbook')}
              onPress={this.onReaderPress}
            />
        }
        {
          path && canConvertEbook &&
            <IconButton
              name={icons.UPDATE}
              title={translate('ConvertEbook')}
              onPress={this.onConvertPress}
            />
        }
        {
          path &&
            <IconButton
              name={icons.DELETE}
              onPress={this.onDeleteFilePress}
            />
        }

        <FileDetailsModal
          isOpen={isDetailsModalOpen}
          onModalClose={this.onDetailsModalClose}
          id={id}
        />

        {
          streamUrl && isAudio &&
            <BookFileAudioModal
              isOpen={isAudioModalOpen}
              onModalClose={this.onAudioModalClose}
              onDock={this.onDockPress}
              streamUrl={streamUrl}
              bookFileId={id}
              mediaType={2}
              title={path}
            />
        }
        {
          streamUrl && isEbook &&
            <BookFileReaderModal
              isOpen={isReaderModalOpen}
              onModalClose={this.onReaderModalClose}
              streamUrl={streamUrl}
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
