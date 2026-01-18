import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import AddManualBookModalContentConnector from './AddManualBookModalContentConnector';

function AddManualBookModal(props) {
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
      <AddManualBookModalContentConnector
        {...otherProps}
        onBookAdded={onBookAdded}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

AddManualBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onBookAdded: PropTypes.func,
  onModalClose: PropTypes.func.isRequired
};

export default AddManualBookModal;
