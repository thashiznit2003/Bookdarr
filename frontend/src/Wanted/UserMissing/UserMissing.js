import PropTypes from 'prop-types';
import React from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableHead from 'Components/Table/TableHead';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import UserMissingRow from './UserMissingRow';

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
          <Table>
            <TableHead>
              <TableRow>
                <TableRowCell>Title</TableRowCell>
                <TableRowCell>Author</TableRowCell>
                <TableRowCell>eBook</TableRowCell>
                <TableRowCell>Audiobook</TableRowCell>
                <TableRowCell>Search</TableRowCell>
                <TableRowCell>Convert</TableRowCell>
              </TableRow>
            </TableHead>
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
