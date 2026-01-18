import createHandleActions from './Creators/createHandleActions';
import { set } from './baseActions';
import { createThunk } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';

export const section = 'userMissing';

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  items: []
};

export const FETCH_USER_MISSING = 'userMissing/fetch';
export const fetchUserMissing = createThunk(FETCH_USER_MISSING);

export const actionHandlers = {
  [FETCH_USER_MISSING]: function(getState, payload, dispatch) {
    dispatch(set({ section, isFetching: true, error: null }));

    const { request } = createAjaxRequest({ url: '/user/wanted/missing-files', method: 'GET' });

    request.done((data) => {
      dispatch(set({
        section,
        isFetching: false,
        isPopulated: true,
        error: null,
        items: data || []
      }));
    });

    request.fail((xhr) => {
      dispatch(set({
        section,
        isFetching: false,
        error: xhr
      }));
    });
  }
};

export const reducers = createHandleActions(actionHandlers, defaultState, section);
