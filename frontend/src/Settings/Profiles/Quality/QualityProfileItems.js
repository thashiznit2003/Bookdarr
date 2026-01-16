import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Measure from 'Components/Measure';
import { icons, kinds, sizes } from 'Helpers/Props';
import QualityProfileItem from './QualityProfileItem';
import QualityProfileItemGroup from './QualityProfileItemGroup';
import styles from './QualityProfileItems.css';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableQualityRow({
  qualityIndex,
  nodeRefs,
  overId,
  children
}) {
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: qualityIndex,
    data: { qualityIndex, id: qualityIndex }
  });

  const ref = useCallback((node) => {
    if (node) {
      nodeRefs.current[qualityIndex] = node;
    } else {
      delete nodeRefs.current[qualityIndex];
    }

    setNodeRef(node);
  }, [nodeRefs, qualityIndex, setNodeRef]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={ref} style={style}>
      {children({
        dragHandleProps: {
          ...attributes,
          ...listeners
        },
        isDragging,
        isOverCurrent: overId === qualityIndex
      })}
    </div>
  );
}

SortableQualityRow.propTypes = {
  qualityIndex: PropTypes.string.isRequired,
  nodeRefs: PropTypes.object.isRequired,
  overId: PropTypes.string,
  children: PropTypes.func.isRequired
};

