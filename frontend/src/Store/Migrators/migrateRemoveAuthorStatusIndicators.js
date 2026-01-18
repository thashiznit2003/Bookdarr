import { get } from 'lodash';

export default function migrateRemoveAuthorStatusIndicators(persistedState) {
  const columns = get(persistedState, 'authorIndex.columns');

  if (Array.isArray(columns)) {
    persistedState.authorIndex.columns = columns.filter((column) => column.name !== 'status');
  }

  const posterOptions = get(persistedState, 'authorIndex.posterOptions');
  if (posterOptions && Object.prototype.hasOwnProperty.call(posterOptions, 'showMonitored')) {
    delete posterOptions.showMonitored;
  }

  const overviewOptions = get(persistedState, 'authorIndex.overviewOptions');
  if (overviewOptions && Object.prototype.hasOwnProperty.call(overviewOptions, 'showMonitored')) {
    delete overviewOptions.showMonitored;
  }
}
