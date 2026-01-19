import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import PageHeaderUser from './PageHeaderUser';

function createMapStateToProps() {
  return createSelector(
    (state) => state.currentUser.item,
    (currentUser) => {
      return {
        username: currentUser?.username || ''
      };
    }
  );
}

export default connect(createMapStateToProps)(PageHeaderUser);
