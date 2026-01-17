import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Label from 'Components/Label';
import Button from 'Components/Link/Button';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './Users.css';

function AddUserModal({
  isOpen,
  isSaving,
  onModalClose,
  onSubmit
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      username: username.trim(),
      password,
      isAdmin,
      isActive
    });
    setPassword('');
    setUsername('');
    setIsAdmin(false);
    setIsActive(true);
    onModalClose();
  };

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate('AddUser')}
        </ModalHeader>
        <ModalBody>
          <div className={styles.modalField}>
            <TextInput
              name="username"
              label={translate('Username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.modalField}>
            <TextInput
              name="password"
              type="password"
              label={translate('Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.modalCheckRow}>
            <CheckInput
              name="isAdmin"
              value={isAdmin}
              onChange={(e) => setIsAdmin(e.value)}
            >
              {translate('Admin')}
            </CheckInput>
            <CheckInput
              name="isActive"
              value={isActive}
              onChange={(e) => setIsActive(e.value)}
            >
              {translate('Active')}
            </CheckInput>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onModalClose}>
            {translate('Cancel')}
          </Button>
          <Button
            kind="primary"
            onPress={handleSubmit}
            isDisabled={!canSubmit || isSaving}
          >
            {translate('Add')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

AddUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool,
  onModalClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

AddUserModal.defaultProps = {
  isSaving: false
};

function Users({
  users,
  isFetching,
  error,
  onDelete,
  onToggleActive,
  onRefresh,
  onCreate
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const rows = useMemo(() => users || [], [users]);
  const columns = useMemo(() => ([
    { name: 'username', label: translate('Username'), isVisible: true },
    { name: 'role', label: translate('Role'), isVisible: true },
    { name: 'active', label: translate('Active'), isVisible: true },
    { name: 'lastLogin', label: translate('LastLogin'), isVisible: true },
    { name: 'email', label: translate('Email'), isVisible: true },
    { name: 'actions', label: translate('Actions'), isVisible: true, isSortable: false }
  ]), []);

  useEffect(() => {
    onRefresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContent title={translate('Users')}>
      <PageToolbar>
        <PageToolbarSection>
          <PageToolbarButton
            label={translate('AddUser')}
            iconName={icons.ADD}
            onPress={() => setIsAddModalOpen(true)}
          />
          <PageToolbarButton
            label={translate('Refresh')}
            iconName={icons.REFRESH}
            isSpinning={isFetching}
            onPress={onRefresh}
          />
        </PageToolbarSection>
      </PageToolbar>

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
        </div>

        <div className={styles.helpText}>
          Use Add User to create accounts. Toggle active or delete users in the table.
        </div>

        <Table
          columns={columns}
          horizontalScroll={false}
          selectAll={false}
        >
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
                    <Button
                      kind={user.isActive ? 'danger' : 'success'}
                      onPress={() => onToggleActive(user)}
                    >
                      {user.isActive ? translate('Deactivate') : translate('Activate')}
                    </Button>
                    {!user.isAdmin && (
                      <Button
                        kind="danger"
                        onPress={() => onDelete(user)}
                      >
                        {translate('Delete')}
                      </Button>
                    )}
                  </div>
                </TableRowCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AddUserModal
          isOpen={isAddModalOpen}
          isSaving={isFetching}
          onModalClose={() => setIsAddModalOpen(false)}
          onSubmit={onCreate}
        />
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
