import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './QualityProfileItem.css';

function QualityProfileItem({
  editGroups,
  isPreview,
  groupId,
  name,
  allowed,
  isDragging,
  isOverCurrent,
  isInGroup,
  dragHandleProps,
  onCreateGroupPress,
  onQualityProfileItemAllowedChange,
  qualityId
}) {
  const onAllowedChange = ({ value }) => onQualityProfileItemAllowedChange(qualityId, value);
  const onCreateGroup = () => onCreateGroupPress && onCreateGroupPress(qualityId);

  return (
    <div
      className={classNames(
        styles.qualityProfileItem,
        isDragging && styles.isDragging,
        isPreview && styles.isPreview,
        isOverCurrent && styles.isOverCurrent,
        groupId && styles.isInGroup
      )}
    >
      <label
        className={styles.qualityNameContainer}
      >
          {
            editGroups && !groupId && !isPreview &&
              <IconButton
                className={styles.createGroupButton}
                name={icons.GROUP}
                title={translate('Group')}
                onPress={onCreateGroup}
              />
          }

          {
            !editGroups &&
              <CheckInput
                className={styles.checkInput}
                containerClassName={styles.checkInputContainer}
                name={name}
                value={allowed}
                isDisabled={!!groupId}
                onChange={onAllowedChange}
              />
          }

        <div className={classNames(
          styles.qualityName,
          groupId && styles.isInGroup,
          !allowed && styles.notAllowed
        )}
        >
          {name}
        </div>
      </label>

      {
        dragHandleProps &&
          <div className={styles.dragHandle} {...dragHandleProps}>
            <Icon
              className={styles.dragIcon}
              title={translate('CreateGroup')}
              name={icons.REORDER}
            />
          </div>
      }
    </div>
  );
}

QualityProfileItem.propTypes = {
  editGroups: PropTypes.bool,
  isPreview: PropTypes.bool,
  groupId: PropTypes.number,
  qualityId: PropTypes.number,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool,
  isOverCurrent: PropTypes.bool,
  isInGroup: PropTypes.bool,
  dragHandleProps: PropTypes.object,
  onCreateGroupPress: PropTypes.func,
  onQualityProfileItemAllowedChange: PropTypes.func.isRequired
};

QualityProfileItem.defaultProps = {
  isPreview: false,
  isOverCurrent: false,
  isDragging: false,
  isInGroup: false,
  dragHandleProps: null,
  onCreateGroupPress: null,
  qualityId: null
};

export default QualityProfileItem;
