import React, { Component } from 'react';
import Alert from 'Components/Alert';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItemDescription from 'Components/DescriptionList/DescriptionListItemDescription';
import DescriptionListItemTitle from 'Components/DescriptionList/DescriptionListItemTitle';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import { icons, inputTypes, kinds } from 'Helpers/Props';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import translate from 'Utilities/String/translate';
import styles from './Diagnostics.css';

const emptyConfig = {
  repo: { value: '' },
  token: { value: '' },
  gitUserName: { value: '' },
  gitUserEmail: { value: '' }
};

class Diagnostics extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoading: true,
      isConfigLoading: true,
      isSaving: false,
      isPushing: false,
      status: null,
      result: null,
      error: null,
      config: emptyConfig,
      configError: null,
      configMessage: null
    };
  }

  componentDidMount() {
    this.fetchStatus();
    this.fetchConfig();
  }

  //
  // Actions

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
        isLoading: false,
        error: null
      });
    });

    request.fail(() => {
      this.setState({
        isLoading: false,
        error: translate('DiagnosticsStatusLoadFailed')
      });
    });
  };

  fetchConfig = () => {
    const { request } = createAjaxRequest({
      url: '/diagnostics/config',
      method: 'GET',
      dataType: 'json',
      skipDiagnostics: true
    });

    request.done((data) => {
      this.setState({
        isConfigLoading: false,
        config: {
          repo: { value: data?.repo || '' },
          token: { value: '' },
          gitUserName: { value: data?.gitUserName || '' },
          gitUserEmail: { value: data?.gitUserEmail || '' }
        },
        configError: null
      });
    });

    request.fail(() => {
      this.setState({
        isConfigLoading: false,
        configError: translate('DiagnosticsConfigLoadFailed')
      });
    });
  };

  onConfigChange = ({ name, value }) => {
    this.setState((prevState) => ({
      config: {
        ...prevState.config,
        [name]: {
          ...prevState.config[name],
          value
        }
      }
    }));
  };

  onSaveConfig = () => {
    const {
      config
    } = this.state;

    const payload = {
      repo: config.repo.value,
      gitUserName: config.gitUserName.value,
      gitUserEmail: config.gitUserEmail.value
    };

    if (config.token.value) {
      payload.token = config.token.value;
    }

    this.setState({
      isSaving: true,
      configError: null,
      configMessage: null
    });

    const { request } = createAjaxRequest({
      url: '/diagnostics/config',
      method: 'PUT',
      dataType: 'json',
      data: JSON.stringify(payload),
      skipDiagnostics: true
    });

    request.done((data) => {
      this.setState({
        isSaving: false,
        configMessage: translate('DiagnosticsConfigSaved'),
        config: {
          repo: { value: data?.repo ?? payload.repo ?? '' },
          token: { value: '' },
          gitUserName: { value: data?.gitUserName ?? payload.gitUserName ?? '' },
          gitUserEmail: { value: data?.gitUserEmail ?? payload.gitUserEmail ?? '' }
        }
      }, () => {
        this.fetchStatus();
      });
    });

    request.fail(() => {
      this.setState({
        isSaving: false,
        configError: translate('DiagnosticsConfigSaveFailed')
      });
    });
  };

  onPushPress = async () => {
    this.setState({ isPushing: true, error: null, result: null });

    if (window.ReadarrDiagnostics?.flush) {
      await window.ReadarrDiagnostics.flush();
    }

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
        result: data
      });
    });

    request.fail(() => {
      this.setState({
        isPushing: false,
        error: translate('DiagnosticsPushFailed')
      });
    });
  };

  //
  // Render

  render() {
    const {
      isLoading,
      isConfigLoading,
      isSaving,
      isPushing,
      status,
      result,
      error,
      config,
      configError,
      configMessage
    } = this.state;

    const isDevelop = status?.isDevelop;
    const isConfigured = status?.hasToken && status?.repo;
    const showLoading = isLoading || isConfigLoading;
    const tokenStatus = status?.hasToken ? translate('DiagnosticsTokenConfigured') : translate('DiagnosticsTokenMissing');
    const {
      repo,
      token,
      gitUserName,
      gitUserEmail
    } = config;

    return (
      <PageContent title={translate('Diagnostics')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('Save')}
              iconName={icons.SAVE}
              isSpinning={isSaving}
              isDisabled={isSaving || isConfigLoading}
              onPress={this.onSaveConfig}
            />
          </PageToolbarSection>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('PushDiagnostics')}
              iconName={icons.BUG}
              isSpinning={isPushing}
              isDisabled={!isDevelop || !isConfigured || isPushing}
              onPress={this.onPushPress}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {
            showLoading &&
              <LoadingIndicator />
          }

          {
            !showLoading && error &&
              <Alert kind={kinds.DANGER}>
                {error}
              </Alert>
          }

          {
            !showLoading && configError &&
              <Alert kind={kinds.DANGER}>
                {configError}
              </Alert>
          }

          {
            !showLoading && configMessage &&
              <Alert kind={kinds.SUCCESS}>
                {configMessage}
              </Alert>
          }

          {
            !showLoading && !isDevelop &&
              <Alert kind={kinds.WARNING}>
                {translate('DiagnosticsDevelopOnly')}
              </Alert>
          }

          {
            !showLoading && isDevelop && !isConfigured &&
              <Alert kind={kinds.WARNING}>
                {translate('DiagnosticsNotConfigured')}
              </Alert>
          }

          {
            !showLoading && result?.message &&
              <Alert kind={result.success ? kinds.SUCCESS : kinds.DANGER}>
                {result.message}
              </Alert>
          }

          {
            !showLoading &&
            <Alert kind={kinds.INFO}>
              <div className={styles.instructionsTitle}>
                {translate('DiagnosticsSetupTitle')}
              </div>
              <ul className={styles.instructionsList}>
                <li>{translate('DiagnosticsSetupRepoStep')}</li>
                <li>{translate('DiagnosticsSetupTokenStep')}</li>
                <li>{translate('DiagnosticsSetupSaveStep')}</li>
                <li>{translate('DiagnosticsSetupTestStep')}</li>
              </ul>
            </Alert>
          }

          {
            !showLoading &&
            <Form id="diagnosticsSettings">
              <FieldSet legend={translate('DiagnosticsConfiguration')}>
                <FormGroup>
                  <FormLabel>{translate('DiagnosticsRepo')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="repo"
                    helpText={translate('DiagnosticsRepoHelpText')}
                    onChange={this.onConfigChange}
                    {...repo}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>{translate('DiagnosticsToken')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.PASSWORD}
                    name="token"
                    helpText={tokenStatus}
                    helpTextWarning={translate('DiagnosticsTokenKeepHelpText')}
                    onChange={this.onConfigChange}
                    {...token}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>{translate('DiagnosticsGitUserName')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="gitUserName"
                    helpText={translate('DiagnosticsGitUserNameHelpText')}
                    onChange={this.onConfigChange}
                    {...gitUserName}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>{translate('DiagnosticsGitUserEmail')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="gitUserEmail"
                    helpText={translate('DiagnosticsGitUserEmailHelpText')}
                    onChange={this.onConfigChange}
                    {...gitUserEmail}
                  />
                </FormGroup>
              </FieldSet>
            </Form>
          }

          {
            !showLoading && status &&
            <FieldSet legend={translate('Diagnostics')}>
              <DescriptionList>
                <DescriptionListItemTitle>{translate('Branch')}</DescriptionListItemTitle>
                <DescriptionListItemDescription>
                  {window.Readarr.branch}
                </DescriptionListItemDescription>

                <DescriptionListItemTitle>{translate('DiagnosticsRepo')}</DescriptionListItemTitle>
                <DescriptionListItemDescription>
                  {status.repo || translate('DiagnosticsRepoMissing')}
                </DescriptionListItemDescription>

                <DescriptionListItemTitle>{translate('DiagnosticsToken')}</DescriptionListItemTitle>
                <DescriptionListItemDescription>
                  {status.hasToken ? translate('DiagnosticsTokenConfigured') : translate('DiagnosticsTokenMissing')}
                </DescriptionListItemDescription>

                <DescriptionListItemTitle>{translate('DiagnosticsLastCommit')}</DescriptionListItemTitle>
                <DescriptionListItemDescription className={styles.commitDescription}>
                  {result?.commit || translate('DiagnosticsLastCommitMissing')}
                </DescriptionListItemDescription>

                <DescriptionListItemTitle>{translate('DiagnosticsLastFolder')}</DescriptionListItemTitle>
                <DescriptionListItemDescription>
                  {result?.folder || translate('DiagnosticsNoPushYet')}
                </DescriptionListItemDescription>
              </DescriptionList>
            </FieldSet>
          }
        </PageContentBody>
      </PageContent>
    );
  }
}

export default Diagnostics;
