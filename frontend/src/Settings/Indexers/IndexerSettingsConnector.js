import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchIndexerOptions, fetchIndexers, testAllIndexers } from 'Store/Actions/settingsActions';
import IndexerSettings from './IndexerSettings';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.indexers.isTestingAll,
    (isTestingAll) => {
      return {
        isTestingAll
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchFetchIndexerOptions: fetchIndexerOptions,
  dispatchFetchIndexers: fetchIndexers,
  dispatchTestAllIndexers: testAllIndexers
};

export default connect(createMapStateToProps, mapDispatchToProps)(IndexerSettings);
