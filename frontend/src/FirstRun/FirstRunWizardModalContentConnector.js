import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  fetchDownloadClients,
  fetchIndexers,
  fetchMediaManagementSettings,
  fetchNamingSettings,
  fetchRootFolders,
  saveMediaManagementSettings,
  saveNamingSettings,
  setMediaManagementSettingsValue,
  setNamingSettingsValue
} from 'Store/Actions/settingsActions';
import FirstRunWizardModalContent from './FirstRunWizardModalContent';
import styles from './FirstRunWizardModalContent.css';

const DISMISS_KEY = 'bookdarr.firstRunWizardDismissed';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.rootFolders,
    (state) => state.settings.downloadClients,
    (state) => state.settings.indexers,
    (state) => state.settings.mediaManagement,
    (state) => state.settings.naming,
    (state) => state.currentUser.item,
    (state) => state.system.status.item,
    (rootFolders, downloadClients, indexers, mediaManagement, naming, currentUser, systemStatus) => {
      const rootFolderCount = rootFolders.items.length;
      const downloadClientCount = downloadClients.items.length;
      const indexerCount = indexers.items.length;

      const isAdmin = currentUser?.isAdmin ?? systemStatus?.isAdmin ?? false;
      const authenticationEnabled = systemStatus?.authentication !== 'none';

      const shouldShowWizard = authenticationEnabled && isAdmin && (
        rootFolderCount === 0 ||
        downloadClientCount === 0 ||
        indexerCount === 0
      );

      return {
        shouldShowWizard,
        rootFolderCount,
        downloadClientCount,
        indexerCount,
        renameBooks: naming.item.renameBooks ?? false,
        standardBookFormat: naming.item.standardBookFormat ?? '',
        combineAudiobookMode: mediaManagement.item.combineAudiobookMode ?? 'disabled',
        combineAudiobookDeleteMode: mediaManagement.item.combineAudiobookDeleteMode ?? 'deleteImmediately',
        isSaving: mediaManagement.isSaving || naming.isSaving
      };
    }
  );
}

const mapDispatchToProps = {
  fetchRootFolders,
  fetchDownloadClients,
  fetchIndexers,
  fetchMediaManagementSettings,
  fetchNamingSettings,
  saveMediaManagementSettings,
  saveNamingSettings,
  setMediaManagementSettingsValue,
  setNamingSettingsValue
};

