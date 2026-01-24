import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './FirstRunWizardModalContent.css';

function FirstRunWizardModalContent(props) {
  const {
    rootFolderCount,
    downloadClientCount,
    indexerCount,
    renameBooks,
    standardBookFormat,
    combineAudiobookMode,
    combineAudiobookDeleteMode,
    isSaving,
    onApplyRecommendedSettings,
    onDragStart,
    onDismiss
  } = props;

  const [stepIndex, setStepIndex] = useState(0);

  const combineModeLabel = {
    disabled: translate('CombineAudiobookModeDisabled'),
    mp3ToMp3: translate('CombineAudiobookModeMp3'),
    mp3ToM4b: translate('CombineAudiobookModeM4b')
  }[combineAudiobookMode] || combineAudiobookMode;

  const combineDeleteLabel = {
    deleteImmediately: translate('CombineAudiobookDeleteModeDelete'),
    deleteAfterOneHour: translate('CombineAudiobookDeleteModeDelay'),
    keep: translate('CombineAudiobookDeleteModeKeep')
  }[combineAudiobookDeleteMode] || combineAudiobookDeleteMode;

  const steps = useMemo(() => ([
    {
      key: 'rootFolders',
      title: translate('FirstRunWizardRootFolderTitle'),
      body: (
        <div className={styles.stepBody}>
          <div>{translate('FirstRunWizardRootFolderHelp')}</div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>
              {translate('FirstRunWizardConfiguredCount', [rootFolderCount])}
            </span>
            <span className={`${styles.statusBadge} ${rootFolderCount ? styles.statusComplete : styles.statusMissing}`}>
              {rootFolderCount ? translate('FirstRunWizardStatusComplete') : translate('FirstRunWizardStatusMissing')}
            </span>
          </div>
          <div className={styles.inlineActions}>
            <Button
              kind={kinds.PRIMARY}
              size={sizes.SMALL}
              to="/settings/mediamanagement"
            >
              {translate('FirstRunWizardOpenMediaManagement')}
            </Button>
          </div>
          <div className={styles.note}>
            {translate('FirstRunWizardRootFolderNote')}
          </div>
        </div>
      )
    },
    {
      key: 'downloadClients',
      title: translate('FirstRunWizardDownloadClientsTitle'),
      body: (
        <div className={styles.stepBody}>
          <div>{translate('FirstRunWizardDownloadClientsHelp')}</div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>
              {translate('FirstRunWizardConfiguredCount', [downloadClientCount])}
            </span>
            <span className={`${styles.statusBadge} ${downloadClientCount ? styles.statusComplete : styles.statusMissing}`}>
              {downloadClientCount ? translate('FirstRunWizardStatusComplete') : translate('FirstRunWizardStatusMissing')}
            </span>
          </div>
          <div className={styles.inlineActions}>
            <Button
              kind={kinds.PRIMARY}
              size={sizes.SMALL}
              to="/settings/downloadclients"
            >
              {translate('FirstRunWizardOpenDownloadClients')}
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'indexers',
      title: translate('FirstRunWizardIndexersTitle'),
      body: (
        <div className={styles.stepBody}>
          <div>{translate('FirstRunWizardIndexersHelp')}</div>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>
              {translate('FirstRunWizardConfiguredCount', [indexerCount])}
            </span>
            <span className={`${styles.statusBadge} ${indexerCount ? styles.statusComplete : styles.statusMissing}`}>
              {indexerCount ? translate('FirstRunWizardStatusComplete') : translate('FirstRunWizardStatusMissing')}
            </span>
          </div>
          <div className={styles.inlineActions}>
            <Button
              kind={kinds.PRIMARY}
              size={sizes.SMALL}
              to="/settings/indexers"
            >
              {translate('FirstRunWizardOpenIndexers')}
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'mediaManagement',
      title: translate('FirstRunWizardMediaManagementTitle'),
      body: (
        <div className={styles.stepBody}>
          <div>{translate('FirstRunWizardMediaManagementHelp')}</div>
          <ul className={styles.recommendations}>
            <li>{translate('FirstRunWizardMediaManagementRename')}</li>
            <li>{translate('FirstRunWizardMediaManagementFormat')}</li>
            <li>{translate('FirstRunWizardMediaManagementCombine')}</li>
          </ul>
          <div className={styles.statusRow}>
            <span className={styles.statusLabel}>
              {translate('FirstRunWizardMediaManagementStatus', [
                renameBooks ? translate('FirstRunWizardOn') : translate('FirstRunWizardOff'),
                standardBookFormat || translate('FirstRunWizardNotSet'),
                combineModeLabel,
                combineDeleteLabel
              ])}
            </span>
          </div>
          <div className={styles.inlineActions}>
            <SpinnerButton
              kind={kinds.PRIMARY}
              size={sizes.SMALL}
              isSpinning={isSaving}
              onPress={onApplyRecommendedSettings}
            >
              {translate('FirstRunWizardApplyRecommended')}
            </SpinnerButton>
            <Button
              kind={kinds.DEFAULT}
              size={sizes.SMALL}
              to="/settings/mediamanagement"
            >
              {translate('FirstRunWizardOpenMediaManagement')}
            </Button>
          </div>
        </div>
      )
    }
  ]), [
    rootFolderCount,
    downloadClientCount,
    indexerCount,
    renameBooks,
    standardBookFormat,
    combineModeLabel,
    combineDeleteLabel,
    isSaving,
    onApplyRecommendedSettings
  ]);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <ModalContent showCloseButton={false}>
      <ModalHeader
        className={styles.dragHandle}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        {translate('FirstRunWizardTitle')}
      </ModalHeader>

      <ModalBody>
        <div className={styles.container}>
          <div>{translate('FirstRunWizardIntro')}</div>
          <div className={styles.headerRow}>
            <div className={styles.stepTitle}>{step.title}</div>
            <div className={styles.stepCount}>
              {translate('FirstRunWizardStep', [stepIndex + 1, steps.length])}
            </div>
          </div>
          {step.body}
        </div>
      </ModalBody>

      <ModalFooter>
        <div className={styles.footerActions}>
          <Button
            kind={kinds.DEFAULT}
            size={sizes.SMALL}
            onPress={onDismiss}
          >
            {translate('FirstRunWizardFinish')}
          </Button>
          <div className={styles.footerRight}>
            <Button
              kind={kinds.DEFAULT}
              size={sizes.SMALL}
              onPress={() => setStepIndex(Math.max(0, stepIndex - 1))}
              isDisabled={stepIndex === 0}
            >
              {translate('FirstRunWizardBack')}
            </Button>
            <Button
              kind={kinds.PRIMARY}
              size={sizes.SMALL}
              onPress={() => setStepIndex(Math.min(steps.length - 1, stepIndex + 1))}
              isDisabled={isLastStep}
            >
              {translate('FirstRunWizardNext')}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </ModalContent>
  );
}

FirstRunWizardModalContent.propTypes = {
  rootFolderCount: PropTypes.number.isRequired,
  downloadClientCount: PropTypes.number.isRequired,
  indexerCount: PropTypes.number.isRequired,
  renameBooks: PropTypes.bool.isRequired,
  standardBookFormat: PropTypes.string,
  combineAudiobookMode: PropTypes.string,
  combineAudiobookDeleteMode: PropTypes.string,
  isSaving: PropTypes.bool.isRequired,
  onApplyRecommendedSettings: PropTypes.func.isRequired,
  onDragStart: PropTypes.func,
  onDismiss: PropTypes.func.isRequired
};

FirstRunWizardModalContent.defaultProps = {
  standardBookFormat: '',
  combineAudiobookMode: 'disabled',
  combineAudiobookDeleteMode: 'deleteImmediately'
};

export default FirstRunWizardModalContent;
