import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import Label from 'Components/Label';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableCell from 'Components/Table/TableCell';
import TableHeader from 'Components/Table/TableHeader';
import TableRow from 'Components/Table/TableRow';
import TextInput from 'Components/Form/TextInput';
import CheckInput from 'Components/Form/CheckInput';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import translate from 'Utilities/String/translate';
import styles from './Users.css';

function Users({
  users,
  isFetching,
  onRefresh,
  onCreate
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const rows = useMemo(() => users || [], [users]);

  const onCreateClick = () => {
    if (!username || !password) {
      return;
    }

    onCreate({
      username,
      password,
      isAdmin,
      isActive
    });
    setPassword('');
  };

  return (
    <PageContent title={translate('Users')}>
      <PageContentBody className={styles.pageBody}>
        <div className={styles.header}>
          <div className={styles.title}>
            {translate('Users')}
          </div>
          <div className={styles.actions}>
            <SpinnerIconButton
              name="refresh"
              isSpinning={isFetching}
              title={translate('Refresh')}
              onPress={onRefresh}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <TextInput
              name="username"
              label={translate('Username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <TextInput
              name="password"
              type="password"
              label={translate('Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.formField}>
            <CheckInput
              name="isAdmin"
              value={isAdmin}
              onChange={(e) => setIsAdmin(e.value)}
            >
              {translate('Admin')}
            </CheckInput>
          </div>
          <div className={styles.formField}>
            <CheckInput
              name="isActive"
              value={isActive}
              onChange={(e) => setIsActive(e.value)}
            >
              {translate('Active')}
            </CheckInput>
          </div>
          <SpinnerIconButton
            name="add"
            title={translate('Create')}
            onPress={onCreateClick}
            isDisabled={!username || !password}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>{translate('Username')}</TableCell>
              <TableCell>{translate('Role')}</TableCell>
              <TableCell>{translate('Active')}</TableCell>
              <TableCell>{translate('LastLogin')}</TableCell>
              <TableCell>{translate('Email')}</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Label kind={user.isAdmin ? 'primary' : 'default'}>
                    {user.isAdmin ? 'Admin' : (user.role || 'User')}
                  </Label>
                </TableCell>
                <TableCell>
                  <Label kind={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? translate('Active') : translate('Inactive')}
                  </Label>
                </TableCell>
                <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</TableCell>
                <TableCell>{user.email || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageContentBody>
    </PageContent>
  );
}

Users.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetching: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
};

export default Users;
