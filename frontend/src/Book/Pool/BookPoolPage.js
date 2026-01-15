import PropTypes from 'prop-types';
import React, { Component } from 'react';
import IconButton from 'Components/Link/IconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import { icons } from 'Helpers/Props';
import BookTitleLink from 'Book/BookTitleLink';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import styles from './BookPoolPage.css';

const STATUS_LABELS = {
  0: () => translate('Pending'),
  1: () => translate('Available'),
  2: () => translate('NeedsManual')
};

export default class BookPoolPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      books: [],
      isFetching: false,
      error: null,
      adding: {}
    };
  }

  componentDidMount() {
    this.fetchPool();
  }

  fetchPool = () => {
    this.setState({ isFetching: true, error: null });

    const request = createAjaxRequest({
      url: '/user/library/pool',
      method: 'GET'
    });

    request.request.done((data) => {
      this.setState({ books: data || [], isFetching: false });
    });

    request.request.fail((xhr) => {
      this.setState({ error: xhr, isFetching: false });
    });
  };

  onAddToLibrary = (book) => {
    const { adding, books } = this.state;

    this.setState({
      adding: { ...adding, [book.bookId]: true }
    });

    const request = createAjaxRequest({
      url: '/user/library',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        bookId: book.bookId,
        wantsEbook: true,
        wantsAudiobook: true
      })
    });

    request.request.done((data) => {
      const updatedBooks = books.map((item) => {
        if (item.bookId === data.bookId) {
          return {
            ...item,
            inMyLibrary: true,
            status: data.status,
            hasEbook: data.hasEbook,
            hasAudiobook: data.hasAudiobook
          };
        }

        return item;
      });

      this.setState({ books: updatedBooks, adding: { ...adding, [book.bookId]: false } });
    });

    request.request.fail(() => {
      this.setState({ adding: { ...adding, [book.bookId]: false } });
    });
  };

  renderStatus(resource) {
    const { status, needsAttention } = resource;
    const label = STATUS_LABELS[status] ? STATUS_LABELS[status]() : translate('Pending');

    return (
      <span className={needsAttention ? styles.statusAttention : styles.status}>
        {label}
      </span>
    );
  }

  render() {
    const {
      books,
      isFetching,
      error,
      adding
    } = this.state;

    return (
      <PageContent>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              name={icons.REFRESH}
              onPress={this.fetchPool}
              title={translate('Refresh')}
            />
          </PageToolbarSection>
          <PageToolbarSection>
            <span className={styles.description}>{translate('BookPoolDescription')}</span>
          </PageToolbarSection>
        </PageToolbar>
        <PageContentBody noPadding={true}>
          {isFetching && <LoadingIndicator />}
          {error && (
            <div className={styles.error}>
              {getErrorMessage(error, translate('UnableToLoadBookPool'))}
            </div>
          )}
          {!isFetching && !error && (
            <>
              {books.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <div className={styles.headerRow}>
                    <div className={styles.cell}>{translate('Title')}</div>
                    <div className={styles.cell}>{translate('Author')}</div>
                    <div className={styles.cell}>{translate('Status')}</div>
                    <div className={styles.cell}>{translate('HasEbook')}</div>
                    <div className={styles.cell}>{translate('HasAudiobook')}</div>
                    <div className={styles.cell}>{translate('Action')}</div>
                  </div>
                  {books.map((item) => (
                    <div
                      key={item.bookId}
                      className={item.needsAttention ? styles.rowNeedsAttention : styles.row}
                    >
                      <div className={styles.cell}>
                        <BookTitleLink
                          title={item.book.title}
                          titleSlug={item.book.titleSlug}
                          disambiguation={item.book.disambiguation}
                        />
                      </div>
                      <div className={styles.cell}>{item.book.authorTitle}</div>
                      <div className={styles.cell}>{this.renderStatus(item)}</div>
                      <div className={styles.cell}>{item.hasEbook ? translate('Yes') : translate('No')}</div>
                      <div className={styles.cell}>{item.hasAudiobook ? translate('Yes') : translate('No')}</div>
                      <div className={styles.cell}>
                        <IconButton
                          name={icons.ADD}
                          title={translate(item.inMyLibrary ? 'InMyLibrary' : 'AddToMyLibrary')}
                          onPress={() => this.onAddToLibrary(item)}
                          isDisabled={item.inMyLibrary}
                          isSpinning={adding[item.bookId]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>{translate('BookPoolEmpty')}</div>
              )}
            </>
          )}
        </PageContentBody>
      </PageContent>
    );
  }
}
