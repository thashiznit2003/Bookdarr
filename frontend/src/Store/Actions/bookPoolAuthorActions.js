import { createThunk, handleThunks } from 'Store/thunks';
import createFetchHandler from './Creators/createFetchHandler';
import createHandleActions from './Creators/createHandleActions';

//
// Variables

export const section = 'bookPoolAuthors';

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  items: []
};

//
// Action Types

export const FETCH_BOOK_POOL_AUTHORS = 'bookPoolAuthors/fetchBookPoolAuthors';

//
// Action Creators

export const fetchBookPoolAuthors = createThunk(FETCH_BOOK_POOL_AUTHORS);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [FETCH_BOOK_POOL_AUTHORS]: createFetchHandler(section, '/user/library/pool/authors')
});

//
// Reducers

export const reducers = createHandleActions(actionHandlers, defaultState, section);
