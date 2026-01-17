import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { restart } from 'Store/Actions/systemActions';
import PageHeaderActionsMenu from './PageHeaderActionsMenu';

function createMapStateToProps() {
  return createSelector(
    (state) => state.system.status,
    (status) => {
      return {
        formsAuth: status.item.authentication === 'forms'
      };
    }
  );
}

const mapDispatchToProps = {
  restart
};

class PageHeaderActionsMenuConnector extends Component {

  //
  // Listeners

  onRestartPress = () => {
    this.props.restart();
  };

  //
  // Render

  render() {
    return (
      <PageHeaderActionsMenu
        {...this.props}
        onRestartPress={this.onRestartPress}
      />
    );
  }
}

PageHeaderActionsMenuConnector.propTypes = {
  restart: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(PageHeaderActionsMenuConnector);
