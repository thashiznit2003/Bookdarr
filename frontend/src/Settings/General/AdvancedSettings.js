import PropTypes from 'prop-types';
import React from 'react';
import FieldSet from 'Components/FieldSet';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { inputTypes, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function AdvancedSettings(props) {
  const {
    settings,
    onInputChange
  } = props;

  const {
    enableDiagnostics,
    enableDevelopmentMenu
  } = settings;

  return (
    <FieldSet legend={translate('Advanced')}>
      <FormGroup size={sizes.MEDIUM}>
        <FormLabel>
          {translate('EnableDiagnosticsMenu')}
        </FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="enableDiagnostics"
          helpText={translate('EnableDiagnosticsMenuHelpText')}
          helpTextWarning={translate('MenuVisibilityRefreshHelpText')}
          onChange={onInputChange}
          {...enableDiagnostics}
        />
      </FormGroup>

      <FormGroup size={sizes.MEDIUM}>
        <FormLabel>
          {translate('EnableDevelopmentMenu')}
        </FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="enableDevelopmentMenu"
          helpText={translate('EnableDevelopmentMenuHelpText')}
          helpTextWarning={translate('MenuVisibilityRefreshHelpText')}
          onChange={onInputChange}
          {...enableDevelopmentMenu}
        />
      </FormGroup>
    </FieldSet>
  );
}

AdvancedSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default AdvancedSettings;
