import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import translate from 'Utilities/String/translate';
import { fetchUserBookProgress, saveUserBookProgress } from './userBookProgress';
import styles from './BookFileAudioModal.css';

class BookFileAudioModal extends Component {
  constructor(props) {
    super(props);

    this.audioRef = React.createRef();
    this.saveTimeout = null;
    this.resumePosition = null;
    this.lastSavedPosition = null;
    this.isActive = false;
    this.state = {
      isLoading: false
    };
  }

  componentDidUpdate(prevProps) {
    const isOpening = this.props.isOpen && !prevProps.isOpen;
    const isClosing = !this.props.isOpen && prevProps.isOpen;
    const changedSource = this.props.isOpen && this.props.streamUrl !== prevProps.streamUrl;

    if (isClosing) {
      this.isActive = false;
      this.flushProgress();
      this.stopAudio();
      this.setState({ isLoading: false });
    }

    if (isOpening || changedSource) {
      this.resumePosition = null;
      this.lastSavedPosition = null;
      this.isActive = true;
      this.setState({ isLoading: true });
      this.loadProgress();
    }
  }

  componentWillUnmount() {
    this.isActive = false;
    this.flushProgress();
    this.stopAudio();
  }

  loadProgress = () => {
    const { bookFileId } = this.props;

    if (!bookFileId) {
      return;
    }

    fetchUserBookProgress(bookFileId)
      .done((data) => {
        if (!this.isActive || !data) {
          return;
        }

        if (typeof data.position === 'number' && data.position > 0) {
          this.resumePosition = data.position;
          const audio = this.audioRef.current;
          if (audio && audio.readyState >= 1) {
            this.handleLoadedMetadata();
          }
        }
      })
      .fail((xhr) => {
        if (!xhr || xhr.status !== 404) {
          return;
        }
      });
  };

  scheduleSave = () => {
    if (this.saveTimeout) {
      return;
    }

    this.saveTimeout = window.setTimeout(() => {
      this.saveTimeout = null;
      this.saveProgress(false);
    }, 10000);
  };

  saveProgress = (force) => {
    const { bookFileId, mediaType } = this.props;
    const audio = this.audioRef.current;

    if (!bookFileId || !audio || !isFinite(audio.currentTime)) {
      return;
    }

    const position = Math.max(0, audio.currentTime);
    const duration = isFinite(audio.duration) ? audio.duration : null;
    const progress = duration ? Math.min(100, (position / duration) * 100) : null;

    if (!force && this.lastSavedPosition != null && Math.abs(position - this.lastSavedPosition) < 3) {
      return;
    }

    this.lastSavedPosition = position;

    saveUserBookProgress({
      bookFileId,
      mediaType,
      position,
      duration,
      progress
    });
  };

  flushProgress = () => {
    if (this.saveTimeout) {
      window.clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    this.saveProgress(true);
  };

  handleLoadedMetadata = () => {
    const audio = this.audioRef.current;
    if (!audio || this.resumePosition == null) {
      this.setState({ isLoading: false });
      return;
    }

    const duration = isFinite(audio.duration) ? audio.duration : null;
    if (duration && this.resumePosition >= duration) {
      return;
    }

    audio.currentTime = this.resumePosition;
    this.setState({ isLoading: false });
  };

  handleCanPlay = () => {
    this.setState({ isLoading: false });
  };

  handleLoadStart = () => {
    this.setState({ isLoading: true });
  };

  handleError = () => {
    this.setState({ isLoading: false });
  };

  handleTimeUpdate = () => {
    this.scheduleSave();
  };

  handlePause = () => {
    this.saveProgress(true);
  };

  handleEnded = () => {
    this.saveProgress(true);
  };

  stopAudio = () => {
    const audio = this.audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  };

  handleModalClose = () => {
    this.flushProgress();
    this.stopAudio();
    this.props.onModalClose();
  };

  handleDockPress = () => {
    const { onDock, streamUrl, bookFileId, mediaType, title } = this.props;

    if (!onDock) {
      return;
    }

    const audio = this.audioRef.current;
    const resumePosition = audio && isFinite(audio.currentTime) ? audio.currentTime : 0;
    const shouldAutoplay = audio ? !audio.paused : false;

    onDock({
      streamUrl,
      bookFileId,
      mediaType,
      title,
      resumePosition,
      shouldAutoplay
    });

    this.handleModalClose();
  };

  render() {
    const {
      isOpen,
      streamUrl
    } = this.props;
    const { isLoading } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        onModalClose={this.handleModalClose}
      >
        <ModalContent
          onModalClose={this.handleModalClose}
        >
          <ModalHeader>
            {translate('AudiobookPlayer')}
          </ModalHeader>

          <ModalBody>
            <div className={styles.player}>
              {
                isLoading ?
                  <div className={styles.loadingOverlay}>
                    <LoadingIndicator />
                  </div> :
                  null
              }
              <audio
                ref={this.audioRef}
                className={styles.audio}
                controls={true}
                preload="metadata"
                src={streamUrl}
                key={streamUrl}
                onLoadStart={this.handleLoadStart}
                onLoadedMetadata={this.handleLoadedMetadata}
                onCanPlay={this.handleCanPlay}
                onError={this.handleError}
                onTimeUpdate={this.handleTimeUpdate}
                onPause={this.handlePause}
                onEnded={this.handleEnded}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            {
              this.props.onDock ?
                (
                  <Button onPress={this.handleDockPress}>
                    {translate('DockAudiobookPlayer')}
                  </Button>
                ) :
                null
            }
            <Button onPress={this.handleModalClose}>
              {translate('Close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

BookFileAudioModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onDock: PropTypes.func,
  streamUrl: PropTypes.string.isRequired,
  bookFileId: PropTypes.number.isRequired,
  mediaType: PropTypes.number.isRequired,
  title: PropTypes.string
};

BookFileAudioModal.defaultProps = {
  onDock: null,
  title: null
};

export default BookFileAudioModal;
