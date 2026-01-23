import React, { Component } from 'react';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import { icons } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import styles from './DatabaseCommandsPage.css';

class DatabaseCommandsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isRunning: false,
      error: null,
      logs: [],
      lastMessage: null,
      lastCount: null
    };
  }

  onFindInvalidLinksPress = () => {
    this.runCommand({
      url: '/database/commands/invalid-file-links',
      method: 'GET'
    });
  };

  onClearInvalidLinksPress = () => {
    this.runCommand({
      url: '/database/commands/clear-invalid-file-links',
      method: 'POST'
    });
  };

  onFindMissingPathsPress = () => {
    this.runCommand({
      url: '/database/commands/missing-file-paths',
      method: 'GET'
    });
  };

  onRemoveDuplicatePathsPress = () => {
    this.runCommand({
      url: '/database/commands/remove-duplicate-file-paths',
      method: 'POST'
    });
  };

  runCommand = ({ url, method }) => {
    this.setState({ isRunning: true, error: null });

    const request = createAjaxRequest({
      url,
      method
    });

    request.request.done((data) => {
      const logs = data?.logs || [];

      this.setState((prevState) => {
        return {
          isRunning: false,
          error: null,
          logs: [...prevState.logs, ...logs],
          lastMessage: data?.message || null,
          lastCount: data?.count ?? null
        };
      });
    });

    request.request.fail((xhr) => {
      const errorMessage = getErrorMessage(xhr, translate('DatabaseCommandsFailed'));

      this.setState((prevState) => {
        return {
          isRunning: false,
          error: xhr,
          logs: [...prevState.logs, errorMessage]
        };
      });
    });
  };

  render() {
    const {
      isRunning,
      error,
      logs,
      lastMessage,
      lastCount
    } = this.state;

    return (
      <PageContent>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              onPress={this.onFindInvalidLinksPress}
              isDisabled={isRunning}
              iconName={icons.SEARCH}
              label={translate('DatabaseCommandsFindInvalidFileLinks')}
            />
            <PageToolbarButton
              onPress={this.onClearInvalidLinksPress}
              isDisabled={isRunning}
              iconName={icons.CLEAR}
              label={translate('DatabaseCommandsClearInvalidFileLinks')}
            />
            <PageToolbarButton
              onPress={this.onFindMissingPathsPress}
              isDisabled={isRunning}
              iconName={icons.SEARCH}
              label={translate('DatabaseCommandsFindMissingFilePaths')}
            />
            <PageToolbarButton
              onPress={this.onRemoveDuplicatePathsPress}
              isDisabled={isRunning}
              iconName={icons.CLEAR}
              label={translate('DatabaseCommandsRemoveDuplicateFileEntries')}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody className={styles.pageBody}>
          {isRunning && <LoadingIndicator />}

          {error && (
            <div className={styles.errorMessage}>
              {getErrorMessage(error, translate('DatabaseCommandsFailed'))}
            </div>
          )}

          {lastMessage && (
            <div className={styles.summary}>
              <span>{lastMessage}</span>
              {lastCount !== null && <span className={styles.count}>({lastCount})</span>}
            </div>
          )}

          <div className={styles.logPanel}>
            <div className={styles.logHeader}>{translate('DatabaseCommandsLog')}</div>
            <pre className={styles.logOutput}>
              {logs.length ? logs.join('\n') : translate('DatabaseCommandsNoLogs')}
            </pre>
          </div>
        </PageContentBody>
      </PageContent>
    );
  }
}

export default DatabaseCommandsPage;
