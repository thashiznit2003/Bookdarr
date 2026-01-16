import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import _ from 'lodash';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import TableOptionsColumn from './TableOptionsColumn';
import styles from './TableOptionsModal.css';

function SortableTableColumn({ column, onVisibleChange }) {
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: column.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.columnWrapper}
    >
      <TableOptionsColumn
        name={column.name}
        label={typeof column.columnLabel === 'function' ? column.columnLabel() : column.columnLabel || column.label}
        isVisible={column.isVisible}
        isModifiable={column.isModifiable !== false}
        isDragging={isDragging}
        onVisibleChange={onVisibleChange}
        dragHandleProps={{
          ...attributes,
          ...listeners
        }}
      />
    </div>
  );
}

SortableTableColumn.propTypes = {
  column: PropTypes.object.isRequired,
  onVisibleChange: PropTypes.func.isRequired
};

function TableOptionsModal(props) {
  const {
    isOpen,
    columns,
    canModifyColumns,
    optionsComponent: OptionsComponent,
    onTableOptionChange,
    onModalClose
  } = props;

  const [hasPageSize] = useState(!!props.pageSize);
  const [pageSize, setPageSize] = useState(props.pageSize);
  const [pageSizeError, setPageSizeError] = useState(null);

  useEffect(() => {
    setPageSize(props.pageSize);
  }, [props.pageSize]);

  const modifiableColumns = useMemo(() => columns.filter(column => column.isModifiable !== false), [columns]);
  const columnOrder = useMemo(() => modifiableColumns.map(column => column.name), [modifiableColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const onPageSizeChange = ({ value }) => {
    let error = null;

    if (value < 5) {
      error = 'Page size must be at least 5';
    } else if (value > 250) {
      error = 'Page size must not exceed 250';
    } else {
      onTableOptionChange({ pageSize: value });
    }

    setPageSize(value);
    setPageSizeError(error);
  };

  const onVisibleChange = ({ name, value }) => {
    const updatedColumns = _.cloneDeep(columns);
    const column = _.find(updatedColumns, { name });

    if (column) {
      column.isVisible = value;
      onTableOptionChange({ columns: updatedColumns });
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!active || !over || active.id === over.id) {
      return;
    }

    const activeIndex = modifiableColumns.findIndex(column => column.name === active.id);
    const overIndex = modifiableColumns.findIndex(column => column.name === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    const reordered = arrayMove(modifiableColumns, activeIndex, overIndex);

    const updatedColumns = _.cloneDeep(columns);
    let reorderIndex = 0;

    updatedColumns.forEach((column, idx) => {
      if (column.isModifiable === false) {
        return;
      }

      updatedColumns[idx] = reordered[reorderIndex];
      reorderIndex += 1;
    });

    onTableOptionChange({ columns: updatedColumns });
  };

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      {
        isOpen ?
          <ModalContent onModalClose={onModalClose}>
            <ModalHeader>
              Table Options
            </ModalHeader>

            <ModalBody>
              <Form>
                {
                  hasPageSize ?
                    <FormGroup>
                      <FormLabel>
                        {translate('PageSize')}
                      </FormLabel>

                      <FormInputGroup
                        type={inputTypes.NUMBER}
                        name="pageSize"
                        value={pageSize || 0}
                        helpText={translate('PageSizeHelpText')}
                        errors={pageSizeError ? [{ message: pageSizeError }] : undefined}
                        onChange={onPageSizeChange}
                      />
                    </FormGroup> :
                    null
                }

                {
                  OptionsComponent ?
                    <OptionsComponent
                      onTableOptionChange={onTableOptionChange}
                    /> : null
                }

                {
                  canModifyColumns ?
                    <FormGroup>
                      <FormLabel>
                        {translate('Columns')}
                      </FormLabel>

                      <div>
                        <FormInputHelpText
                          text="Choose which columns are visible and which order they appear in"
                        />

                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={columnOrder}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className={styles.columns}>
                              {
                                columns.map((column, index) => {
                                  if (column.isModifiable !== false) {
                                    return (
                                      <SortableTableColumn
                                        key={column.name}
                                        column={column}
                                        onVisibleChange={onVisibleChange}
                                      />
                                    );
                                  }

                                  return (
                                    <TableOptionsColumn
                                      key={column.name}
                                      name={column.name}
                                      label={typeof column.columnLabel === 'function' ? column.columnLabel() : column.columnLabel || column.label}
                                      isVisible={column.isVisible}
                                      isModifiable={false}
                                      onVisibleChange={onVisibleChange}
                                    />
                                  );
                                })
                              }
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    </FormGroup> :
                    null
                }
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={onModalClose}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent> :
          null
      }
    </Modal>
  );
}

TableOptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageSize: PropTypes.number,
  canModifyColumns: PropTypes.bool.isRequired,
  optionsComponent: PropTypes.elementType,
  onTableOptionChange: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

TableOptionsModal.defaultProps = {
  canModifyColumns: true
};

export default TableOptionsModal;
