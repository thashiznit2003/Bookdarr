import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchUsers, createUser, deleteUser, toggleUser, updateUser } from 'Store/Actions/Settings/settingsUsersActions';
import Users from './Users';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settingsUsers,
    (usersState) => ({
      users: usersState.items || [],
      isFetching: usersState.isFetching,
      error: usersState.error
    })
  );
}

const mapDispatchToProps = {
  onRefresh: fetchUsers,
  onCreate: createUser,
  onDelete: deleteUser,
  onToggleActive: toggleUser,
  onUpdate: updateUser
};

export default connect(createMapStateToProps, mapDispatchToProps)(Users);
