import React, { Component } from 'react';
import SpinnerButton from 'Components/Link/SpinnerButton';
import { kinds, sizes } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import translate from 'Utilities/String/translate';
import styles from './PageSidebar.css';

class SidebarDiagnosticsStatus extends Component {
  state = {
    isLoading: true,
    status: null,
    isPushing: false,
    message: null,
    error: null
  };

  componentDidMount() {
    this.fetchStatus();
  }

  fetchStatus = () => {
    const { request } = createAjaxRequest({
      url: '/diagnostics/status',
      method: 'GET',
      dataType: 'json',
      skipDiagnostics: true
    });

    request.done((data) => {
      this.setState({
        status: data,
        isLoading: false
      });
    });

    request.fail(() => {
      this.setState({
        isLoading: false,
        error: translate('DiagnosticsStatusLoadFailed')
      });
    });
  };

  onPushPress = () => {
    this.setState({
      isPushing: true,
      message: null,
      error: null
    });

    const { request } = createAjaxRequest({
      url: '/diagnostics/push',
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify({}),
      skipDiagnostics: true
    });

    request.done((data) => {
      this.setState({
        isPushing: false,
        message: data.success ? data.message || translate('SidebarDiagnosticsPushSuccess') : null,
        error: data.success ? null : data.message || translate('DiagnosticsPushFailed')
      }, () => {
        if (data.success) {
          this.fetchStatus();
        }
      });
    });

    request.fail(() => {
      this.setState({
        isPushing: false,
        error: translate('DiagnosticsPushFailed')
      });
    });
  };

  render() {
    if (window.Readarr.branch !== 'develop') {
      return null;
    }

    const {
      status,
      isPushing,
      message,
      error
    } = this.state;

    const isConfigured = !!(status?.repo && status?.hasToken);

    return (
      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarFooterTitle}>
          {translate('Diagnostics')}
        </div>
        <div className={styles.sidebarFooterNote}>
          {translate('SidebarDiagnosticsHelpText')}
        </div>
        <SpinnerButton
          kind={kinds.INFO}
          size={sizes.SMALL}
          isSpinning={isPushing}
          isDisabled={!isConfigured || isPushing}
          onPress={this.onPushPress}
        >
          {translate('PushDiagnostics')}
        </SpinnerButton>
        {
          status?.repo &&
            <div className={styles.sidebarFooterStatus}>
              {status.repo}
            </div>
        }
        {
          status &&
            <div className={styles.sidebarFooterStatus}>
              {status.hasToken ? translate('DiagnosticsTokenConfigured') : translate('DiagnosticsTokenMissing')}
            </div>
        }
        {
          message &&
            <div className={styles.sidebarFooterMessage}>
              {message}
            </div>
        }
        {
          error &&
            <div className={styles.sidebarFooterError}>
              {error}
            </div>
        }
      </div>
    );
  }
}

export default SidebarDiagnosticsStatus;
