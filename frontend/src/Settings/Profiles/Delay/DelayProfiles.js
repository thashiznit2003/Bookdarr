import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import DelayProfile from './DelayProfile';
import EditDelayProfileModalConnector from './EditDelayProfileModalConnector';
import styles from './DelayProfiles.css';

function getPointerY(event) {
  if (!event) {
    return null;
  }

  if ('clientY' in event && event.clientY != null) {
    return event.clientY;
  }

  if (event.touches && event.touches[0]) {
    return event.touches[0].clientY;
  }

  return null;
}

function SortableDelayProfile({
  item,
  index,
  tagList,
  nodeRefs,
  onConfirmDeleteDelayProfile
}) {
  const id = `delay-profile-${item.id}`;
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id,
    data: {
      order: index + 1,
      id: item.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const setRef = useCallback((node) => {
    nodeRefs.current[id] = node;
    setNodeRef(node);
  }, [nodeRefs, id, setNodeRef]);

  return (
    <div ref={setRef} style={style}>
      <DelayProfile
        {...item}
        tagList={tagList}
        isDragging={isDragging}
        dragHandleProps={{
          ...attributes,
          ...listeners
        }}
        onConfirmDeleteDelayProfile={onConfirmDeleteDelayProfile}
      />
    </div>
  );
}

SortableDelayProfile.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  nodeRefs: PropTypes.object.isRequired,
  onConfirmDeleteDelayProfile: PropTypes.func.isRequired
};

function DelayProfiles(props) {
  const {
    defaultProfile,
    items,
    tagList,
    onConfirmDeleteDelayProfile,
    onDelayProfileDragMove,
    onDelayProfileDragEnd,
    ...otherProps
  } = props;

  const [isAddDelayProfileModalOpen, setAddDelayProfileModalOpen] = useState(false);
  const nodeRefs = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragOver = useCallback(({ active, over, event }) => {
    if (!active || !over || !event) {
      return;
    }

    const dragOrder = active.data.current.order;
    let dropOrder = over.data.current.order;

    if (dragOrder == null || dropOrder == null) {
      return;
    }

    const overNode = nodeRefs.current[over.id];
    const pointerY = getPointerY(event);

    if (overNode && pointerY != null) {
      const { top, height } = overNode.getBoundingClientRect();
      const hoverMiddleY = top + height / 2;

      if (pointerY > hoverMiddleY) {
        dropOrder += 1;
      }
    }

    if (dropOrder < 0) {
      dropOrder = 0;
    }

    if (dropOrder === dragOrder) {
      return;
    }

    onDelayProfileDragMove(dragOrder, dropOrder);
  }, [onDelayProfileDragMove, nodeRefs]);

  const handleDragEnd = useCallback(({ active, over }) => {
    if (!active) {
      return;
    }

    onDelayProfileDragEnd({ id: active.data.current.id }, Boolean(over));
  }, [onDelayProfileDragEnd]);

  const onAddDelayProfilePress = () => setAddDelayProfileModalOpen(true);
  const onModalClose = () => setAddDelayProfileModalOpen(false);

  return (
    <FieldSet legend={translate('DelayProfiles')}>
      <PageSectionContent
        errorMessage={translate('UnableToLoadDelayProfiles')}
        {...otherProps}
      >
        <div className={styles.delayProfilesHeader}>
          <div className={styles.column}>
            {translate('Protocol')}
          </div>
          <div className={styles.column}>
            {translate('UsenetDelay')}
          </div>
          <div className={styles.column}>
            {translate('TorrentDelay')}
          </div>
          <div className={styles.column}>
            {translate('StacksDelay')}
          </div>
          <div className={styles.tags}>
            {translate('Tags')}
          </div>
        </div>

        <div className={styles.delayProfiles}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => `delay-profile-${item.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {
                items.map((item, index) => (
                  <SortableDelayProfile
                    key={item.id}
                    item={item}
                    index={index}
                    tagList={tagList}
                    nodeRefs={nodeRefs}
                    onConfirmDeleteDelayProfile={onConfirmDeleteDelayProfile}
                  />
                ))
              }
            </SortableContext>
          </DndContext>
        </div>

        {
          defaultProfile &&
            <div>
              <DelayProfile
                {...defaultProfile}
                tagList={tagList}
                isDragging={false}
                dragHandleProps={{}}
                onConfirmDeleteDelayProfile={onConfirmDeleteDelayProfile}
              />
            </div>
        }

        <div className={styles.addDelayProfile}>
          <Link
            className={styles.addButton}
            onPress={onAddDelayProfilePress}
          >
            <Icon name={icons.ADD} />
          </Link>
        </div>

        <EditDelayProfileModalConnector
          isOpen={isAddDelayProfileModalOpen}
          onModalClose={onModalClose}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

DelayProfiles.propTypes = {
  defaultProfile: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteDelayProfile: PropTypes.func.isRequired,
  onDelayProfileDragMove: PropTypes.func.isRequired,
  onDelayProfileDragEnd: PropTypes.func.isRequired
};

DelayProfiles.defaultProps = {
  defaultProfile: null
};

export default DelayProfiles;
