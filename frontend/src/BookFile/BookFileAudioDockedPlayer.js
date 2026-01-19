import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { clearAudioPlayer } from 'Store/Actions/audioPlayerActions';
import { fetchUserBookProgress, saveUserBookProgress } from './userBookProgress';
import styles from './BookFileAudioDockedPlayer.css';

class BookFileAudioDockedPlayer extends Component {
  constructor(props) {
    super(props);

    this.audioRef = React.createRef();
    this.saveTimeout = null;
    this.resumePosition = null;
    this.shouldAutoplay = false;
    this.lastSavedPosition = null;
    this.isActive = false;
  }

  componentDidUpdate(prevProps) {
    const isOpening = this.props.isDocked && !prevProps.isDocked;
    const isClosing = !this.props.isDocked && prevProps.isDocked;
    const changedSource = this.props.isDocked && this.props.streamUrl !== prevProps.streamUrl;

    if (isClosing) {
      this.isActive = false;
      this.flushProgress();
    }

    if (isOpening || changedSource) {
      this.isActive = true;
      this.resumePosition = null;
      this.shouldAutoplay = false;
      this.lastSavedPosition = null;
      this.applyResumeFromProps();

      if (this.resumePosition == null) {
        this.loadProgress();
      }
    }
  }

  componentWillUnmount() {
    this.isActive = false;
    this.flushProgress();
  }

  applyResumeFromProps = () => {
    const { resumePosition, shouldAutoplay } = this.props;

    if (Number.isFinite(resumePosition)) {
      this.resumePosition = resumePosition;
      this.shouldAutoplay = !!shouldAutoplay;
    }
  };

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

        if (typeof data.position === 'number' && data.position >= 0) {
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
      return;
    }

    const duration = isFinite(audio.duration) ? audio.duration : null;
    if (duration && this.resumePosition >= duration) {
      return;
    }

    audio.currentTime = this.resumePosition;

    if (this.shouldAutoplay) {
      const playPromise = audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
      this.shouldAutoplay = false;
    }
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

  handleClose = () => {
    const audio = this.audioRef.current;
    if (audio) {
      audio.pause();
    }

    this.flushProgress();
    this.props.clearAudioPlayer();
  };

  getDisplayTitle = () => {
    const { title } = this.props;

    if (!title) {
      return translate('AudiobookPlayer');
    }

    const parts = title.split(/[/\\\\]/);
    return parts[parts.length - 1] || title;
  };

  render() {
    const { isDocked, streamUrl } = this.props;

    if (!isDocked || !streamUrl) {
      return null;
    }

    return (
      <div className={styles.dockedPlayer}>
        <div className={styles.title} title={this.getDisplayTitle()}>
          {this.getDisplayTitle()}
        </div>
        <audio
          ref={this.audioRef}
          className={styles.audio}
          controls={true}
          preload="metadata"
          src={streamUrl}
          onLoadedMetadata={this.handleLoadedMetadata}
          onTimeUpdate={this.handleTimeUpdate}
          onPause={this.handlePause}
          onEnded={this.handleEnded}
        />
        <div className={styles.actions}>
          <IconButton
            name={icons.CLOSE}
            title={translate('Close')}
            onPress={this.handleClose}
          />
        </div>
      </div>
    );
  }
}

BookFileAudioDockedPlayer.propTypes = {
  isDocked: PropTypes.bool.isRequired,
  streamUrl: PropTypes.string,
  bookFileId: PropTypes.number,
  mediaType: PropTypes.number,
  title: PropTypes.string,
  resumePosition: PropTypes.number,
  shouldAutoplay: PropTypes.bool,
  clearAudioPlayer: PropTypes.func.isRequired
};

BookFileAudioDockedPlayer.defaultProps = {
  streamUrl: null,
  bookFileId: 0,
  mediaType: 2,
  title: null,
  resumePosition: null,
  shouldAutoplay: false
};

const mapStateToProps = (state) => ({
  isDocked: state.audioPlayer.isDocked,
  streamUrl: state.audioPlayer.streamUrl,
  bookFileId: state.audioPlayer.bookFileId,
  mediaType: state.audioPlayer.mediaType,
  title: state.audioPlayer.title,
  resumePosition: state.audioPlayer.resumePosition,
  shouldAutoplay: state.audioPlayer.shouldAutoplay
});

export default connect(mapStateToProps, { clearAudioPlayer })(BookFileAudioDockedPlayer);