class FirstRunWizardModalContentConnector extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      dismissed: false,
      position: null,
      isDragging: false,
      dragOffset: null
    };

    this._dockRef = React.createRef();
  }

  componentDidMount() {
    this.loadDismissedState();
    this.props.fetchRootFolders();
    this.props.fetchDownloadClients();
    this.props.fetchIndexers();
    this.props.fetchMediaManagementSettings();
    this.props.fetchNamingSettings();
  }

  componentDidUpdate(prevProps, prevState) {
    const isOpen = this.getIsOpen();

    if (isOpen && !this.state.position && this._dockRef.current) {
      this.setInitialPosition();
    }

    if (!isOpen && prevState.isDragging) {
      this.stopDragging();
    }
  }

  componentWillUnmount() {
    this.stopDragging();
  }

  loadDismissedState() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const dismissed = window.localStorage.getItem(DISMISS_KEY) === 'true';
    this.setState({ dismissed });
  }

  onDismiss = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    }

    this.setState({ dismissed: true });
    this.stopDragging();
  };

  onApplyRecommendedSettings = () => {
    this.props.setNamingSettingsValue({ name: 'renameBooks', value: true });
    this.props.setMediaManagementSettingsValue({ name: 'copyUsingHardlinks', value: false });
    this.props.setMediaManagementSettingsValue({ name: 'combineAudiobookMode', value: 'mp3ToM4b' });
    this.props.setMediaManagementSettingsValue({ name: 'combineAudiobookDeleteMode', value: 'deleteImmediately' });

    this.props.saveNamingSettings();
    this.props.saveMediaManagementSettings();
  };

  getIsOpen() {
    const { shouldShowWizard } = this.props;
    const { dismissed } = this.state;

    return shouldShowWizard && !dismissed;
  }

  setInitialPosition() {
    if (!this._dockRef.current) {
      return;
    }

    const rect = this._dockRef.current.getBoundingClientRect();
    const margin = 16;
    const x = Math.max(margin, window.innerWidth - rect.width - margin);
    const y = Math.max(margin, window.innerHeight - rect.height - margin);

    this.setState({ position: { x, y } });
  }

  getEventPoint(event) {
    if (!event) {
      return null;
    }

    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      return { x: touch.clientX, y: touch.clientY };
    }

    if (event.changedTouches && event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }

    if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
      return { x: event.clientX, y: event.clientY };
    }

    return null;
  }

  onDragStart = (event) => {
    if (!this._dockRef.current) {
      return;
    }

    const point = this.getEventPoint(event);
    if (!point) {
      return;
    }

    event.preventDefault();

    const rect = this._dockRef.current.getBoundingClientRect();
    const position = this.state.position || { x: rect.left, y: rect.top };

    this.setState({
      isDragging: true,
      position,
      dragOffset: {
        x: point.x - rect.left,
        y: point.y - rect.top
      }
    });

    window.addEventListener('mousemove', this.onDragMove);
    window.addEventListener('mouseup', this.onDragEnd);
    window.addEventListener('touchmove', this.onDragMove, { passive: false });
    window.addEventListener('touchend', this.onDragEnd);
  };

  onDragMove = (event) => {
    const { isDragging, dragOffset } = this.state;

    if (!isDragging || !dragOffset || !this._dockRef.current) {
      return;
    }

    const point = this.getEventPoint(event);
    if (!point) {
      return;
    }

    event.preventDefault();

    const rect = this._dockRef.current.getBoundingClientRect();
    const margin = 16;
    const nextX = point.x - dragOffset.x;
    const nextY = point.y - dragOffset.y;
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;

    const x = Math.min(Math.max(margin, nextX), Math.max(margin, maxX));
    const y = Math.min(Math.max(margin, nextY), Math.max(margin, maxY));

    this.setState({ position: { x, y } });
  };

  onDragEnd = () => {
    this.stopDragging();
  };

  stopDragging() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.onDragMove);
      window.removeEventListener('mouseup', this.onDragEnd);
      window.removeEventListener('touchmove', this.onDragMove);
      window.removeEventListener('touchend', this.onDragEnd);
    }

    if (this.state.isDragging || this.state.dragOffset) {
      this.setState({ isDragging: false, dragOffset: null });
    }
  }

  render() {
    const { shouldShowWizard, ...otherProps } = this.props;
    const { position, isDragging } = this.state;
    const isOpen = this.getIsOpen();

    if (!isOpen) {
      return null;
    }

    const dockStyle = position ? {
      left: position.x,
      top: position.y,
      right: 'auto',
      bottom: 'auto'
    } : undefined;

    return (
      <div
        ref={this._dockRef}
        className={classNames(styles.wizardDock, isDragging && styles.wizardDockDragging)}
        style={dockStyle}
      >
        <FirstRunWizardModalContent
          {...otherProps}
          onApplyRecommendedSettings={this.onApplyRecommendedSettings}
          onDismiss={this.onDismiss}
          onDragStart={this.onDragStart}
        />
      </div>
    );
  }
}

FirstRunWizardModalContentConnector.propTypes = {
  shouldShowWizard: PropTypes.bool.isRequired,
  rootFolderCount: PropTypes.number.isRequired,
  downloadClientCount: PropTypes.number.isRequired,
  indexerCount: PropTypes.number.isRequired,
  renameBooks: PropTypes.bool.isRequired,
  standardBookFormat: PropTypes.string,
  combineAudiobookMode: PropTypes.string,
  combineAudiobookDeleteMode: PropTypes.string,
  isSaving: PropTypes.bool.isRequired,
  fetchRootFolders: PropTypes.func.isRequired,
  fetchDownloadClients: PropTypes.func.isRequired,
  fetchIndexers: PropTypes.func.isRequired,
  fetchMediaManagementSettings: PropTypes.func.isRequired,
  fetchNamingSettings: PropTypes.func.isRequired,
  saveMediaManagementSettings: PropTypes.func.isRequired,
  saveNamingSettings: PropTypes.func.isRequired,
  setMediaManagementSettingsValue: PropTypes.func.isRequired,
  setNamingSettingsValue: PropTypes.func.isRequired
};

FirstRunWizardModalContentConnector.defaultProps = {
  standardBookFormat: '',
  combineAudiobookMode: 'disabled',
  combineAudiobookDeleteMode: 'deleteImmediately'
};

export default connect(createMapStateToProps, mapDispatchToProps)(FirstRunWizardModalContentConnector);
