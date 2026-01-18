import PropTypes from 'prop-types';
import React from 'react';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookTitleLink from 'Book/BookTitleLink';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';

function UserUpgradesRow({
  bookId,
  book,
  needsEpub,
  needsM4b
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
        {needsEpub ? 'Needs EPUB' : 'OK'}
      </TableRowCell>

      <TableRowCell>
        {needsM4b ? 'Needs M4B' : 'OK'}
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

UserUpgradesRow.propTypes = {
  bookId: PropTypes.number.isRequired,
  book: PropTypes.object.isRequired,
  needsEpub: PropTypes.bool.isRequired,
  needsM4b: PropTypes.bool.isRequired
};

export default UserUpgradesRow;
