import PropTypes from 'prop-types';
import React from 'react';
import ProgressBar from 'Components/ProgressBar';
import { kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './BookIndexProgressBar.css';

function BookIndexProgressBar(props) {
  const {
    bookCount,
    bookFileCount,
    ebookFileCount,
    audiobookFileCount,
    totalBookCount,
    posterWidth,
    detailedProgressBar
  } = props;

  const text = `${bookFileCount ? bookCount : 0} / ${totalBookCount}`;

  let kind = kinds.DANGER;

  if (ebookFileCount > 0 && audiobookFileCount > 0) {
    kind = kinds.SUCCESS;
  } else if (ebookFileCount > 0 || audiobookFileCount > 0) {
    kind = kinds.WARNING;
  }

  return (
    <ProgressBar
      className={styles.progressBar}
      containerClassName={styles.progress}
      progress={100}
      kind={kind}
      size={detailedProgressBar ? sizes.MEDIUM : sizes.SMALL}
      showText={detailedProgressBar}
      text={text}
      title={translate('BookProgressBarText', {
        bookCount: bookFileCount ? bookCount : 0,
        bookFileCount,
        totalBookCount
      })}
      width={posterWidth}
    />
  );
}

BookIndexProgressBar.propTypes = {
  bookCount: PropTypes.number.isRequired,
  bookFileCount: PropTypes.number.isRequired,
  ebookFileCount: PropTypes.number,
  audiobookFileCount: PropTypes.number,
  totalBookCount: PropTypes.number.isRequired,
  posterWidth: PropTypes.number.isRequired,
  detailedProgressBar: PropTypes.bool.isRequired
};

BookIndexProgressBar.defaultProps = {
  ebookFileCount: 0,
  audiobookFileCount: 0
};

export default BookIndexProgressBar;
