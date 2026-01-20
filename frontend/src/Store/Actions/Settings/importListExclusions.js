import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import createFetchHandler from 'Store/Actions/Creators/createFetchHandler';
import createRemoveItemHandler from 'Store/Actions/Creators/createRemoveItemHandler';
import createSaveProviderHandler from 'Store/Actions/Creators/createSaveProviderHandler';
import createSetSettingValueReducer from 'Store/Actions/Creators/Reducers/createSetSettingValueReducer';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { removeItem, set } from 'Store/Actions/baseActions';
import { createThunk } from 'Store/thunks';

//
// Variables

const section = 'settings.importListExclusions';

//
// Actions Types

export const FETCH_IMPORT_LIST_EXCLUSIONS = 'settings/importListExclusions/fetchImportListExclusions';
export const SAVE_IMPORT_LIST_EXCLUSION = 'settings/importListExclusions/saveImportListExclusion';
export const DELETE_IMPORT_LIST_EXCLUSION = 'settings/importListExclusions/deleteImportListExclusion';
export const DELETE_IMPORT_LIST_EXCLUSIONS = 'settings/importListExclusions/deleteImportListExclusions';
export const SET_IMPORT_LIST_EXCLUSION_VALUE = 'settings/importListExclusions/setImportListExclusionValue';

//
// Action Creators

export const fetchImportListExclusions = createThunk(FETCH_IMPORT_LIST_EXCLUSIONS);
export const saveImportListExclusion = createThunk(SAVE_IMPORT_LIST_EXCLUSION);
export const deleteImportListExclusion = createThunk(DELETE_IMPORT_LIST_EXCLUSION);
export const deleteImportListExclusions = createThunk(DELETE_IMPORT_LIST_EXCLUSIONS);

export const setImportListExclusionValue = createAction(SET_IMPORT_LIST_EXCLUSION_VALUE, (payload) => {
  return {
    section,
    ...payload
  };
});

//
// Details

export default {

  //
  // State

  defaultState: {
    isFetching: false,
    isPopulated: false,
    error: null,
    items: [],
    isSaving: false,
    saveError: null,
    isDeleting: false,
    deleteError: null,
    pendingChanges: {}
  },

  //
  // Action Handlers

  actionHandlers: {
    [FETCH_IMPORT_LIST_EXCLUSIONS]: createFetchHandler(section, '/importlistexclusion'),
    [SAVE_IMPORT_LIST_EXCLUSION]: createSaveProviderHandler(section, '/importlistexclusion'),
    [DELETE_IMPORT_LIST_EXCLUSION]: createRemoveItemHandler(section, '/importlistexclusion'),
    [DELETE_IMPORT_LIST_EXCLUSIONS]: function(getState, payload, dispatch) {
      const { ids } = payload;

      if (!ids || !ids.length) {
        return;
      }

      dispatch(set({ section, isDeleting: true, deleteError: null }));

      const { request } = createAjaxRequest({
        url: '/importlistexclusion/bulk',
        method: 'DELETE',
        dataType: 'json',
        data: JSON.stringify({ ids })
      });

      request.done(() => {
        dispatch(batchActions([
          ...ids.map((id) => removeItem({ section, id })),
          set({ section, isDeleting: false, deleteError: null })
        ]));
      });

      request.fail((xhr) => {
        dispatch(set({ section, isDeleting: false, deleteError: xhr }));
      });
    }
  },

  //
  // Reducers

  reducers: {
    [SET_IMPORT_LIST_EXCLUSION_VALUE]: createSetSettingValueReducer(section)
  }

};