function QualityProfileItems({
  editGroups,
  qualityProfileItems,
  errors,
  warnings,
  onToggleEditGroupsMode,
  onQualityProfileItemAllowedChange,
  onCreateGroupPress,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onDeleteGroupPress,
  onQualityProfileItemDragMove,
  onQualityProfileItemDragEnd
}) {
  const [qualitiesHeight, setQualitiesHeight] = useState(0);
  const [qualitiesHeightEditGroups, setQualitiesHeightEditGroups] = useState(0);
  const [overId, setOverId] = useState(null);
  const nodeRefs = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const sortableIds = useMemo(() => {
    const ids = [];

    qualityProfileItems.forEach((item, index) => {
      const baseIndex = `${index + 1}`;
      ids.push(baseIndex);

      if (item.items) {
        item.items.forEach((_, childIndex) => {
          ids.push(`${baseIndex}.${childIndex + 1}`);
        });
      }
    });

    return ids;
  }, [qualityProfileItems]);

  const onMeasure = ({ height }) => {
    if (editGroups) {
      setQualitiesHeightEditGroups(height);
    } else {
      setQualitiesHeight(height);
    }
  };

  const onDragOver = useCallback(({ active, over, event }) => {
    if (!active || !over || !event) {
      return;
    }

    const dragQualityIndex = active.data.current?.qualityIndex;
    let dropQualityIndex = over.data.current?.qualityIndex;

    if (!dragQualityIndex || !dropQualityIndex) {
      return;
    }

    const overNode = nodeRefs.current[over.id];
    const pointerY = getPointerY(event);

    let dropPosition = 'above';

    if (overNode && pointerY != null) {
      const { top, height } = overNode.getBoundingClientRect();
      const hoverMiddleY = top + height / 2;

      dropPosition = pointerY > hoverMiddleY ? 'below' : 'above';
    }

    if (dropQualityIndex === dragQualityIndex && dropPosition === 'above') {
      return;
    }

    setOverId(over.id);
    onQualityProfileItemDragMove({
      dragQualityIndex,
      dropQualityIndex,
      dropPosition
    });
  }, [onQualityProfileItemDragMove]);

  const onDragEnd = useCallback(({ active, over }) => {
    setOverId(null);

    if (!active) {
      return;
    }

    onQualityProfileItemDragEnd({ id: active.data.current?.id }, Boolean(over));
  }, [onQualityProfileItemDragEnd]);

  const minHeight = editGroups ? qualitiesHeightEditGroups : qualitiesHeight;
  const renderOrder = qualityProfileItems.map((_, index) => qualityProfileItems.length - 1 - index);

  return (
    <FormGroup size={sizes.EXTRA_SMALL}>
      <FormLabel size={sizes.SMALL}>
        Qualities
      </FormLabel>

      <div>
        <FormInputHelpText
          text="Qualities higher in the list are more preferred. Qualities within the same group are equal. Only checked qualities are wanted"
        />

        {errors.map((error, index) => (
          <FormInputHelpText
            key={index}
            text={error.message}
            isError={true}
            isCheckInput={false}
          />
        ))}

        {warnings.map((warning, index) => (
          <FormInputHelpText
            key={index}
            text={warning.message}
            isWarning={true}
            isCheckInput={false}
          />
        ))}

        <Button
          className={styles.editGroupsButton}
          kind={kinds.PRIMARY}
          onPress={onToggleEditGroupsMode}
        >
          <div>
            <Icon
              className={styles.editGroupsButtonIcon}
              name={editGroups ? icons.REORDER : icons.GROUP}
            />
            {editGroups ? 'Done Editing Groups' : 'Edit Groups'}
          </div>
        </Button>

        <Measure
          includeMargin={false}
          onMeasure={onMeasure}
          className={styles.qualities}
          style={{ minHeight: `${minHeight}px` }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {renderOrder.map((originalIndex) => {
                const entry = qualityProfileItems[originalIndex];
                const qualityIndex = `${originalIndex + 1}`;

                if (entry.quality) {
                  return (
                    <SortableQualityRow
                      key={entry.quality.id}
                      qualityIndex={qualityIndex}
                      nodeRefs={nodeRefs}
                      overId={overId}
                    >
                      {({ dragHandleProps, isDragging, isOverCurrent }) => (
                      <QualityProfileItem
                        {...entry}
                        qualityId={entry.quality.id}
                        name={entry.quality.name}
                        dragHandleProps={dragHandleProps}
                        isDragging={isDragging}
                        isOverCurrent={isOverCurrent}
                        editGroups={editGroups}
                        onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
                        onCreateGroupPress={onCreateGroupPress}
                      />
                      )}
                    </SortableQualityRow>
                  );
                }

                return (
                  <SortableQualityRow
                    key={`group-${entry.id}`}
                    qualityIndex={qualityIndex}
                    nodeRefs={nodeRefs}
                    overId={overId}
                  >
                    {({ dragHandleProps, isDragging, isOverCurrent }) => (
                      <QualityProfileItemGroup
                        groupId={entry.id}
                        name={entry.name}
                        allowed={entry.allowed}
                        items={entry.items}
                        editGroups={editGroups}
                        isDragging={isDragging}
                        isOverCurrent={isOverCurrent}
                        dragHandleProps={dragHandleProps}
                        onItemGroupAllowedChange={onItemGroupAllowedChange}
                        onItemGroupNameChange={onItemGroupNameChange}
                        onDeleteGroupPress={onDeleteGroupPress}
                      >
                        {entry.items.map((child, childIndex) => {
                          const childQualityIndex = `${qualityIndex}.${childIndex + 1}`;

                          return (
                            <SortableQualityRow
                              key={child.quality.id}
                              qualityIndex={childQualityIndex}
                              nodeRefs={nodeRefs}
                              overId={overId}
                            >
                              {({ dragHandleProps: childDragHandleProps, isDragging: childIsDragging, isOverCurrent: childIsOverCurrent }) => (
                                <QualityProfileItem
                                  editGroups={editGroups}
                                  groupId={entry.id}
                                  qualityId={child.quality.id}
                                  name={child.quality.name}
                                  allowed={child.allowed}
                                  isDragging={childIsDragging}
                                  isOverCurrent={childIsOverCurrent}
                                  dragHandleProps={childDragHandleProps}
                                  onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
                                  onCreateGroupPress={onCreateGroupPress}
                                />
                              )}
                            </SortableQualityRow>
                          );
                        }).reverse()}
                      </QualityProfileItemGroup>
                    )}
                  </SortableQualityRow>
                );
              })}
            </SortableContext>
          </DndContext>
        </Measure>
      </div>
    </FormGroup>
  );
}

QualityProfileItems.propTypes = {
  editGroups: PropTypes.bool.isRequired,
  qualityProfileItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  errors: PropTypes.arrayOf(PropTypes.object),
  warnings: PropTypes.arrayOf(PropTypes.object),
  onToggleEditGroupsMode: PropTypes.func.isRequired,
  onQualityProfileItemAllowedChange: PropTypes.func.isRequired,
  onCreateGroupPress: PropTypes.func.isRequired,
  onItemGroupAllowedChange: PropTypes.func.isRequired,
  onItemGroupNameChange: PropTypes.func.isRequired,
  onDeleteGroupPress: PropTypes.func.isRequired,
  onQualityProfileItemDragMove: PropTypes.func.isRequired,
  onQualityProfileItemDragEnd: PropTypes.func.isRequired
};

QualityProfileItems.defaultProps = {
  errors: [],
  warnings: []
};

export default QualityProfileItems;
