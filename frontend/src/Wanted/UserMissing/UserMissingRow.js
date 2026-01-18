import PropTypes from 'prop-types';
import React from 'react';
import AuthorNameLink from 'Author/AuthorNameLink';
import BookTitleLink from 'Book/BookTitleLink';
import TableRow from 'Components/Table/TableRow';
import TableRowCell from 'Components/Table/Cells/TableRowCell';

function UserMissingRow({
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
        <a
          href={`/book/${book.titleSlug}?tab=search&autoSearch=true`}
          aria-label="Search"
        >
          Search
        </a>
      </TableRowCell>
    </TableRow>
  );
}

UserMissingRow.propTypes = {
  book: PropTypes.object.isRequired,
  missingEbook: PropTypes.bool.isRequired,
  missingAudiobook: PropTypes.bool.isRequired
};

export default UserMissingRow;
