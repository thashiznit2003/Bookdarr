import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './AuthorIndexFooter.css';

class AuthorIndexFooter extends PureComponent {

  //
  // Render

  render() {
    const { author } = this.props;
    const count = author.length;
    let books = 0;
    let bookFiles = 0;
    let ended = 0;
    let continuing = 0;
    let totalFileSize = 0;

    author.forEach((s) => {
      const { statistics = {} } = s;

      const {
        bookCount = 0,
        bookFileCount = 0,
        sizeOnDisk = 0
      } = statistics;

      books += bookCount;
      bookFiles += bookFileCount;

      if (s.status === 'ended') {
        ended++;
      } else {
        continuing++;
      }

      totalFileSize += sizeOnDisk;
    });

    return (
      <div className={styles.footer}>
        <div className={styles.statistics}>
          <DescriptionList>
            <DescriptionListItem
              title={translate('Authors')}
              data={count}
            />

            <DescriptionListItem
              title={translate('Ended')}
              data={ended}
            />

            <DescriptionListItem
              title={translate('Continuing')}
              data={continuing}
            />
          </DescriptionList>

          <DescriptionList>
            <DescriptionListItem
              title={translate('Books')}
              data={books}
            />

            <DescriptionListItem
              title={translate('Files')}
              data={bookFiles}
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
  }
}

AuthorIndexFooter.propTypes = {
  author: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default AuthorIndexFooter;
