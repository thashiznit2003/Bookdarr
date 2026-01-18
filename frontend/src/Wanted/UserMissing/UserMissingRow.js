import PropTypes from 'prop-types';
import React from 'react';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookTitleLink from 'Book/BookTitleLink';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import BookEntities from 'Book/bookEntities';
import BookSearchCellConnector from 'Book/BookSearchCellConnector';

function UserMissingRow({
  bookId,
  book,
  missingEbook,
  missingAudiobook
}) {
  if (!book) {
    return null;
  }

  return (
    <TableRow>
      <TableRowCell>
        <BookTitleLink
          titleSlug={book.titleSlug}
          title={book.title}
          disambiguation={book.disambiguation}
        />
      </TableRowCell>

      <TableRowCell>
        <AuthorNameLink
          titleSlug={book.author?.titleSlug}
          authorName={book.author?.authorName}
        />
      </TableRowCell>

      <TableRowCell>
        {missingEbook ? 'Missing eBook' : 'Available'}
      </TableRowCell>

      <TableRowCell>
        {missingAudiobook ? 'Missing Audiobook' : 'Available'}
      </TableRowCell>

      <TableRowCell>
        <BookSearchCellConnector
          bookId={bookId}
          authorId={book.authorId}
          bookTitle={book.title}
          authorName={book.author?.authorName}
          bookEntity={BookEntities.WANTED_MISSING}
          showOpenAuthorButton={false}
        />
      </TableRowCell>

      <TableRowCell>
        <a
          href={`/book/${book.titleSlug}?convert=true`}
          aria-label="Convert"
        >
          Convert
        </a>
      </TableRowCell>
    </TableRow>
  );
}

UserMissingRow.propTypes = {
  bookId: PropTypes.number.isRequired,
  book: PropTypes.object.isRequired,
  missingEbook: PropTypes.bool.isRequired,
  missingAudiobook: PropTypes.bool.isRequired
};

export default UserMissingRow;
