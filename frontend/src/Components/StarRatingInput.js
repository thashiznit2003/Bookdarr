import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import styles from './StarRatingInput.css';

function StarRatingInput({ value, onChange, max, iconSize, allowClear }) {
  const [hoverValue, setHoverValue] = useState(null);
  const displayValue = hoverValue ?? value ?? 0;

  const stars = useMemo(
    () => Array.from({ length: max }, (_, index) => index + 1),
    [max]
  );

  const handleSelect = (rating) => {
    if (allowClear && value === rating) {
      onChange(null);
      return;
    }

    onChange(rating);
  };

  return (
    <div className={styles.starInput} role="radiogroup" aria-label="User rating">
      {stars.map((rating) => {
        const isActive = rating <= displayValue;
        return (
          <button
            key={rating}
            type="button"
            className={`${styles.starButton} ${!isActive ? styles.starInactive : ''}`}
            onClick={() => handleSelect(rating)}
            onMouseEnter={() => setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            aria-checked={value === rating}
            aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
            role="radio"
          >
            <Icon name={icons.STAR_FULL} size={iconSize} />
          </button>
        );
      })}
    </div>
  );
}

StarRatingInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  max: PropTypes.number,
  iconSize: PropTypes.number,
  allowClear: PropTypes.bool
};

StarRatingInput.defaultProps = {
  value: null,
  max: 5,
  iconSize: 18,
  allowClear: true
};

export default StarRatingInput;
