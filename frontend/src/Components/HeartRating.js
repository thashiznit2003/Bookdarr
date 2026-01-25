import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import styles from './HeartRating.css';

function HeartRating({ rating, iconSize }) {
  const safeRating = Number(rating);

  if (!Number.isFinite(safeRating) || safeRating <= 0) {
    return null;
  }

  return (
    <span className={styles.rating}>
      <Icon
        className={styles.heart}
        name={icons.HEART}
        size={iconSize}
      />

      {safeRating.toFixed(1)}
    </span>
  );
}

HeartRating.propTypes = {
  rating: PropTypes.number,
  iconSize: PropTypes.number.isRequired
};

HeartRating.defaultProps = {
  rating: null,
  iconSize: 14
};

export default HeartRating;
