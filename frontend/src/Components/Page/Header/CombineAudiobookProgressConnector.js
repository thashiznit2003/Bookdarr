import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import CombineAudiobookProgress from 'Book/Details/CombineAudiobookProgress';
import createCommandsSelector from 'Store/Selectors/createCommandsSelector';
import { findCommand, isCommandExecuting } from 'Utilities/Command';

function createMapStateToProps() {
  return createSelector(
    createCommandsSelector(),
    (commands) => {
      const combineCommand = findCommand(commands, { name: commandNames.COMBINE_AUDIOBOOK });
      const isCombining = combineCommand ? isCommandExecuting(combineCommand) : false;
      const shouldShow = isCombining || combineCommand?.status === 'completed';

      return {
        command: shouldShow ? combineCommand : null
      };
    }
  );
}

function CombineAudiobookProgressConnector({ command }) {
  return (
    <CombineAudiobookProgress
      command={command}
      isInline={true}
    />
  );
}

export default connect(createMapStateToProps)(CombineAudiobookProgressConnector);
