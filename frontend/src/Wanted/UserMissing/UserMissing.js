import PropTypes from 'prop-types';
import React from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import UserMissingRow from './UserMissingRow';

const columns = [
  { name: 'title', label: 'Title', isVisible: true, isSortable: false },
  { name: 'author', label: 'Author', isVisible: true, isSortable: false },
  { name: 'ebook', label: 'eBook', isVisible: true, isSortable: false },
  { name: 'audiobook', label: 'Audiobook', isVisible: true, isSortable: false },
  { name: 'search', label: 'Search', isVisible: true, isSortable: false }
];

function UserMissing(props) {
  const { items, isFetching, error } = props;

  return (
    <PageContent title="Missing Files">
      <PageContentBody>
        {isFetching && <LoadingIndicator />}
        {error && (
          <div>Unable to load Missing Files</div>
        )}
        {!isFetching && !error && (
          <Table
            columns={columns}
            selectAll={false}
            horizontalScroll={false}
          >
            <TableBody>
              {items.map((item) => (
                <UserMissingRow
                  key={item.bookId}
                  {...item}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </PageContentBody>
    </PageContent>
  );
}

UserMissing.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object
};

export default UserMissing;
