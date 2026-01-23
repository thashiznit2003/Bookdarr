import React, { Component } from 'react';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import { icons, kinds } from 'Helpers/Props';
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
      lastCount: null,
      isMissingPathsConfirmOpen: false,
      missingPathsCount: 0,
      isDuplicateConfirmOpen: false,
      duplicateCount: 0
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
      method: 'GET',
      onComplete: (data) => {
        const count = data?.count ?? 0;

        if (count > 0) {
          this.setState({
            isMissingPathsConfirmOpen: true,
            missingPathsCount: count
          });
        }
      }
    });
  };

  onClearMissingPathsConfirm = () => {
    this.setState({ isMissingPathsConfirmOpen: false });

    this.runCommand({
      url: '/database/commands/clear-missing-file-paths',
      method: 'POST'
    });
  };

  onMissingPathsConfirmClose = () => {
    this.setState({ isMissingPathsConfirmOpen: false });
  };

  onFindDuplicatePathsPress = () => {
    this.runCommand({
      url: '/database/commands/duplicate-file-paths',
      method: 'GET',
      onComplete: (data) => {
        const count = data?.count ?? 0;

        if (count > 0) {
          this.setState({
            isDuplicateConfirmOpen: true,
            duplicateCount: count
          });
        }
      }
    });
  };

  onRemoveDuplicatePathsConfirm = () => {
    this.setState({ isDuplicateConfirmOpen: false });

    this.runCommand({
      url: '/database/commands/remove-duplicate-file-paths',
      method: 'POST'
    });
  };

  onDuplicateConfirmClose = () => {
    this.setState({ isDuplicateConfirmOpen: false });
  };

  runCommand = ({ url, method, onComplete }) => {
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
      }, () => {
        if (onComplete) {
          onComplete(data);
        }
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
      lastCount,
      isMissingPathsConfirmOpen,
      missingPathsCount,
      isDuplicateConfirmOpen,
      duplicateCount
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
              title={translate('DatabaseCommandsFindInvalidFileLinksTooltip')}
            />
            <PageToolbarButton
              onPress={this.onClearInvalidLinksPress}
              isDisabled={isRunning}
              iconName={icons.CLEAR}
              label={translate('DatabaseCommandsClearInvalidFileLinks')}
              title={translate('DatabaseCommandsClearInvalidFileLinksTooltip')}
            />
            <PageToolbarButton
              onPress={this.onFindMissingPathsPress}
              isDisabled={isRunning}
              iconName={icons.SEARCH}
              label={translate('DatabaseCommandsFindMissingFilePaths')}
              title={translate('DatabaseCommandsFindMissingFilePathsTooltip')}
            />
            <PageToolbarButton
              onPress={this.onFindDuplicatePathsPress}
              isDisabled={isRunning}
              iconName={icons.CLEAR}
              label={translate('DatabaseCommandsRemoveDuplicateFileEntries')}
              title={translate('DatabaseCommandsRemoveDuplicateFileEntriesTooltip')}
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

        <ConfirmModal
          isOpen={isMissingPathsConfirmOpen}
          kind={kinds.DANGER}
          title={translate('DatabaseCommandsMissingFilePathsConfirmTitle')}
          message={
            <div>
              <div>{translate('DatabaseCommandsMissingFilePathsConfirmMessage', [missingPathsCount])}</div>
              <div>{translate('DatabaseCommandsMissingFilePathsConfirmNote')}</div>
            </div>
          }
          confirmLabel={translate('DatabaseCommandsRemoveMissingFileEntries')}
          onConfirm={this.onClearMissingPathsConfirm}
          onCancel={this.onMissingPathsConfirmClose}
        />

        <ConfirmModal
          isOpen={isDuplicateConfirmOpen}
          kind={kinds.DANGER}
          title={translate('DatabaseCommandsDuplicateFilePathsConfirmTitle')}
          message={
            <div>
              <div>{translate('DatabaseCommandsDuplicateFilePathsConfirmMessage', [duplicateCount])}</div>
              <div>{translate('DatabaseCommandsDuplicateFilePathsConfirmNote')}</div>
            </div>
          }
          confirmLabel={translate('DatabaseCommandsRemoveDuplicateFileEntriesConfirm')}
          onConfirm={this.onRemoveDuplicatePathsConfirm}
          onCancel={this.onDuplicateConfirmClose}
        />
      </PageContent>
    );
  }
}

export default DatabaseCommandsPage;
