import PropTypes from 'prop-types';
import React from 'react';
import Modal from 'Components/Modal/Modal';
import AssignUnmappedModalContentConnector from './AssignUnmappedModalContentConnector';

function AssignUnmappedModal(props) {
  const { isOpen, onModalClose, ...otherProps } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <AssignUnmappedModalContentConnector
        {...otherProps}
        onModalClose={onModalClose}
      />
    </Modal>
  );
}

AssignUnmappedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  files: PropTypes.arrayOf(PropTypes.object),
  fileIds: PropTypes.arrayOf(PropTypes.number),
  folder: PropTypes.string,
  onModalClose: PropTypes.func.isRequired
};

AssignUnmappedModal.defaultProps = {
  files: [],
  fileIds: []
};

export default AssignUnmappedModal;
