import migrateAddAuthorDefaults from './migrateAddAuthorDefaults';
import migrateAddBookDefaults from './migrateAddBookDefaults';
import migrateAuthorSortKey from './migrateAuthorSortKey';
import migrateBlacklistToBlocklist from './migrateBlacklistToBlocklist';
import migrateRemoveAuthorStatusIndicators from './migrateRemoveAuthorStatusIndicators';

export default function migrate(persistedState) {
  migrateAddAuthorDefaults(persistedState);
  migrateAddBookDefaults(persistedState);
  migrateAuthorSortKey(persistedState);
  migrateBlacklistToBlocklist(persistedState);
  migrateRemoveAuthorStatusIndicators(persistedState);
}
