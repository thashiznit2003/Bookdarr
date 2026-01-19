import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TextTruncate from 'react-text-truncate';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookCover from 'Book/BookCover';
import HeartRating from 'Components/HeartRating';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Button from 'Components/Link/Button';
import Marquee from 'Components/Marquee';
import Measure from 'Components/Measure';
import Modal from 'Components/Modal/Modal';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import fonts from 'Styles/Variables/fonts';
import formatBytes from 'Utilities/Number/formatBytes';
import stripHtml from 'Utilities/String/stripHtml';
import translate from 'Utilities/String/translate';
import BookDetailsLinks from './BookDetailsLinks';
import styles from './BookDetailsHeader.css';

const defaultFontSize = parseInt(fonts.defaultFontSize);
const lineHeight = parseFloat(fonts.lineHeight);

function getFanartUrl(images) {
  return images.find((x) => x.coverType === 'fanart')?.url;
}

class BookDetailsHeader extends Component {

  //
  // Lifecycle

  constructor(props) {
    super(props);

    this.state = {
      overviewHeight: 0,
      titleWidth: 0,
      isOverviewModalOpen: false
    };
  }

  //
  // Listeners

  onOverviewMeasure = ({ height }) => {
    this.setState({ overviewHeight: height });
  };

  onTitleMeasure = ({ width }) => {
    this.setState({ titleWidth: width });
  };

  onOverviewMorePress = () => {
    this.setState({ isOverviewModalOpen: true });
  };

  onOverviewModalClose = () => {
    this.setState({ isOverviewModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      width,
      titleSlug,
      title,
      seriesTitle,
      pageCount,
      overview,
      statistics = {},
      releaseDate,
      ratings,
      images,
      links,
      shortDateFormat,
      author,
      isSmallScreen
    } = this.props;

    const {
      overviewHeight,
      titleWidth,
      isOverviewModalOpen
    } = this.state;

    const fanartUrl = getFanartUrl(author.images);
    const marqueeWidth = titleWidth - (isSmallScreen ? 85 : 160);
    const overviewText = stripHtml(overview || '');
    const showOverviewMore = isSmallScreen && overviewText;

    return (
      <div className={styles.header} style={{ width }}>
        <div
          className={styles.backdrop}
          style={
            fanartUrl ?
              { backgroundImage: `url(${fanartUrl})` } :
              null
          }
        >
          <div className={styles.backdropOverlay} />
        </div>

        <div className={styles.headerContent}>
          <BookCover
            className={styles.cover}
            images={images}
            size={250}
            lazy={false}
          />

          <div className={styles.info}>
            <Measure
              className={styles.titleRow}
              onMeasure={this.onTitleMeasure}
            >
              <div className={styles.titleContainer}>
                <div className={styles.title} style={{ width: marqueeWidth }}>
                  <Marquee text={title} />
                </div>

              </div>
            </Measure>

            <div className={styles.details}>
              <div>
                {seriesTitle}
              </div>

              <div>
                <AuthorNameLink
                  className={styles.authorLink}
                  titleSlug={author.titleSlug}
                  authorName={author.authorName}
                />

                {
                  !!pageCount &&
                    <span className={styles.duration}>
                      {`${pageCount} pages`}
                    </span>
                }

                <HeartRating
                  rating={ratings.value}
                  iconSize={20}
                />
              </div>
            </div>

            <div className={styles.detailsLabels}>
              {
                releaseDate &&
                  <Label
                    className={styles.detailsLabel}
                    size={sizes.LARGE}
                  >
                    <Icon
                      name={icons.CALENDAR}
                      size={17}
                    />

                    <span className={styles.sizeOnDisk}>
                      {
                        moment(releaseDate).format(shortDateFormat)
                      }
                    </span>
                  </Label>
              }

              <Label
                className={styles.detailsLabel}
                size={sizes.LARGE}
              >
                <Icon
                  name={icons.DRIVE}
                  size={17}
                />

                <span className={styles.sizeOnDisk}>
                  {
                    formatBytes(statistics.sizeOnDisk)
                  }
                </span>
              </Label>

              <Tooltip
                anchor={
                  <Label
                    className={styles.detailsLabel}
                    size={sizes.LARGE}
                  >
                    <Icon
                      name={icons.EXTERNAL_LINK}
                      size={17}
                    />

                    <span className={styles.links}>
                      Links
                    </span>
                  </Label>
                }
                tooltip={
                  <BookDetailsLinks
                    titleSlug={titleSlug}
                    links={links}
                  />
                }
                kind={kinds.INVERSE}
                position={tooltipPositions.BOTTOM}
              />

            </div>
            <Measure
              onMeasure={this.onOverviewMeasure}
              className={styles.overview}
            >
              <TextTruncate
                line={Math.floor(overviewHeight / (defaultFontSize * lineHeight))}
                truncateText="…"
                text={overviewText}
                textTruncateChild={
                  showOverviewMore ? (
                    <button
                      type="button"
                      className={styles.overviewMore}
                      onClick={this.onOverviewMorePress}
                    >
                      {translate('More')}
                    </button>
                  ) : null
                }
              />
            </Measure>

            {
              isSmallScreen && overviewText ?
                <Modal
                  isOpen={isOverviewModalOpen}
                  size={sizes.MEDIUM}
                  onModalClose={this.onOverviewModalClose}
                >
                  <div className={styles.overviewModalContent}>
                    <div className={styles.overviewModalTitle}>
                      {translate('Overview')}
                    </div>
                    <div className={styles.overviewModalBody}>
                      {overviewText}
                    </div>
                    <div className={styles.overviewModalFooter}>
                      <Button onPress={this.onOverviewModalClose}>
                        {translate('Ok')}
                      </Button>
                    </div>
                  </div>
                </Modal> :
                null
            }
          </div>
        </div>
      </div>
    );
  }
}

BookDetailsHeader.propTypes = {
  id: PropTypes.number.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  titleSlug: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  seriesTitle: PropTypes.string.isRequired,
  pageCount: PropTypes.number,
  overview: PropTypes.string,
  statistics: PropTypes.object.isRequired,
  releaseDate: PropTypes.string.isRequired,
  ratings: PropTypes.object.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  links: PropTypes.arrayOf(PropTypes.object).isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  author: PropTypes.object,
  isSmallScreen: PropTypes.bool.isRequired
};

BookDetailsHeader.defaultProps = {
  width: '100%'
};

export default BookDetailsHeader;
