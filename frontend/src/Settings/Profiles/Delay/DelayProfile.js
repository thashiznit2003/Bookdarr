import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { icons, kinds } from 'Helpers/Props';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import EditDelayProfileModalConnector from './EditDelayProfileModalConnector';
import styles from './DelayProfile.css';

function getDelay(enabled, delay) {
  if (!enabled) {
    return '-';
  }

  if (!delay) {
    return 'No Delay';
  }

  if (delay === 1) {
    return '1 Minute';
  }

  // TODO: use better units of time than just minutes
  return `${delay} Minutes`;
}

function DelayProfile(props) {
  const {
    id,
    enableUsenet,
    enableTorrent,
    preferredProtocol,
    usenetDelay,
    torrentDelay,
    tags,
    tagList,
    isDragging,
    dragHandleProps,
    onConfirmDeleteDelayProfile
  } = props;

  const [isEditDelayProfileModalOpen, setEditDelayProfileModalOpen] = useState(false);
  const [isDeleteDelayProfileModalOpen, setDeleteDelayProfileModalOpen] = useState(false);

  let preferred = titleCase(preferredProtocol);

  if (!enableUsenet) {
    preferred = 'Only Torrent';
  } else if (!enableTorrent) {
    preferred = 'Only Usenet';
  }

  const onEditDelayProfilePress = () => setEditDelayProfileModalOpen(true);
  const onEditDelayProfileModalClose = () => setEditDelayProfileModalOpen(false);
  const onDeleteDelayProfilePress = () => {
    setEditDelayProfileModalOpen(false);
    setDeleteDelayProfileModalOpen(true);
  };
  const onDeleteDelayProfileModalClose = () => setDeleteDelayProfileModalOpen(false);
  const handleConfirmDeleteDelayProfile = () => onConfirmDeleteDelayProfile(id);

  return (
    <div
      className={classNames(
        styles.delayProfile,
        isDragging && styles.isDragging
      )}
    >
      <div className={styles.column}>{preferred}</div>
      <div className={styles.column}>{getDelay(enableUsenet, usenetDelay)}</div>
      <div className={styles.column}>{getDelay(enableTorrent, torrentDelay)}</div>

      <TagList
        tags={tags}
        tagList={tagList}
      />

      <div className={styles.actions}>
        <Link
          className={id === 1 ? styles.editButton : undefined}
          onPress={onEditDelayProfilePress}
        >
          <Icon name={icons.EDIT} />
        </Link>

        {
          id !== 1 &&
            <div
              className={styles.dragHandle}
              {...dragHandleProps}
            >
              <Icon
                className={styles.dragIcon}
                name={icons.REORDER}
              />
            </div>
        }
      </div>

      <EditDelayProfileModalConnector
        id={id}
        isOpen={isEditDelayProfileModalOpen}
        onModalClose={onEditDelayProfileModalClose}
        onDeleteDelayProfilePress={onDeleteDelayProfilePress}
      />

      <ConfirmModal
        isOpen={isDeleteDelayProfileModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteDelayProfile')}
        message={translate('DeleteDelayProfileMessageText')}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDeleteDelayProfile}
        onCancel={onDeleteDelayProfileModalClose}
      />
    </div>
  );
}

DelayProfile.propTypes = {
  id: PropTypes.number.isRequired,
  enableUsenet: PropTypes.bool.isRequired,
  enableTorrent: PropTypes.bool.isRequired,
  preferredProtocol: PropTypes.string.isRequired,
  usenetDelay: PropTypes.number.isRequired,
  torrentDelay: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDragging: PropTypes.bool.isRequired,
  dragHandleProps: PropTypes.object,
  onConfirmDeleteDelayProfile: PropTypes.func.isRequired
};

DelayProfile.defaultProps = {
  dragHandleProps: {}
};

export default DelayProfile;
