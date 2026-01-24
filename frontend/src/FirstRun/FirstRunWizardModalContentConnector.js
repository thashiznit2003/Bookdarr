import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
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
        copyUsingHardlinks: mediaManagement.item.copyUsingHardlinks ?? false,
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
      dismissed: false
    };
  }

  componentDidMount() {
    this.loadDismissedState();
    this.props.fetchRootFolders();
    this.props.fetchDownloadClients();
    this.props.fetchIndexers();
    this.props.fetchMediaManagementSettings();
    this.props.fetchNamingSettings();
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
  };

  onApplyRecommendedSettings = () => {
    this.props.setNamingSettingsValue({ name: 'renameBooks', value: true });
    this.props.setMediaManagementSettingsValue({ name: 'copyUsingHardlinks', value: false });
    this.props.setMediaManagementSettingsValue({ name: 'combineAudiobookMode', value: 'mp3ToM4b' });
    this.props.setMediaManagementSettingsValue({ name: 'combineAudiobookDeleteMode', value: 'deleteImmediately' });

    this.props.saveNamingSettings();
    this.props.saveMediaManagementSettings();
  };

  render() {
    const { shouldShowWizard, ...otherProps } = this.props;
    const { dismissed } = this.state;
    const isOpen = shouldShowWizard && !dismissed;

    return (
      <Modal
        size={sizes.LARGE}
        isOpen={isOpen}
        closeOnBackgroundClick={false}
        onModalClose={this.onDismiss}
      >
        <FirstRunWizardModalContent
          {...otherProps}
          onApplyRecommendedSettings={this.onApplyRecommendedSettings}
          onDismiss={this.onDismiss}
        />
      </Modal>
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
  copyUsingHardlinks: PropTypes.bool.isRequired,
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
