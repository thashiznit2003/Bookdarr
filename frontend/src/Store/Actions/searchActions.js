import _ from 'lodash';
import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { createThunk, handleThunks } from 'Store/thunks';
import getNewAuthor from 'Utilities/Author/getNewAuthor';
import monitorNewItemsOptions from 'Utilities/Author/monitorNewItemsOptions';
import monitorOptions from 'Utilities/Author/monitorOptions';
import getNewBook from 'Utilities/Book/getNewBook';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getSectionState from 'Utilities/State/getSectionState';
import updateSectionState from 'Utilities/State/updateSectionState';
import { set, update, updateItem } from './baseActions';
import createHandleActions from './Creators/createHandleActions';

//
// Variables

export const section = 'search';
let abortCurrentRequest = null;
let currentRequestId = 0;

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  isAdding: false,
  isAdded: false,
  addError: null,
  items: [],

  authorDefaults: {
    rootFolderPath: '',
    monitor: monitorOptions[0].key,
    monitorNewItems: monitorNewItemsOptions[0].key,
    qualityProfileId: 0,
    metadataProfileId: 0,
    tags: []
  },

  bookDefaults: {
    rootFolderPath: '',
    monitor: 'specificBook',
    monitorNewItems: monitorNewItemsOptions[0].key,
    qualityProfileId: 0,
    metadataProfileId: 0,
    tags: []
  }
};

export const persistState = [
  'search.bookDefaults',
  'search.authorDefaults'
];

//
// Actions Types

export const GET_SEARCH_RESULTS = 'search/getSearchResults';
export const ADD_AUTHOR = 'search/addAuthor';
export const ADD_BOOK = 'search/addBook';
export const CLEAR_SEARCH_RESULTS = 'search/clearSearchResults';
export const SET_AUTHOR_ADD_DEFAULT = 'search/setAuthorAddDefault';
export const SET_BOOK_ADD_DEFAULT = 'search/setBookAddDefault';

//
// Action Creators

export const getSearchResults = createThunk(GET_SEARCH_RESULTS);
export const addAuthor = createThunk(ADD_AUTHOR);
export const addBook = createThunk(ADD_BOOK);
export const clearSearchResults = createAction(CLEAR_SEARCH_RESULTS);
export const setAuthorAddDefault = createAction(SET_AUTHOR_ADD_DEFAULT);
export const setBookAddDefault = createAction(SET_BOOK_ADD_DEFAULT);

//
// Action Handlers

export const actionHandlers = handleThunks({

  [GET_SEARCH_RESULTS]: function(getState, payload, dispatch) {
    dispatch(set({ section, isFetching: true, error: null }));

    if (abortCurrentRequest) {
      abortCurrentRequest();
    }

    const requestId = ++currentRequestId;
    const { request, abortRequest } = createAjaxRequest({
      url: '/search',
      data: {
        term: payload.term
      }
    });

    abortCurrentRequest = abortRequest;

    request.done((data) => {
      if (requestId !== currentRequestId) {
        return;
      }

      dispatch(batchActions([
        update({ section, data }),

        set({
          section,
          isFetching: false,
          isPopulated: true,
          error: null
        })
      ]));
    });

    request.fail((xhr) => {
      if (requestId !== currentRequestId) {
        return;
      }

      dispatch(set({
        section,
        isFetching: false,
        isPopulated: false,
        error: xhr.aborted ? null : xhr
      }));
    });
  },

  [ADD_AUTHOR]: function(getState, payload, dispatch) {
    dispatch(set({ section, isAdding: true }));

    const foreignAuthorId = payload.foreignAuthorId;
    const items = getState().search.items;
    const itemToAdd = _.find(items, { foreignId: foreignAuthorId });

    if (!itemToAdd?.author) {
      dispatch(set({
        section,
        isAdding: false,
        isAdded: false,
        addError: { message: 'Unable to find the selected author in search results.' }
      }));
      return;
    }

    const newAuthor = getNewAuthor(_.cloneDeep(itemToAdd.author), payload);

    const promise = createAjaxRequest({
      url: '/author',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(newAuthor)
    }).request;

    promise.done((data) => {
      dispatch(batchActions([
        updateItem({ section: 'authors', ...data }),

        set({
          section,
          isAdding: false,
          isAdded: true,
          addError: null
        })
      ]));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isAdding: false,
        isAdded: false,
        addError: xhr
      }));
    });
  },

  [ADD_BOOK]: function(getState, payload, dispatch) {
    dispatch(set({ section, isAdding: true }));

    const foreignBookId = payload.foreignBookId;
    const items = getState().search.items;
    const itemToAdd = _.find(items, { foreignId: foreignBookId });

    if (!itemToAdd?.book) {
      dispatch(set({
        section,
        isAdding: false,
        isAdded: false,
        addError: { message: 'Unable to find the selected book in search results.' }
      }));
      return;
    }

    const newBook = getNewBook(_.cloneDeep(itemToAdd.book), payload);

    const promise = createAjaxRequest({
      url: '/book',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(newBook)
    }).request;

    promise.done((data) => {
      itemToAdd.book = data;
      dispatch(batchActions([
        updateItem({ section: 'authors', ...data.author }),
        updateItem({ section: 'books', ...data, inMyLibrary: true }),
        updateItem({ section, ...itemToAdd }),

        set({
          section,
          isAdding: false,
          isAdded: true,
          addError: null
        })
      ]));

      // Also add to the current user's library so it shows up immediately
      createAjaxRequest({
        url: '/user/library',
        method: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
          bookId: data.id,
          wantsEbook: true,
          wantsAudiobook: true
        })
      }).request.always(() => {
        dispatch(updateItem({ section: 'books', ...data, inMyLibrary: true }));
      });

      if (payload.onBookAdded) {
        payload.onBookAdded({
          book: data,
          importExistingFiles: payload.importExistingFiles,
          importPath: payload.importPath
        });
      }
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isAdding: false,
        isAdded: false,
        addError: xhr
      }));
    });
  }
});

//
// Reducers

export const reducers = createHandleActions({

  [SET_AUTHOR_ADD_DEFAULT]: function(state, { payload }) {
    const newState = getSectionState(state, section);

    newState.authorDefaults = {
      ...newState.authorDefaults,
      ...payload
    };

    return updateSectionState(state, section, newState);
  },

  [SET_BOOK_ADD_DEFAULT]: function(state, { payload }) {
    const newState = getSectionState(state, section);

    newState.bookDefaults = {
      ...newState.bookDefaults,
      ...payload
    };

    return updateSectionState(state, section, newState);
  },

  [CLEAR_SEARCH_RESULTS]: function(state) {
    const {
      authorDefaults,
      bookDefaults,
      ...otherDefaultState
    } = defaultState;

    return Object.assign({}, state, otherDefaultState);
  }

}, defaultState, section);
