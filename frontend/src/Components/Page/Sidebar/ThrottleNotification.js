import React, { Component } from 'react';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import translate from 'Utilities/String/translate';
import styles from './PageSidebar.css';

const POLL_INTERVAL = 60000;

export default class ThrottleNotification extends Component {
  state = {
    status: null
  };

  componentDidMount() {
    this.fetchStatus();
    this._pollInterval = window.setInterval(this.fetchStatus, POLL_INTERVAL);
  }

  componentWillUnmount() {
    if (this._pollInterval) {
      window.clearInterval(this._pollInterval);
    }
  }

  fetchStatus = () => {
    const { request } = createAjaxRequest({
      url: '/system/throttle',
      method: 'GET',
      dataType: 'json',
      skipDiagnostics: true
    });

    request.done((data) => {
      this.setState({
        status: data
      });
    });

    request.fail(() => {
      this.setState({
        status: null
      });
    });
  };

  render() {
    const { status } = this.state;

    if (!status || !status.isThrottled) {
      return null;
    }

    const message = status.message || translate('ThrottleNotificationFallback');

    return (
      <div className={styles.sidebarThrottleNotification}>
        <div className={styles.sidebarThrottleTitle}>{translate('ThrottleNotificationTitle')}</div>
        <div className={styles.sidebarThrottleMessage}>{message}</div>
      </div>
    );
  }
}
