import createHandleActions from './Creators/createHandleActions';
import { set } from './baseActions';
import { createThunk } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';

export const section = 'userFileUpgrades';

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  items: []
};

export const FETCH_USER_UPGRADES = 'userFileUpgrades/fetch';
export const fetchUserUpgrades = createThunk(FETCH_USER_UPGRADES);

export const actionHandlers = {
  [FETCH_USER_UPGRADES]: function(getState, payload, dispatch) {
    dispatch(set({ section, isFetching: true, error: null }));

    const { request } = createAjaxRequest({ url: '/user/wanted/file-upgrades', method: 'GET' });

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
