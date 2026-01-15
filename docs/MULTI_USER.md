# Multi-User & Shared Book Pool Design

This document captures the backend architecture required for the new Bookdarr multi-user experience described in the checklist. It focuses on the shared book pool, per-user ownership, and the download/permission rules needed to keep files consistent while letting every user maintain a personalized library.

## Objectives

1. Allow multiple authenticated users, each with their own library view and permissions.
2. Maintain a global pool of books, metadata, and files so duplicate downloads are avoided.
3. Let each user “claim” or add a book from the pool without triggering new downloads unless the asset is missing.
4. Download new files only when there is ≥95% certainty they belong to the active book, and mark downloads that require manual review.
5. Provide admin controls (site-wide download/indexer settings, user roles) while exposing book pools/permissions via the UI (Book Pool sidebar entry, “Add to my Library” actions).

## Key Entities

- **User**
  - `Id`, `Username`, `Email`, `PasswordHash`, `Role` (Admin / Standard / Limited)
  - `PreferredQualityMedia` (e.g., `ebook`, `audiobook`, `both`)
  - `CreatedAt`, `LastLogin`, `IsActive`
  - Each user controls personal settings (`Theme`, `Notifications`) via metadata tables.

- **Book**
  - Existing book record (author, title, editions, metadata).
  - `BookId` remains the canonical identifier. Shared pool logic treats Book rows as global metadata.

- **UserBook` (many-to-many join)**
  - `UserId`, `BookId`, `IsMonitored`, `AddedOn`, `ClaimedFromPool`, `IsActive`
  - Tracks ownership and monitoring preferences per user.
  - When a user adds a new book, `UserBook` is inserted connecting them to the pool; duplicates only create a new join row, not another `Book`.

- **BookFile**
  - Existing file table gains `MediaType` (`ebook`/`audiobook`), `IsGlobal` flag, `ClaimedByUserId` (nullable).
  - Shared pool ensures once a file is stored, every `UserBook` referencing the parent `Book` can collect it.
  - Additional metadata fields: `ConvertedFrom`, `IsExtraDownload`, `ConversionError`, `AddedByUserId`.

- **UserBookFile**
  - Optional helper table linking `BookFileId` to `UserId` when a file should be shown for certain users only (e.g., waved for private downloads, or to track manual additions).
  - Contains `IsPreferredCopy`, `IsDownloadedAutomatically`, `MarkedForReview`, `ParentDownloadId`.

- **DownloadRequest**
  - Logs each request triggered by a user (automatic search, manual search, manual download).
  - Fields include `UserId`, `BookId`, `TriggerType`, `ConfidenceScore`, `Status`, `CreatedAt`.
  - Helps determine whether an automatic download should proceed (≥95% confidence) or flag the book for manual review.

- **RolePermission**
  - Defines what each role can do: manage indexers/download clients (admin only), delete global metadata, claim other user files, etc.

## ER Diagram (conceptual)

```
   +------+        +-----------+        +----------+
   | User |<>----< | UserBook  | >----<> | Book     |
   +------+        +-----------+        +----------+
        \                                /    \
         \                              /      \
        has many                    has many   has many
           \                        /           \
          +--------------+   +-------------+   +-------------+
          | UserBookFile |   | BookFile    |   | DownloadLog |
          +--------------+   +-------------+   +-------------+
```

## API / Backend Hooks

- **GET `/api/v1/book-pool`** – return shared books with available files + metadata, and indicate whether the active user already owns the book.
- **POST `/api/v1/book-pool/{id}/claim`** – add a `UserBook` entry for the active user or clone metadata from another user when a book already exists in the pool.
- **GET `/api/v1/user-books`** – retrieve the books currently visible to the signed-in user (via the `UserBook` join).
- **POST `/api/v1/users`** – admin-only endpoint to create new users, assign roles, and optionally pre-populate the shared pool with books.
- **POST `/api/v1/downloads/manual`** – manual search/download actions should attach `UserId`, `BookId`, and `RequestedMediaType`, and may flag `MarkedForReview` when confidence < 95%.
- **PATCH `/api/v1/book-files/{id}/permissions`** – allow admins to revoke global visibility or mark files as “downloaded extraneously.”

## Download & Import Flow

1. When a user triggers a download/search, capture `ConfidenceScore` and `RequestedMediaType`. Automatic downloads proceed only if the score ≥95%; otherwise, attach a red notification dot to the book and defer to manual search.
2. Download clients pull the torrent/NZB; once completed, Bookdarr associates the file with the shared `Book`. Each user referencing that `Book` automatically inherits access to the new `BookFile`.
3. The new `DownloadRequests` table captures every download/search trigger (auto, manual, or interactive), storing the requesting user, desired media type, confidence score, review flag, and notes. The REST endpoint `GET /api/v1/downloads/requests/pending` surfaces these items back to the UI so red-dot notifications, review banners, or manual follow-ups can appear per user.
4. Manual downloads/imports allow users to upload files directly. The UI prompts for `File`, `MediaType`, and optional `Conversion Notes`, then stores the file and records `AddedByUserId`.
5. If a user adds a new book that already exists (determined via metadata match), Bookdarr creates a `UserBook` pointing to the existing `Book`, avoiding redundant downloads.
6. Extra files (e.g., extra audio components or `.nfo`) are tagged with `IsExtraDownload` and `MarkedForReview`. They remain accessible but are marked as “downloaded extraneously” until an admin removes the tag.

## Permissions & Admin Controls

- **Admin User**: created during fresh installs as the first account; has God-level access to indexers, download clients, and can delete pool entries.
- **Standard Users**: can search, add books, claim shared copies, and download files but cannot modify global downloader/indexer settings.
- **Limited Users**: read-only access to the library/pool, cannot trigger automatic downloads.
- **Book Pool UI**: top-level sidebar entry that lists shared books; each shared book entry includes a “+” (Claim shared copy / Add to my library) button.
- **Metadata & Edition Switching**: automatic edition switching is removed. Manual edition selection remains in the book editor dropdown.
- **Book Access**: editing a book updates pool metadata; deleting a book requires admin rights and removes the pool entry.

## Next Steps

1. Implement the database migrations that add `Users`, `UserBook`, `UserBookFile`, and the new file metadata columns described above.
2. Wire authentication, role-based policies, and protected endpoints before adjusting the frontend.
3. Update the UI (frontend components, sidebar, book pool page) based on these backend endpoints.
4. Keep the diagnostics/workflow documentation in sync with this feature rollout, tagging/pushing after each incremental change.
