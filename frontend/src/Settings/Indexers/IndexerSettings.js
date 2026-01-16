import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Alert from 'Components/Alert';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import { icons, kinds } from 'Helpers/Props';
import SettingsToolbarConnector from 'Settings/SettingsToolbarConnector';
import translate from 'Utilities/String/translate';
import IndexersConnector from './Indexers/IndexersConnector';
import ManageIndexersModal from './Indexers/Manage/ManageIndexersModal';
import IndexerOptionsConnector from './Options/IndexerOptionsConnector';

class IndexerSettings extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._saveCallback = null;
    this._importInput = null;

    this.state = {
      isSaving: false,
      hasPendingChanges: false,
      isManageIndexersOpen: false,
      isImporting: false,
      alertMessage: null,
      alertKind: kinds.INFO
    };
  }

  showAlert = (message, kind = kinds.INFO) => {
    this.setState({ alertMessage: message, alertKind: kind });
  };

  clearAlert = () => {
    this.setState({ alertMessage: null });
  };

  //
  // Listeners

  onChildMounted = (saveCallback) => {
    this._saveCallback = saveCallback;
  };

  onChildStateChange = (payload) => {
    this.setState(payload);
  };

  onManageIndexersPress = () => {
    this.setState({ isManageIndexersOpen: true });
  };

  onManageIndexersModalClose = () => {
    this.setState({ isManageIndexersOpen: false });
  };

  onImportIndexersPress = () => {
    if (this._importInput) {
      this._importInput.value = null;
      this._importInput.click();
    }
  };

  onImportIndexersChange = (event) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    this.clearAlert();

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.showAlert('Unable to read the import file contents.', kinds.DANGER);
        return;
      }

      this.importIndexers(reader.result);
    };

    reader.onerror = () => {
      this.showAlert('Unable to read the import file.', kinds.DANGER);
    };

    reader.readAsText(files[0]);
  };

  onExportIndexersPress = () => {
    const apiRoot = window.Readarr.apiRoot;
    const apiKey = encodeURIComponent(window.Readarr.apiKey);

    window.location.assign(`${apiRoot}/indexer/export?apikey=${apiKey}`);
  };

  importIndexers = async (contents) => {
    const {
      dispatchFetchIndexers,
      dispatchFetchIndexerOptions
    } = this.props;

    if (!contents || !contents.trim()) {
      this.showAlert('The import file is empty.', kinds.DANGER);
      return;
    }

    this.setState({ isImporting: true });
    this.clearAlert();

    try {
      const response = await fetch(`${window.Readarr.apiRoot}/indexer/import?forceSave=true`, {
        method: 'POST',
        headers: {
          'X-Api-Key': window.Readarr.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload: contents })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = result && result.errors ? result.errors.join('\n') : 'Indexer import failed.';
        throw new Error(message);
      }

      if (result && result.errors && result.errors.length) {
        this.showAlert(`Imported ${result.created || 0} indexer(s) with warnings:\n${result.errors.join('\n')}`, kinds.WARNING);
      } else {
        this.showAlert(`Imported ${result.created || 0} indexer(s).`, kinds.SUCCESS);
      }

      dispatchFetchIndexers();
      dispatchFetchIndexerOptions();
    } catch (error) {
      this.showAlert(error.message || 'Indexer import failed.', kinds.DANGER);
    } finally {
      this.setState({ isImporting: false });
    }
  };

  onSavePress = () => {
    if (this._saveCallback) {
      this._saveCallback();
    }
  };

  //
  // Render

  render() {
    const {
      isTestingAll,
      dispatchTestAllIndexers
    } = this.props;

    const {
      isSaving,
      hasPendingChanges,
      isManageIndexersOpen,
      isImporting,
      alertMessage,
      alertKind
    } = this.state;

    return (
      <PageContent title={translate('IndexerSettings')}>
        <input
          ref={(input) => { this._importInput = input; }}
          type="file"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={this.onImportIndexersChange}
        />
        {
          alertMessage &&
            <Alert kind={alertKind}>
              {alertMessage.split('\n').map((line, idx, arr) => (
                <Fragment key={idx}>
                  {line}
                  {idx < arr.length - 1 && <br />}
                </Fragment>
              ))}
            </Alert>
        }
        <SettingsToolbarConnector
          isSaving={isSaving}
          hasPendingChanges={hasPendingChanges}
          additionalButtons={
            <Fragment>
              <PageToolbarSeparator />

              <PageToolbarButton
                label={translate('TestAllIndexers')}
                iconName={icons.TEST}
                isSpinning={isTestingAll}
                onPress={dispatchTestAllIndexers}
              />

              <PageToolbarButton
                label={translate('ManageIndexers')}
                iconName={icons.MANAGE}
                onPress={this.onManageIndexersPress}
              />

              <PageToolbarButton
                label={translate('ImportIndexers')}
                iconName={icons.FILEIMPORT}
                isSpinning={isImporting}
                onPress={this.onImportIndexersPress}
              />

              <PageToolbarButton
                label={translate('ExportIndexers')}
                iconName={icons.EXPORT}
                onPress={this.onExportIndexersPress}
              />
            </Fragment>
          }
          onSavePress={this.onSavePress}
        />

        <PageContentBody>
          <IndexersConnector />

          <IndexerOptionsConnector
            onChildMounted={this.onChildMounted}
            onChildStateChange={this.onChildStateChange}
          />

          <ManageIndexersModal
            isOpen={isManageIndexersOpen}
            onModalClose={this.onManageIndexersModalClose}
          />
        </PageContentBody>
      </PageContent>
    );
  }
}

IndexerSettings.propTypes = {
  isTestingAll: PropTypes.bool.isRequired,
  dispatchFetchIndexers: PropTypes.func.isRequired,
  dispatchFetchIndexerOptions: PropTypes.func.isRequired,
  dispatchTestAllIndexers: PropTypes.func.isRequired
};

export default IndexerSettings;
