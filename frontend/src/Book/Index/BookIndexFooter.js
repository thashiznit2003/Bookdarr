import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { ColorImpairedConsumer } from 'App/ColorImpairedContext';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './BookIndexFooter.css';

class BookIndexFooter extends PureComponent {

  //
  // Render

  render() {
    const { book } = this.props;
    const count = book.length;
    let books = 0;
    let bookFiles = 0;
    let totalFileSize = 0;
    let fullFormats = 0;
    let partialFormats = 0;
    let missingFormats = 0;

    const authors = new Set();

    book.forEach((s) => {
      authors.add(s.authorId);

      const { statistics = {} } = s;

      const {
        bookCount = 0,
        bookFileCount = 0,
        ebookFileCount = 0,
        audiobookFileCount = 0,
        sizeOnDisk = 0
      } = statistics;

      books += bookCount;
      bookFiles += bookFileCount;

      const hasEbook = ebookFileCount > 0;
      const hasAudiobook = audiobookFileCount > 0;

      if (hasEbook && hasAudiobook) {
        fullFormats++;
      } else if (hasEbook || hasAudiobook) {
        partialFormats++;
      } else {
        missingFormats++;
      }

      totalFileSize += sizeOnDisk;
    });

    return (
      <ColorImpairedConsumer>
        {(enableColorImpairedMode) => {
          return (
            <div className={styles.footer}>
              <div>
                <div className={styles.legendItem}>
                  <div
                    className={classNames(
                      styles.continuing,
                      enableColorImpairedMode && 'colorImpaired'
                    )}
                  />
                  <div>
                    Full (ebook + audiobook)
                  </div>
                </div>

                <div className={styles.legendItem}>
                  <div
                    className={classNames(
                      styles.ended,
                      enableColorImpairedMode && 'colorImpaired'
                    )}
                  />
                  <div>
                    Partial (one format)
                  </div>
                </div>

                <div className={styles.legendItem}>
                  <div
                    className={classNames(
                      styles.missingMonitored,
                      enableColorImpairedMode && 'colorImpaired'
                    )}
                  />
                  <div>
                    Missing files
                  </div>
                </div>
              </div>

              <div className={styles.statistics}>
                <DescriptionList>
                  <DescriptionListItem
                    title={translate('Authors')}
                    data={authors.size}
                  />

                  <DescriptionListItem
                    title={translate('Books')}
                    data={books}
                  />

                  <DescriptionListItem
                    title={translate('Files')}
                    data={bookFiles}
                  />

                  <DescriptionListItem
                    title="Full"
                    data={fullFormats}
                  />

                  <DescriptionListItem
                    title="Partial"
                    data={partialFormats}
                  />

                  <DescriptionListItem
                    title="Missing"
                    data={missingFormats}
                  />
                </DescriptionList>

                <DescriptionList>
                  <DescriptionListItem
                    title={translate('TotalFileSize')}
                    data={formatBytes(totalFileSize)}
                  />
                </DescriptionList>
              </div>
            </div>
          );
        }}
      </ColorImpairedConsumer>
    );
  }
}

BookIndexFooter.propTypes = {
  book: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default BookIndexFooter;
