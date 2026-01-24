import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AuthorMetadataProfilePopoverContent from 'AddAuthor/AuthorMetadataProfilePopoverContent';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Popover from 'Components/Tooltip/Popover';
import { icons, inputTypes, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './AddAuthorOptionsForm.css';

class AddAuthorOptionsForm extends Component {

  //
  // Listeners

  onMetadataProfileIdChange = ({ value }) => {
    this.props.onInputChange({ name: 'metadataProfileId', value: parseInt(value) });
  };

  //
  // Render

  render() {
    const {
      rootFolderPath,
      metadataProfileId,
      includeNoneMetadataProfile,
      showMetadataProfile,
      folder,
      tags,
      onInputChange,
      ...otherProps
    } = this.props;

    return (
      <Form {...otherProps}>
        <FormGroup>
          <FormLabel>
            {translate('RootFolder')}
          </FormLabel>

          <FormInputGroup
            type={inputTypes.ROOT_FOLDER_SELECT}
            name="rootFolderPath"
            valueOptions={{
              authorFolder: folder
            }}
            selectedValueOptions={{
              authorFolder: folder
            }}
            helpText={translate('AddNewAuthorRootFolderHelpText', { folder })}
            onChange={onInputChange}
            {...rootFolderPath}
          />
        </FormGroup>

        <FormGroup className={showMetadataProfile ? undefined : styles.hideMetadataProfile}>
          <FormLabel>
            {translate('MetadataProfile')}

            {
              includeNoneMetadataProfile &&
                <Popover
                  anchor={
                    <Icon
                      className={styles.labelIcon}
                      name={icons.INFO}
                    />
                  }
                  title={translate('MetadataProfile')}
                  body={<AuthorMetadataProfilePopoverContent />}
                  position={tooltipPositions.RIGHT}
                />
            }
          </FormLabel>

          <FormInputGroup
            type={inputTypes.METADATA_PROFILE_SELECT}
            name="metadataProfileId"
            includeNone={includeNoneMetadataProfile}
            onChange={this.onMetadataProfileIdChange}
            {...metadataProfileId}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>
            {translate('Tags')}
          </FormLabel>

          <FormInputGroup
            type={inputTypes.TAG}
            name="tags"
            onChange={onInputChange}
            {...tags}
          />
        </FormGroup>
      </Form>
    );
  }
}

AddAuthorOptionsForm.propTypes = {
  rootFolderPath: PropTypes.object,
  metadataProfileId: PropTypes.object,
  showMetadataProfile: PropTypes.bool.isRequired,
  includeNoneMetadataProfile: PropTypes.bool.isRequired,
  folder: PropTypes.string.isRequired,
  tags: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default AddAuthorOptionsForm;
