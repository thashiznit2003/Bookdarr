import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchUserUpgrades } from 'Store/Actions/userFileUpgradeActions';
import UserUpgrades from './UserUpgrades';

class UserUpgradesConnector extends Component {
  componentDidMount() {
    this.props.fetch();
  }

  render() {
    const { items, isFetching, error } = this.props;

    return (
      <UserUpgrades
        items={items}
        isFetching={isFetching}
        error={error}
      />
    );
  }
}

UserUpgradesConnector.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  fetch: PropTypes.func.isRequired
};

function createMapStateToProps() {
  return createSelector(
    (state) => state.userFileUpgrades,
    (slice) => slice
  );
}

const mapDispatchToProps = {
  fetch: fetchUserUpgrades
};

export default connect(createMapStateToProps, mapDispatchToProps)(UserUpgradesConnector);
