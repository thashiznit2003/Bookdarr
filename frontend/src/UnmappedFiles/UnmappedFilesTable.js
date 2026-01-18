import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTable from 'Components/Table/VirtualTable';
import VirtualTableRow from 'Components/Table/VirtualTableRow';
import AssignUnmappedModal from 'UnmappedFiles/assign/AssignUnmappedModal';
import { align, icons, kinds, sortDirections } from 'Helpers/Props';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import UnmappedFilesTableHeader from './UnmappedFilesTableHeader';
import UnmappedFilesTableRow from './UnmappedFilesTableRow';

class UnmappedFilesTable extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      scroller: null,
      allSelected: false,
      allUnselected: false,
      lastToggled: null,
      selectedState: {},
      isAssignModalOpen: false,
      assignFolder: null,
      assignFileIds: [],
      assignFiles: []
    };
  }

  componentDidMount() {
    this.setSelectedState();
  }

  componentDidUpdate(prevProps) {
    const {
      items,
      sortKey,
      sortDirection,
      isDeleting,
      deleteError
    } = this.props;

    if (sortKey !== prevProps.sortKey ||
      sortDirection !== prevProps.sortDirection ||
      hasDifferentItemsOrOrder(prevProps.items, items)
    ) {
      this.setSelectedState();
    }

    const hasFinishedDeleting = prevProps.isDeleting &&
                                !isDeleting &&
                                !deleteError;

    if (hasFinishedDeleting) {
      this.onSelectAllChange({ value: false });
    }
  }

  //
  // Control

  setScrollerRef = (ref) => {
    this.setState({ scroller: ref });
  };

  getSelectedIds = () => {
    if (this.state.allUnselected) {
      return [];
    }
    return getSelectedIds(this.state.selectedState);
  };

  setSelectedState() {
    const {
      items
    } = this.props;

    const {
      selectedState
    } = this.state;

    const newSelectedState = {};

    items.forEach((file) => {
      const isItemSelected = selectedState[file.id];

      if (isItemSelected) {
        newSelectedState[file.id] = isItemSelected;
      } else {
        newSelectedState[file.id] = false;
      }
    });

    const selectedCount = getSelectedIds(newSelectedState).length;
    const newStateCount = Object.keys(newSelectedState).length;
    let isAllSelected = false;
    let isAllUnselected = false;

    if (selectedCount === 0) {
      isAllUnselected = true;
    } else if (selectedCount === newStateCount) {
      isAllSelected = true;
    }

    this.setState({ selectedState: newSelectedState, allSelected: isAllSelected, allUnselected: isAllUnselected });
  }

  onSelectAllChange = ({ value }) => {
    this.setState(selectAll(this.state.selectedState, value));
  };

  onSelectAllPress = () => {
    this.onSelectAllChange({ value: !this.state.allSelected });
  };

  onSelectedChange = ({ id, value, shiftKey = false }) => {
    this.setState((state) => {
      return toggleSelected(state, this.props.items, id, value, shiftKey);
    });
  };

  onDeleteUnmappedFilesPress = () => {
    const selectedIds = this.getSelectedIds();

    this.props.deleteUnmappedFiles(selectedIds);
  };

  onAssignPress = () => {
    const selectedIds = this.getSelectedIds();
    if (!selectedIds.length) {
      return;
    }

    const selectedItems = this.props.items.filter((x) => selectedIds.includes(x.id));
    const first = selectedItems[0];

    if (!first) {
      return;
    }

    const folder = first.path.substring(0, Math.max(first.path.lastIndexOf('/'), first.path.lastIndexOf('\\')));

    this.setState({
      isAssignModalOpen: true,
      assignFolder: folder,
      assignFileIds: selectedIds,
      assignFiles: selectedItems
    });
  };

  onAssignModalClose = () => {
    this.setState({
      isAssignModalOpen: false,
      assignFolder: null,
      assignFileIds: []
    });
  };

  rowRenderer = ({ key, rowIndex, style }) => {
    const {
      items,
      columns,
      deleteUnmappedFile
    } = this.props;

    const {
      selectedState
    } = this.state;

    const item = items[rowIndex];

    return (
      <VirtualTableRow
        key={key}
        style={style}
      >
        <UnmappedFilesTableRow
          key={item.id}
          columns={columns}
          isSelected={selectedState[item.id]}
          onSelectedChange={this.onSelectedChange}
          deleteUnmappedFile={deleteUnmappedFile}
          {...item}
        />
      </VirtualTableRow>
    );
  };

  render() {

    const {
      isFetching,
      isPopulated,
      isDeleting,
      error,
      items,
      columns,
      sortKey,
      sortDirection,
      onTableOptionChange,
      onSortPress,
      isScanningFolders,
      onAddMissingAuthorsPress,
      deleteUnmappedFiles,
      ...otherProps
    } = this.props;

    const {
      scroller,
      allSelected,
      allUnselected,
      selectedState,
      isAssignModalOpen,
      assignFolder,
      assignFileIds,
      assignFiles
    } = this.state;

    const selectedTrackFileIds = this.getSelectedIds();

    return (
      <PageContent title={translate('UnmappedFiles')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('AddMissing')}
              iconName={icons.ADD_MISSING_AUTHORS}
              isDisabled={isPopulated && !error && !items.length}
              isSpinning={isScanningFolders}
              onPress={onAddMissingAuthorsPress}
            />
            <PageToolbarButton
              label={translate('DeleteSelected')}
              iconName={icons.DELETE}
              isDisabled={selectedTrackFileIds.length === 0}
              isSpinning={isDeleting}
              onPress={this.onDeleteUnmappedFilesPress}
            />
            <PageToolbarButton
              label={translate('AssignToBook')}
              iconName={icons.INTERACTIVE}
              isDisabled={selectedTrackFileIds.length === 0}
              onPress={this.onAssignPress}
            />
          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <TableOptionsModalWrapper
              {...otherProps}
              columns={columns}
              onTableOptionChange={onTableOptionChange}
            >
              <PageToolbarButton
                label={translate('Options')}
                iconName={icons.TABLE}
              />
            </TableOptionsModalWrapper>

          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody
          registerScroller={this.setScrollerRef}
        >
          {
            isFetching && !isPopulated &&
              <LoadingIndicator />
          }

          {
            isPopulated && !error && !items.length &&
              <Alert kind={kinds.INFO}>
                Success! My work is done, all files on disk are matched to known books.
              </Alert>
          }

          {
            isPopulated && !error && !!items.length && scroller &&
              <VirtualTable
                items={items}
                columns={columns}
                scroller={scroller}
                isSmallScreen={false}
                overscanRowCount={10}
                rowRenderer={this.rowRenderer}
                header={
                  <UnmappedFilesTableHeader
                    columns={columns}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onTableOptionChange={onTableOptionChange}
                    onSortPress={onSortPress}
                    allSelected={allSelected}
                    allUnselected={allUnselected}
                    onSelectAllChange={this.onSelectAllChange}
                  />
                }
                selectedState={selectedState}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />
          }
        </PageContentBody>

        <AssignUnmappedModal
          isOpen={isAssignModalOpen}
          fileIds={assignFileIds}
          files={assignFiles}
          folder={assignFolder}
          onModalClose={this.onAssignModalClose}
        />
      </PageContent>
    );
  }
}

UnmappedFilesTable.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  deleteError: PropTypes.object,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.oneOf(sortDirections.all),
  onTableOptionChange: PropTypes.func.isRequired,
  onSortPress: PropTypes.func.isRequired,
  deleteUnmappedFile: PropTypes.func.isRequired,
  deleteUnmappedFiles: PropTypes.func.isRequired,
  isScanningFolders: PropTypes.bool.isRequired,
  onAddMissingAuthorsPress: PropTypes.func.isRequired
};

export default UnmappedFilesTable;
