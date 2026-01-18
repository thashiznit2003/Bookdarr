import PropTypes from 'prop-types';
import React from 'react';
import ProgressBar from 'Components/ProgressBar';
import { kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './AuthorIndexProgressBar.css';

function AuthorIndexProgressBar(props) {
  const {
    bookCount,
    availableBookCount,
    bookFileCount,
    totalBookCount,
    posterWidth,
    detailedProgressBar
  } = props;

  const progress = bookCount ? (availableBookCount / bookCount) * 100 : 100;
  const text = `${availableBookCount} / ${bookCount}`;

  return (
    <ProgressBar
      className={styles.progressBar}
      containerClassName={styles.progress}
      progress={progress}
      kind={kinds.DEFAULT}
      size={detailedProgressBar ? sizes.MEDIUM : sizes.SMALL}
      showText={detailedProgressBar}
      text={text}
      title={translate('AuthorProgressBarText', { bookCount, availableBookCount, bookFileCount, totalBookCount })}
      width={posterWidth}
    />
  );
}

AuthorIndexProgressBar.propTypes = {
  bookCount: PropTypes.number.isRequired,
  availableBookCount: PropTypes.number.isRequired,
  bookFileCount: PropTypes.number.isRequired,
  totalBookCount: PropTypes.number.isRequired,
  posterWidth: PropTypes.number.isRequired,
  detailedProgressBar: PropTypes.bool.isRequired
};

export default AuthorIndexProgressBar;
