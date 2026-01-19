import { createAction } from 'redux-actions';
import getSectionState from 'Utilities/State/getSectionState';
import updateSectionState from 'Utilities/State/updateSectionState';
import createHandleActions from './Creators/createHandleActions';

export const section = 'audioPlayer';

export const defaultState = {
  isDocked: false,
  streamUrl: null,
  bookFileId: 0,
  mediaType: null,
  title: null,
  resumePosition: null,
  shouldAutoplay: false
};

export const SET_AUDIO_PLAYER_STATE = 'audioPlayer/setAudioPlayerState';

export const setAudioPlayerState = createAction(SET_AUDIO_PLAYER_STATE);

export const dockAudioPlayer = (payload) => {
  return setAudioPlayerState({
    isDocked: true,
    ...payload
  });
};

export const clearAudioPlayer = () => {
  return setAudioPlayerState({
    isDocked: false,
    streamUrl: null,
    bookFileId: 0,
    mediaType: null,
    title: null,
    resumePosition: null,
    shouldAutoplay: false
  });
};

export const reducers = createHandleActions({
  [SET_AUDIO_PLAYER_STATE]: function(state, { payload }) {
    const currentState = getSectionState(state, section);

    return updateSectionState(state, section, {
      ...currentState,
      ...payload
    });
  }
}, defaultState, section);
