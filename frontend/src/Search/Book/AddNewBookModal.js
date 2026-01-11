import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import AddNewBookModalContentConnector from './AddNewBookModalContentConnector';

function AddNewBookModal(props) {
  const {
    isOpen,
    onBookAdded,
    onModalClose,
    ...otherProps
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <AddNewBookModalContentConnector
        {...otherProps}
        onBookAdded={onBookAdded}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

AddNewBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onBookAdded: PropTypes.func,
  onModalClose: PropTypes.func.isRequired
};

export default AddNewBookModal;
