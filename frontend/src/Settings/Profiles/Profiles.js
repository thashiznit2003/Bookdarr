import React, { Component } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import SettingsToolbarConnector from 'Settings/SettingsToolbarConnector';
import translate from 'Utilities/String/translate';
import DelayProfilesConnector from './Delay/DelayProfilesConnector';
import MetadataProfilesConnector from './Metadata/MetadataProfilesConnector';
import QualityProfilesConnector from './Quality/QualityProfilesConnector';
import ReleaseProfilesConnector from './Release/ReleaseProfilesConnector';

class Profiles extends Component {

  //
  // Render

  render() {
    return (
      <PageContent title={translate('Profiles')}>
        <SettingsToolbarConnector showSave={false} />

        <PageContentBody>
          <QualityProfilesConnector />
          <MetadataProfilesConnector />
          <DelayProfilesConnector />
          <ReleaseProfilesConnector />
        </PageContentBody>
      </PageContent>
    );
  }
}

export default Profiles;
