import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import CheckInput from 'Components/Form/CheckInput';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons, kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import EditImportListExclusionModalConnector from './EditImportListExclusionModalConnector';
import ImportListExclusion from './ImportListExclusion';
import styles from './ImportListExclusions.css';

class ImportListExclusions extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddImportListExclusionModalOpen: false,
      isSelecting: false,
      isBulkDeleteModalOpen: false,
      allSelected: false,
      selectedState: {}
    };
  }

  //
  // Listeners

  onAddImportListExclusionPress = () => {
    this.setState({ isAddImportListExclusionModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isAddImportListExclusionModalOpen: false });
  };

  onToggleSelectPress = () => {
    const { items } = this.props;
    const selectedState = {};

    items.forEach((item) => {
      selectedState[item.id] = false;
    });

    this.setState({
      isSelecting: true,
      selectedState,
      allSelected: false
    });
  };

  onDoneSelectingPress = () => {
    this.setState({
      isSelecting: false,
      isBulkDeleteModalOpen: false,
      selectedState: {},
      allSelected: false
    });
  };

  onSelectedChange = ({ id, value }) => {
    this.setState((prevState) => {
      const selectedState = {
        ...prevState.selectedState,
        [id]: value
      };

      const selectedIds = getSelectedIds(selectedState);
      const allSelected = selectedIds.length > 0 && selectedIds.length === Object.keys(selectedState).length;

      return {
        selectedState,
        allSelected
      };
    });
  };

  onSelectAllChange = ({ value }) => {
    this.setState((prevState) => {
      const selectedState = {};
      Object.keys(prevState.selectedState).forEach((id) => {
        selectedState[id] = value;
      });

      return {
        selectedState,
        allSelected: value
      };
    });
  };

  onDeleteSelectedPress = () => {
    const selectedIds = getSelectedIds(this.state.selectedState);
    if (!selectedIds.length) {
      return;
    }

    this.setState({ isBulkDeleteModalOpen: true });
  };

  onBulkDeleteConfirm = () => {
    const selectedIds = getSelectedIds(this.state.selectedState);
    if (!selectedIds.length) {
      this.setState({ isBulkDeleteModalOpen: false });
      return;
    }

    this.props.deleteImportListExclusions(selectedIds);
    this.setState({
      isBulkDeleteModalOpen: false,
      selectedState: {},
      allSelected: false
    });
  };

  onBulkDeleteCancel = () => {
    this.setState({ isBulkDeleteModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      onConfirmDeleteImportListExclusion,
      isDeleting,
      ...otherProps
    } = this.props;

    const {
      isSelecting,
      isBulkDeleteModalOpen,
      allSelected,
      selectedState
    } = this.state;

    const selectedIds = getSelectedIds(selectedState);

    return (
      <FieldSet legend={translate('ImportListExclusions')}>
        <PageSectionContent
          errorMessage={translate('UnableToLoadImportListExclusions')}
          {...otherProps}
        >
          <div className={styles.actions}>
            {!isSelecting && (
              <Button
                kind={kinds.PRIMARY}
                size={sizes.SMALL}
                onPress={this.onToggleSelectPress}
              >
                {translate('ExclusionSelect')}
              </Button>
            )}

            {isSelecting && (
              <>
                <Button
                  kind={kinds.DANGER}
                  size={sizes.SMALL}
                  isDisabled={!selectedIds.length || isDeleting}
                  onPress={this.onDeleteSelectedPress}
                >
                  {translate('DeleteSelected')}
                </Button>
                <Button
                  kind={kinds.DEFAULT}
                  size={sizes.SMALL}
                  onPress={this.onDoneSelectingPress}
                >
                  {translate('DoneSelecting')}
                </Button>
              </>
            )}
          </div>

          <div className={styles.importListExclusionsHeader}>
            {isSelecting && (
              <div className={styles.select}>
                <CheckInput
                  name="selectAllImportListExclusions"
                  value={allSelected}
                  onChange={this.onSelectAllChange}
                />
              </div>
            )}
            <div className={styles.foreignId}>
              {translate('ForeignId')}
            </div>
            <div className={styles.name}>
              {translate('Name')}
            </div>
          </div>

          <div>
            {
              items.map((item, index) => {
                return (
                  <ImportListExclusion
                    key={item.id}
                    {...item}
                    {...otherProps}
                    index={index}
                    onConfirmDeleteImportListExclusion={onConfirmDeleteImportListExclusion}
                    isSelecting={isSelecting}
                    isSelected={selectedState[item.id]}
                    onSelectedChange={this.onSelectedChange}
                  />
                );
              })
            }
          </div>

          <div className={styles.addImportListExclusion}>
            <Link
              className={styles.addButton}
              onPress={this.onAddImportListExclusionPress}
            >
              <Icon name={icons.ADD} />
            </Link>
          </div>

          <EditImportListExclusionModalConnector
            isOpen={this.state.isAddImportListExclusionModalOpen}
            onModalClose={this.onModalClose}
          />

          <ConfirmModal
            isOpen={isBulkDeleteModalOpen}
            kind={kinds.DANGER}
            title={translate('DeleteImportListExclusion')}
            message={translate('DeleteImportListExclusionMessageText')}
            confirmLabel={translate('Delete')}
            onConfirm={this.onBulkDeleteConfirm}
            onCancel={this.onBulkDeleteCancel}
          />

        </PageSectionContent>
      </FieldSet>
    );
  }
}

ImportListExclusions.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteImportListExclusion: PropTypes.func.isRequired,
  deleteImportListExclusions: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool.isRequired
};

export default ImportListExclusions;
