import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createThunk } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import Users from './Users';

export const FETCH_USERS = 'settings/users/fetch';
export const CREATE_USER = 'settings/users/create';

export const fetchUsers = createThunk(FETCH_USERS);
export const createUser = createThunk(CREATE_USER);

function createMapStateToProps() {
  return createSelector(
    (state) => state.settingsUsers,
    (usersState) => {
      return {
        users: usersState.items || [],
        isFetching: usersState.isFetching
      };
    }
  );
}

function mapDispatchToProps(dispatch) {
  return {
    onRefresh() {
      dispatch(fetchUsers());
    },

    onCreate(payload) {
      dispatch(createUser(payload));
    }
  };
}

const actionHandlers = {
  [FETCH_USERS]: function(getState, payload, dispatch) {
    dispatch({ type: '@@settingsUsers/set', payload: { isFetching: true, error: null } });

    const { request } = createAjaxRequest({
      url: '/users',
      method: 'GET',
      dataType: 'json'
    });

    request.done((data) => {
      dispatch({
        type: '@@settingsUsers/set',
        payload: { items: data, isFetching: false, error: null }
      });
    });

    request.fail((xhr) => {
      dispatch({
        type: '@@settingsUsers/set',
        payload: { isFetching: false, error: xhr }
      });
    });
  },

  [CREATE_USER]: function(getState, payload, dispatch) {
    dispatch({ type: '@@settingsUsers/set', payload: { isFetching: true } });

    const { request } = createAjaxRequest({
      url: '/users',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        username: payload.username,
        password: payload.password,
        isAdmin: payload.isAdmin,
        isActive: payload.isActive
      })
    });

    request.done(() => {
      dispatch(fetchUsers());
    });

    request.fail((xhr) => {
      dispatch({
        type: '@@settingsUsers/set',
        payload: { isFetching: false, error: xhr }
      });
    });
  }
};

export function settingsUsersReducer(state = { items: [], isFetching: false, error: null }, action) {
  if (action.type === '@@settingsUsers/set') {
    return {
      ...state,
      ...action.payload
    };
  }

  if (actionHandlers[action.type]) {
    return state;
  }

  return state;
}

export function settingsUsersHandleActions(getState, payload, dispatch, action) {
  if (actionHandlers[action.type]) {
    return actionHandlers[action.type](getState, payload, dispatch);
  }
}

export default connect(createMapStateToProps, mapDispatchToProps)(Users);
