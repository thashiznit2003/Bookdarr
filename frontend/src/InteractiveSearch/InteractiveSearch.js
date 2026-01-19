import PropTypes from 'prop-types';
import React from 'react';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons, kinds, sortDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import InteractiveSearchRow from './InteractiveSearchRow';
import styles from './InteractiveSearch.css';

const baseColumns = [
  {
    name: 'protocol',
    label: 'Source',
    isSortable: true
  },
  {
    name: 'age',
    label: 'Age',
    isSortable: true
  },
  {
    name: 'title',
    label: 'Title',
    isSortable: true
  },
  {
    name: 'indexer',
    label: 'Indexer',
    isSortable: true
  },
  {
    name: 'size',
    label: 'Size',
    isSortable: true
  },
  {
    name: 'peers',
    label: 'Peers',
    isSortable: true
  },
  {
    name: 'qualityWeight',
    label: 'Type',
    isSortable: true
  },
  {
    name: 'customFormatScore',
    label: React.createElement(Icon, {
      name: icons.SCORE,
      title: () => translate('CustomFormatScore')
    }),
    isSortable: true
  },
  {
    name: 'indexerFlags',
    label: React.createElement(Icon, {
      name: icons.FLAG,
      title: () => translate('IndexerFlags')
    }),
    isSortable: true
  },
  {
    name: 'releaseWeight',
    label: React.createElement(Icon, { name: icons.DOWNLOAD }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING
  },
  {
    name: 'rejections',
    label: React.createElement(Icon, {
      name: icons.DANGER,
      title: 'Rejections'
    }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING
  }
];

function getColumns(isSmallScreen) {
  const visibleColumns = isSmallScreen ?
    ['title', 'peers', 'releaseWeight', 'rejections'] :
    baseColumns.map((column) => column.name);

  return baseColumns
    .filter((column) => visibleColumns.includes(column.name))
    .map((column) => ({ ...column, isVisible: true }));
}

function InteractiveSearch(props) {
  const {
    searchPayload,
    isFetching,
    isPopulated,
    error,
    totalReleasesCount,
    items,
    sortKey,
    sortDirection,
    longDateFormat,
    timeFormat,
    isSmallScreen,
    onSortPress,
    onGrabPress
  } = props;

  const columns = getColumns(isSmallScreen);

  return (
    <div>
      {
        isFetching ? <LoadingIndicator /> : null
      }

      {
        !isFetching && error ?
          <div className={styles.blankpad}>
            Unable to load results for this book search. Try again later
          </div> :
          null
      }

      {
        !isFetching && isPopulated && !totalReleasesCount ?
          <Alert kind={kinds.INFO}>
            {translate('NoResultsFound')}
          </Alert> :
          null
      }

      {
        !!totalReleasesCount && isPopulated && !items.length ?
          <Alert kind={kinds.WARNING}>
            {translate('AllResultsAreHiddenByTheAppliedFilter')}
          </Alert> :
          null
      }

      {
        isPopulated && !!items.length ?
          <Table
            className={styles.table}
            columns={columns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
            horizontalScroll={!isSmallScreen}
          >
            <TableBody>
              {
                items.map((item) => {
                  return (
                    <InteractiveSearchRow
                      key={`${item.indexerId}-${item.guid}`}
                      {...item}
                      searchPayload={searchPayload}
                      longDateFormat={longDateFormat}
                      timeFormat={timeFormat}
                      isSmallScreen={isSmallScreen}
                      onGrabPress={onGrabPress}
                    />
                  );
                })
              }
            </TableBody>
          </Table> :
          null
      }

      {
        totalReleasesCount !== items.length && !!items.length ?
          <div className={styles.filteredMessage}>
            {translate('SomeResultsAreHiddenByTheAppliedFilter')}
          </div> :
          null
      }
    </div>
  );
}

InteractiveSearch.propTypes = {
  searchPayload: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  totalReleasesCount: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string,
  type: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  onSortPress: PropTypes.func.isRequired,
  onGrabPress: PropTypes.func.isRequired
};

export default InteractiveSearch;
