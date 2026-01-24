import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './ModalHeader.css';

class ModalHeader extends Component {

  //
  // Render

  render() {
    const {
      className,
      children,
      ...otherProps
    } = this.props;

    return (
      <div
        className={classNames(styles.modalHeader, className)}
        {...otherProps}
      >
        {children}
      </div>
    );
  }

}

ModalHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default ModalHeader;
