import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { saveDelayProfile, setDelayProfileValue } from 'Store/Actions/settingsActions';
import selectSettings from 'Store/Selectors/selectSettings';
import EditDelayProfileModalContent from './EditDelayProfileModalContent';

const newDelayProfile = {
  enableUsenet: true,
  enableTorrent: true,
  enableStacks: false,
  preferredProtocol: 'usenet',
  usenetDelay: 0,
  torrentDelay: 0,
  stacksDelay: 0,
  bypassIfHighestQuality: false,
  bypassIfAboveCustomFormatScore: false,
  minimumCustomFormatScore: 0,
  tags: []
};

const protocolOptions = [
  { key: 'preferUsenet', value: 'Prefer Usenet' },
  { key: 'preferTorrent', value: 'Prefer Torrent' },
  { key: 'preferStacks', value: 'Prefer Stacks' },
  { key: 'onlyUsenet', value: 'Only Usenet' },
  { key: 'onlyTorrent', value: 'Only Torrent' },
  { key: 'onlyStacks', value: 'Only Stacks' }
];

function createDelayProfileSelector() {
  return createSelector(
    (state, { id }) => id,
    (state) => state.settings.delayProfiles,
    (id, delayProfiles) => {
      const {
        isFetching,
        error,
        isSaving,
        saveError,
        pendingChanges,
        items
      } = delayProfiles;

      const profile = id ? _.find(items, { id }) : newDelayProfile;
      const settings = selectSettings(profile, pendingChanges, saveError);

      return {
        id,
        isFetching,
        error,
        isSaving,
        saveError,
        item: settings.settings,
        ...settings
      };
    }
  );
}

function createMapStateToProps() {
  return createSelector(
    createDelayProfileSelector(),
    (delayProfile) => {
      const enableUsenet = delayProfile.item.enableUsenet.value;
      const enableTorrent = delayProfile.item.enableTorrent.value;
      const enableStacks = delayProfile.item.enableStacks.value;
      const preferredProtocol = delayProfile.item.preferredProtocol.value;
      let protocol = 'preferUsenet';

      const enabledProtocols = [enableUsenet, enableTorrent, enableStacks].filter(Boolean).length;

      if (enabledProtocols === 1) {
        if (enableUsenet) {
          protocol = 'onlyUsenet';
        } else if (enableTorrent) {
          protocol = 'onlyTorrent';
        } else {
          protocol = 'onlyStacks';
        }
      } else if (preferredProtocol === 'torrent') {
        protocol = 'preferTorrent';
      } else if (preferredProtocol === 'stacks') {
        protocol = 'preferStacks';
      }

      return {
        protocol,
        protocolOptions,
        ...delayProfile
      };
    }
  );
}

const mapDispatchToProps = {
  setDelayProfileValue,
  saveDelayProfile
};

class EditDelayProfileModalContentConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    if (!this.props.id) {
      Object.keys(newDelayProfile).forEach((name) => {
        this.props.setDelayProfileValue({
          name,
          value: newDelayProfile[name]
        });
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSaving && !this.props.isSaving && !this.props.saveError) {
      this.props.onModalClose();
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setDelayProfileValue({ name, value });
  };

  onProtocolChange = ({ value }) => {
    switch (value) {
      case 'preferUsenet':
        this.props.setDelayProfileValue({ name: 'enableUsenet', value: true });
        this.props.setDelayProfileValue({ name: 'enableTorrent', value: true });
        this.props.setDelayProfileValue({ name: 'preferredProtocol', value: 'usenet' });
        break;
      case 'preferTorrent':
        this.props.setDelayProfileValue({ name: 'enableUsenet', value: true });
        this.props.setDelayProfileValue({ name: 'enableTorrent', value: true });
        this.props.setDelayProfileValue({ name: 'preferredProtocol', value: 'torrent' });
        break;
      case 'preferStacks':
        this.props.setDelayProfileValue({ name: 'enableUsenet', value: true });
        this.props.setDelayProfileValue({ name: 'enableTorrent', value: true });
        this.props.setDelayProfileValue({ name: 'enableStacks', value: true });
        this.props.setDelayProfileValue({ name: 'preferredProtocol', value: 'stacks' });
        break;
      case 'onlyUsenet':
        this.props.setDelayProfileValue({ name: 'enableUsenet', value: true });
        this.props.setDelayProfileValue({ name: 'enableTorrent', value: false });
        this.props.setDelayProfileValue({ name: 'enableStacks', value: false });
        this.props.setDelayProfileValue({ name: 'preferredProtocol', value: 'usenet' });
        break;
      case 'onlyTorrent':
        this.props.setDelayProfileValue({ name: 'enableUsenet', value: false });
        this.props.setDelayProfileValue({ name: 'enableTorrent', value: true });
        this.props.setDelayProfileValue({ name: 'enableStacks', value: false });
        this.props.setDelayProfileValue({ name: 'preferredProtocol', value: 'torrent' });
        break;
      case 'onlyStacks':
        this.props.setDelayProfileValue({ name: 'enableUsenet', value: false });
        this.props.setDelayProfileValue({ name: 'enableTorrent', value: false });
        this.props.setDelayProfileValue({ name: 'enableStacks', value: true });
        this.props.setDelayProfileValue({ name: 'preferredProtocol', value: 'stacks' });
        break;
      default:
        throw Error(`Unknown protocol option: ${value}`);
    }
  };

  onSavePress = () => {
    this.props.saveDelayProfile({ id: this.props.id });
  };

  //
  // Render

  render() {
    return (
      <EditDelayProfileModalContent
        {...this.props}
        onSavePress={this.onSavePress}
        onInputChange={this.onInputChange}
        onProtocolChange={this.onProtocolChange}
      />
    );
  }
}

EditDelayProfileModalContentConnector.propTypes = {
  id: PropTypes.number,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  setDelayProfileValue: PropTypes.func.isRequired,
  saveDelayProfile: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(EditDelayProfileModalContentConnector);
