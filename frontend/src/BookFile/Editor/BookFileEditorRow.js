import PropTypes from 'prop-types';
import React from 'react';
import BookQuality from 'Book/BookQuality';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import TableRow from 'Components/Table/TableRow';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import BookFileActionsCell from './BookFileActionsCell';
import styles from './BookFileEditorRow.css';

function getMediaLabel(path, mediaType) {
  const mediaTypeValue = typeof mediaType === 'string' ? mediaType.toLowerCase().trim() : mediaType;
  const pathLower = (path || '').toLowerCase();
  const isAudioByMediaType = mediaTypeValue === 'audiobook' || mediaTypeValue === 2 || mediaTypeValue === '2';
  const isEbookByMediaType = mediaTypeValue === 'ebook' || mediaTypeValue === 1 || mediaTypeValue === '1';
  const isAudioByExtension = ['.mp3', '.m4b', '.m4a', '.aac', '.flac'].some((value) => pathLower.endsWith(value));
  const isEbookByExtension = ['.epub', '.pdf', '.mobi', '.azw', '.azw3', '.kepub'].some((value) => pathLower.endsWith(value));

  if (isAudioByMediaType || isAudioByExtension) {
    return translate('Audiobook');
  }

  if (isEbookByMediaType || isEbookByExtension) {
    return translate('Ebook');
  }

  return path;
}

function BookFileEditorRow(props) {
  const {
    id,
    path,
    size,
    dateAdded,
    quality,
    qualityCutoffNotMet,
    mediaType,
    pageCount,
    isSelected,
    isSmallScreen,
    onSelectedChange,
    deleteBookFile
  } = props;

  const displayPath = isSmallScreen ? getMediaLabel(path, mediaType) : path;

  return (
    <TableRow>
      {
        !isSmallScreen &&
          <TableSelectCell
            id={id}
            isSelected={isSelected}
            onSelectedChange={onSelectedChange}
          />
      }
      <TableRowCell
        className={styles.path}
      >
        {displayPath}
      </TableRowCell>

      {
        !isSmallScreen &&
          <TableRowCell
            className={styles.size}
          >
            {formatBytes(size)}
          </TableRowCell>
      }

      {
        !isSmallScreen &&
          <RelativeDateCellConnector
            className={styles.dateAdded}
            date={dateAdded}
          />
      }

      {
        !isSmallScreen &&
          <TableRowCell
            className={styles.quality}
          >
            <BookQuality
              quality={quality}
              isCutoffNotMet={qualityCutoffNotMet}
            />
          </TableRowCell>
      }

      <BookFileActionsCell
        id={id}
        path={path}
        quality={quality}
        mediaType={mediaType}
        pageCount={pageCount}
        deleteBookFile={deleteBookFile}
      />
    </TableRow>
  );
}

BookFileEditorRow.propTypes = {
  id: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  quality: PropTypes.object.isRequired,
  qualityCutoffNotMet: PropTypes.bool.isRequired,
  mediaType: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pageCount: PropTypes.number,
  dateAdded: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  isSmallScreen: PropTypes.bool.isRequired,
  onSelectedChange: PropTypes.func.isRequired,
  deleteBookFile: PropTypes.func.isRequired
};

export default BookFileEditorRow;
