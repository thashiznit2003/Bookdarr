import { createThunk, handleThunks } from 'Store/thunks';
import createHandleActions from './Creators/createHandleActions';
import createFetchHandler from './Creators/createFetchHandler';

export const section = 'currentUser';

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  item: null
};

export const FETCH_CURRENT_USER = 'currentUser/fetchCurrentUser';

export const fetchCurrentUser = createThunk(FETCH_CURRENT_USER);

export const actionHandlers = handleThunks({
  [FETCH_CURRENT_USER]: createFetchHandler(section, '/users/me')
});

export const reducers = createHandleActions(actionHandlers, defaultState, section);
