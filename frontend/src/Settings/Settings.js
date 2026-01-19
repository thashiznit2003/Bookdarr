import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Link from 'Components/Link/Link';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import translate from 'Utilities/String/translate';
import SettingsToolbarConnector from './SettingsToolbarConnector';
import styles from './Settings.css';

function Settings({ isAdmin }) {
  const sections = [
    {
      to: '/settings/general',
      title: translate('General'),
      summary: translate('GeneralSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/mediamanagement',
      title: translate('MediaManagement'),
      summary: translate('MediaManagementSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/profiles',
      title: translate('Profiles'),
      summary: translate('ProfilesSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/quality',
      title: translate('Quality'),
      summary: translate('QualitySettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/customformats',
      title: 'Custom Formats',
      summary: 'Custom Formats and Settings',
      adminOnly: true
    },
    {
      to: '/settings/indexers',
      title: translate('Indexers'),
      summary: translate('IndexersSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/downloadclients',
      title: translate('DownloadClients'),
      summary: translate('DownloadClientsSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/importlists',
      title: translate('Lists'),
      summary: translate('ListsSettingsSummary')
    },
    {
      to: '/settings/connect',
      title: translate('Connect'),
      summary: translate('ConnectSettingsSummary')
    },
    {
      to: '/settings/metadata',
      title: translate('Metadata'),
      summary: translate('MetadataSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/tags',
      title: translate('Tags'),
      summary: translate('TagsSettingsSummary'),
      adminOnly: true
    },
    {
      to: '/settings/ui',
      title: translate('Ui'),
      summary: translate('UISettingsSummary')
    },
    {
      to: '/settings/development',
      title: translate('Development'),
      summary: 'Development settings',
      adminOnly: true
    },
    {
      to: '/settings/users',
      title: 'Users',
      summary: isAdmin ? 'Manage Bookdarr users.' : 'Manage your Bookdarr account.'
    }
  ];

  const visibleSections = isAdmin ? sections : sections.filter((section) => !section.adminOnly);

  return (
    <PageContent title={translate('Settings')}>
      <SettingsToolbarConnector
        hasPendingChanges={false}
      />

      <PageContentBody>
        {visibleSections.map((section) => (
          <React.Fragment key={section.to}>
            <Link
              className={styles.link}
              to={section.to}
            >
              {section.title}
            </Link>

            <div className={styles.summary}>
              {section.summary}
            </div>
          </React.Fragment>
        ))}
      </PageContentBody>
    </PageContent>
  );
}

Settings.propTypes = {
  isAdmin: PropTypes.bool.isRequired
};

function createMapStateToProps() {
  return createSelector(
    (state) => state.currentUser.item,
    (state) => state.system.status.item?.isAdmin ?? false,
    (currentUser, statusIsAdmin) => ({
      isAdmin: currentUser?.isAdmin ?? statusIsAdmin ?? false
    })
  );
}

export default connect(createMapStateToProps)(Settings);
