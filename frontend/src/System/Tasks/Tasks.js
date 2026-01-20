import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Alert from 'Components/Alert';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import { icons, kinds } from 'Helpers/Props';
import { fetchTasks } from 'Store/Actions/systemActions';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import translate from 'Utilities/String/translate';
import QueuedTasks from './Queued/QueuedTasks';
import ScheduledTasks from './Scheduled/ScheduledTasks';
import styles from './Tasks.css';

class Tasks extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      pendingTaskStates: {},
      isSaving: false,
      saveError: null
    };
  }

  componentDidMount() {
    this.props.dispatchFetchTasks();
  }

  onTaskStateChange = (taskId, state) => {
    const { items } = this.props;
    const currentState = items.find((task) => task.id === taskId)?.state;

    this.setState((prevState) => {
      const pendingTaskStates = {
        ...prevState.pendingTaskStates
      };

      if (!currentState || currentState === state) {
        delete pendingTaskStates[taskId];
      } else {
        pendingTaskStates[taskId] = state;
      }

      return { pendingTaskStates };
    });
  };

  onSavePress = async () => {
    const { pendingTaskStates } = this.state;
    const taskIds = Object.keys(pendingTaskStates);

    if (!taskIds.length) {
      return;
    }

    this.setState({ isSaving: true, saveError: null });

    const requests = taskIds.map((taskId) => {
      const { request } = createAjaxRequest({
        url: `/system/task/${taskId}/state`,
        method: 'PUT',
        dataType: 'json',
        data: JSON.stringify({ state: pendingTaskStates[taskId] })
      });

      return new Promise((resolve, reject) => {
        request.done(resolve);
        request.fail(reject);
      });
    });

    try {
      await Promise.all(requests);
      await this.props.dispatchFetchTasks();
      this.setState({
        pendingTaskStates: {},
        isSaving: false,
        saveError: null
      });
    } catch (error) {
      this.setState({
        isSaving: false,
        saveError: translate('TaskStateSaveFailed')
      });
    }
  };

  render() {
    const {
      isFetching,
      isPopulated,
      error,
      items
    } = this.props;
    const {
      pendingTaskStates,
      isSaving,
      saveError
    } = this.state;

    const hasPendingChanges = Object.keys(pendingTaskStates).length > 0;

    return (
      <PageContent title={translate('Tasks')}>
        <PageToolbar>
          <PageToolbarSection>
            <div className={styles.warning}>
              {translate('TasksChangeWarning')}
            </div>
          </PageToolbarSection>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('Save')}
              iconName={icons.SAVE}
              isSpinning={isSaving}
              isDisabled={!hasPendingChanges || isSaving || isFetching}
              onPress={this.onSavePress}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {
            saveError &&
              <Alert kind={kinds.DANGER}>
                {saveError}
              </Alert>
          }

          {
            error &&
              <Alert kind={kinds.DANGER}>
                {translate('UnableToLoadTasks')}
              </Alert>
          }

          <ScheduledTasks
            isFetching={isFetching}
            isPopulated={isPopulated}
            items={items}
            pendingTaskStates={pendingTaskStates}
            onTaskStateChange={this.onTaskStateChange}
          />
          <QueuedTasks />
        </PageContentBody>
      </PageContent>
    );
  }
}

Tasks.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.array.isRequired,
  dispatchFetchTasks: PropTypes.func.isRequired
};

function createMapStateToProps() {
  return createSelector(
    (state) => state.system.tasks,
    (tasks) => ({
      isFetching: tasks.isFetching,
      isPopulated: tasks.isPopulated,
      error: tasks.error,
      items: tasks.items
    })
  );
}

const mapDispatchToProps = {
  dispatchFetchTasks: fetchTasks
};

export default connect(createMapStateToProps, mapDispatchToProps)(Tasks);
