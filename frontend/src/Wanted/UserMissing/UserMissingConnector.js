import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchUserMissing } from 'Store/Actions/userMissingActions';
import UserMissing from './UserMissing';

class UserMissingConnector extends Component {
  componentDidMount() {
    this.props.fetch();
  }

  render() {
    const { items, isFetching, error } = this.props;

    return (
      <UserMissing
        items={items}
        isFetching={isFetching}
        error={error}
      />
    );
  }
}

UserMissingConnector.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  fetch: PropTypes.func.isRequired
};

function createMapStateToProps() {
  return createSelector(
    (state) => state.userMissing,
    (slice) => slice
  );
}

const mapDispatchToProps = {
  fetch: fetchUserMissing
};

export default connect(createMapStateToProps, mapDispatchToProps)(UserMissingConnector);
