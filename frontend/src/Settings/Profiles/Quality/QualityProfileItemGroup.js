import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './QualityProfileItemGroup.css';

function QualityProfileItemGroup({
  editGroups,
  groupId,
  name,
  allowed,
  items,
  isDragging,
  isOverCurrent,
  dragHandleProps,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onDeleteGroupPress,
  children
}) {
  const handleAllowedChange = ({ value }) => onItemGroupAllowedChange(groupId, value);
  const handleNameChange = ({ value }) => onItemGroupNameChange(groupId, value);
  const handleDeletePress = () => onDeleteGroupPress(groupId);

  return (
    <div
      className={classNames(
        styles.qualityProfileItemGroup,
        editGroups && styles.editGroups,
        isDragging && styles.isDragging,
        isOverCurrent && styles.isOverCurrent
      )}
    >
      <div className={styles.qualityProfileItemGroupInfo}>
        {
          editGroups &&
            <div className={styles.qualityNameContainer}>
              <IconButton
                className={styles.deleteGroupButton}
                name={icons.UNGROUP}
                title={translate('Ungroup')}
                onPress={handleDeletePress}
              />

              <TextInput
                className={styles.nameInput}
                name="name"
                value={name}
                onChange={handleNameChange}
              />
            </div>
        }

        {
          !editGroups &&
            <label className={styles.qualityNameLabel}>
              <CheckInput
                className={styles.checkInput}
                containerClassName={styles.checkInputContainer}
                name="allowed"
                value={allowed}
                onChange={handleAllowedChange}
              />

              <div className={styles.nameContainer}>
                <div className={classNames(
                  styles.name,
                  !allowed && styles.notAllowed
                )}
                >
                  {name}
                </div>

                <div className={styles.groupQualities}>
                  {
                    items.map(({ quality }) => (
                      <Label key={quality.id}>
                        {quality.name}
                      </Label>
                    )).reverse()
                  }
                </div>
              </div>
            </label>
        }

        {
          dragHandleProps &&
            <div className={styles.dragHandle} {...dragHandleProps}>
              <Icon
                className={styles.dragIcon}
                name={icons.REORDER}
                title={translate('Reorder')}
              />
            </div>
        }
      </div>

      {
        editGroups &&
          <div className={styles.items}>
            {children}
          </div>
      }
    </div>
  );
}

QualityProfileItemGroup.propTypes = {
  editGroups: PropTypes.bool,
  groupId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDragging: PropTypes.bool,
  isOverCurrent: PropTypes.bool,
  dragHandleProps: PropTypes.object,
  onItemGroupAllowedChange: PropTypes.func.isRequired,
  onItemGroupNameChange: PropTypes.func.isRequired,
  onDeleteGroupPress: PropTypes.func.isRequired,
  children: PropTypes.node
};

QualityProfileItemGroup.defaultProps = {
  editGroups: false,
  isDragging: false,
  isOverCurrent: false,
  dragHandleProps: null,
  children: null
};

export default QualityProfileItemGroup;
