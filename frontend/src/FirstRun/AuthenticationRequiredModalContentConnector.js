import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import { fetchCurrentUser } from 'Store/Actions/currentUserActions';
import { fetchGeneralSettings, saveGeneralSettings, setGeneralSettingsValue } from 'Store/Actions/settingsActions';
import { fetchStatus } from 'Store/Actions/systemActions';
import createSettingsSectionSelector from 'Store/Selectors/createSettingsSectionSelector';
import AuthenticationRequiredModalContent from './AuthenticationRequiredModalContent';

const SECTION = 'general';

function createMapStateToProps() {
  return createSelector(
    createSettingsSectionSelector(SECTION),
    (sectionSettings) => {
      return {
        ...sectionSettings
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchClearPendingChanges: clearPendingChanges,
  dispatchSetGeneralSettingsValue: setGeneralSettingsValue,
  dispatchSaveGeneralSettings: saveGeneralSettings,
  dispatchFetchGeneralSettings: fetchGeneralSettings,
  dispatchFetchStatus: fetchStatus,
  dispatchFetchCurrentUser: fetchCurrentUser
};

class AuthenticationRequiredModalContentConnector extends Component {
  constructor(props, context) {
    super(props, context);

    this._pendingLogin = null;
  }

  //
  // Lifecycle

  componentDidMount() {
    this.props.dispatchFetchGeneralSettings();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isSaving && !this.props.isSaving) {
      if (!this.props.saveError && this._pendingLogin) {
        this.login(this._pendingLogin);
      }

      this._pendingLogin = null;
    }
  }

  componentWillUnmount() {
    this.props.dispatchClearPendingChanges({ section: `settings.${SECTION}` });
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.dispatchSetGeneralSettingsValue({ name, value });
  };

  onSavePress = () => {
    const settings = this.props.settings || {};
    const username = settings.username?.value ?? '';
    const password = settings.password?.value ?? '';

    this._pendingLogin = {
      username,
      password
    };

    this.props.dispatchSaveGeneralSettings();
  };

  login = async ({ username, password }) => {
    if (!username || !password) {
      return;
    }

    const loginUrl = `${window.Readarr.urlBase}/login`;
    const body = new URLSearchParams({
      username,
      password,
      rememberMe: 'true'
    });

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
        credentials: 'same-origin'
      });

      if (response.ok && !response.url.includes('loginFailed=true')) {
        this.props.dispatchFetchCurrentUser();
      }
    } catch (error) {
      // Silent fail; the user can still log in manually.
    }
  };

  //
  // Render

  render() {
    const {
      dispatchClearPendingChanges,
      dispatchFetchGeneralSettings,
      dispatchSetGeneralSettingsValue,
      dispatchSaveGeneralSettings,
      ...otherProps
    } = this.props;

    return (
      <AuthenticationRequiredModalContent
        {...otherProps}
        onInputChange={this.onInputChange}
        onSavePress={this.onSavePress}
      />
    );
  }
}

AuthenticationRequiredModalContentConnector.propTypes = {
  dispatchClearPendingChanges: PropTypes.func.isRequired,
  dispatchFetchGeneralSettings: PropTypes.func.isRequired,
  dispatchSetGeneralSettingsValue: PropTypes.func.isRequired,
  dispatchSaveGeneralSettings: PropTypes.func.isRequired,
  dispatchFetchStatus: PropTypes.func.isRequired,
  dispatchFetchCurrentUser: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  saveError: PropTypes.object,
  settings: PropTypes.object
};

export default connect(createMapStateToProps, mapDispatchToProps)(AuthenticationRequiredModalContentConnector);
