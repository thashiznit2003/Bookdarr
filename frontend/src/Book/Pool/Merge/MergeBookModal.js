import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import MergeBookModalContent from './MergeBookModalContent';

function MergeBookModal(props) {
  const {
    isOpen,
    onModalClose,
    ...otherProps
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <MergeBookModalContent
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

MergeBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default MergeBookModal;
