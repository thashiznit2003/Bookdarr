import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import QueueStatusConnector from 'Activity/Queue/Status/QueueStatusConnector';
import OverlayScroller from 'Components/Scroller/OverlayScroller';
import Scroller from 'Components/Scroller/Scroller';
import { icons } from 'Helpers/Props';
import locationShape from 'Helpers/Props/Shapes/locationShape';
import dimensions from 'Styles/Variables/dimensions';
import HealthStatusConnector from 'System/Status/Health/HealthStatusConnector';
import translate from 'Utilities/String/translate';
import MessagesConnector from './Messages/MessagesConnector';
import PageSidebarItem from './PageSidebarItem';
import SidebarDiagnosticsStatus from './SidebarDiagnosticsStatus';
import ThrottleNotification from './ThrottleNotification';
import styles from './PageSidebar.css';

const HEADER_HEIGHT = parseInt(dimensions.headerHeight);
const SIDEBAR_WIDTH = parseInt(dimensions.sidebarWidth);

const links = [
  {
    iconName: icons.AUTHOR_CONTINUING,
    title: () => translate('Library'),
    to: '/books',
    alias: '/authors',
    children: [
      {
        title: () => translate('Books'),
        to: '/books'
      },
      {
        title: () => translate('Authors'),
        to: '/authors'
      },
      {
        title: () => translate('AddNew'),
        to: '/add/search'
      },
      {
        title: () => translate('UnmappedFiles'),
        to: '/unmapped'
      }
    ]
  },

  {
    iconName: icons.BOOK_READER,
    title: () => translate('BookPool'),
    to: '/bookpool',
    children: [
      {
        title: () => translate('Books'),
        to: '/bookpool'
      },
      {
        title: () => translate('Authors'),
        to: '/bookpool/authors'
      }
    ]
  },

  {
    iconName: icons.ACTIVITY,
    title: () => translate('Activity'),
    to: '/activity/queue',
    children: [
      {
        title: () => translate('Queue'),
        to: '/activity/queue',
        statusComponent: QueueStatusConnector
      },
      {
        title: () => translate('History'),
        to: '/activity/history'
      },
      {
        title: () => translate('Blocklist'),
        to: '/activity/blocklist'
      }
    ]
  },

  {
    iconName: icons.WARNING,
    title: () => translate('Wanted'),
    to: '/wanted/missing-files',
    children: [
      {
        title: () => translate('MissingFiles'),
        to: '/wanted/missing-files'
      },
      {
        title: () => translate('FileUpgrades'),
        to: '/wanted/file-upgrades'
      }
    ]
  },

  {
    iconName: icons.SETTINGS,
    title: () => translate('Settings'),
    to: '/settings',
    children: [
      {
        title: () => translate('General'),
        to: '/settings/general'
      },
      {
        title: () => translate('MediaManagement'),
        to: '/settings/mediamanagement'
      },
      {
        title: () => translate('Profiles'),
        to: '/settings/profiles'
      },
      {
        title: () => translate('Quality'),
        to: '/settings/quality'
      },
      {
        title: () => translate('CustomFormats'),
        to: '/settings/customformats'
      },
      {
        title: () => translate('Indexers'),
        to: '/settings/indexers'
      },
      {
        title: () => translate('DownloadClients'),
        to: '/settings/downloadclients'
      },
      {
        title: () => translate('ImportLists'),
        to: '/settings/importlists'
      },
      {
        title: () => translate('Connect'),
        to: '/settings/connect'
      },
      {
        title: () => translate('Metadata'),
        to: '/settings/metadata'
      },
      {
        title: () => translate('Tags'),
        to: '/settings/tags'
      },
      {
        title: () => translate('Users'),
        to: '/settings/users'
      },
      {
        title: () => translate('Ui'),
        to: '/settings/ui'
      },
      {
        title: () => translate('Development'),
        to: '/settings/development'
      }
    ]
  },

  {
    iconName: icons.SYSTEM,
    title: () => translate('System'),
    to: '/system/status',
    children: [
      {
        title: () => translate('Status'),
        to: '/system/status',
        statusComponent: HealthStatusConnector
      },
      {
        title: () => translate('Tasks'),
        to: '/system/tasks'
      },
      {
        title: () => translate('Backup'),
        to: '/system/backup'
      },
      {
        title: () => translate('Updates'),
        to: '/system/updates'
      },
      {
        title: () => translate('Events'),
        to: '/system/events'
      },
      {
        title: () => translate('LogFiles'),
        to: '/system/logs/files'
      }
    ]
  },
  {
    iconName: icons.BUG,
    title: () => translate('Diagnostics'),
    to: '/system/diagnostics',
    developOnly: true
  }
];

