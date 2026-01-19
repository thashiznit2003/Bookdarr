import PropTypes from 'prop-types';
import React from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import styles from './MergeBookModalContent.css';

function getBookTitle(resource) {
  return resource?.book?.title || resource?.title || '';
}

function getBookAuthor(resource) {
  const author = resource?.book?.author;

  if (author?.authorName) {
    return author.authorName;
  }

  if (author?.authorNameLastFirst) {
    const parts = author.authorNameLastFirst.split(',');
    if (parts.length > 1) {
      return `${parts[1].trim()} ${parts[0].trim()}`.trim();
    }
    return author.authorNameLastFirst;
  }

  return resource?.book?.authorTitle || resource?.authorTitle || '';
}

function getBookId(resource) {
  if (resource?.bookId != null) {
    return resource.bookId;
  }

  return resource?.id;
}

function MergeBookModalContent(props) {
  const {
    books,
    isMerging,
    mergeError,
    onMergeConfirmed,
    onModalClose
  } = props;

  const hasTwoBooks = books.length === 2;
  const leftBook = hasTwoBooks ? books[0] : null;
  const rightBook = hasTwoBooks ? books[1] : null;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('MergeBooksTitle')}
      </ModalHeader>

      <ModalBody>
        {
          mergeError &&
            <Alert kind={kinds.DANGER}>
              {getErrorMessage(mergeError, translate('MergeBooksFailed'))}
            </Alert>
        }

        {
          !hasTwoBooks &&
            <Alert kind={kinds.WARNING}>
              {translate('MergeBooksSelectTwo')}
            </Alert>
        }

        {
          hasTwoBooks &&
            <>
              <div className={styles.instructions}>
                {translate('MergeBooksChooseWinner')}
              </div>

              <div className={styles.compare}>
                <div className={styles.compareColumn}>
                  <div className={styles.compareLabel}>Left selection</div>
                  <div className={styles.compareTitle}>{getBookTitle(leftBook)}</div>
                  <div className={styles.compareAuthor}>{getBookAuthor(leftBook)}</div>
                </div>

                <div className={styles.compareColumn}>
                  <div className={styles.compareLabel}>Right selection</div>
                  <div className={styles.compareTitle}>{getBookTitle(rightBook)}</div>
                  <div className={styles.compareAuthor}>{getBookAuthor(rightBook)}</div>
                </div>
              </div>

              <Alert kind={kinds.WARNING}>
                {translate('MergeBooksWarning')}
              </Alert>
            </>
        }
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>
          {translate('Cancel')}
        </Button>

        <SpinnerButton
          kind={kinds.PRIMARY}
          isSpinning={isMerging}
          isDisabled={!hasTwoBooks || isMerging}
          onPress={() => onMergeConfirmed(getBookId(leftBook), getBookId(rightBook))}
        >
          {translate('MergeKeepLeft')}
        </SpinnerButton>

        <SpinnerButton
          kind={kinds.PRIMARY}
          isSpinning={isMerging}
          isDisabled={!hasTwoBooks || isMerging}
          onPress={() => onMergeConfirmed(getBookId(rightBook), getBookId(leftBook))}
        >
          {translate('MergeKeepRight')}
        </SpinnerButton>
      </ModalFooter>
    </ModalContent>
  );
}

MergeBookModalContent.propTypes = {
  books: PropTypes.arrayOf(PropTypes.object).isRequired,
  isMerging: PropTypes.bool.isRequired,
  mergeError: PropTypes.object,
  onMergeConfirmed: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default MergeBookModalContent;
