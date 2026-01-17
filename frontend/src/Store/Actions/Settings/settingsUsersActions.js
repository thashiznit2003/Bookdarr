import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { set } from '../baseActions';
import createHandleActions from '../Creators/createHandleActions';

export const section = 'settingsUsers';

export const defaultState = {
  items: [],
  isFetching: false,
  error: null
};

export const FETCH_USERS = 'settings/users/fetch';
export const CREATE_USER = 'settings/users/create';

export const fetchUsers = createThunk(FETCH_USERS);
export const createUser = createThunk(CREATE_USER);

export const actionHandlers = handleThunks({
  [FETCH_USERS]: function(getState, payload, dispatch) {
    dispatch(set({ section, isFetching: true, error: null }));

    const { request } = createAjaxRequest({
      url: '/users',
      method: 'GET',
      dataType: 'json'
    });

    request.done((data) => {
      dispatch(set({
        section,
        isFetching: false,
        items: data,
        error: null
      }));
    });

    request.fail((xhr) => {
      dispatch(set({
        section,
        isFetching: false,
        error: xhr
      }));
    });
  },

  [CREATE_USER]: function(getState, payload, dispatch) {
    dispatch(set({ section, isFetching: true }));

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
      dispatch(set({
        section,
        isFetching: false,
        error: xhr
      }));
    });
  }
});

export const reducers = createHandleActions({
  '@@settingsUsers/set': (state, { payload }) => {
    return {
      ...state,
      ...payload
    };
  }
}, defaultState, section);
