import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchCurrentUser } from 'Store/Actions/currentUserActions';
import { fetchUsers, createUser, deleteUser, toggleUser, updateUser } from 'Store/Actions/Settings/settingsUsersActions';
import Users from './Users';

function createMapStateToProps() {
  return createSelector(
    (state) => state.system.status.item?.isAdmin ?? false,
    (state) => state.settingsUsers,
    (state) => state.currentUser,
    (isAdmin, usersState, currentUserState) => {
      const currentUser = currentUserState.item;
      return {
        isAdmin,
        currentUser,
        users: isAdmin ? (usersState.items || []) : (currentUser ? [currentUser] : []),
        isFetching: isAdmin ? usersState.isFetching : currentUserState.isFetching,
        error: isAdmin ? usersState.error : currentUserState.error
      };
    }
  );
}

const mapDispatchToProps = (dispatch) => ({
  onRefresh: (isAdmin) => {
    if (isAdmin) {
      dispatch(fetchUsers());
      return;
    }

    dispatch(fetchCurrentUser());
  },
  onCreate: (payload) => dispatch(createUser(payload)),
  onDelete: (payload) => dispatch(deleteUser(payload)),
  onToggleActive: (payload) => dispatch(toggleUser(payload)),
  onUpdate: (payload) => dispatch(updateUser(payload))
});

export default connect(createMapStateToProps, mapDispatchToProps)(Users);
