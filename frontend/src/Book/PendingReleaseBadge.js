import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './PendingReleaseBadge.css';

function PendingReleaseBadge(props) {
  const {
    count,
    earliestRelease,
    reason
  } = props;

  if (count === 0) {
    return null;
  }

  const title = translate('PendingReleaseTooltip', {
    count,
    date: earliestRelease ? new Date(earliestRelease).toLocaleDateString() : translate('Unknown'),
    reason: reason || translate('Delayed')
  });

  return (
    <div
      className={styles.badge}
      title={title}
    >
      <Icon
        name={icons.SCHEDULED}
        size={12}
      />
    </div>
  );
}

PendingReleaseBadge.propTypes = {
  count: PropTypes.number.isRequired,
  earliestRelease: PropTypes.string,
  reason: PropTypes.string
};

PendingReleaseBadge.defaultProps = {
  count: 0
};

export default PendingReleaseBadge;
