import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import Label from 'Components/Label';
import LabelButton from 'Components/Label/LabelButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableHeader from 'Components/Table/TableHeader';
import TableRow from 'Components/Table/TableRow';
import TableHeaderCell from 'Components/Table/TableHeaderCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TextInput from 'Components/Form/TextInput';
import CheckInput from 'Components/Form/CheckInput';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import translate from 'Utilities/String/translate';
import styles from './Users.css';

function Users({
  users,
  isFetching,
  error,
  onDelete,
  onToggleActive,
  onRefresh,
  onCreate
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const rows = useMemo(() => users || [], [users]);
  const columns = useMemo(() => ([
    { name: 'username', label: translate('Username'), isVisible: true },
    { name: 'role', label: translate('Role'), isVisible: true },
    { name: 'active', label: translate('Active'), isVisible: true },
    { name: 'lastLogin', label: translate('LastLogin'), isVisible: true },
    { name: 'email', label: translate('Email'), isVisible: true }
  ]), []);

  useEffect(() => {
    onRefresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {error && (
          <div style={{ color: 'var(--dangerColor)', marginBottom: 12 }}>
            {translate('AnErrorOccurred')} ({error.status || 'error'})
          </div>
        )}
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

        <Table
          columns={columns}
          horizontalScroll={false}
          selectAll={false}
        >
          <TableHeader>
            <TableRow>
              <TableHeaderCell>{translate('Username')}</TableHeaderCell>
              <TableHeaderCell>{translate('Role')}</TableHeaderCell>
              <TableHeaderCell>{translate('Active')}</TableHeaderCell>
              <TableHeaderCell>{translate('LastLogin')}</TableHeaderCell>
              <TableHeaderCell>{translate('Email')}</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableRowCell>{user.username}</TableRowCell>
                <TableRowCell>
                  <Label kind={user.isAdmin ? 'primary' : 'default'}>
                    {user.isAdmin ? 'Admin' : (user.role || 'User')}
                  </Label>
                </TableRowCell>
                <TableRowCell>
                  <Label kind={user.isActive ? 'success' : 'danger'}>
                    {user.isActive ? translate('Active') : translate('Inactive')}
                  </Label>
                </TableRowCell>
                <TableRowCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</TableRowCell>
                <TableRowCell>{user.email || '—'}</TableRowCell>
                <TableRowCell>
                  <div className={styles.actionRow}>
                    <LabelButton
                      kind={user.isActive ? 'danger' : 'success'}
                      onPress={() => onToggleActive(user)}
                    >
                      {user.isActive ? translate('Deactivate') : translate('Activate')}
                    </LabelButton>
                    {!user.isAdmin && (
                      <LabelButton
                        kind="danger"
                        onPress={() => onDelete(user)}
                      >
                        {translate('Delete')}
                      </LabelButton>
                    )}
                  </div>
                </TableRowCell>
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
  error: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
};

Users.defaultProps = {
  error: null
};

export default Users;
