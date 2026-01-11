import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AddAuthorOptionsForm from 'Search/Common/AddAuthorOptionsForm';
import styles from './AddManualBookModalContent.css';

class AddManualBookModalContent extends Component {
  state = {
    title: '',
    authorName: '',
    releaseDate: '',
    overview: '',
    publisher: '',
    language: '',
    format: '',
    isbn13: '',
    asin: '',
    pageCount: '',
    isEbook: false
  };

  onInputChange = ({ name, value }) => {
    this.setState({ [name]: value });
  };

  onAddPress = () => {
    this.props.onAddManualBook(this.state);
  };

  render() {
    const {
      rootFolderPath,
      monitor,
      monitorNewItems,
      qualityProfileId,
      metadataProfileId,
      tags,
      isAdding,
      addError,
      validationErrors,
      validationWarnings,
      onAuthorOptionsChange,
      onModalClose,
      ...otherProps
    } = this.props;

    const {
      title,
      authorName,
      releaseDate,
      overview,
      publisher,
      language,
      format,
      isbn13,
      asin,
      pageCount,
      isEbook
    } = this.state;

    const errorMessage = getErrorMessage(addError, translate('AddManualBookFailed'));
    const isRootFolderMissing = !rootFolderPath?.value;

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate('AddBookManually')}
        </ModalHeader>

        <ModalBody>
          <div className={styles.container}>
            <Form {...otherProps}>
              <div className={styles.grid}>
                <FormGroup className={classNames(styles.fieldGroup, styles.fullWidth)}>
                  <FormLabel>
                    {translate('Title')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="title"
                    value={title}
                    helpText={translate('ManualBookTitleHelpText')}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={classNames(styles.fieldGroup, styles.fullWidth)}>
                  <FormLabel>
                    {translate('Author')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="authorName"
                    value={authorName}
                    helpText={translate('ManualBookAuthorHelpText')}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={classNames(styles.fieldGroup, styles.fullWidth)}>
                  <FormLabel>
                    {translate('ReleaseDate')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="releaseDate"
                    value={releaseDate}
                    placeholder="YYYY-MM-DD"
                    helpText={translate('ManualBookReleaseDateHelpText')}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={classNames(styles.fieldGroup, styles.fullWidth)}>
                  <FormLabel>
                    {translate('Overview')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT_AREA}
                    name="overview"
                    value={overview}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('Publisher')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="publisher"
                    value={publisher}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('Language')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="language"
                    value={language}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('Format')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="format"
                    value={format}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('BookIsbn13')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="isbn13"
                    value={isbn13}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('ASIN')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.TEXT}
                    name="asin"
                    value={asin}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('PageCount')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.NUMBER}
                    name="pageCount"
                    value={pageCount}
                    onChange={this.onInputChange}
                  />
                </FormGroup>

                <FormGroup className={styles.fieldGroup}>
                  <FormLabel>
                    {translate('IsEbook')}
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.CHECK}
                    name="isEbook"
                    value={isEbook}
                    onChange={this.onInputChange}
                  />
                </FormGroup>
              </div>
            </Form>

            <div className={styles.hint}>
              {translate('ManualBookMatchHelpText')}
            </div>

            <AddAuthorOptionsForm
              rootFolderPath={rootFolderPath}
              monitor={monitor}
              monitorNewItems={monitorNewItems}
              qualityProfileId={qualityProfileId}
              metadataProfileId={metadataProfileId}
              tags={tags}
              includeNoneMetadataProfile={true}
              includeSpecificBookMonitor={true}
              showMetadataProfile={true}
              onInputChange={onAuthorOptionsChange}
              {...otherProps}
              validationErrors={validationErrors}
              validationWarnings={validationWarnings}
            />

            {
              addError &&
                <div className={styles.errorMessage}>
                  {errorMessage}
                </div>
            }
          </div>
        </ModalBody>

        <ModalFooter className={styles.modalFooter}>
          <Button onPress={onModalClose}>
            {translate('Cancel')}
          </Button>

          <SpinnerButton
            kind={kinds.SUCCESS}
            isSpinning={isAdding}
            isDisabled={isRootFolderMissing}
            onPress={this.onAddPress}
          >
            {translate('AddBook')}
          </SpinnerButton>
        </ModalFooter>
      </ModalContent>
    );
  }
}

AddManualBookModalContent.propTypes = {
  rootFolderPath: PropTypes.object,
  monitor: PropTypes.object.isRequired,
  monitorNewItems: PropTypes.object.isRequired,
  qualityProfileId: PropTypes.object,
  metadataProfileId: PropTypes.object,
  tags: PropTypes.object.isRequired,
  isAdding: PropTypes.bool.isRequired,
  addError: PropTypes.object,
  validationErrors: PropTypes.arrayOf(PropTypes.object).isRequired,
  validationWarnings: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAuthorOptionsChange: PropTypes.func.isRequired,
  onAddManualBook: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default AddManualBookModalContent;
