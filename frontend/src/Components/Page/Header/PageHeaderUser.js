import PropTypes from 'prop-types';
import React from 'react';
import styles from './PageHeader.css';

function PageHeaderUser({ username }) {
  if (!username) {
    return null;
  }

  return (
    <div className={styles.user}>
      {username}
    </div>
  );
}

PageHeaderUser.propTypes = {
  username: PropTypes.string
};

PageHeaderUser.defaultProps = {
  username: null
};

export default PageHeaderUser;
