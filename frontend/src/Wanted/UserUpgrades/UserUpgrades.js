import PropTypes from 'prop-types';
import React from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableHeader from 'Components/Table/TableHeader';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import UserUpgradesRow from './UserUpgradesRow';

function UserUpgrades(props) {
  const { items, isFetching, error } = props;

  return (
    <PageContent title="File Upgrades">
      <PageContentBody>
        {isFetching && <LoadingIndicator />}
        {error && <div>Unable to load File Upgrades</div>}
        {!isFetching && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableRowCell>Title</TableRowCell>
                <TableRowCell>Author</TableRowCell>
                <TableRowCell>eBook</TableRowCell>
                <TableRowCell>Audiobook</TableRowCell>
                <TableRowCell>Convert</TableRowCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <UserUpgradesRow
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

UserUpgrades.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object
};

export default UserUpgrades;