const settingsHiddenForNonAdmin = new Set([
  '/settings/general',
  '/settings/mediamanagement',
  '/settings/profiles',
  '/settings/quality',
  '/settings/customformats',
  '/settings/indexers',
  '/settings/downloadclients',
  '/settings/metadata',
  '/settings/tags',
  '/settings/development'
]);

const systemHiddenForNonAdmin = new Set([
  '/system/tasks',
  '/system/backup',
  '/system/events',
  '/system/logs/files'
]);

function getVisibleLinks(isAdmin) {
  if (isAdmin) {
    return links;
  }

  return links.reduce((acc, link) => {
    if (link.to === '/system/diagnostics') {
      return acc;
    }

    const nextLink = {
      ...link
    };

    if (nextLink.to === '/settings' && nextLink.children) {
      nextLink.children = nextLink.children.filter((child) => !settingsHiddenForNonAdmin.has(child.to));
    }

    if (nextLink.to === '/system/status' && nextLink.children) {
      nextLink.children = nextLink.children.filter((child) => !systemHiddenForNonAdmin.has(child.to));
    }

    acc.push(nextLink);
    return acc;
  }, []);
}

function getActiveParent(pathname, visibleLinks) {
  let activeParent = visibleLinks[0]?.to || '/';

  visibleLinks.forEach((link) => {
    if (link.to && link.to === pathname) {
      activeParent = link.to;

      return false;
    }

    const children = link.children;

    if (children) {
      children.forEach((childLink) => {
        if (pathname.startsWith(childLink.to)) {
          activeParent = link.to;

          return false;
        }
      });
    }

    if (
      (link.to !== '/' && pathname.startsWith(link.to)) ||
      (link.alias && pathname.startsWith(link.alias))
    ) {
      activeParent = link.to;

      return false;
    }
  });

  return activeParent;
}

function getPositioning() {
  const windowScroll = window.scrollY == null ? document.documentElement.scrollTop : window.scrollY;
  const top = Math.max(HEADER_HEIGHT - windowScroll, 0);
  const height = window.innerHeight - top;

  return {
    top: `${top}px`,
    height: `${height}px`
  };
}

function hasActiveChildLink(link, pathname) {
  const children = link.children;

  if (!children || !children.length) {
    return false;
  }

  return _.some(children, (child) => {
    return child.to === pathname;
  });
}

class PageSidebar extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._touchStartX = null;
    this._touchStartY = null;
    this._sidebarRef = null;
    this._scrollerRef = null;
    this._portalNode = document.getElementById('portal-root');
    this._hiddenTransform = this.getHiddenTransform(props.isSmallScreen);

    this.state = {
      top: dimensions.headerHeight,
      height: `${window.innerHeight - HEADER_HEIGHT}px`,
      transition: null,
      transform: props.isSidebarVisible ? 0 : this._hiddenTransform
    };
  }

  componentDidMount() {
    if (this.props.isSmallScreen) {
      window.addEventListener('click', this.onWindowClick, { capture: true });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      isSidebarVisible
    } = this.props;

    const transform = this.state.transform;

    if (prevProps.isSidebarVisible !== isSidebarVisible) {
      this._setSidebarTransform(isSidebarVisible);

      if (isSidebarVisible && this._scrollerRef) {
        this._scrollerRef.scrollTop = 0;
      }
    } else if (transform === 0 && !isSidebarVisible) {
      this.props.onSidebarVisibleChange(true);
    } else if (transform === -SIDEBAR_WIDTH && isSidebarVisible) {
      this.props.onSidebarVisibleChange(false);
    }
  }

  componentWillUnmount() {
    if (this.props.isSmallScreen) {
      window.removeEventListener('click', this.onWindowClick, { capture: true });
    }
  }

  //
  // Control

  _setSidebarRef = (ref) => {
    this._sidebarRef = ref;
  };

  _setScrollerRef = (ref) => {
    this._scrollerRef = ref;
  };

  getHeaderHeight = () => {
    if (!this.props.isSmallScreen) {
      return HEADER_HEIGHT;
    }

    const header = document.querySelector('[data-page-header="true"]');
    if (!header) {
      return HEADER_HEIGHT;
    }

    const rect = header.getBoundingClientRect();
    return Math.max(HEADER_HEIGHT, Math.round(rect.height));
  };
  getHiddenTransform = (isSmallScreen) => {
    if (isSmallScreen) {
      return window.innerWidth * -1;
    }

    return SIDEBAR_WIDTH * -1;
  };

  _setSidebarTransform(isSidebarVisible, transition, callback) {
    const hiddenTransform = this.getHiddenTransform(this.props.isSmallScreen);
    this._hiddenTransform = hiddenTransform;

    this.setState({
      transition,
      transform: isSidebarVisible ? 0 : hiddenTransform
    }, callback);
  }

  //
  // Listeners

  onWindowClick = (event) => {
    const sidebar = ReactDOM.findDOMNode(this._sidebarRef);
    const toggleButton = document.getElementById('sidebar-toggle-button');

    if (!sidebar) {
      return;
    }

    if (
      !sidebar.contains(event.target) &&
      !toggleButton.contains(event.target) &&
      this.props.isSidebarVisible
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.props.onSidebarVisibleChange(false);
    }
  };

  onWindowScroll = () => {
    this.setState(getPositioning());
  };

  onTouchStart = (event) => {
    const touches = event.touches;
    const touchStartX = touches[0].pageX;
    const touchStartY = touches[0].pageY;
    const isSidebarVisible = this.props.isSidebarVisible;

    if (touches.length !== 1) {
      return;
    }

    if (isSidebarVisible) {
      return;
    } else if (!isSidebarVisible && touchStartX > 40) {
      return;
    }

    this._touchStartX = touchStartX;
    this._touchStartY = touchStartY;
  };

  onTouchMove = (event) => {
    const touches = event.touches;
    const currentTouchX = touches[0].pageX;
    const currentTouchY = touches[0].pageY;
    const isSidebarVisible = this.props.isSidebarVisible;

    if (!this._touchStartX) {
      return;
    }

    // This is a bit funky when trying to close and you scroll
    // vertical too much by mistake, commenting out for now.
    // TODO: Evaluate if this should be nuked

    // if (Math.abs(this._touchStartY - currentTouchY) > 40) {
    //   const transform = isSidebarVisible ? 0 : SIDEBAR_WIDTH * -1;

    //   this.setState({
    //     transition: 'none',
    //     transform
    //   });

    //   return;
    // }

    if (isSidebarVisible) {
      return;
    }

    const deltaX = currentTouchX - this._touchStartX;
    const deltaY = currentTouchY - this._touchStartY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    if (Math.abs(deltaX) < 40) {
      return;
    }

    const transform = Math.min(currentTouchX + this._hiddenTransform, 0);

    this.setState({
      transition: 'none',
      transform
    });
  };

  onTouchEnd = (event) => {
    const touches = event.changedTouches;
    const currentTouch = touches[0].pageX;

    if (!this._touchStartX) {
      return;
    }

    if (this.props.isSidebarVisible) {
      this._touchStartX = null;
      this._touchStartY = null;
      return;
    }

    if (currentTouch > this._touchStartX && currentTouch > 50) {
      this._setSidebarTransform(true, 'none');
    } else if (currentTouch < this._touchStartX && currentTouch < 80) {
      this._setSidebarTransform(false, 'transform 50ms ease-in-out');
    } else {
      this._setSidebarTransform(this.props.isSidebarVisible);
    }

    this._touchStartX = null;
    this._touchStartY = null;
  };

  onTouchCancel = (event) => {
    this._touchStartX = null;
    this._touchStartY = null;
  };

  onItemPress = () => {
    this.props.onSidebarVisibleChange(false);
  };

  //
  // Render

  render() {
    const {
      location,
      isSmallScreen,
      isAdmin
    } = this.props;

    const {
      top,
      height,
      transition,
      transform
    } = this.state;

    const urlBase = window.Readarr.urlBase;
    const pathname = urlBase ? location.pathname.substr(urlBase.length) || '/' : location.pathname;
    const visibleLinks = getVisibleLinks(isAdmin).filter((link) => {
      return !link.developOnly || window.Readarr.branch === 'develop';
    });
    const activeParent = getActiveParent(pathname, visibleLinks);

    let containerStyle = {};
    let sidebarStyle = {};

    if (isSmallScreen) {
      const headerHeight = this.getHeaderHeight();

      containerStyle = {
        transition,
        transform: `translateX(${transform}px)`
      };

      sidebarStyle = {
        top: 0,
        height: '100%'
      };
    }

    const ScrollerComponent = isSmallScreen ? Scroller : OverlayScroller;

    const sidebarContent = (
      <div
        ref={this._setSidebarRef}
        className={classNames(
          styles.sidebarContainer
        )}
        style={containerStyle}
      >
        <ScrollerComponent
          className={styles.sidebar}
          style={sidebarStyle}
          registerScroller={this._setScrollerRef}
        >
          <div>
            {
              visibleLinks.map((link) => {
                const childWithStatusComponent = _.find(link.children, (child) => {
                  return !!child.statusComponent;
                });

                const childStatusComponent = childWithStatusComponent ?
                  childWithStatusComponent.statusComponent :
                  null;

                const isActiveParent = activeParent === link.to;
                const hasActiveChild = hasActiveChildLink(link, pathname);

                return (
                  <PageSidebarItem
                    key={link.to}
                    iconName={link.iconName}
                    title={link.title}
                    titleKey={link.titleKey}
                    to={link.to}
                    statusComponent={isActiveParent || !childStatusComponent ? link.statusComponent : childStatusComponent}
                    isActive={pathname === link.to && !hasActiveChild}
                    isActiveParent={isActiveParent}
                    isParentItem={!!link.children}
                    onPress={this.onItemPress}
                  >
                    {
                      link.children && link.to === activeParent &&
                        link.children.map((child) => {
                          return (
                            <PageSidebarItem
                              key={child.to}
                              title={child.title}
                              titleKey={child.titleKey}
                              to={child.to}
                              isActive={pathname.startsWith(child.to)}
                              isParentItem={false}
                              isChildItem={true}
                              statusComponent={child.statusComponent}
                              onPress={this.onItemPress}
                            />
                          );
                        })
                    }
                  </PageSidebarItem>
                );
              })
            }
          </div>

          <MessagesConnector />
          <ThrottleNotification />
          <SidebarDiagnosticsStatus />
        </ScrollerComponent>
      </div>
    );

    if (isSmallScreen) {
      if (!this.props.isSidebarVisible) {
        return null;
      }

      const overlayStyle = {
        top: `${headerHeight}px`,
        height: `calc(100% - ${headerHeight}px)`
      };

      const overlay = (
        <div className={styles.mobileOverlay} style={overlayStyle}>
          {sidebarContent}
        </div>
      );

      if (this._portalNode) {
        return ReactDOM.createPortal(overlay, this._portalNode);
      }

      return overlay;
    }

    return sidebarContent;
  }
}

PageSidebar.propTypes = {
  location: locationShape.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onSidebarVisibleChange: PropTypes.func.isRequired
};

export default PageSidebar;
