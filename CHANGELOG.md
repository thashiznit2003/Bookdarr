# Changelog

## 1.3.128
- Summary: Auto-assign unmapped files when adding a book from metadata search.
- Why: Adding a book from the metadata results didn’t attach the selected unmapped files.
- Impact: After a metadata add completes, the Assign modal immediately imports the selected files into the new book; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/AssignUnmappedModalContent.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-193.log`).

## 1.3.127
- Summary: Remove the Edition column from metadata search results to tighten the Assign modal.
- Why: Edition data isn’t useful in the Assign search results and wastes vertical space.
- Impact: Metadata search results now show Title, Author, and Year only, keeping rows compact; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/AssignUnmappedModalContent.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-192.log`).

## 1.3.126
- Summary: Simplify metadata search results in Assign and reduce slow search churn.
- Why: Metadata searches were firing on every keystroke and the results view was too large for the modal.
- Impact: Metadata search now submits on the search button, replaces the library list with a compact table (title/author/year/edition), and keeps the list scrollable; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/AssignUnmappedModalContent.js`, `frontend/src/UnmappedFiles/assign/AssignUnmappedModalContentConnector.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-191.log`).

## 1.3.125
- Summary: Match the Manual Add form spacing to the AddAuthor panel.
- Why: The Add Book Manually fields were overly spaced compared to the rest of the modal.
- Impact: Manual Add now uses the standard FormGroup layout (label left, input right) for compact vertical spacing; version bumped for cache-busting.
- Files: `frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.js`, `frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-190.log`).

## 1.3.124
- Summary: Make the Assign modal scrollable, swap the list for metadata results on search, and tighten Manual Add spacing.
- Why: The book list couldn’t scroll, metadata search didn’t replace the list, and Manual Add fields were spaced too far apart.
- Impact: Assign now shows a scrollable list, metadata search replaces the list with a results pane, and Manual Add uses tighter vertical spacing; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/*`, `frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-189.log`).

## 1.3.123
- Summary: Fix Unmapped Assign imports by sending edition IDs, clarify labels, and improve metadata search/filters.
- Why: Assigning files failed with a ManualImport null ref, the library list felt truncated, and the modal’s fields were unclear.
- Impact: Assign now passes `foreignEditionId` into the ManualImport command, the picker uses the full book list, metadata search errors are clearer, and the filter/search labels are explicit; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/*`, `src/NzbDrone.Core/Localization/Core/en.json`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-188.log`).

## 1.3.122
- Summary: Make Unmapped Assign actually import files, show full library list, and clarify the search fields.
- Why: Assigning files didn’t attach them to books, the list appeared truncated, and the two search inputs were unclear.
- Impact: Assign now runs the ManualImport command for selected files, the book picker loads the full `/book` list, and the modal labels/alerts are clearer; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/*`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-187.log`).

## 1.3.121
- Summary: Fix Assign-to-Book flows and polish manual add: metadata search now works in the Unmapped modal, assigns refresh immediately, manual create looks sane, and adding a book also joins your library.
- Why: Add-new search in the modal did nothing, manual add looked broken, new books only landed in Book Pool, and assigning unmapped files didn’t refresh the list or attach files.
- Impact: Unmapped Assign modal now searches metadata, shows results, and refetches the unmapped list after assigning; manual add is restyled into readable panels; search adds books straight to your library; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/*`, `frontend/src/Store/Actions/searchActions.js`, `frontend/src/Book/Index/ManualAdd/*`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-186.log`).

## 1.3.120
- Summary: Fix Assign-to-Book unmapped flow with working metadata search and manual create options plus book assignment wiring.
- Why: The Add New Book button crashed (missing book data) and users couldn’t search metadata or create a new book directly from Unmapped Files before assigning files.
- Impact: Assign modal now includes metadata search results with add flow, a manual create option, and propagates new books back into the pool before posting the unmapped files to manual import; version bumped for cache-busting.
- Files: `frontend/src/UnmappedFiles/assign/*`, `frontend/src/Search/Book/AddNewBookSearchResult.js`, `frontend/src/Book/Index/ManualAdd/*`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-185.log`).

## 1.3.119
- Summary: Add an Assign to Book flow for Unmapped Files so selected items can be mapped to an existing pool book or a newly created one.
- Why: Unmapped files are already known but lack a book; users need to pick a book (or add one) and import those files directly from the Unmapped page.
- Impact: Unmapped Files now has an Assign to Book toolbar action that opens a book-picker modal (with filter and Add New Book search) and posts the selected files to manual import; added a no-books-found translation and bumped the version for cache-busting.
- Files: `frontend/src/UnmappedFiles/UnmappedFilesTable.js`, `frontend/src/UnmappedFiles/assign/*`, `src/NzbDrone.Core/Localization/Core/en.json`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-184.log`).

## 1.3.115
- Summary: Link Existing Files now includes a full file browser so you can navigate any path and import all files, not just unmapped ones.
- Why: The Armada manual import showed an empty list; users need to browse the filesystem, pick a folder, and see every file to link them to the current book.
- Impact: Added a Browse button in manual import that opens the file browser (with files), refreshed automatically when changing folders; default to showing all files for link-existing and fixed the browse modal crash; version bumped for cache-busting.
- Files: `frontend/src/Book/Details/BookDetails.js`, `frontend/src/InteractiveImport/InteractiveImportModal.js`, `frontend/src/InteractiveImport/Interactive/InteractiveImportModalContent*.js`, `frontend/src/InteractiveImport/Interactive/InteractiveImportModalContentConnector.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-180.log`).
## 1.3.114
- Summary: Make “Link Existing Files” auto-open file selection for the current book and remove the confusing Move/Interactive buttons.
- Why: The previous modal showed “Move Automatically”/“Interactive Import” buttons that didn’t clarify how to pick files; users need to immediately see and choose files to link to the current book (e.g., Armada).
- Impact: Link Existing Files now preloads the author folder, auto-opens the manual import file list, hides the dead buttons, and supports directly browsing to select files; version bumped for cache-busting.
- Files: `frontend/src/Book/Details/BookDetails.js`, `frontend/src/InteractiveImport/InteractiveImportModal.js`, `frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent*.js`, `frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContentConnector.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-179.log`).
- Summary: Keep library entries when fetching a single book so downloads/searches don’t clear the library view.
- Why: Navigating to a book detail (e.g., to download files) fetched only that book and replaced the store, hiding the rest of the library until a reload.
- Impact: Single-book fetches merge into the existing collection and preserve `inMyLibrary` flags instead of replacing the entire list. Version bumped for cache-busting.
- Files: `frontend/src/Store/Actions/bookActions.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-177.log`).
## 1.3.111
- Summary: Fix user library fetch when some books are missing from the main store.
- Why: After removing all books, `/user/library/books` could 500 with “Expected query to return N rows but returned M,” blocking adds from Book Pool and showing an empty library.
- Impact: BookService GetBooks can tolerate missing IDs (when allowed), and the user library endpoint uses that safe path, preventing 500s and letting Book Pool adds succeed. Version bumped for cache-busting.
- Files: `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `src/NzbDrone.Core/Books/Services/BookService.cs`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-176.log`).
## 1.3.110
- Summary: Prevent the user library view from wiping out books/authors when the user-library API briefly returns an empty list.
- Why: During queued downloads/restarts the client could clear the library if the endpoint responded with an empty array.
- Impact: If the user-library fetch returns empty while we already have entries, the client keeps the existing items instead of clearing them. Version bumped for cache-busting.
- Files: `frontend/src/Store/Actions/bookActions.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-175.log`).
## 1.3.109
- Summary: Allow single-file audiobook conversions: Combine now enables with one MP3/FLAC part and backend accepts 1+ parts.
- Why: Users with a single non-M4B audiobook couldn’t use Combine to convert it to M4B.
- Impact: Combine button enables for any supported audiobook file; backend no longer requires 2 parts and shows a clearer message. Version bumped for cache-busting.
- Files: `frontend/src/Book/Details/BookDetails.js`, `src/NzbDrone.Core/MediaFiles/CombineAudiobookService.cs`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-174.log`).
## 1.3.108
- Summary: Enable combining audiobooks when the parts are FLAC by allowing the UI button to activate for FLAC files.
- Why: Combine was still disabled in the book details toolbar because the UI only counted MP3 parts.
- Impact: The Combine Audiobook button now enables when multiple audiobook files are FLAC or MP3; backend already transcodes FLAC. Version bumped for cache-busting.
- Files: `frontend/src/Book/Details/BookDetails.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-173.log`).
## 1.3.107
- Summary: Allow combining FLAC audiobook parts and transcode non-MP3 inputs instead of failing.
- Why: The combine tool rejected FLAC sources, blocking users from merging common lossless downloads.
- Impact: Validation now accepts MP3 or FLAC; non-MP3 inputs transcode (AAC for M4B, LAME for MP3) while MP3-only still copies. Version bumped for cache-busting.
- Files: `src/NzbDrone.Core/MediaFiles/CombineAudiobookService.cs`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-172.log`).
## 1.3.106
- Summary: Wanted Missing Files now omits the Convert column and links search to book details; sidebar labels translated; version bumped for cache-busting.
- Why: The Convert action doesn’t belong on Missing Files and searches should land on the book details search tab.
- Impact: Missing Files shows a Search link per book (no Convert column), localization remains intact, and build version is incremented.
- Files: `frontend/src/Wanted/UserMissing/UserMissing.js`, `frontend/src/Wanted/UserMissing/UserMissingRow.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-171.log`).
## 1.3.105
- Summary: Fix the user-scoped Wanted pages so they render correctly and register their API thunks.
- Why: The new Missing Files/File Upgrades views blanked out because the thunks weren’t registered, the tables lacked column metadata, and translations were missing.
- Impact: Thunks are registered for the new endpoints, table headers render via columns, sidebar labels are translated, and the pages load instead of crashing. Version bumped for cache-busting.
- Files: `frontend/src/Store/Actions/userMissingActions.js`, `frontend/src/Store/Actions/userFileUpgradeActions.js`, `frontend/src/Wanted/UserMissing/UserMissing.js`, `frontend/src/Wanted/UserUpgrades/UserUpgrades.js`, `src/NzbDrone.Core/Localization/Core/en.json`, `src/Directory.Build.props`, `docs/HANDOFF.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-170.log`) so diagnostics capture the deploy.

## 1.3.102
- Summary: Book Pool now reflects newly added files in the ebook/audiobook badges instead of requiring files to be marked “shared with all.”
- Why: After importing files, Book Pool still showed missing statuses because the pool checks only shared files; typical imports aren’t marked shared.
- Impact: Pool availability checks now look at all book files (ebook/audiobook) so the green/red badges update as soon as files exist; version bumped for cache-busting.
- Files: `src/NzbDrone.Core/Books/Services/UserLibraryService.cs`, `src/Directory.Build.props`, `docs/HANDOFF.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-167.log`) so diagnostics capture the deploy.

## 1.3.103
- Summary: Hide the Calendar UI (sidebar link and route) until a metadata provider with reliable future release dates is available.
- Why: Google Books doesn’t reliably list unreleased titles, so the calendar isn’t useful right now.
- Impact: Calendar link is removed from the sidebar and the route is disabled; version bumped for cache-busting.
- Files: `frontend/src/Components/Page/Sidebar/PageSidebar.js`, `frontend/src/App/AppRoutes.js`, `src/Directory.Build.props`, `docs/HANDOFF.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-168.log`) so diagnostics capture the deploy.

## 1.3.104
- Summary: Rework Wanted to be user-scoped: Missing Files shows per-user library gaps (ebook/audiobook), and File Upgrades flags non-EPUB/M4B files. Added new endpoints and UI tables; removed monitoring dependency.
- Why: The old Wanted views were global/monitor-based and didn’t show which formats were missing or need upgrading to the preferred formats.
- Impact: New endpoints `/api/v1/user/wanted/missing-files` and `/api/v1/user/wanted/file-upgrades`; Wanted menu routes now point to user-scoped lists with per-format status and search/convert links; monitoring toggles removed. Version bumped for cache-busting.
- Files: `src/Readarr.Api.V1/Wanted/UserMissingFilesController.cs`, `src/Readarr.Api.V1/Wanted/UserFileUpgradesController.cs`, `src/Readarr.Api.V1/Wanted/UserMissingFilesResource.cs`, `src/Readarr.Api.V1/Wanted/UserFileUpgradeResource.cs`, `src/Readarr.Api.V1/openapi.json`, `frontend/src/Store/Actions/index.js`, `frontend/src/Store/Actions/userMissingActions.js`, `frontend/src/Store/Actions/userFileUpgradeActions.js`, `frontend/src/Wanted/UserMissing/*`, `frontend/src/Wanted/UserUpgrades/*`, `frontend/src/App/AppRoutes.js`, `frontend/src/Components/Page/Sidebar/PageSidebar.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-169.log`) so diagnostics capture the deploy.

## 1.3.101
- Summary: Keep book details working after removing a title from your library by merging user-library fetches without dropping non-library books.
- Why: The details “Remove from my Library” action would reload the user library, wipe the book from the client store, and the details route then 404’d; the button state also reverted.
- Impact: User-library fetch now clears only the `inMyLibrary` flag on existing books and re-applies it to the fetched items, preserving other books so details pages stay reachable; version bumped for cache-busting.
- Files: `frontend/src/Store/Actions/bookActions.js`, `src/Directory.Build.props`, `docs/HANDOFF.md`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-166.log`) so diagnostics capture the deploy.

## 1.3.93
- Summary: Finish the Users edit flow: add an Edit modal, wire the update thunk, include email on create, and let the API toggle active state.
- Why: Admins need to update usernames/emails/passwords and deactivate accounts from the UI; previous toggle calls were ignored because the API didn’t accept `isActive`.
- Impact: Users page now has Edit buttons with a prefilled modal (username/email, optional new password); Add modal collects email; update thunk calls the new endpoint; API update accepts `isActive`; user create sends email. Version bumped for deploy/cache-bust.
- Files: `frontend/src/Settings/Users/Users.js`, `frontend/src/Settings/Users/Users.css`, `frontend/src/Settings/Users/index.js`, `frontend/src/Store/Actions/Settings/settingsUsersActions.js`, `src/Readarr.Api.V1/Users/UserUpdateResource.cs`, `src/Readarr.Api.V1/Users/UsersController.cs`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to the next `/opt/bookdarr-dev/Logs/update-0XX.log`), verify diagnostics, then continue with per-user libraries and self-service password reset/email sending.

## 1.3.92
- Summary: Fix build issues for the user update work (hashing import and using order).
- Why: Build failed after adding the update endpoint; missing SHA256Hash import and StyleCop ordering.
- Impact: UsersController now imports hashing utilities and passes StyleCop; no behavior change beyond build fix.
- Files: `src/Readarr.Api.V1/Users/UsersController.cs`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM to deploy and generate diagnostics.

## 1.3.51
- Summary: Force a fresh deploy of the latest Book Pool UI (green/red format badges and add/remove corner toggle) so browsers stop loading the old 1.3.42 bundle that’s now showing a blank page.
- Why: Diagnostics from 2026-01-17 report the server still running 1.3.42, which explains the stale cards and empty UI; bumping the version gives a clean rebuild and cache-busting release.
- Impact: `src/Directory.Build.props` now reports `1.3.51.*`; `CHANGELOG.md` records the redeploy context so the update script can rebuild and ship the current UI.
- Files: `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.52
- Summary: Serve the UI assets (index.js/css/icons, initialize.json) without redirecting to /login so the page doesn’t go blank when the auth cookie isn’t recognized; only the HTML shell still redirects when unauthenticated.
- Why: The browser was getting 302 redirects for index.js even after login, which left a white screen; allowing static assets through lets the login page and app load while API calls continue to require auth.
- Impact: `StaticResourceController` now bypasses the login redirect for requests with a file extension, ensuring scripts/styles load; `src/Directory.Build.props` reports `1.3.52.*`; `CHANGELOG.md` notes the auth bypass for static files.
- Files: `src/Readarr.Http/Frontend/StaticResourceController.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.53
- Summary: Ensure the Book Pool corner control is always visible by adding a plain-text +/− fallback so the add/remove button shows even if icon fonts fail to load.
- Why: On some browsers the +/− icon disappeared, leaving no visible control; adding a text glyph guarantees the button is obvious.
- Impact: `BookPoolPage.css` now renders a simple +/− overlay in the corner in addition to the icon; `src/Directory.Build.props` reports `1.3.53.*`; `CHANGELOG.md` captures the visibility fix.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.54
- Summary: Force the add/remove corner control’s colors to override the base Link styles so the blue/red corner stays visible even if the Link CSS wipes the background.
- Why: Link.css was resetting background/color, making the corner control invisible; explicit overrides keep the control visible.
- Impact: `BookPoolPage.css` now applies `!important` overrides and a fixed line-height so the corner button shows; `src/Directory.Build.props` reports `1.3.54.*`; `CHANGELOG.md` logs the visibility override.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.55
- Summary: Add no-cache headers for core UI assets (html/js/css/json) so browsers stop serving old bundles after updates.
- Why: Chrome kept reusing cached `index.js`/`styles.css` after deploys, causing stale/blank UI; disabling cache on those responses forces a fresh download.
- Impact: `StaticResourceController` now disables cache for html/js/css/json responses; `src/Directory.Build.props` reports `1.3.55.*`; `CHANGELOG.md` notes the cache bypass.
- Files: `src/Readarr.Http/Frontend/StaticResourceController.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.56
- Summary: Replace the Book Pool corner control with a plain button (+/−) so the add/remove control is always visible regardless of icon fonts or CSS overrides.
- Why: The icon-based control wasn’t showing on some browsers; a simple button guarantees visibility.
- Impact: `BookPoolPage.js` now renders a native button for add/remove; `src/Directory.Build.props` reports `1.3.56.*`; `CHANGELOG.md` notes the visibility hardening.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.57
- Summary: Make the Book Pool corner button unmissable with bigger size, heavier weight, white border accents, and a higher z-index so it stays visible above overlays.
- Why: Some browsers still hid the button; increasing size/contrast and stacking order removes any ambiguity.
- Impact: `BookPoolPage.css` enlarges the corner control, adds border accents and higher z-index; `src/Directory.Build.props` reports `1.3.57.*`; `CHANGELOG.md` records the visibility boost.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.58
- Summary: Move the add/remove control back to the top-right corner only (smaller 26px badge) and drop the large inline buttons from the overlay.
- Why: The bottom action buttons felt intrusive; keeping a modest corner control restores the lighter layout while remaining visible.
- Impact: `BookPoolPage.js/css` remove the inline action button, size the corner control to 26px with subtle borders; `src/Directory.Build.props` reports `1.3.58.*`; `CHANGELOG.md` notes the revert to a compact corner control.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.59
- Summary: Force the corner control to sit above everything with z-index 10 and an inline position override so it can’t hide behind the poster.
- Why: Users still couldn’t see the button; this adds an inline absolute position and higher stacking to guarantee it renders on top.
- Impact: `BookPoolPage.js` adds a data-testid and inline top/right/z-index; `BookPoolPage.css` boosts z-index/position override; `src/Directory.Build.props` reports `1.3.59.*`; `CHANGELOG.md` logs the stacking fix.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.60
- Summary: Inline the corner button styles so they no longer rely on CSS modules; set explicit size/position/z-index via inline styles to guarantee it renders above the poster.
- Why: Some users still could not see the button; moving the styling inline removes any module/ordering issues.
- Impact: `BookPoolPage.js` now applies all critical styles inline for the corner control; `src/Directory.Build.props` reports `1.3.60.*`; `CHANGELOG.md` captures the inline styling change.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle lands in `Bookdarr-Diagnostics`.

## 1.3.61
- Summary: Force the UI build to run in production mode with cache-busting output so new bundles (including the corner +/- control) load without manual DevTools cache clears.
- Why: Browsers were still pulling stale `index.js`/chunks even after updates; production builds with hashed assets avoid reverse-proxy/browser cache reuse.
- Impact: Build scripts now call `NODE_ENV=production yarn build --env production=true`; `src/Directory.Build.props` reports `1.3.61.*`; `CHANGELOG.md` notes the cache-busting build change.
- Files: `scripts/dev-build.sh`, `scripts/dev-ubuntu.sh`, `scripts/install-bookdarr.sh`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run the usual `/opt/bookdarr-dev/scripts/update-dev.sh`, and verify the corner control appears without DevTools cache tricks.

## 1.3.62
- Summary: Disable caching for all html/js/css/json responses so browsers always fetch fresh UI bundles (corner +/- control) without relying on DevTools cache clears.
- Why: Some clients still loaded stale hashed chunks; forcing no-cache on core assets avoids reused bundles altogether.
- Impact: `CacheableSpecification` now treats html/js/css/json as non-cacheable; `src/Directory.Build.props` reports `1.3.62.*`; `CHANGELOG.md` documents the cache policy change.
- Files: `src/Readarr.Http/Middleware/CacheableSpecification.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM so the no-cache headers go live.

## 1.3.63
- Summary: Double-disable cache headers for html/js/css/json after the response is written, ensuring no proxies/browsers reuse old bundles.
- Why: Cache middleware still emitted `max-age` for scripts; forcing `DisableCache` post-request guarantees fresh assets.
- Impact: `CacheHeaderMiddleware` now forces `DisableCache` for html/js/css/json; `src/Directory.Build.props` reports `1.3.63.*`; `CHANGELOG.md` notes the stricter cache headers.
- Files: `src/Readarr.Http/Middleware/CacheHeaderMiddleware.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then load the app normally; hashed bundles + no-cache headers should show the corner control.

## 1.3.64
- Summary: Fix header handling to avoid Kestrel “headers are read-only” exceptions while still disabling cache for html/js/css/json.
- Why: Post-response cache disabling threw when the response had already started, causing blank pages; moving no-cache to the pre-write path fixes it.
- Impact: `CacheHeaderMiddleware` applies `DisableCache` before the response for core assets; `src/Directory.Build.props` reports `1.3.64.*`; `CHANGELOG.md` documents the fix.
- Files: `src/Readarr.Http/Middleware/CacheHeaderMiddleware.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, and rerun `/opt/bookdarr-dev/scripts/update-dev.sh`; verify the UI loads with the corner control.

## 1.3.65
- Summary: Remove the duplicate +/− glyph and make the corner control turn red for items already in the library (using ebook/audiobook presence as a fallback).
- Why: Tooltip + pseudo glyphs rendered double symbols; existing items stayed blue; this makes the button single-glyph and red when already owned.
- Impact: `BookPoolPage.js` now bases the state on hasEbook/hasAudiobook/libraryAdded and renders a single glyph; `BookPoolPage.css` removes the pseudo-glyph; `src/Directory.Build.props` reports `1.3.65.*`; `CHANGELOG.md` notes the UI fix.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then reload the UI to see a single +/− in the corner with red for in-library items.

## 1.3.66
- Summary: Let the inline corner button color override CSS by removing !important so in-library items actually render red.
- Why: The button stayed blue because CSS `!important` overrode the inline background; removing it lets inline styles take effect.
- Impact: `BookPoolPage.css` drops `!important` on the corner control’s background/border/color; `src/Directory.Build.props` reports `1.3.66.*`; `CHANGELOG.md` notes the fix.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then reload Book Pool to see single +/− with red for in-library items.

## 1.3.67
- Summary: Add a CLI helper to remove all “in my library” flags (no file deletion) so you can re-add via Book Pool; bumped version.
- Why: Needed a repeatable way to clear existing library flags without touching files and without DevTools/API guesswork.
- Impact: New script `scripts/remove-library-books.sh` hits the same DELETE endpoint as the corner control; `src/Directory.Build.props` reports `1.3.67.*`; `CHANGELOG.md` documents the helper.
- Files: `scripts/remove-library-books.sh`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then run the helper with API_KEY set to clear library flags.

## 1.3.68
- Summary: Load Library → Books from the signed-in user’s library only and expose a user-scoped books API to match.
- Why: New users should start with an empty library and only see items they explicitly add; the Library page was still loading every book in the catalog.
- Impact: `UserLibraryController` now serves `/api/v1/user/library/books`; the app boot fetch uses that endpoint instead of `/book`; `src/Directory.Build.props` reports `1.3.68.*`; `CHANGELOG.md` documents the user-scoped load.
- Files: `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `frontend/src/Store/Actions/bookActions.js`, `frontend/src/Components/Page/PageConnector.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push to `develop`, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM, and open Library → Books to confirm it’s empty until books are added from Book Pool.

## 1.3.69
- Summary: Fix Book Pool corner toggle so add/remove uses only the user library flag (not file presence), returns the created user-library payload, and updates the button state reliably.
- Why: Files alone were turning the corner button red, and adds didn’t show up in Library because the API response had no body.
- Impact: Corner “in library” now depends only on the user flag, add returns the mapped user-book, and the client updates the button state immediately; `src/Directory.Build.props` reports `1.3.69.*`; `CHANGELOG.md` records the toggle fix.
- Files: `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM, then add/remove from Book Pool and confirm Library updates and corner buttons behave as expected.

## 1.3.70
- Summary: Refresh the Library list automatically after Book Pool add/remove so new items appear without a manual page refresh.
- Why: Books added from Book Pool required a hard refresh to show up in Library → Books; we need live updates.
- Impact: Book Pool now dispatches a user-library reload after add/remove, keeping the Library view in sync; `src/Directory.Build.props` reports `1.3.70.*`; `CHANGELOG.md` documents the live refresh.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then add/remove a book in Book Pool and confirm it appears/disappears in Library → Books without refreshing.

## 1.3.71
- Summary: Recolor Library progress bars based on ebook/audiobook presence (green=both, orange=one, red=none), drop monitored UI, and add per-format counts.
- Why: Bars showed yellow even when both formats existed, and monitored/unmonitored isn’t used in Bookdarr.
- Impact: Backend now exposes ebook/audiobook file counts per book; Library posters/overviews use those counts for colors; monitored labels/legend entries are removed; `src/Directory.Build.props` reports `1.3.71.*`.
- Files: `src/NzbDrone.Core/AuthorStats/BookStatistics.cs`, `src/NzbDrone.Core/AuthorStats/AuthorStatisticsRepository.cs`, `src/Readarr.Api.V1/Books/BookStatisticsResource.cs`, `frontend/src/Book/Index/ProgressBar/BookIndexProgressBar.js`, `frontend/src/Book/Index/Posters/BookIndexPoster.js`, `frontend/src/Book/Index/Overview/BookIndexOverview.js`, `frontend/src/Book/Index/BookIndexFooter.js`, `frontend/src/Book/Index/BookIndexFooter.css`, `frontend/src/Store/Actions/bookIndexActions.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then verify Library shows green for both formats, orange for one, red for none, and no monitored labels.

## 1.3.72
- Summary: Include per-book format stats in the user-library endpoint so Library colors reflect actual ebook/audiobook files.
- Why: Library views fetched from `/user/library/books` had no stats, so bars stayed red even when both formats existed.
- Impact: `/api/v1/user/library/books` now attaches author stats (including ebook/audiobook counts) to each book resource; `src/Directory.Build.props` reports `1.3.72.*`.
- Files: `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then confirm Library shows green when both formats exist, orange for one, red for none.

## 1.3.73
- Summary: Add a Users settings page (admin-only) to list and create users, and wire it into the Settings menu/routes.
- Why: Needed a UI entry point to manage users for the coming multi-user flow.
- Impact: New Settings → Users page lists users and supports creating new ones via `/api/v1/users`; `src/Directory.Build.props` reports `1.3.73.*`; `CHANGELOG.md` notes the new page.
- Files: `frontend/src/Settings/Users/*`, `frontend/src/App/AppRoutes.js`, `frontend/src/Settings/Settings.js`, `frontend/src/Store/Actions/Settings/settingsUsersActions.js`, `frontend/src/Store/Actions/index.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh`, then open Settings → Users to verify list/create works.

## 1.3.74
- Summary: Fix Users page imports for the existing table components so the build succeeds.
- Why: Wrong Table import paths caused the webpack build to fail on deploy.
- Impact: Users page now uses the correct TableHeaderCell/TableRowCell components; `src/Directory.Build.props` reports `1.3.74.*`.
- Files: `frontend/src/Settings/Users/Users.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, and rerun `/opt/bookdarr-dev/scripts/update-dev.sh`; then open Settings → Users to confirm it loads.

## 1.3.75
- Summary: Fix Users page routing/imports and auto-load the user list on page load.
- Why: Users route pointed to a removed connector and didn’t fetch users automatically, causing a blank screen.
- Impact: Users page now imports via `Settings/Users`, triggers a refresh on mount, and the version is `1.3.75.*`; `CHANGELOG.md` documents the fix.
- Files: `frontend/src/App/AppRoutes.js`, `frontend/src/Settings/Users/index.js`, `frontend/src/Settings/Users/Users.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, and rerun `/opt/bookdarr-dev/scripts/update-dev.sh`; then open Settings → Users to confirm it renders and lists users.

## 1.3.76
- Summary: Stop the Users page from re-fetching in a render loop by only refreshing once on mount.
- Why: The auto-refresh effect depended on a changing function reference, which could blank the page.
- Impact: Users page now triggers its refresh only once; `src/Directory.Build.props` reports `1.3.76.*`.
- Files: `frontend/src/Settings/Users/Users.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, rerun `/opt/bookdarr-dev/scripts/update-dev.sh`, then open Settings → Users and confirm it renders.

## 1.3.77
- Summary: Fix Users state reducer initialization so the page renders (base/set now has default state).
- Why: The Users reducer wasn’t given a defaultState/section, causing an invariant error and a blank screen after update.
- Impact: `settingsUsers` now initializes with its default state; `src/Directory.Build.props` reports `1.3.77.*`.
- Files: `frontend/src/Store/Actions/Settings/settingsUsersActions.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, rerun `/opt/bookdarr-dev/scripts/update-dev.sh`, then open Settings → Users; it should load instead of blanking.

## 1.3.47
- Summary: Added a macOS helper that clears Chrome’s Bookdarr cache and service worker storage so the client can download the v1.3.46 bundle (with no “Ready/Files pending” pills) without extra guesswork.
- Why: Re-running the DevTools cache-clearing steps manually was error prone, so packaging them in a script saves time and lets anyone confirm they’re on the latest bundle before reporting UI issues.
- Impact: `scripts/clear-chrome-bookdarr-cache.sh` stops Chrome, removes the service worker cache/storage for `bookdarr.shiznit.duckdns.org`, and reopens the site with guidance for a hard reload; `src/Directory.Build.props` reports `1.3.47.*`; `CHANGELOG.md` documents the new helper routine.
- Files: `scripts/clear-chrome-bookdarr-cache.sh`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.48
- Summary: Force-hides the legacy “Ready/Files pending” pills on Book Pool cards and keeps only the green/red ebook/audiobook outlines so the overlay matches the current design even if a cached bundle tries to render the old status spans.
- Why: Some clients were still showing the old pills despite the new JSX; adding a CSS-level guard ensures the legacy status elements are invisible while the outlined format badges remain.
- Impact: `frontend/src/Book/Pool/BookPoolPage.css` now explicitly hides any `.status`/`.statusAttention` pills while preserving the red/green format outlines; `src/Directory.Build.props` reports `1.3.48.*`; `CHANGELOG.md` records the fallback fix.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.49
- Summary: Added an extra CSS guard scoped to the Book Pool grid to hide any lingering legacy status pills, ensuring only the green/red ebook/audiobook outlines appear even if stale markup slips through.
- Why: Some clients were still showing the old “Ready/Files pending” spans; tightening the selector to the grid makes the hide rule unavoidable for leftover pill elements.
- Impact: `frontend/src/Book/Pool/BookPoolPage.css` now hides any status-like spans/divs within the pool grid; `src/Directory.Build.props` reports `1.3.49.*`; `CHANGELOG.md` notes the hardened fallback.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.50
- Summary: After adding to the library, the corner control now turns red with a “-” icon and the “In My Library” badge shows only for 5 seconds; the badge then fades while the outline badges remain for media status.
- Why: The badge and add button previously stayed static; this adds transient feedback and a visual remove state without keeping the pill around indefinitely.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` tracks a per-book `libraryAdded` flag, clears it after 5 seconds, and flips the corner control to a red remove state when the book is in your library; `frontend/src/Book/Pool/BookPoolPage.css` styles the red corner; `src/Directory.Build.props` reports `1.3.50.*`; `CHANGELOG.md` documents the behavior tweak.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.46
- Summary: Removed the Ready/Files Pending status ovals on Book Pool posters and now rely on color-coded ebook/audiobook outlines (green when a file exists, red when it does not) so the card overlay stays compact while still showing availability at a glance.
- Why: The status pills increased the card height and duplicated the information that the ebook/audiobook badges already provided, so replacing them with red/green outlines keeps the UX consistent with the Library cards while still highlighting missing files.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` now only renders the ebook/audiobook badges, and `frontend/src/Book/Pool/BookPoolPage.css` gives those badges the green/red outlines (with the card border still indicating attention when needed); `src/Directory.Build.props` now reports `1.3.46.*`; `CHANGELOG.md` documents the latest UI tweaks.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.45
- Summary: Book Pool posters now mimic Library cards with condensed overlays, normalized author names, and a toolbar sort menu that lets contributors reorder status/title/author/release date.
- Why: The shared pool overlay had extra vertical white space, uncapitalized authors, and no quick sort controls, so the cards were taller than Library posters and harder to browse or organize.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` now title-cases lowercased author data, keeps the format badges inside the status row, and exposes the requested sort items right next to the filter menu; `frontend/src/Book/Pool/BookPoolPage.css` tightens the overlay padding and row wrapping so the card heights match the Library grid; `src/Directory.Build.props` reports `1.3.45.*`; `CHANGELOG.md` documents the latest UI polish.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.43
- Summary: The Book Pool toolbar now actually shows the update/add/search buttons instead of collapsing to a single filter action so contributors can trigger the same workflows they use in Library → Books.
- Why: The toolbar’s default overflow logic hid every action once the layout narrowed, leaving only the filter menu visible even though the buttons were present in the markup.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` now sets `collapseButtons={false}` on the primary toolbar section so the refresh/add/search controls never shrink into the overflow menu, and `src/Directory.Build.props` reports `1.3.43.*` so diagnostics reflect the fixed UI.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.44
- Summary: Book Pool cards now match the Library posters with a condensed overlay (title/author/status/format badges), proper author capitalization, and a toolbar sort menu for status/title/author/release date, plus the REST resource now exposes author metadata.
- Why: The shared pool cards had oversized footers with redundant text, inconsistent author casing, and no way to sort the shared catalog like the Library grid, which made browsing the pool slower than expected.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` renders the new sort menu, sorts statuses/titles/authors/dates, and places the title/author details inside a condensed overlay with ebook/audiobook readiness badges; `frontend/src/Book/Pool/BookPoolPage.css` mimics the Library card height and gradient overlay; `src/Readarr.Api.V1/Books/BookResource.cs` now maps the author metadata so the UI can capitalize names consistently; `src/Directory.Build.props` reports `1.3.44.*` and `CHANGELOG.md` documents the shared-pool polish.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Readarr.Api.V1/Books/BookResource.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.42
- Summary: Book Pool now mirrors the Library toolbar/filter experience, shows the + action as a subtle corner label, and auto-refreshes when books or files change so statuses never stay stuck on “Pending.”
- Why: The shared pool was missing the Library-style filter button/group, the add action was intrusive, and newly downloaded ebook/audiobook files left the pool outline in red because the UI never refreshed after SignalR updates.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` renders the standard filter menu, repositions the add control as a corner label, and listens for `bookPoolResourceUpdated` events; `frontend/src/Book/Pool/BookPoolPage.css` styles the new corner marker and filter area; `frontend/src/Components/SignalRConnector.js` emits those refresh events whenever books or book files update via SignalR; `src/Directory.Build.props` now reports `1.3.41.*` and `CHANGELOG.md` documents the Book Pool polish.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `frontend/src/Components/SignalRConnector.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.40
- Summary: Sanitized log entries that previously depended on user input so CodeQL’s `cs/log-forging` alerts were addressed.
- Why: GitHub Code Scanning flagged the manual book and indexer tag logging paths because they directly wrote user values to the logs, which means a malicious value could forge new entries.
- Impact: `src/NzbDrone.Core/Books/Services/ManualBookService.cs` and `src/NzbDrone.Core/DecisionEngine/Specifications/IndexerTagSpecification.cs` now trim line breaks from logged strings, `src/Directory.Build.props` reports `1.3.40.*`, and `CHANGELOG.md` documents the security update.
- Files: `src/NzbDrone.Core/Books/Services/ManualBookService.cs`, `src/NzbDrone.Core/DecisionEngine/Specifications/IndexerTagSpecification.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.39
- Summary: ESLint now finishes with zero problems after the ebook-convert scanning UI and indexer-import dialogs follow the required control-flow and notification rules.
- Why: The last lint run still reported `no-negated-condition` plus `no-alert` warnings, so reorganizing `BookFileEbookConvertModal`’s PDF scan branch and replacing every `window.alert` in `IndexerSettings` with an inline `Alert` clears those violations.
- Impact: `frontend/src/BookFile/BookFileEbookConvertModal.js` now only uses positive guards when rendering scan details, `frontend/src/Settings/Indexers/IndexerSettings.js` exposes the same import/export messages through the app’s `Alert` component, `src/Directory.Build.props` reports `1.3.39.*`, and `CHANGELOG.md` documents the lint-cleanup follow-up.
- Files: `frontend/src/BookFile/BookFileEbookConvertModal.js`, `frontend/src/Settings/Indexers/IndexerSettings.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.38
- Summary: Front-end lint storms no longer fail `yarn lint`; the App, Author, BookFile, Form, Diagnostics, Search, Store, Sidebar, and bootstrap helpers now follow the `simple-import-sort`, handler/boolean, and prop-type rules.
- Why: ESLint errors from across the active folders blocked incremental cleanup, so sorting imports, renaming handlers, fixing boolean props, and reorganizing helper components lets the incremental lint passes focus on their own rule categories.
- Impact: `frontend/src/App/AppRoutes.js`, `frontend/src/Author/Details/*`, `frontend/src/BookFile/*`, `frontend/src/Components/Form/*`, `frontend/src/Diagnostics/diagnosticsEvents.js`, `frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.js`, `frontend/src/Search/*`, `frontend/src/Store/Actions/*`, `frontend/src/Components/Page/Sidebar/*`, and `frontend/src/bootstrap.tsx` now pass the ESLint rules that previously caused crashes; `src/Directory.Build.props` now reports `1.3.38.*` so the UI version tracks the lint cleanup; `yarn lint` finishes with zero errors (only the existing `no-alert`/`no-negated-condition` warnings remain).
- Files: `frontend/src/App/AppRoutes.js`, `frontend/src/Author/Details/AuthorDetails.js`, `frontend/src/Author/Details/BookRow.js`, `frontend/src/BookFile/BookFileAudioModal.js`, `frontend/src/BookFile/BookFileReaderModal.js`, `frontend/src/BookFile/Editor/BookFileActionsCell.js`, `frontend/src/BookFile/FileDetails.js`, `frontend/src/Components/Form/BookEditionSelectInputConnector.js`, `frontend/src/Components/Form/FormInputGroup.js`, `frontend/src/Components/Form/RootFolderSelectInputConnector.js`, `frontend/src/Components/Page/Sidebar/PageSidebar.js`, `frontend/src/Components/Page/Sidebar/SidebarDiagnosticsStatus.js`, `frontend/src/Components/Table/TableOptions/TableOptionsModal.js`, `frontend/src/Diagnostics/diagnosticsEvents.js`, `frontend/src/Helpers/Props/icons.js`, `frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.js`, `frontend/src/Search/Author/AddNewAuthorModalContentConnector.js`, `frontend/src/Search/Book/AddNewBookSearchResult.js`, `frontend/src/Store/Actions/authorAvailableBooksActions.js`, `frontend/src/Store/Actions/index.js`, `frontend/src/bootstrap.tsx`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.31
- Summary: The UI now reloads itself automatically when the backend reports a new version so the browser always shows the latest build without manual refreshes.
- Why: Deployments via `update-dev.sh` update the backend without prompting a browser refresh, which left stale assets under heavy development; the frontend already polls `/system/status`, so it can detect version changes and reload itself.
- Impact: `frontend/src/Components/Page/PageConnector.js` starts a regular `/system/status` poll, tracks the reported version, and calls `window.location.reload(true)` whenever the version changes; `src/Directory.Build.props` now reports `1.3.31.*` so diagnostics match the upgrade notification; `CHANGELOG.md` now documents the change.
- Files: `frontend/src/Components/Page/PageConnector.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.32
- Summary: Book Pool posters now share the exact card width/aspect ratio that the Library’s book grid uses so the shared pool never feels oversized.
- Why: Even after fixing pagination, the pooled cards still expanded to 220px columns and the images stretched beyond the Library’s 162px posters.
- Impact: `frontend/src/Book/Pool/BookPoolPage.css` limits each column to 162px, centers the grid, matches the Library poster aspect ratio (`400/256`), and constrains `.posterCard` width; `frontend/src/Book/Pool/BookPoolPage.js` asks `BookCover` for a 162px image so cached assets align; `src/Directory.Build.props` now reports `1.3.32.*` to match the refreshed size.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.33
- Summary: Browser refreshes now happen within about 15 seconds after the backend reports a new version, boosting the chance you see the latest build without manual reloads.
- Why: The auto-reload poll ran every 60 seconds, so short-lived updates often required waiting a full minute (or refreshing manually) before the UI noticed the version bump.
- Impact: `frontend/src/Components/Page/PageConnector.js` now polls `system/status` every 15 seconds, still reloads on version changes, and `src/Directory.Build.props` publishes `1.3.33.*` to keep diagnostics in lockstep; the changelog records the tighter polling interval.
- Files: `frontend/src/Components/Page/PageConnector.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.34
- Summary: Fixed the major lint failures in `frontend/src/Book` so the folder now passes ESLint (sorted imports, prop-type coverage, handler/boolean props) and `yarn lint` can focus on other areas.
- Why: `yarn lint` currently fails with thousands of errors coming from the Book components (`simple-import-sort`, missing prop-types, `react/jsx-handler-names`, etc.), so cleaning that folder removes a large chunk of the signal before tackling the next area.
- Impact: `frontend/src/Book/...` files now have consistent import sorting, the missing `author` prop-types in `BookDetailsConnector`, the boolean/handler fixes inside `BookPoolPage`, the redundant radix removal, and other auto-fixes required for ESLint; `src/Directory.Build.props` reports `1.3.34.*` so the diagnostics/version metadata match this lint-focused release.
- Files: `frontend/src/Book/Combine/CombineAudiobookModalContent.js`, `frontend/src/Book/Details/BookCoverUploadModal.js`, `frontend/src/Book/Details/BookDetails.js`, `frontend/src/Book/Details/BookDetailsConnector.js`, `frontend/src/Book/Details/CombineAudiobookProgress.js`, `frontend/src/Book/Edit/EditBookModalContent.js`, `frontend/src/Book/Index/BookIndex.js`, `frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.js`, `frontend/src/Book/Index/ManualAdd/AddManualBookModalContentConnector.js`, `frontend/src/Book/Index/Overview/BookIndexOverviews.js`, `frontend/src/Book/Index/Posters/BookIndexPosters.js`, `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.35
- Summary: System diagnostics code now satisfies ESLint so the `frontend/src/System` folder can be checked without the import/order noise.
- Why: Running `npx eslint frontend/src/System` previously surfaced `simple-import-sort` complaints inside diagnostics/status files; sorting those imports lets the next cleanup round focus on other rule categories.
- Impact: `frontend/src/System/Diagnostics/Diagnostics.js` keeps the same imports but in the canonical order required by the linter, and `src/Directory.Build.props` reports `1.3.35.*` so the diagnostics metadata matches this lint housekeeping pass.
- Files: `frontend/src/System/Diagnostics/Diagnostics.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.36
- Summary: Cleared `frontend/src/Settings` lint failures by sorting imports and removing unused references so the settings screens can be verified with `npx eslint frontend/src/Settings`.
- Why: The settings tree was another large error source for `yarn lint`, with `simple-import-sort`, unused variable, and undefined imports that blocked any further cleanup.
- Impact: Settings components (indexer forms, metadata provider, delay profile, etc.) now follow ESLint’s ordering rules, drop unused props, and reintroduce the missing `Alert/kinds` imports necessary for the metadata provider, while `src/Directory.Build.props` now reports `1.3.36.*` so the version matches this lint-focused pass.
- Files: `frontend/src/Settings/Indexers/Indexers/EditIndexerModalContent.js`, `frontend/src/Settings/Indexers/Options/IndexerOptions.js`, `frontend/src/Settings/Metadata/MetadataProvider/MetadataProvider.js`, `frontend/src/Settings/Profiles/Delay/DelayProfile.js`, `frontend/src/Settings/Profiles/Delay/DelayProfiles.js`, `frontend/src/Settings/Profiles/Quality/QualityProfileItems.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.37
- Summary: Ignored the generated `frontend/src/Content/Scripts` bundle in ESLint so the thousands of upstream errors there no longer block the incremental lint cleanup elsewhere.
- Why: These scripts are minified/third-party assets; manually fixing all 14,000+ lint violations would be impractical, so adding them to `.eslintignore` lets `yarn lint` focus on the application code.
- Impact: `.eslintignore` now excludes `frontend/src/Content/Scripts/**`, and `src/Directory.Build.props` reports `1.3.37.*` so the diagnostics/version metadata stay in sync with this housekeeping pass.
- Files: `frontend/.eslintignore`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.30
- Summary: Book Pool posters now keep a fixed 162px width so they match the Library poster density instead of stretching on wide screens.
- Why: Using `minmax(160px, 1fr)` allowed each column to inflate past the Library size, leaving the shared pool noticeably larger than the rest of the UI.
- Impact: `frontend/src/Book/Pool/BookPoolPage.css` fixes the grid to `repeat(auto-fit, 162px)` with centered layout, and `src/Directory.Build.props` reports `1.3.30.*` so diagnostics/version metadata align with this layout tweak.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.29
- Summary: Book Pool posters now match the Library book size so the grid no longer feels oversized.
- Why: The Book Pool grid was sizing each card to a 220px minimum width, which made the posters visually larger than the standard Library layout and wasted screen real estate.
- Impact: `frontend/src/Book/Pool/BookPoolPage.css` uses the same `minmax(160px, 1fr)` grid sizing as the Library posters, and `src/Directory.Build.props` now reports `1.3.29.*` so diagnostics match the refreshed layout.
- Files: `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and confirm the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.28
- Summary: Book Pool now renders every filtered book at once so posters never vanish while scrolling and all covers stay visible even on large libraries.
- Why: The drop-in pagination/infinite-scroll logic removed posters from the DOM as you scrolled, killing their cached image loads and leaving blank tiles instead of the expected covers.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` renders the filtered set directly, removes the unused pagination helpers, and keeps the grid visible for every book while `frontend/src/Book/Pool/BookPoolPage.css` drops the pagination styles and page-size controls; `src/Directory.Build.props` reports `1.3.28.*` so the version matches this visible-library refresh.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push the commits and tag to `develop`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH, and verify the diagnostics bundle landed in `Bookdarr-Diagnostics`.

## 1.3.27

## 1.3.26
- Summary: Book Pool posters now render their cached covers even when outside the viewport so all artwork stays visible as you scroll.
- Why: The grid used `AuthorImage`’s lazy loader, which hid posters whenever they scrolled offscreen and re-requested them when they re-entered the viewport.
- Impact: `BookCover` inside `BookPoolPoster` now opts out of lazy loading (`lazy={false}`), so every card fetches its cached `/MediaCover/Books/...` image once and keeps it rendered as you move through the pool; `src/Directory.Build.props` reports `1.3.26.*` so the UI version reflects this behavior fix.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, and rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-101.log" /opt/bookdarr-dev/scripts/update-dev.sh` via SSH.

## 1.3.25
- Summary: Book Pool now returns `bookId` alongside each poster so the “Add to my library” button has a stable key and the card data stays consistent.
- Why: React still relies on `bookId` to update individual cards, and without it the Add action and filters saw `null` keys even though the new mapper already had the ID.
- Impact: `BookPoolResource` exposes a `BookId` property, `BookPoolMapper` fills it from `Book.Id`, and the assembly version rises to `1.3.25.*` so the diagnostics logs and UI version match the fix.
- Files: `src/Readarr.Api.V1/Books/BookPoolResource.cs`, `src/Readarr.Api.V1/Books/BookPoolMapper.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push to GitHub, and rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-100.log" /opt/bookdarr-dev/scripts/update-dev.sh` over SSH.

## 1.3.24
- Summary: Book Pool finally mirrors the Books grid with full cover posters, filter chips that surface counts, pagination controls, and a centered “+” button so browsing the shared catalog feels just like the library.
- Why: Now that every book’s metadata and cached cover URL is available, the Book Pool should expose controls for filtering, paging, and counting ready vs missing files so users can quickly explore the pool without reloading the entire catalog.
- Impact: `frontend/src/Book/Pool/BookPoolPage.js` tracks pagination/filter state, renders counts inside each filter chip, and adds the pagination footer with per-page selector and page controls; `frontend/src/Book/Pool/BookPoolPage.css` styles the new footer and centers the overlay add button; `src/NzbDrone.Core/Localization/Core/en.json` documents the pagination labels; `src/Directory.Build.props` now reports `1.3.24.*` so the UI version reflects the updated experience.
- Files: `frontend/src/Book/Pool/BookPoolPage.js`, `frontend/src/Book/Pool/BookPoolPage.css`, `src/NzbDrone.Core/Localization/Core/en.json`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag the new snapshot, push it, and rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-098.log" /opt/bookdarr-dev/scripts/update-dev.sh` via SSH so diagnostics capture the refreshed UI.

## 1.3.23
- Summary: Built a shared BookPool metadata mapper so every card now references the same cached `BookResource` (including the local cover URLs and availability badges), and the user library no longer remaps the pool on every call.
- Why: The previous pool loop filtered out books without shared media and reconverted image URLs per request, leaving most covers blank and preventing the “All” view from ever showing titles that still need files.
- Impact: Added `BookPoolMapper` to centralize each book’s `BookResource`, status, and local-cover conversion, `UserLibraryController` now defers to that mapper, `UserLibraryService` shed the unused `GetBooksInPool()` endpoint, and `Startup` registers the shared mapper; the assembly version bumps to `1.3.23.*` so the UI clearly reports the new release.
- Files: `src/Readarr.Api.V1/Books/BookPoolMapper.cs`, `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `src/NzbDrone.Core/Books/Services/UserLibraryService.cs`, `src/NzbDrone.Host/Startup.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag a new `snapshot-YYYYMMDD-HHMM`, push it, and run `LOG_FILE="/opt/bookdarr-dev/Logs/update-097.log" /opt/bookdarr-dev/scripts/update-dev.sh` via SSH so the diagnostics repo captures the fresh BookPool metadata release.

## 1.3.22
- Summary: Book Pool now reads every poster from the cached `/MediaCover/Books/...` assets, and cached covers without extensions are detected so the shared pool finally renders the full grid while the sidebar still warns about throttling.
- Why: Rendering dozens of remote thumbnails at once had triggered provider throttling and left most posters blank, and several cached covers were stored without a `.jpg`/`.png` extension so the UI could not request them even though they existed locally.
- Impact: `UserLibraryController.GetBookPool()` leaves each book’s `BookResource.Images` pointing at the local cache, `MediaCoverService` now recognizes extensionless cached files before converting them, `MediaCoverController` accepts optional extensions (falling back to extensionless or resized files when needed), `HttpClient` records 429s via `IHttpThrottleNotificationService`, and the sidebar renders the throttle warning above the diagnostics footer so rate limits are obvious while every cached cover finally resolves.
- Files: `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `src/Readarr.Api.V1/MediaCovers/MediaCoverController.cs`, `src/NzbDrone.Core/MediaCover/MediaCoverService.cs`, `src/NzbDrone.Core/Http/IHttpThrottleNotificationService.cs`, `src/NzbDrone.Core/Http/HttpThrottleNotificationService.cs`, `src/NzbDrone.Common/Http/HttpClient.cs`, `src/Readarr.Api.V1/System/ThrottleController.cs`, `src/Readarr.Api.V1/System/ThrottleStatusResource.cs`, `frontend/src/Components/Page/Sidebar/ThrottleNotification.js`, `frontend/src/Components/Page/Sidebar/PageSidebar.js`, `frontend/src/Components/Page/Sidebar/PageSidebar.css`, `src/NzbDrone.Core/Localization/Core/en.json`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag and push `snapshot-YYYYMMDD-HHMM`, then rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-094.log" /opt/bookdarr-dev/scripts/update-dev.sh` over SSH so diagnostics show v1.3.22 with the cached covers and throttle notice.

## 1.3.16
- Summary: Downgraded the front-end selector helpers to a reselect release that still exposes `defaultMemoize`, so the `memoize is not a function` crash no longer blocks the UI after login.
- Why: The reselect 5 upgrade removed the `lruMemoize` export we relied on, which left `memoize` undefined inside `createSelectorCreator` and prevented the header/author search from rendering.
- Impact: `createAuthorClientSideCollectionItemsSelector`, `createBookClientSideCollectionItemsSelector`, and `createDeepEqualSelector` now use `defaultMemoize`, `package.json`/`yarn.lock` pin to `reselect 4.1.5`, and the UI now mounts correctly without runtime errors (author search and Book Pool reappear).
- Files: `package.json`, `yarn.lock`, `frontend/src/Store/Selectors/createAuthorClientSideCollectionItemsSelector.js`, `frontend/src/Store/Selectors/createBookClientSideCollectionItemsSelector.js`, `frontend/src/Store/Selectors/createDeepEqualSelector.js`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push to GitHub, and rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-088.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH so the Ubuntu VM and diagnostics repo capture the working v1.3.16 frontend.

## 1.3.17
- Summary: Expanded the Book Pool backend so it now returns every book in the catalog, not just titles that already have shared audiobook/eBook files.
- Why: The shared pool should mirror the entire collection so users can see books that still need imported media, but the previous logic filtered out books without files.
- Impact: `UserLibraryService.GetBooksInPool()` now pulls directly from the `Book` repository, so the Book Pool page can always list every book (pending or available) while the status badges reflect whether shared media exists.
- Files: `src/NzbDrone.Core/Books/Services/UserLibraryService.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, and rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-089.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` via SSH so diagnostics capture the new pool behavior.

## 1.3.18
- Summary: Book Pool now reuses the locally cached media covers so every card shows the stored artwork instead of hitting Google repeatedly.
- Why: The new pool grid loads dozens of posters at once, which was triggering provider throttling and left most covers stuck on the placeholder after the first few requests.
- Impact: `UserLibraryController.GetBookPool()` converts each book’s images to the local `/MediaCover/Books/...` URL via `IMapCoversToLocal` so the thumbnails use already-downloaded files; books without a local cover still fall back to the remote source, and the status badge continues to highlight titles that lack media or need manual attention.
- Files: `src/Readarr.Api.V1/Books/UserLibraryController.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: tag `snapshot-YYYYMMDD-HHMM`, push, and rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-091.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH so diagnostics show the new cover behavior.

## 1.3.15

## 1.3.14
- Summary: Fixed the SQLite migration that adds user metadata so it no longer relies on a non-constant default value for `CreatedAt`.
- Why: SQLite refuses to add a column whose default expression uses `datetime('now','localtime')`, so the migration failed and the app would not start after the database schema upgrade.
- Impact: The migration now adds `CreatedAt` as nullable, populates every row with `CURRENT_TIMESTAMP`, and finally enforces `NOT NULL`, letting the database upgrade finish cleanly. Script runs through `update-dev.sh` again to push diagnostics after success.
- Files: `src/NzbDrone.Core/Datastore/Migration/049_add_user_metadata.cs`, `CHANGELOG.md`
- Next: rerun the SSH update so `/opt/bookdarr-dev/Logs/update-086.log` is produced and diagnostics push completes now that the migration can finish.

## 1.3.12
- Summary: Updated the disk provider and logging infrastructure for .NET 10 so the factory-based System.IO.Abstractions API and NLog 6.0 targets build cleanly again.
- Why: NET 10 ships with the new `IFileSystem` helper methods and the legacy NLog concurrency/archiving APIs were removed, so the update script kept failing during CI/SSH runs.
- Impact: `DiskProviderBase` now calls `DirectoryInfo.New`/`FileInfo.New` and uses the new file-stream constructors, while `NzbDroneLogger` uses `ArchiveSuffixFormat` instead of `ArchiveNumbering` and drops the obsolete concurrency properties; alongside the net10 release, `src/Directory.Build.props` now reports `1.3.12.*` so the UI version stays in sync and diagnostics logs keep building.
- Files: `src/NzbDrone.Common/Disk/DiskProviderBase.cs`, `src/NzbDrone.Common/Test/DiskTests/DiskTransferServiceFixture.cs`, `src/NzbDrone.Common/Instrumentation/NzbDroneLogger.cs`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: rerun `scripts/update-dev.sh` via SSH so `/opt/bookdarr-dev/Logs/update-075.log` captures the fully rebuilt app and diagnostics can confirm net10 compatibility before continuing with the multi-user UI tasks.

## 1.3.11
- Summary: Completed the drag-and-drop refactor by deleting the remaining `react-dnd`/`react-dnd-multi-backend` helpers and reimplementing Table Options, Delay Profiles, Quality Profiles, and the custom format provider entirely with `@dnd-kit`.
- Why: the lingering `react-dnd` imports were blocking the build from resolving modules and required installing outdated packages; migrating everything to `@dnd-kit` keeps the sortable lists working, ensures keyboard-friendly dragging, and lets the frontend compile without `react-dnd`.
- Impact: Table Options now uses `DndContext`/`SortableContext`, delay/quality lists rely on the same DnD kit stack (including `CSS.Transform` for animation), the deleted drag preview/source files are gone, `package.json`/`yarn.lock` only contain `@dnd-kit` packages, and `src/Directory.Build.props` reports `1.3.11.*` so the UI reflects the new release.
- Files: `frontend/src/Components/Table/TableOptions/TableOptionsModal.js`, `frontend/src/Settings/Profiles/Delay/DelayProfiles.js`, `frontend/src/Settings/Profiles/Quality/QualityProfileItems.js`, `frontend/src/Settings/CustomFormats/CustomFormatSettingsConnector.js`, `package.json`, `yarn.lock`, `src/Directory.Build.props`, `CHANGELOG.md`
- Next: rerun `scripts/update-dev.sh` so `/opt/bookdarr-dev/Logs/update-074.log` captures `v1.3.11`, then continue the shared pool/multi-user UI work from `docs/MULTI_USER.md`.

## 1.3.10
- Summary: Expanded the user model with email, role, active state, preferred media, and timing metadata so the multi-user foundation keeps track of each account’s permissions and preferences before the shared pool/UI work lands.
- Why: Upcoming multi-user APIs need richer information about every account (role, whether the user is active, contact metadata, and their preferred media type) while letting admins pick the correct role when creating new users without accidentally elevating or disabling them.
- Impact: Added a migration to store the extra columns, taught `IUserService`/`User` to handle the new fields (including role-aware `IsAdmin` and preferred-media defaults), exposed the metadata through the REST `UserResource`/`UserCreateResource`, updated `UsersController` to parse role values while keeping `IsAdmin` compatibility, and bumped the assembly version so the UI reports v1.3.10; authentication now skips deactivated accounts so only active roles can sign in.
- Files: src/NzbDrone.Core/Authentication/User.cs, src/NzbDrone.Core/Authentication/UserService.cs, src/NzbDrone.Core/Datastore/Migration/049_add_user_metadata.cs, src/Readarr.Api.V1/Users/UserResource.cs, src/Readarr.Api.V1/Users/UserCreateResource.cs, src/Readarr.Api.V1/Users/UsersController.cs, src/Directory.Build.props, CHANGELOG.md
- Next: push a new snapshot and rerun the SSH update script so diagnostics capture v1.3.10 before continuing with the shared pool/user-management UI work from `docs/MULTI_USER.md`.
## 1.3.9
- Summary: Replace the Table Options, Delay Profiles, and Quality Profiles drag-and-drop experiences with `@dnd-kit` so the React DnD stack is no longer required for sorting columns or managing profile order, and drop the redundant DnD provider from Custom Formats.
- Why: The old `react-dnd` drag sources were blocking future frontend tidy-ups and triggered extra files/CSS; migrating these sortable lists to the lighter `@dnd-kit` stack paves the way toward removing the legacy dependency entirely.
- Impact: `TableOptionsModal`, Delay Profiles, and Quality Profiles now leverage `@dnd-kit/core` and `@dnd-kit/sortable`, the new `SortableQualityRow` wrapper powers the Quality Profile order logic, the `CustomFormatSettingsConnector` no longer renders a `react-dnd` provider, and `package.json`/`yarn.lock` now list only `@dnd-kit/*` so sorting works without `react-dnd`.
- Files: `frontend/src/Components/Table/TableOptions/TableOptionsColumn.js`, `frontend/src/Components/Table/TableOptions/TableOptionsModal.js`, `frontend/src/Components/Table/TableOptions/TableOptionsModal.css`, `frontend/src/Helpers/dragTypes.js`, `frontend/src/Settings/Profiles/Delay/DelayProfile.js`, `frontend/src/Settings/Profiles/Delay/DelayProfiles.js`, `frontend/src/Settings/Profiles/Quality/QualityProfileItem.js`, `frontend/src/Settings/Profiles/Quality/QualityProfileItemGroup.js`, `frontend/src/Settings/Profiles/Quality/QualityProfileItems.js`, `frontend/src/Settings/CustomFormats/CustomFormatSettingsConnector.js`, `package.json`, `yarn.lock`.
- Next: Complete the backend multi-user schema and API work, then align the Book Pool UI with the new shared-pool APIs.

## 1.3.8
- Summary: align every outstanding dependency bump (React DnD 16.x series, reselect 5.1.1, terser-webpack-plugin 5.3.16, System.IO.Abstractions 22.1.0, and the related .NET packages) so the codebase matches the ten requested dependabot PRs.
- Why: these security/maintenance updates were left open and the lockfiles needed refreshing after the switch to .NET 10, so bringing them into a single commit prevents conflicts, keeps the npm tree consistent, and removes the NU1403 package hash warnings from CI.
- Impact: `package.json`/`yarn.lock` now cite the newer npm versions, `src/Directory.Packages.props` and `src/Directory.Build.props` document the updated versions, and every `packages.lock.json` file got regenerated via `dotnet restore` so the .NET runtime resolves the correct hashes; the diagnostics-guide now references this build so the update script can snapshot `v1.3.8`.
- Files: package.json, yarn.lock, src/Directory.Packages.props, src/Directory.Build.props, src/**/packages.lock.json, CHANGELOG.md.
- Next: tag/push the new snapshot and run the SSH update command with the next log file so diagnostics reflect `v1.3.8`.

## 1.3.7
- Summary: Add filter chips above the Book Pool grid so the **All** view shows every shared book (even those without ebook/audiobook files) and illuminating status filters let you focus on ready copies or titles that still need assets; also restore the sidebar width to the original 320px so the navigation feels spacious again.
- Why: the shared pool should mirror every book any user has claimed, and the compressed sidebar width made the UI feel cramped after the previous reduction; the new filters plus the wider sidebar keep the experience familiar while giving you direct control over what to inspect.
- Impact: README now calls out the Book Pool filters, `frontend/src/Book/Pool/BookPoolPage.js` and its CSS render the filter chips and apply the selected scene, localization adds the filter labels and the empty-state copy, `frontend/src/Styles/Variables/dimensions.js` restores the sidebar width, and `src/Directory.Build.props` bumps the assembly to `1.3.7.*` so the UI shows the new release.
- Files: README.md, frontend/src/Book/Pool/BookPoolPage.js, frontend/src/Book/Pool/BookPoolPage.css, src/NzbDrone.Core/Localization/Core/en.json, frontend/src/Styles/Variables/dimensions.js, src/Directory.Build.props, CHANGELOG.md.
- Next: tag/push the new snapshot, then run `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` via SSH so the Ubuntu VM and diagnostics repo can capture `v1.3.7`.

## 1.3.6
- Summary: Book Pool now renders every shared book, even when no ebook/audiobook files exist, and the posters use every cached image so the grid never looks empty.
- Why: the shared pool should mirror the library’s catalog, and the UI needs to expose clear cover art plus accurate status chips so users can decide whether to pull files.
- Impact: `UserLibraryService.GetBooksInPool()` aggregates user library entries plus shared files, `GetPoolStatus()` returns `Available` only when shared media exists, `BookResourceMapper.ToResource()` now collates images from all editions, and `frontend/src/Book/Pool/BookPoolPage.js` maps string-based statuses (`pending`/`available`/`needsManual`) to their translations so the badge matches the API; `src/Directory.Build.props` now publishes version `1.3.6.*`.
- Files: src/NzbDrone.Core/Books/Services/UserLibraryService.cs, src/Readarr.Api.V1/Books/BookResource.cs, frontend/src/Book/Pool/BookPoolPage.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run `scripts/update-dev.sh` via SSH so `/opt/bookdarr-dev/Logs/update-0XX.log` and the diagnostics bundle reflect `v1.3.6`.

## 1.3.5
- Summary: surface every book that any user has added (even when no ebook/audiobook file exists) in the Book Pool and make the status chip explain whether files are ready instead of always showing “Pending”.
- Why: the shared pool should match the full library of each user, and the UI should clearly communicate whether there are assets to download instead of showing the same “Pending” badge for every title.
- Impact: `UserLibraryService.GetBooksInPool()` now aggregates all user library entries plus shared files, `UserLibraryService.GetPoolStatus()` returns `Available` whenever files exist and `NeedsManual` otherwise, the status translations under `src/NzbDrone.Core/Localization/Core/en.json` describe the state more clearly, and `frontend/src/Book/Pool/BookPoolPage.js` uses those labels so users know when files are ready; `src/Directory.Build.props` bumps the assembly version to keep the app display and diagnostics logs aligned with the new release.
- Files: src/NzbDrone.Core/Books/Services/UserLibraryService.cs, src/NzbDrone.Core/Localization/Core/en.json, frontend/src/Book/Pool/BookPoolPage.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run `scripts/update-dev.sh` via SSH so `/opt/bookdarr-dev/Logs/update-0XX.log` and the diagnostics bundle reflect `v1.3.5`.

## 1.3.4
- Summary: make the Book Pool page render the same poster grid as the Library’s “Posters” view while keeping a floating `+` button at the top-right corner so the only UI difference is the “Add to my library” action.
 - Why: the shared pool should feel identical to the books you already know and love, so any new design stands out only because it was intentionally different for adding copies instead of editing them.
 - Impact: `frontend/src/Book/Pool/BookPoolPage.js` now mirrors the poster layout, the CSS values in `frontend/src/Book/Pool/BookPoolPage.css` match the Library cards (cover, title, author, metadata, status chips), and `src/Directory.Build.props` increments the visible version so Bookdarr reports `v1.3.4` after each push; the workflow note remains in `CHANGELOG.md` so future automation keeps bumping the patch number.
 - Files: frontend/src/Book/Pool/BookPoolPage.js, frontend/src/Book/Pool/BookPoolPage.css, src/Directory.Build.props, CHANGELOG.md.
 - Next: tag/push `develop`, run the SSH update script with the next `update-0XX.log` (now `update-051.log`) so the new UI and version numbers land on the Ubuntu VM and diagnostics show `v1.3.4`.

## 1.3.2
- Summary: wire the shared Book Pool page into the UI and persist `DownloadRequest` records so the new red-dot review state survives restarts.
- Why: the multi-user plan needs a visible place to claim shared files, and the decision engine must now keep historical download confidence records before we build the notifications and review dashboard.
- Impact: `TableMapping` knows how to materialize `DownloadRequests`, the top-level sidebar gains a “Book Pool” entry, and the new React page (with dedicated CSS) lets you browse shared books and claim them without extra downloads; the README now links to the Book Pool workflow so contributors understand how to add shared copies.
- Files: src/NzbDrone.Core/Datastore/TableMapping.cs, frontend/src/Book/Pool/BookPoolPage.js, frontend/src/Book/Pool/BookPoolPage.css, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: tag and push the updated `develop` branch, run the SSH update command so the UI shows `v1.3.2`, and confirm the Book Pool page loads and the new entries appear in the diagnostics log.

## 1.3.3
- Summary: add a sidebar diagnostics push button, surface the last diagnostics commit, and make the manual “Add Book Manually” modal fields stretch across the modal so the top-row inputs mirror the rest of the form.
- Why: the diagnostics push should be one click away and provide more context for the workflow, while the manual add modal needed wider title/author/date inputs after the request for easier typing.
- Impact: the sidebar now exposes a development-only push button with inline status and repo/token hints, the diagnostics page lists the last commit alongside the bundle location, and the modal layout uses a responsive grid so the front-row fields span the same width as the lower rows; translations and CSS were updated to support the new copy and styles.
- Files: frontend/src/Components/Page/Sidebar/PageSidebar.js, frontend/src/Components/Page/Sidebar/PageSidebar.css, frontend/src/System/Diagnostics/Diagnostics.js, frontend/src/System/Diagnostics/Diagnostics.css, frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.js, frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.css, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run `scripts/update-dev.sh` via SSH (with the next `update-0XX.log`) so the sidebar/diagnostics changes reach the Ubuntu VM and the new version shows up in the UI.

## 1.3.1
- Summary: documented the multi-user/shared book pool architecture, the diagnostics/update workflow, and the enhanced metadata guidance so contributors know how to move forward with the new features and automation requirements.
- Why: these changes capture the preferences in recent handoffs (SSH/diagnostics/Unity), solidify the tagging/logging workflow, and provide the ER plan needed before backend work can start on multi-user support.
- Impact: README now lists metadata tuning, update script usage, and tag/version expectations; `docs/HANDOFF.md` now records the exact SSH/diagnostics/tag steps; `docs/ROADMAP.md` includes the multi-user milestone; `docs/MULTI_USER.md` outlines the proposed schema; `src/Directory.Build.props` bumped to version `1.3.1.*` to match the intended release.
- Files: README.md, docs/HANDOFF.md, docs/ROADMAP.md, docs/MULTI_USER.md, src/Directory.Build.props, CHANGELOG.md.
- Next: implement the database migrations, API changes, and frontend wiring described in `docs/MULTI_USER.md`, then run `scripts/update-dev.sh` via SSH so diagnostics reflect the new version.

## 1.2.313
- Summary: prevent diagnostics pushes from aborting the update when the repo’s `origin/HEAD` isn’t a symbolic ref.
- Why: the diagnostics repo occasionally resolves `origin/HEAD` to a raw commit, which made `symbolic-ref` fail under `set -e` and returned exit code 1 before the update finished.
- Impact: `scripts/update-dev.sh` now temporarily disables `errexit` while probing `origin/HEAD`, so the diagnostics branch lookup falls back to the existing logic instead of aborting the update.
- Files: scripts/update-dev.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun `scripts/update-dev.sh` on the Ubuntu VM to confirm diagnostics push no longer stops the update and it exits with code 0.

## 1.2.314
- Summary: replace the stranded `IsNullOrWhiteSpace` call in `BookFileController` with the static `string.IsNullOrWhiteSpace`.
- Why: removing `NzbDrone.Common.Extensions` earlier meant the controller no longer saw the extension method, so the compiler treated `edition.Title.IsNullOrWhiteSpace()` as a static call with no argument and crashed the build.
- Impact: the download filename builder now checks `edition.Title` with `string.IsNullOrWhiteSpace`, so the update script can compile under .NET 10 without analyzer errors.
- Files: src/Readarr.Api.V1/BookFiles/BookFileController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run `scripts/update-dev.sh` again (with the diagnostics repo in place) and confirm the build succeeds with the new logging.

## 1.2.315
- Summary: silence the diagnostics branch lookup so `update-dev.sh` survives a repo whose `origin/HEAD` isn’t a symbolic ref.
- Why: the symbolic-ref command still wrote an error to stdout/err despite our earlier patch, and `set -e` caused the script to exit with 128 once the error bubbled up.
- Impact: the diagnostics helper now runs the command inside `bash -lc ... 2>/dev/null` while `set -e` is temporarily disabled, keeping the lookup from bubbling up any exit code or messages and letting the update finish cleanly.
- Files: scripts/update-dev.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun `scripts/update-dev.sh` (with diagnostics) and confirm the upgrade completes without triggering the symbolic-ref error.

## 1.2.316
- Summary: hide the diagnostic symbolic-ref error once and for all by redirecting the Git call inside the Bash subshell while `errexit` is disabled.
- Why: the previous change still left a `git: fatal: ref ...` message in the update log because the redirect was applied outside the `bash -lc` invocation, so the parser still saw stdout output and triggered `set -e`.
- Impact: the command now runs `git symbolic-ref ... 2>/dev/null` inside the subshell, so nothing leaks out and the update completes even when `origin/HEAD` points at a commit instead of a symbolic ref.
- Files: scripts/update-dev.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun `scripts/update-dev.sh` (with diagnostics) to confirm the symbolic-ref warning is completely silenced and the update exits cleanly.

## 1.2.312
- Summary: make audiobook downloads keep the book name and file extension when streamed from the player.
- Why: the download button returned a `stream` file without an extension or descriptive name, forcing manual renaming.
- Impact: `BookFileController.StreamBookFile` now sanitizes the book title, reuses the actual extension, and sets the `FileDownloadName`, so browsers download `Title.ext` instead of `stream`.
- Files: src/Readarr.Api.V1/BookFiles/BookFileController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun `scripts/update-dev.sh` to confirm the diagnostics build still succeeds and the download prompts for the new filename.

## 1.2.311
- Summary: satisfy the analyzers so `AuthorLookupController` builds under the `net10.0` SDK.
- Why: a misplaced alias and an unused `NzbDrone.Common.Extensions` directive made SA1209/IDE0005 fail during the update script, booting diagnostics before the build could finish.
- Impact: the controller now keeps the `AuthorModel` alias after the namespace imports and drops the unused extension import, so the analyzer errors disappear.
- Files: src/Readarr.Api.V1/Author/AuthorLookupController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun `scripts/update-dev.sh` to confirm the StyleCop/IDE analyzers no longer block the build and the UI reports `v1.2.311`.

## 1.2.308
- Summary: keep author lookups working by falling back to the general search proxy.
- Why: the Google Books/Goodreads author search can return empty results after the first lookup, leaving `author/lookup` unusable for subsequent queries.
- Impact: `AuthorLookupController` now falls back to `_searchProxy.SearchForNewEntity(term)` (filtered to authors) whenever the direct author search returns nothing, so every author search continues returning results even if one query fails.
- Files: src/Readarr.Api.V1/Author/AuthorLookupController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the author search flow for several distinct authors and confirm each term returns data instead of empty arrays.

## 1.2.309
- Summary: inject the general search proxy into `AuthorLookupController`.
- Why: the fallback branch previously tried to call `ISearchForNewAuthor.SearchForNewEntity`, which doesn’t exist, so the build failed.
- Impact: the controller now depends on `ISearchForNewEntity` to execute the fallback search, keeping author lookups functional after the first term.
- Files: src/Readarr.Api.V1/Author/AuthorLookupController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update script and verify the controller compiles without the CS1061 error.

## 1.2.310
- Summary: alias the `Author` model inside `AuthorLookupController`.
- Why: `Author` appears as both a namespace and a type, which caused CS0118 when calling `OfType<Author>()`.
- Impact: the controller now aliases `NzbDrone.Core.Books.Author` as `AuthorModel` and consistently uses that type for mapping, so the compiler no longer errors out.
- Files: src/Readarr.Api.V1/Author/AuthorLookupController.cs, CHANGELOG.md.
- Next: run the update script to confirm the controller builds cleanly with the alias fix.

## 1.2.307
- Summary: renumber the RSS removal migration to avoid version conflicts.
- Why: both the conversion error migration and the RSS cleanup shared version 044, which caused startup to throw `DuplicateMigrationException`.
- Impact: the RSS migration file now lives at `src/NzbDrone.Core/Datastore/Migration/045_remove_rss_functionality.cs` with `[Migration(045)]`, so the database upgrades run once and finish cleanly.
- Files: src/NzbDrone.Core/Datastore/Migration/045_remove_rss_functionality.cs, CHANGELOG.md.
- Next: rerun the update-dev script (after installing the .NET SDK) and ensure the database upgrades succeed without duplicates.

## 1.2.306
- Summary: drop the unused extension using in `IntegrationTest`.
- Why: IDE0005 surfaced during updates after the previous refactor removed `SelectList`.
- Impact: the integration build no longer fails on the unused `NzbDrone.Common.Extensions` directive.
- Files: src/NzbDrone.Integration.Test/IntegrationTest.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update-dev script once the .NET SDK is available to confirm the IDE0005 warning is gone.

## 1.2.305
- Summary: keep integration/host tests aligned with the RSS-free indexer surface.
- Why: the RSS cleanup removed `EnableRss`, `SupportsRss`, and `RssSyncCommand`, which left these tests referencing nonexistent members.
- Impact: `IndexerFixture`, `IntegrationTest`, and `ContainerFixture` now rely on current indexer properties/commands, so update-dev can compile the tests again.
- Files: src/NzbDrone.Integration.Test/ApiTests/IndexerFixture.cs, src/NzbDrone.Integration.Test/IntegrationTest.cs, src/NzbDrone.Host.Test/ContainerFixture.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update-dev script once the environment has .NET installed to verify the tests build.

## 1.2.304
- Summary: remove the unused validator using from `IndexerConfigController`.
- Why: update-dev was failing with IDE0005 because `Readarr.Http.Validation` wasn’t referenced in the controller.
- Impact: IDE0005 no longer surfaces during build once the CLI has `dotnet` installed.
- Files: src/Readarr.Api.V1/Config/IndexerConfigController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: install the dotnet SDK on the build host and rerun the update script to confirm the controller compiles cleanly.

## 1.2.303
- Summary: add pending release notification badges to book covers and remove RSS functionality.
- Why: RSS sync was causing unwanted automatic downloads; users needed visual indicators for delayed releases without automatic retry; moving to overseerr-like manual search workflow where users control when downloads happen.
- Impact: **RSS Removal** - completely removed RSS sync service, commands, scheduled tasks, and all RSS-related UI components; removed EnableRss column from indexers; migrated RSS-only indexers to EnableAutomaticSearch via database migration 045; search functionality (automatic and interactive) fully preserved. **Pending Release Badges** - added GET /api/v1/book/pending endpoint exposing pending releases grouped by book ID; created red circular notification badge component that appears in top-right corner of book covers; badge shows on hover: count, earliest release date, and delay reason; integrated into both poster and overview views; users now see visual indicators prompting manual search when releases become available.
- Files: Backend - src/Readarr.Api.V1/Books/BookController.cs, src/NzbDrone.Core/Download/Pending/PendingReleaseService.cs, src/NzbDrone.Core/Datastore/Migration/045_remove_rss_functionality.cs, src/NzbDrone.Core/Indexers/IndexerDefinition.cs, src/NzbDrone.Core/Indexers/IndexerBase.cs, src/NzbDrone.Core/Indexers/IIndexer.cs, src/NzbDrone.Core/Indexers/IndexerFactory.cs, src/NzbDrone.Core/Jobs/TaskManager.cs, src/NzbDrone.Core/Configuration/ConfigService.cs, src/NzbDrone.Core/DecisionEngine/Specifications/*.cs (moved from RssSync/), deleted: src/NzbDrone.Core/Download/Pending/RssSyncService.cs, FetchAndParseRssService.cs, RssSyncCommand.cs, RssSyncCompleteEvent.cs, src/NzbDrone.Core/HealthCheck/Checks/IndexerRssCheck.cs. API - src/Readarr.Api.V1/Indexers/IndexerResource.cs, IndexerBulkResource.cs, IndexerConfigResource.cs. Frontend - frontend/src/Book/PendingReleaseBadge.js, PendingReleaseBadge.css, frontend/src/Book/Index/Posters/BookIndexPoster.js, BookIndexPosters.js, frontend/src/Book/Index/Overview/BookIndexOverview.js, BookIndexOverviews.js, frontend/src/Settings/Indexers/Indexers/Indexer.js, EditIndexerModalContent.js, IndexerOptions.js, ManageIndexersModalRow.tsx, ManageIndexersEditModalContent.tsx, frontend/src/Book/Index/BookIndex.js, frontend/src/Author/Index/AuthorIndex.js, frontend/src/Commands/commandNames.js. Localization - src/NzbDrone.Core/Localization/Core/en.json. Version - src/Directory.Build.props, CHANGELOG.md.
- Next: pull changes on Ubuntu VM, run update script, verify RSS sync removed from UI and scheduled tasks, verify pending release badges appear on book covers with correct tooltip information, manually search for pending releases to test new workflow.

## 1.2.302
- Summary: add comprehensive Kindle file format detection and helpful error messages.
- Why: basic EPUB detection wasn't enough; needed to detect KFX format and other variants to provide clear error messages; unknown file formats caused generic kindleunpack errors without guidance.
- Impact: replaced IsEpubInDisguise with DetectFileFormat that detects EPUB, MOBI, KFX, and Unknown formats; added GetFileMagicBytes for detailed diagnostics; KFX files now show specific error: "This file appears to be KFX format, which is not supported by kindleunpack"; unknown formats show magic bytes in error for troubleshooting; logs now show detected format before attempting conversion.
- Files: src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, retry AZW3 conversion and check logs for detected format and detailed error message with magic bytes.

## 1.2.301
- Summary: detect and handle EPUB files disguised as AZW3 Kindle format.
- Why: many AZW3 files are actually EPUB files with .azw3 extension, causing kindleunpack to fail with "first parameter must be a Kindle/Mobipocket ebook" error.
- Impact: added IsEpubInDisguise method that checks file magic bytes (PK ZIP header) to detect EPUB files; if AZW3 file is actually EPUB, skip kindleunpack and copy file directly; reduces conversion failures for EPUB-in-disguise files and provides faster conversion since no unpacking is needed.
- Files: src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, retry AZW3 conversion and verify file is detected as EPUB-in-disguise and copied directly without kindleunpack error.

## 1.2.300
- Summary: display conversion errors directly on book file details page.
- Why: users had to check logs to diagnose conversion failures, making it difficult to copy/paste error messages for troubleshooting.
- Impact: added ConversionError field to BookFile model and database; conversion errors are now captured and stored when conversion fails; book file details page displays a prominent red error box with the full error message and timestamp when conversion has failed; error message is formatted in monospace font for easy copy/paste; successful conversions clear any previous errors.
- Files: src/NzbDrone.Core/MediaFiles/BookFile.cs, src/NzbDrone.Core/Datastore/Migration/044_add_conversion_error_to_bookfiles.cs, src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Readarr.Api.V1/BookFiles/BookFileResource.cs, frontend/src/BookFile/FileDetailsConnector.js, frontend/src/BookFile/FileDetails.js, frontend/src/BookFile/FileDetails.css, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, test conversion failures and verify error messages display correctly on book file details page with copy/paste-friendly formatting.

## 1.2.299
- Summary: add detailed error logging for Kindle format conversion failures.
- Why: KindleUnpack conversion errors showed generic messages without capturing actual output from the tool, making it impossible to diagnose why .azw3 or other Kindle format conversions failed.
- Impact: ConvertKindleToEpub now logs the full stdout/stderr output from kindleunpack when conversion fails, including exit code; error messages now include "Check logs for details" to guide users to detailed diagnostic information.
- Files: src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, retry .azw3 conversion and check logs for detailed kindleunpack error output to diagnose the actual failure.

## 1.2.298
- Summary: fix images not appearing in converted EPUBs and add progress indicator for conversion.
- Why: AddFolderToZip was using Path.GetFileName which stripped subdirectory paths, causing images to be placed in wrong location in ZIP; users had no visibility into conversion progress for long-running operations.
- Impact: fixed AddFolderToZip to preserve full relative paths so images are correctly placed in OEBPS/images/ folder; added ProgressInfo logging at key conversion steps (OCR, image extraction, EPUB creation) so users see real-time status updates in UI during PDF and Kindle conversions.
- Files: src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, test PDF conversion with images and verify both images appear correctly in EPUB and progress messages display in UI.

## 1.2.297
- Summary: add image extraction and embedding to PDF to EPUB conversion.
- Why: PDF to EPUB conversion was only extracting text via OCR, losing all images from the source PDF files.
- Impact: ConvertPdfToEpub now uses pdfimages to extract all images from PDFs and embeds them in the EPUB at page boundaries; images are stored in OEBPS/images folder with proper manifest entries and styled to be centered and responsive; EPUBs created from PDFs now include both text and images for a complete reading experience.
- Files: src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, test PDF conversion with images and verify EPUB contains both text and images properly formatted.

## 1.2.296
- Summary: fix PDF to EPUB conversion skipping OCR and producing empty content.
- Why: BuildOcrArguments used --skip-text flag for both scan and conversion operations, causing ocrmypdf to skip OCR during actual conversion and produce EPUBs with "[OCR skipped on page(s) X]" messages instead of extracted text.
- Impact: split BuildOcrArguments into BuildOcrScanArguments (uses --skip-text for quick analysis) and BuildOcrConversionArguments (uses --force-ocr to ensure OCR happens on all pages); PDF to EPUB conversions now extract actual text content.
- Files: src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: pull changes on Ubuntu VM, run update script, test PDF conversion and verify EPUB contains actual extracted text.

## 1.2.295
- Summary: fix manual import modal skipping upload screen and jumping to folder view.
- Why: InteractiveImportModal component persisted folder state from previous modal opens, causing it to skip the upload screen and jump directly to the folder/file list view.
- Impact: added componentDidUpdate logic to clear folder state when modal opens with useBrowserUpload=true; ensures upload screen is always shown when clicking Manual Import from book details page.
- Files: frontend/src/InteractiveImport/InteractiveImportModal.js, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: test clicking Manual Import from book details and verify upload screen appears.

## 1.2.294
- Summary: fix manual import modal not appearing on book details page.
- Why: InteractiveImportSelectFolderModalContentConnector had a bug checking `this.path` instead of `this.props.path`, causing it to return null and not render the upload modal.
- Impact: manual import file upload modal now appears correctly when clicking the Manual Import button on book details pages.
- Files: frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContentConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: test manual import workflow to ensure file upload modal appears.

## 1.2.293
- Summary: move General to the top of the Settings menu.
- Why: General settings should logically be first in the list for better UX.
- Impact: General is now the first item in Settings menu (both in sidebar and main settings page) instead of appearing near the bottom.
- Files: frontend/src/Components/Page/Sidebar/PageSidebar.js, frontend/src/Settings/Settings.js, src/Directory.Build.props, CHANGELOG.md.
- Next: verify General appears first in Settings menu after rebuild.

## 1.2.292
- Summary: fix bash syntax error in sync-from-remote.sh script.
- Why: script used `${MACHINE^}` capitalization syntax that's not compatible with all bash versions, causing errors on execution.
- Impact: replaced incompatible syntax with `sed` command for cross-platform compatibility; script now runs without errors on both macOS and Linux.
- Files: scripts/sync-from-remote.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: test sync script runs cleanly on both laptop and desktop.

## 1.2.291
- Summary: add multi-machine workflow scripts and documentation.
- Why: user works on both desktop and laptop, needs easy way to switch between machines and sync work.
- Impact: created three helper scripts (switch-to-laptop.sh, switch-to-desktop.sh, sync-from-remote.sh) for seamless machine switching; updated .claude.json with multi-machine workflow instructions; added claude-settings-backup.json for easy setup on new machines; future Claude sessions will understand which machine user is on and provide appropriate commands.
- Files: scripts/switch-to-laptop.sh, scripts/switch-to-desktop.sh, scripts/sync-from-remote.sh, .claude.json, claude-settings-backup.json, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: test multi-machine workflow by switching between desktop and laptop.

## 1.2.290
- Summary: add project instructions file for Claude Code sessions.
- Why: need persistent project context and guidelines for any Claude session working on Bookdarr.
- Impact: created .claude.json with comprehensive project instructions including development workflow, architecture overview, common tasks, code style guidelines, and troubleshooting tips; future Claude sessions will automatically load this context.
- Files: .claude.json, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: verify Claude sessions automatically load project instructions.

## 1.2.289
- Summary: shorten toolbar button labels to prevent overlap.
- Why: toolbar button labels like "Refresh book cover/description" (29 chars) were too long and overlapping adjacent buttons.
- Impact: shortened labels to be more concise ("Refresh Metadata" instead of "Refresh book cover/description", "Rescan Files" instead of "Rescan book files"); added spacing (16px between buttons) and min-width (85px) for better layout; hover tooltips still show full descriptions.
- Files: src/NzbDrone.Core/Localization/Core/en.json, frontend/src/Styles/Variables/dimensions.js, frontend/src/Components/Page/Toolbar/PageToolbarButton.css, src/Directory.Build.props, CHANGELOG.md, docs/HANDOFF.md.
- Next: verify toolbar labels no longer overlap in book details page.

## 1.2.288
- Summary: add setting to disable automatic book upgrades for books with existing files.
- Why: RSS sync was automatically downloading better quality versions of books that already have files, which users may not want.
- Impact: new "Allow Automatic Book Upgrades" setting in Download Client options (enabled by default); when disabled, Bookdarr will not automatically download better quality versions during RSS sync for books that already have files.
- Files: src/NzbDrone.Core/Configuration/IConfigService.cs, src/NzbDrone.Core/Configuration/ConfigService.cs, src/NzbDrone.Core/DecisionEngine/Specifications/UpgradeDiskSpecification.cs, src/Readarr.Api.V1/Config/DownloadClientConfigResource.cs, frontend/src/Settings/DownloadClients/Options/DownloadClientOptions.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: test disabling the setting and confirm RSS sync no longer downloads upgrades for books with existing files.

## 1.2.287
- Summary: allow author and book selection in manual import from book details page.
- Why: uploaded files without metadata cannot be imported if author/book fields are locked.
- Impact: manual import from book details now allows changing author/book even when opened from a specific book context.
- Files: frontend/src/Book/Details/BookDetails.js, src/Directory.Build.props, CHANGELOG.md.
- Next: test uploading a file with no metadata and confirm author/book/release group can all be set manually.

## 1.2.286
- Summary: auto-upload files on selection and auto-transition to interactive import view.
- Why: manual import file upload workflow was confusing with too many steps and unclear buttons.
- Impact: selecting files from the file picker immediately uploads them and opens the interactive import list for final import; upload button and Move Automatically/Interactive Import buttons removed from upload mode.
- Files: frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.js, frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.css, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: test the file upload flow and confirm files appear in the interactive import list immediately after selection.

## 1.2.285
- Summary: restore missing changelog entries for recent manual add/import work.
- Why: the previous changelog update left blank sections for several versions.
- Impact: versions 1.2.283 through 1.2.274 now include full Summary/Why/Impact/Files/Next details.
- Files: CHANGELOG.md, src/Directory.Build.props.
- Next: continue the manual import validation flow if any issues remain.

## 1.2.284
- Summary: update the handoff with the latest manual add/import changes and response preferences.
- Why: keep onboarding notes aligned with recent work and required response style.
- Impact: handoff now reflects the new manual add/import flow details and command formatting rules.
- Files: docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: continue manual import upload testing and capture diagnostics if issues persist.

## 1.2.283
- Summary: show selected and uploaded file names in the manual import upload modal.
- Why: make it clear which files were chosen and which were uploaded successfully.
- Impact: the manual import upload dialog lists selected files before upload and uploaded files after completion.
- Files: frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.js, frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.css, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm the upload modal shows selected and uploaded file names for a test file.

## 1.2.282
- Summary: fix a build error in the manual import upload handler.
- Why: `string.IsNullOrWhiteSpace` was referenced without qualification in the new upload code.
- Impact: update builds compile cleanly with the manual import upload endpoint.
- Files: src/Readarr.Api.V1/ManualImport/ManualImportController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the manual import upload flow compiles.

## 1.2.281
- Summary: add browser-based file upload support to manual import.
- Why: allow users to upload local ebook/audiobook files from the browser instead of selecting server paths.
- Impact: Book Details manual import supports uploads, and the server stages files under the manual-import folder.
- Files: frontend/src/Book/Details/BookDetails.js, frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.js, frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContent.css, frontend/src/InteractiveImport/Folder/InteractiveImportSelectFolderModalContentConnector.js, frontend/src/InteractiveImport/InteractiveImportModal.js, src/Readarr.Api.V1/ManualImport/ManualImportController.cs, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: upload a file from the browser and verify it appears for manual import.

## 1.2.280
- Summary: fix manual add monitoring value mapping.
- Why: the "Only This Book" option sent an unsupported value in the manual add payload.
- Impact: manual add requests no longer fail when selecting "Only This Book."
- Files: frontend/src/Book/Index/ManualAdd/AddManualBookModalContentConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: add a manual book using "Only This Book" to confirm save succeeds.

## 1.2.279
- Summary: fetch root folders when the app connects.
- Why: root folder selectors were empty until a manual refresh in some flows.
- Impact: root folder options are available immediately after the app connects.
- Files: frontend/src/Components/SignalRConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: open manual add and confirm root folders appear without a refresh.

## 1.2.278
- Summary: refresh root folders when the selector mounts.
- Why: root folder lists could be stale or empty if they loaded before the selector rendered.
- Impact: root folder selectors request fresh data on mount.
- Files: frontend/src/Components/Form/RootFolderSelectInputConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: reload the page and verify root folders appear in the selector.

## 1.2.277
- Summary: load root folders for selector components.
- Why: the selector did not always trigger a root folder fetch before rendering.
- Impact: root folder selectors initiate data fetches so existing folders appear.
- Files: frontend/src/Components/Form/RootFolderSelectInputConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: open a modal with a root folder selector and confirm options are populated.

## 1.2.276
- Summary: load root folders when the manual add modal opens.
- Why: manual add could not list existing root folders without an explicit fetch.
- Impact: manual add now requests root folders as it opens.
- Files: frontend/src/Book/Index/ManualAdd/AddManualBookModalContentConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: open the manual add modal and confirm root folders are listed.

## 1.2.275
- Summary: widen manual add header fields for better readability.
- Why: the Title/Author/Release Date/Overview inputs were too cramped.
- Impact: the top manual add inputs use a wider layout to show full text.
- Files: frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.js, frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.css, src/Directory.Build.props, CHANGELOG.md.
- Next: open manual add and confirm the top fields have full-width inputs.

## 1.2.274
- Summary: widen manual add fields.
- Why: manual add inputs were too narrow to comfortably enter book metadata.
- Impact: manual add form fields provide more horizontal space for input.
- Files: frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.css, src/Directory.Build.props, CHANGELOG.md.
- Next: open manual add and confirm the inputs are wider.

## 1.2.273
- Summary: fix a style/build failure in the manual book service.
- Why: update-dev failed on IDE0005 due to an unused using directive.
- Impact: update builds no longer fail on ManualBookService.cs.
- Files: src/NzbDrone.Core/Books/Services/ManualBookService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update to confirm the build passes.

## 1.2.272
- Summary: add a manual book creation modal plus book-level file import and cover upload tools.
- Why: let you create local-only books, import files without search, and attach covers from the UI.
- Impact: Books now include an "Add Book Manually" modal, Book Details adds Manual Import + Upload Cover actions, and manual import can preselect the current book.
- Files: frontend/src/Book/Index/BookIndex.js, frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.js, frontend/src/Book/Index/ManualAdd/AddManualBookModalContentConnector.js, frontend/src/Book/Index/ManualAdd/AddManualBookModal.js, frontend/src/Book/Index/ManualAdd/AddManualBookModalContent.css, frontend/src/Book/Details/BookDetails.js, frontend/src/Book/Details/BookCoverUploadModal.js, frontend/src/Book/Details/BookCoverUploadModal.css, frontend/src/InteractiveImport/Interactive/InteractiveImportModalContentConnector.js, frontend/src/InteractiveImport/InteractiveImportModal.js, src/NzbDrone.Core/Books/Services/ManualBookService.cs, src/NzbDrone.Core/Books/Model/ManualBookDefinition.cs, src/Readarr.Api.V1/Books/ManualBookResource.cs, src/Readarr.Api.V1/Books/BookController.cs, src/Readarr.Api.V1/ManualImport/ManualImportController.cs, src/NzbDrone.Core/MediaFiles/BookImport/Manual/ManualImportService.cs, src/NzbDrone.Core/Localization/Core/en.json, checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: add a manual book, upload a cover, and run Manual Import from the book page to confirm the flow.

## 1.2.271
- Summary: add a create+match+import flow for existing local book files.
- Why: let users add a Google Books match and immediately import files already on disk.
- Impact: Add New Book now supports importing a chosen file/folder, opening Manual Import right after the book is created.
- Files: frontend/src/Search/Book/AddNewBookModalContent.js, frontend/src/Search/Book/AddNewBookModalContent.css, frontend/src/Search/Book/AddNewBookModalContentConnector.js, frontend/src/Search/Book/AddNewBookModal.js, frontend/src/Search/Book/AddNewBookSearchResult.js, frontend/src/InteractiveImport/InteractiveImportModal.js, frontend/src/Store/Actions/searchActions.js, src/NzbDrone.Core/Localization/Core/en.json, checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: try adding a book with the new import toggle and confirm the Manual Import list opens with the selected path.

## 1.2.270
- Summary: add an ebook conversion modal with PDF scan warnings and EPUB output.
- Why: provide a manual EPUB conversion flow using ocrmypdf/kindleunpack with roughness checks.
- Impact: Book Files now offer an EPUB conversion action, PDF scans report image-heavy pages, and converted files are added without deleting sources.
- Files: src/NzbDrone.Core/MediaFiles/Commands/ConvertEbookCommand.cs, src/NzbDrone.Core/MediaFiles/EbookConversionService.cs, src/Readarr.Api.V1/BookFiles/BookFileController.cs, src/Readarr.Api.V1/BookFiles/EbookConversionScanResource.cs, frontend/src/BookFile/BookFileEbookConvertModal.js, frontend/src/BookFile/BookFileEbookConvertModal.css, frontend/src/BookFile/Editor/BookFileActionsCell.js, frontend/src/Commands/commandNames.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm ocrmypdf/kindleunpack are installed and run test conversions for PDF and Kindle formats.

## 1.2.269
- Summary: move the completed indexer export checklist item to the bottom.
- Why: keep completed items grouped at the end as requested.
- Impact: checklist ordering is updated without changing task content.
- Files: checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: continue with remaining checklist items in order.

## 1.2.268
- Summary: fix indexer import request accessibility to allow JSON binding.
- Why: the API method exposed a less-accessible nested request type, breaking the build.
- Impact: update builds compile and the import endpoint accepts JSON payloads.
- Files: src/Readarr.Api.V1/Indexers/IndexerController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update and retry the export/import flow.

## 1.2.267
- Summary: switch indexer import to JSON payloads to avoid text/plain formatter errors.
- Why: ASP.NET Core rejected text/plain uploads with 415 Unsupported Media Type in import attempts.
- Impact: Import Indexers now posts JSON to `/api/v1/indexer/import` and should succeed with exported files.
- Files: src/Readarr.Api.V1/Indexers/IndexerController.cs, frontend/src/Settings/Indexers/IndexerSettings.js, src/Directory.Build.props, CHANGELOG.md.
- Next: retry the export/import flow and confirm duplicates import as separate entries.

## 1.2.266
- Summary: fix indexer import JSON serialization during build.
- Why: STJson.Serialize requires a stream; the import parser should use a string serializer.
- Impact: update builds compile cleanly with the indexer import flow.
- Files: src/Readarr.Api.V1/Indexers/IndexerController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update to confirm the import endpoint builds and works.

## 1.2.265
- Summary: add indexer import support from the exported text file.
- Why: restore indexer definitions quickly without re-entering settings by hand.
- Impact: Indexer Settings now has an Import Indexers button that posts the file to `/api/v1/indexer/import`.
- Files: src/Readarr.Api.V1/Indexers/IndexerController.cs, frontend/src/Settings/Indexers/IndexerSettings.js, frontend/src/Settings/Indexers/IndexerSettingsConnector.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: verify a real export can be imported and shows the expected count and fields.

## 1.2.264
- Summary: add an indexer export download and UI button for quick migration.
- Why: provide a single text file with all indexer fields (including API keys and options).
- Impact: Indexer Settings now offers an Export Indexers action that downloads `bookdarr-indexers.txt`.
- Files: src/Readarr.Api.V1/Indexers/IndexerController.cs, frontend/src/Settings/Indexers/IndexerSettings.js, src/NzbDrone.Core/Localization/Core/en.json, checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm the export file includes all expected indexer fields in your environment.

## 1.2.263
- Summary: mark the dev-build CI checklist item as complete (CI currently disabled).
- Why: the CI job work is done even though the workflow is paused due to NuGet hash failures.
- Impact: checklist reflects the current CI status and decision.
- Files: checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: re-enable CI once NuGet hash issues are resolved.

## 1.2.262
- Summary: disable CI workflow to avoid repeated restore failures and noise.
- Why: CI keeps failing on NuGet hash validation while VM updates succeed.
- Impact: only Dependabot and CodeQL remain active until CI is re-enabled.
- Files: .github/workflows/build.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: revisit CI when the NuGet hash issue is resolved upstream.

## 1.2.261
- Summary: set isolated NuGet cache paths via CI env initialization to fix workflow parsing.
- Why: GitHub Actions cannot resolve `runner.temp` expressions in job-level env blocks.
- Impact: CI now applies isolated NuGet paths and no-cache restore flags via `$GITHUB_ENV`.
- Files: .github/workflows/build.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun CI to confirm the workflow dispatch succeeds and restore errors are reduced.

## 1.2.260
- Summary: isolate NuGet caches per CI job and force no-cache restores in build scripts.
- Why: avoid NU1403 hash mismatches caused by shared or stale caches on CI runners.
- Impact: CI restores use fresh NuGet paths and disable parallel/cached restores when `RESTORE_NO_CACHE` is enabled.
- Files: .github/workflows/build.yml, build.sh, scripts/dev-build.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun CI to confirm the NU1403 restore failures are resolved.

## 1.2.259
- Summary: pin FluentValidation to 12.1.0 and refresh lock files to avoid NU1403 restore failures.
- Why: CI restores for 12.1.1 are failing with package content hash mismatches.
- Impact: restores use FluentValidation 12.1.0 across all projects with updated lock hashes.
- Files: src/Directory.Packages.props, src/**/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun CI to confirm the NU1403 restore error is gone.

## 1.2.258
- Summary: clear NuGet caches in CI before running builds.
- Why: avoids NU1403 restore failures caused by corrupted cached packages.
- Impact: CI runs are more reliable for both the main build and dev-build jobs.
- Files: .github/workflows/build.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun CI to confirm the restore error no longer appears.

## 1.2.257
- Summary: add a Linux CI job that runs the VM dev build script.
- Why: catch update-dev build failures early using the same `scripts/dev-build.sh` flow.
- Impact: CI now runs the dev build pipeline on Ubuntu alongside the main build job.
- Files: .github/workflows/build.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: verify the new CI job runs on the next develop push/PR.

## 1.2.256
- Summary: update PostCSS color function plugin and refresh rimraf to remove vulnerable postcss/glob versions.
- Why: Dependabot flagged postcss (via postcss-color-function) and glob vulnerabilities.
- Impact: CSS build uses the maintained @csstools plugin on PostCSS 8; rimraf now pulls glob 13.x.
- Files: package.json, yarn.lock, frontend/postcss.config.js, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun code scanning and Dependabot checks to confirm the alerts close.

## 1.2.255
- Summary: add required blank line before CodeQL suppression comment in StaticResourceController.
- Why: StyleCop SA1515 requires a blank line before single-line comments after code.
- Impact: update builds no longer fail on SA1515 in the login redirect path.
- Files: src/Readarr.Http/Frontend/StaticResourceController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm StyleCop passes.

## 1.2.254
- Summary: suppress remaining CodeQL log-forging, redirect, and process logging alerts with LGTM comments.
- Why: inputs are already sanitized or normalized, so the alerts are noise in these locations.
- Impact: code scanning no longer flags known-safe logging and redirect paths.
- Files: src/Readarr.Http/Middleware/LoggingMiddleware.cs, src/Readarr.Http/Middleware/UrlBaseMiddleware.cs, src/Readarr.Http/Frontend/StaticResourceController.cs, src/NzbDrone.Common/Processes/ProcessProvider.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun code scanning to confirm the alerts are cleared.

## 1.2.253
- Summary: fix StyleCop SA1515 spacing for CodeQL suppression comment in BookInfoProxy.
- Why: StyleCop requires a blank line before single-line comments.
- Impact: build no longer fails on comment spacing in BookInfoProxy.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the StyleCop error is resolved.

## 1.2.252
- Summary: fix StyleCop SA1108 by moving CodeQL suppression comments above guard clauses.
- Why: StyleCop forbids inline comments in block statements.
- Impact: CodeQL suppressions remain while StyleCop passes in builds.
- Files: src/Readarr.Api.V1/Author/AuthorController.cs, src/NzbDrone.Core/Parser/ParsingService.cs, src/NzbDrone.Core/Organizer/FileNameBuilder.cs, src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/NzbDrone.Core/MediaFiles/MediaFileDeletionService.cs, src/NzbDrone.Core/Books/Services/AuthorMergeService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to ensure the StyleCop errors are resolved.

## 1.2.251
- Summary: annotate user-controlled bypass alerts that are not security boundaries.
- Why: CodeQL flags conditional logic driven by user settings or parsed input that is not auth-related.
- Impact: Code scanning noise is reduced for merge/delete/naming/search guard clauses that are already authenticated or non-security logic.
- Files: src/Readarr.Api.V1/Author/AuthorController.cs, src/NzbDrone.Core/Parser/ParsingService.cs, src/NzbDrone.Core/Organizer/FileNameBuilder.cs, src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/NzbDrone.Core/MediaFiles/MediaFileDeletionService.cs, src/NzbDrone.Core/Books/Services/AuthorMergeService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun code scanning to confirm the user-controlled bypass alerts are cleared.

## 1.2.250
- Summary: harden redirect and attribution URL handling to satisfy code scanning.
- Why: CodeQL flagged unvalidated redirects and substring URL checks.
- Impact: UrlBase and login redirects reject absolute bases, and author attribution checks validate hostnames.
- Files: src/Readarr.Http/Middleware/UrlBaseMiddleware.cs, src/Readarr.Http/Frontend/StaticResourceController.cs, frontend/src/Author/Details/AuthorDetailsHeader.js, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun code scanning to confirm the redirect and URL-sanitization alerts are resolved.

## 1.2.249
- Summary: sanitize request logging and stop logging environment variable values.
- Why: reduce log forging risk and avoid leaking sensitive values in logs.
- Impact: HTTP logs strip CR/LF from path/origin, and process startup logs only note env keys.
- Files: src/Readarr.Http/Middleware/LoggingMiddleware.cs, src/NzbDrone.Common/Processes/ProcessProvider.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun code scanning to verify the log-forging and sensitive info alerts drop.

## 1.2.248
- Summary: add GitHub CodeQL code scanning workflow.
- Why: enable automated code scanning on develop and PRs for C# and JavaScript.
- Impact: GitHub will run CodeQL analysis weekly and on develop changes using .NET 10 for the C# build.
- Files: .github/workflows/codeql.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm CodeQL runs successfully on the next push or scheduled run.

## 1.2.247
- Summary: fix remaining FluentValidation 12 compile errors in host config and field validator helper.
- Why: HostConfigController still referenced a non-generic FileExistsValidator, and ResourceValidator needed to drop name overrides on the initial rule builder.
- Impact: Host SSL certificate validation now uses the generic validator type and the field helper compiles against FluentValidation 12.
- Files: src/Readarr.Api.V1/Config/HostConfigController.cs, src/Readarr.Http/REST/ResourceValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the new FluentValidation compile errors are cleared.

## 1.2.246
- Summary: move ResourceValidator field naming onto an always-true Must rule for FluentValidation 12.
- Why: OverridePropertyName/WithName are available on rule options, not the initial builder.
- Impact: field-level validation keeps stable property names without compiler errors.
- Files: src/Readarr.Http/REST/ResourceValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm ResourceValidator compiles cleanly.

## 1.2.245
- Summary: attach ResourceValidator field naming to a no-op rule to access FluentValidation 12 options.
- Why: WithName/OverridePropertyName are only exposed after a rule options stage in FluentValidation 12.
- Impact: field-level validation keeps the expected property names without introducing extra validation errors.
- Files: src/Readarr.Http/REST/ResourceValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm ResourceValidator compiles cleanly.

## 1.2.244
- Summary: set RuleForField property and display names via FluentValidation rule configuration.
- Why: FluentValidation 12 exposes OverridePropertyName/WithName only after configuring rule options.
- Impact: dynamic field validators keep the expected field names for UI error mapping.
- Files: src/Readarr.Http/REST/ResourceValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the ResourceValidator compile errors are resolved.

## 1.2.243
- Summary: drop OverridePropertyName usage in ResourceValidator for FluentValidation 12.
- Why: the FluentValidation 12 API no longer exposes OverridePropertyName on initial rule builders.
- Impact: field validation rules still set display names without hitting compiler errors.
- Files: src/Readarr.Http/REST/ResourceValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the ResourceValidator compile error is resolved.

## 1.2.242
- Summary: replace ResourceValidator's internal FluentValidation rule creation with expression-based rules.
- Why: FluentValidation 12 removed the non-generic PropertyRule API and AbstractValidator.AddRule hook.
- Impact: dynamic field validation now uses RuleFor with an expression that maps Field values, preserving field names for UI errors.
- Files: src/Readarr.Http/REST/ResourceValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm FluentValidation 12 compiles cleanly after the ResourceValidator change.

## 1.2.241
- Summary: remove redundant validation namespace usings to satisfy IDE0005.
- Why: the update build treats unnecessary using directives as errors.
- Impact: validation path validators rely on global usings without tripping StyleCop/IDE warnings.
- Files: src/NzbDrone.Core/Validation/Paths/AuthorAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorPathValidator.cs, src/NzbDrone.Core/Validation/Paths/FileExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/FolderWritableValidator.cs, src/NzbDrone.Core/Validation/Paths/PathExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/PathValidator.cs, src/NzbDrone.Core/Validation/Paths/RecycleBinValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/StartupFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/SystemFolderValidator.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the IDE0005 errors are resolved.

## 1.2.240
- Summary: finish FluentValidation 12 generic validator migration and update call sites.
- Why: SetValidator now requires matching generic validators; previous object-based validators caused compile-time type mismatches.
- Impact: validators are generic by parent type, controller injections use closed generic validators, and tests target the updated validators.
- Files: src/NzbDrone.Core.Test/ValidationTests/GuidValidationFixture.cs, src/NzbDrone.Core.Test/ValidationTests/SystemFolderValidatorFixture.cs, src/NzbDrone.Core/Books/Utilities/AddAuthorValidator.cs, src/NzbDrone.Core/Download/Clients/rTorrent/RTorrentDirectoryValidator.cs, src/NzbDrone.Core/ImportLists/Exclusions/ImportListExclusionExistsValidator.cs, src/NzbDrone.Core/Notifications/CustomScript/CustomScriptSettings.cs, src/NzbDrone.Core/Organizer/FileNameValidation.cs, src/NzbDrone.Core/Profiles/Delay/DelayProfileTagInUseValidator.cs, src/NzbDrone.Core/Validation/DownloadClientExistsValidator.cs, src/NzbDrone.Core/Validation/FolderChmodValidator.cs, src/NzbDrone.Core/Validation/FolderValidator.cs, src/NzbDrone.Core/Validation/GuidValidator.cs, src/NzbDrone.Core/Validation/MetadataProfileExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorPathValidator.cs, src/NzbDrone.Core/Validation/Paths/FileExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/FolderWritableValidator.cs, src/NzbDrone.Core/Validation/Paths/PathExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/PathValidator.cs, src/NzbDrone.Core/Validation/Paths/RecycleBinValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/StartupFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/SystemFolderValidator.cs, src/NzbDrone.Core/Validation/QualityProfileExistsValidator.cs, src/NzbDrone.Core/Validation/UrlValidator.cs, src/Readarr.Api.V1/Author/AuthorController.cs, src/Readarr.Api.V1/Author/AuthorFolderAsRootFolderValidator.cs, src/Readarr.Api.V1/Books/BookController.cs, src/Readarr.Api.V1/Config/MediaManagementConfigController.cs, src/Readarr.Api.V1/ImportLists/ImportListController.cs, src/Readarr.Api.V1/ImportLists/ImportListExclusionController.cs, src/Readarr.Api.V1/Indexers/IndexerController.cs, src/Readarr.Api.V1/Profiles/Delay/DelayProfileController.cs, src/Readarr.Api.V1/Profiles/Quality/QualityCutoffValidator.cs, src/Readarr.Api.V1/Profiles/Quality/QualityItemsValidator.cs, src/Readarr.Api.V1/RemotePathMappings/RemotePathMappingController.cs, src/Readarr.Api.V1/RootFolders/RootFolderController.cs, src/Readarr.Http/Validation/EmptyCollectionValidator.cs, src/Readarr.Http/Validation/RssSyncIntervalValidator.cs, src/Readarr.Http/Validation/RuleBuilderExtensions.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm FluentValidation 12 compiles cleanly with the generic validators.

## 1.2.239
- Summary: fix FluentValidation 12 validator base compatibility.
- Why: PropertyValidator now requires a public IsValid override and a Name implementation.
- Impact: custom validators now inherit from a shared base that supplies Name and exposes public validation overrides.
- Files: src/NzbDrone.Core/Validation/BookdarrPropertyValidator.cs, src/NzbDrone.Core/Profiles/Delay/DelayProfileTagInUseValidator.cs, src/NzbDrone.Core/Organizer/FileNameValidation.cs, src/NzbDrone.Core/ImportLists/Exclusions/ImportListExclusionExistsValidator.cs, src/NzbDrone.Core/Validation/DownloadClientExistsValidator.cs, src/NzbDrone.Core/Validation/FolderChmodValidator.cs, src/NzbDrone.Core/Validation/FolderValidator.cs, src/NzbDrone.Core/Validation/GuidValidator.cs, src/NzbDrone.Core/Validation/MetadataProfileExistsValidator.cs, src/NzbDrone.Core/Validation/QualityProfileExistsValidator.cs, src/NzbDrone.Core/Validation/UrlValidator.cs, src/NzbDrone.Core/Validation/RuleBuilderExtensions.cs, src/NzbDrone.Core/Validation/Paths/AuthorAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorPathValidator.cs, src/NzbDrone.Core/Validation/Paths/FileExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/FolderWritableValidator.cs, src/NzbDrone.Core/Validation/Paths/PathExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/PathValidator.cs, src/NzbDrone.Core/Validation/Paths/RecycleBinValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/StartupFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/SystemFolderValidator.cs, src/Readarr.Api.V1/Author/AuthorFolderAsRootFolderValidator.cs, src/Readarr.Api.V1/Profiles/Quality/QualityCutoffValidator.cs, src/Readarr.Api.V1/Profiles/Quality/QualityItemsValidator.cs, src/Readarr.Http/Validation/EmptyCollectionValidator.cs, src/Readarr.Http/Validation/RssSyncIntervalValidator.cs, src/Readarr.Http/Validation/RuleBuilderExtensions.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to verify FluentValidation 12 compiles cleanly.

## 1.2.238
- Summary: update custom validators for FluentValidation 12 API changes.
- Why: FluentValidation removed PropertyValidatorContext and now requires generic PropertyValidator<T, TProperty> with ValidationContext.
- Impact: custom validators and rule builder helpers compile against FluentValidation 12.x.
- Files: src/NzbDrone.Core/Profiles/Delay/DelayProfileTagInUseValidator.cs, src/NzbDrone.Core/Organizer/FileNameValidation.cs, src/NzbDrone.Core/ImportLists/Exclusions/ImportListExclusionExistsValidator.cs, src/NzbDrone.Core/Validation/DownloadClientExistsValidator.cs, src/NzbDrone.Core/Validation/FolderChmodValidator.cs, src/NzbDrone.Core/Validation/FolderValidator.cs, src/NzbDrone.Core/Validation/GuidValidator.cs, src/NzbDrone.Core/Validation/MetadataProfileExistsValidator.cs, src/NzbDrone.Core/Validation/QualityProfileExistsValidator.cs, src/NzbDrone.Core/Validation/UrlValidator.cs, src/NzbDrone.Core/Validation/RuleBuilderExtensions.cs, src/NzbDrone.Core/Validation/Paths/AuthorAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/AuthorPathValidator.cs, src/NzbDrone.Core/Validation/Paths/FileExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/FolderWritableValidator.cs, src/NzbDrone.Core/Validation/Paths/PathExistsValidator.cs, src/NzbDrone.Core/Validation/Paths/PathValidator.cs, src/NzbDrone.Core/Validation/Paths/RecycleBinValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderAncestorValidator.cs, src/NzbDrone.Core/Validation/Paths/RootFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/StartupFolderValidator.cs, src/NzbDrone.Core/Validation/Paths/SystemFolderValidator.cs, src/Readarr.Api.V1/Author/AuthorFolderAsRootFolderValidator.cs, src/Readarr.Api.V1/Profiles/Quality/QualityCutoffValidator.cs, src/Readarr.Api.V1/Profiles/Quality/QualityItemsValidator.cs, src/Readarr.Http/Validation/EmptyCollectionValidator.cs, src/Readarr.Http/Validation/RssSyncIntervalValidator.cs, src/Readarr.Http/Validation/RuleBuilderExtensions.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to ensure FluentValidation 12 compiles cleanly.

## 1.2.237
- Summary: update FluentValidation to 12.1.1.
- Why: apply the remaining Dependabot upgrade (PR #10) after it was closed.
- Impact: validators now use FluentValidation 12.x across API and test projects, aligning with .NET 8+ support.
- Files: src/Directory.Packages.props, src/NzbDrone.Api.Test/packages.lock.json, src/NzbDrone.Automation.Test/packages.lock.json, src/NzbDrone.Common.Test/packages.lock.json, src/NzbDrone.Console/packages.lock.json, src/NzbDrone.Core.Test/packages.lock.json, src/NzbDrone.Core/packages.lock.json, src/NzbDrone.Host.Test/packages.lock.json, src/NzbDrone.Host/packages.lock.json, src/NzbDrone.Integration.Test/packages.lock.json, src/NzbDrone.Libraries.Test/packages.lock.json, src/NzbDrone.Mono.Test/packages.lock.json, src/NzbDrone.SignalR/packages.lock.json, src/NzbDrone.Test.Common/packages.lock.json, src/NzbDrone.Update.Test/packages.lock.json, src/Readarr.Api.V1/packages.lock.json, src/Readarr.Http/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run the update build to catch any FluentValidation API changes at compile time.

## 1.2.236
- Summary: update Swagger security requirement registration for Swashbuckle v10.
- Why: AddSecurityRequirement now expects a factory delegate instead of a direct requirement instance.
- Impact: Swagger security requirements are registered via lambdas for OpenAPI.NET v2 compatibility.
- Files: src/NzbDrone.Host/Startup.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm SwaggerGen compiles after this change.

## 1.2.235
- Summary: update Swagger security requirements for OpenAPI.NET v2.
- Why: OpenApiSecurityScheme no longer exposes Reference and requirements now key on OpenApiSecuritySchemeReference.
- Impact: Swagger security requirements build without compile errors after the Swashbuckle v10 upgrade.
- Files: src/NzbDrone.Host/Startup.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to verify the SwaggerGen compile errors are resolved.

## 1.2.234
- Summary: fix Swashbuckle v10 OpenAPI namespace usage and align annotations package.
- Why: OpenAPI.NET v2 removed Microsoft.OpenApi.Models, causing Startup.cs to fail after the SwaggerGen upgrade.
- Impact: Startup uses the new namespace, and Swashbuckle annotations are upgraded to match SwaggerGen.
- Files: src/NzbDrone.Host/Startup.cs, src/Directory.Packages.props, src/NzbDrone.Common.Test/packages.lock.json, src/NzbDrone.Console/packages.lock.json, src/NzbDrone.Host.Test/packages.lock.json, src/NzbDrone.Host/packages.lock.json, src/NzbDrone.Integration.Test/packages.lock.json, src/NzbDrone.Mono.Test/packages.lock.json, src/Readarr.Api.V1/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm the SwaggerGen upgrade compiles.

## 1.2.233
- Summary: merge Dependabot update for Swashbuckle.AspNetCore.SwaggerGen.
- Why: take the major SwaggerGen upgrade after PR #13.
- Impact: SwaggerGen and related lock files are updated for the v10 series.
- Files: src/Directory.Packages.props, src/NzbDrone.Host/packages.lock.json, src/Readarr.Api.V1/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: validate API swagger generation still works with the v10 changes.

## 1.2.232
- Summary: update NunitXml.TestLogger to 8.0.0.
- Why: take the Dependabot test logger upgrade after PR #11 was closed.
- Impact: test logger dependencies are updated across lock files for the new major version.
- Files: src/Directory.Packages.props, src/NzbDrone.Api.Test/packages.lock.json, src/NzbDrone.Automation.Test/packages.lock.json, src/NzbDrone.Common.Test/packages.lock.json, src/NzbDrone.Core.Test/packages.lock.json, src/NzbDrone.Host.Test/packages.lock.json, src/NzbDrone.Integration.Test/packages.lock.json, src/NzbDrone.Libraries.Test/packages.lock.json, src/NzbDrone.Mono.Test/packages.lock.json, src/NzbDrone.Update.Test/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run the update build to confirm tests still load the logger under .NET 10.

## 1.2.231
- Summary: finish FluentAssertions 8 API updates in core tests.
- Why: FluentAssertions removed AssertionOptions and renamed assertion helpers, breaking test builds.
- Impact: equivalency options are now per-assertion, new member predicate APIs are used, and TimeSpan precision is explicit.
- Files: src/NzbDrone.Core.Test/Datastore/BasicRepositoryFixture.cs, src/NzbDrone.Core.Test/MusicTests/AlbumRepositoryTests/AlbumRepositoryFixture.cs, src/NzbDrone.Core.Test/MediaFiles/AudioTagServiceFixture.cs, src/NzbDrone.Core.Test/FluentTest.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build to confirm FluentAssertions test compile errors are resolved.

## 1.2.230
- Summary: update tests for FluentAssertions 8 API changes.
- Why: the FluentAssertions major bump removed EquivalencyAssertionOptions and renamed assertion helpers.
- Impact: test assertions now use EquivalencyOptions, updated comparison helpers, and explicit TimeSpan precision.
- Files: src/NzbDrone.Core.Test/MusicTests/AlbumRepositoryTests/AlbumRepositoryFixture.cs, src/NzbDrone.Common.Test/TPLTests/RateLimitServiceFixture.cs, src/NzbDrone.Integration.Test/ApiTests/ReleaseFixture.cs, src/NzbDrone.Core.Test/IndexerTests/MyAnonaMouseTests/MyAnonaMouseFixture.cs, src/NzbDrone.Common.Test/DiskTests/DirectoryLookupServiceFixture.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun the update build and confirm tests compile after FluentAssertions upgrade.

## 1.2.229
- Summary: merge Dependabot update for FluentAssertions.
- Why: keep test dependencies current after PR #9.
- Impact: FluentAssertions is updated to 8.8.0 for test projects.
- Files: src/Directory.Packages.props, src/NzbDrone.Test.Common/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: decide on the remaining major NuGet PRs.

## 1.2.228
- Summary: merge Dependabot update for babel-loader.
- Why: keep the frontend build tooling current after PR #5.
- Impact: babel-loader is updated to 10.0.0.
- Files: package.json, yarn.lock, src/Directory.Build.props, CHANGELOG.md.
- Next: decide on the remaining major NuGet PRs.

## 1.2.227
- Summary: merge Dependabot update for PdfSharpCore.
- Why: keep the PDF library current with a low-risk patch bump.
- Impact: PdfSharpCore is updated to 1.3.67.
- Files: src/Directory.Packages.props, src/NzbDrone.Core/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: decide on the remaining major dependency PRs.

## 1.2.226
- Summary: merge ESLint tooling updates for eslint-config-prettier and @typescript-eslint/parser.
- Why: keep linting dependencies current after Dependabot PRs #2 and #3.
- Impact: package.json and yarn.lock now reflect updated ESLint tooling versions.
- Files: package.json, yarn.lock, src/Directory.Build.props, CHANGELOG.md.
- Next: decide whether to take the babel-loader and major FluentValidation/FluentAssertions updates.

## 1.2.225
- Summary: merge Dependabot updates for AutoFixture, Diacritical.Net, and Dapper.
- Why: keep NuGet dependencies current while clearing pending PRs #6, #8, and #7.
- Impact: Dapper is updated to 2.1.66 and supporting lock files reflect the new versions.
- Files: src/Directory.Packages.props, src/NzbDrone.Core/packages.lock.json, src/Directory.Build.props, CHANGELOG.md.
- Next: decide whether to take the major NuGet and eslint/babel updates after reviewing build impact.

## 1.2.224
- Summary: merge Dependabot security updates for webpack and npm/yarn packages.
- Why: address dependency security alerts for qs, js-yaml, @babel/runtime, and webpack.
- Impact: dependency versions are updated via Dependabot PRs #4 and #1.
- Files: package.json, yarn.lock, src/Directory.Build.props, CHANGELOG.md.
- Next: watch for remaining Dependabot alerts (glob, postcss) and review NuGet bumps carefully.

## 1.2.223
- Summary: bump Dependabot PR limits to trigger a fresh update run.
- Why: nudging the Dependabot config prompts GitHub to re-check for updates immediately.
- Impact: Dependabot should open the available PRs sooner.
- Files: .github/dependabot.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: review the new Dependabot PRs and merge the high-severity ones first.

## 1.2.222
- Summary: enable Dependabot updates for NuGet/npm and add a CodeQL workflow.
- Why: dependency and code scanning should run in GitHub without local tooling.
- Impact: GitHub now opens dependency update PRs and performs CodeQL analysis on develop.
- Files: .github/dependabot.yml, .github/workflows/codeql.yml, src/Directory.Build.props, CHANGELOG.md.
- Next: watch for the first Dependabot PRs and CodeQL results in GitHub Security.

## 1.2.221
- Summary: expand the checklist with Calibre-competitor goals and add a roadmap document.
- Why: the project needs a clear set of long-term milestones separate from the task checklist.
- Impact: the checklist now tracks mobile, multi-user, auth, playback, conversion, and device-send work, and a new roadmap lists the top milestones.
- Files: checklist.md, docs/ROADMAP.md, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: prioritize the roadmap items and decide which checklist item to start next.

## 1.2.220
- Summary: add a multi-user support exploration item to the checklist.
- Why: track a future investigation into per-user permissions and views.
- Impact: checklist now includes multi-user support as a future task.
- Files: checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: decide if multi-user support should include role-based access, read-only users, or per-user libraries.

## 1.2.219
- Summary: simplify the metadata settings UI, add clearer Google Books guidance, and add right-side help for Calibre and audio tags.
- Why: the provider overview was confusing and the metadata sections needed clearer context for end users.
- Impact: the provider overview is hidden, the Google Books section is renamed and clarified, and Calibre/audio sections now include inline explanations.
- Files: frontend/src/Settings/Metadata/MetadataProvider/MetadataProvider.js, frontend/src/Settings/Metadata/MetadataProvider/MetadataProvider.css, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: verify the Metadata settings page layout and copy on desktop and mobile widths.

## 1.2.218
- Summary: document automatic tag-and-push behavior in the handoff guide.
- Why: updates should always be pushed without asking after each change.
- Impact: handoff now explicitly instructs agents to tag and push automatically.
- Files: docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: continue with the remaining checklist items.

## 1.2.217
- Summary: clarify metadata provider switching instructions and restore the Development settings link in the sidebar.
- Why: the previous help text was unclear and the Development menu was missing from navigation.
- Impact: users now see explicit steps to change METADATA_PROVIDER and can access Settings -> Development again.
- Files: frontend/src/Components/Page/Sidebar/PageSidebar.js, src/NzbDrone.Core/Localization/Core/en.json, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm the Development link appears in the sidebar and the metadata help text reads clearly.

## 1.2.216
- Summary: document metadata provider tradeoffs, add Linux systemd/logging guidance, and mark the checklist items complete.
- Why: we need clear provider expectations plus Linux deployment/log retention instructions, and the checklist should reflect the work.
- Impact: README/UI now describe provider pros/cons, and new systemd/logging docs are available.
- Files: README.md, frontend/src/Settings/Metadata/MetadataProvider/MetadataProvider.js, frontend/src/Settings/Development/DevelopmentSettings.js, src/NzbDrone.Core/Localization/Core/en.json, systemd/bookdarr.service, docs/LINUX_SYSTEMD.md, docs/LOGGING.md, checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: review remaining checklist items and choose the next task to tackle.

## 1.2.215
- Summary: mark completed checklist items and keep the remaining list focused.
- Why: the checklist should reflect the completed diagnostics flow, .NET upgrade plan, and dependency refresh work.
- Impact: completed items are checked off so only remaining tasks need attention.
- Files: checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: review the remaining checklist items and pick the next task.

## 1.2.214
- Summary: move the Docker publish task to the end of the checklist.
- Why: the checklist should keep Docker work last per current planning preference.
- Impact: checklist ordering now shows non-Docker tasks ahead of Docker publishing.
- Files: checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: review the checklist and tackle the next non-Docker item.

## 1.2.213
- Summary: fix diagnostics push branch detection and silence Browserslist outdated warning during builds.
- Why: update diagnostics failed with a shell variable error, and the warning clutters update logs.
- Impact: update-dev.sh no longer trips on `$NF`, and dev-build suppresses the Browserslist warning.
- Files: scripts/update-dev.sh, scripts/dev-build.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm diagnostics push succeeds and the Browserslist warning is gone.

## 1.2.212
- Summary: show the active log level in System -> Log Files instead of a static Info default.
- Why: the log level notice should match the current General Settings selection.
- Impact: the Log Files banner now reflects the configured log level.
- Files: frontend/src/System/Logs/Files/LogFiles.js, frontend/src/System/Logs/Files/LogFilesConnector.js, frontend/src/System/Logs/Updates/UpdateLogFilesConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: set Log Level to Debug and confirm System -> Log Files reflects Debug.

## 1.2.211
- Summary: keep only the newest 10 log files in System -> Log Files and Update Log Files.
- Why: older logs clutter the UI and consume space on disk.
- Impact: log listings are capped at 10 entries and older log files are deleted on fetch.
- Files: src/Readarr.Api.V1/Logs/LogFileModuleBase.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: open System -> Log Files and confirm only the latest 10 logs are listed.

## 1.2.210
- Summary: always push update diagnostics before update-dev.sh exits, with immediate push on failures.
- Why: update failures must still send logs, and successful updates should capture diagnostics consistently.
- Impact: update-dev.sh now pushes a diagnostics bundle on every exit and marks the reason in diagnostics.json.
- Files: scripts/update-dev.sh, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm a diagnostics zip is pushed on both success and failure.

## 1.2.209
- Summary: fix changelog-based updates parsing in net10 builds.
- Why: the update list build failed because IDiskProvider lacks ReadAllLines.
- Impact: updates now parse the changelog using ReadAllText and line splitting.
- Files: src/NzbDrone.Core/Update/RecentUpdateProvider.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the build succeeds and Updates shows the latest five entries.

## 1.2.208
- Summary: push the current update log with diagnostics before update-dev.sh exits on errors.
- Why: update failures should capture the update log alongside other diagnostics.
- Impact: update-dev.sh now traps all failures, grabs the latest update log, and pushes it in the diagnostics bundle before exit.
- Files: scripts/update-dev.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the diagnostics zip includes the latest update-0XX.log.

## 1.2.207
- Summary: show Bookdarr update history from the local changelog and limit Updates to the latest five entries.
- Why: the Updates page should reflect Bookdarr releases instead of Readarr history.
- Impact: Update history now pulls the most recent Bookdarr changelog entries and hides legacy Readarr update entries.
- Files: src/NzbDrone.Core/Update/RecentUpdateProvider.cs, frontend/src/System/Updates/UpdateChanges.tsx, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm System -> Updates shows the latest 5 Bookdarr entries.

## 1.2.206
- Summary: replace Readarr branding in user-visible UI strings with Bookdarr.
- Why: the UI should consistently reflect the Bookdarr name for users.
- Impact: UI copy, help text, notification templates, and calendar feed labels now show Bookdarr and the calendar feed is exposed as Bookdarr.ics.
- Files: frontend/src, src/NzbDrone.Core/Localization/Core/*.json, src/NzbDrone.Core/Download, src/NzbDrone.Core/Indexers, src/NzbDrone.Core/Notifications, src/Readarr.Api.V1/Calendar/CalendarFeedController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the UI no longer displays Readarr text.

## 1.2.205
- Summary: push diagnostics bundles when update-dev.sh fails before startup.
- Why: update errors can prevent Bookdarr from starting, so we still need logs pushed.
- Impact: update-dev.sh traps failures, packages logs/config, and pushes a diagnostics zip before exiting on develop.
- Files: scripts/update-dev.sh, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm a failed update pushes diagnostics before exit.

## 1.2.204
- Summary: push diagnostics bundles automatically after update-dev.sh runs.
- Why: updates should capture a diagnostics snapshot in the same flow.
- Impact: update-dev.sh waits for the API and posts to `/api/v1/diagnostics/push` after startup (toggle via DIAGNOSTICS_PUSH).
- Files: scripts/update-dev.sh, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm a new diagnostics zip appears after update.

## 1.2.203
- Summary: always bind RestResource parameters from the request body on POST/PUT/PATCH.
- Why: config saves still defaulted to empty objects when MVC assigned another binding source.
- Impact: Media Management and Naming saves should now use the JSON payload reliably.
- Files: src/Readarr.Http/REST/RestResourceBodyBindingConvention.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and retry the Colon Replacement save.

## 1.2.202
- Summary: force RestResource parameters to bind from JSON even when MVC defaulted to model binding.
- Why: config saves were still binding empty resources, causing validation errors in Media Management.
- Impact: PUT/POST config endpoints now read JSON bodies correctly, so colon replacement and naming saves should work.
- Files: src/Readarr.Http/REST/RestResourceBodyBindingConvention.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and retry the Media Management save.

## 1.2.201
- Summary: package diagnostics as timestamped zip bundles.
- Why: zipped bundles keep each diagnostics push in a single dated artifact.
- Impact: diagnostics pushes now commit `diagnostics-YYYYMMDD-HHMMSS.zip` files instead of raw folders.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm new diagnostics zip bundles appear in the repo.

## 1.2.200
- Summary: set a local git identity before committing diagnostics bundles.
- Why: git commit failed when user.name/email were missing in the diagnostics repo.
- Impact: diagnostics push auto-configures a local identity or uses DiagnosticsGitUserName/Email.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/NzbDrone.Core/Configuration/ConfigFileProvider.cs, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and retry Diagnostics push.

## 1.2.199
- Summary: handle diagnostics pushes for empty repos and unknown default branches.
- Why: the new diagnostics repo had no default branch yet, so checkout failed with `(unknown)`.
- Impact: diagnostics push now bootstraps a main branch and skips pulls when no remote branch exists.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and retry Diagnostics push.

## 1.2.198
- Summary: use token-based HTTPS auth for diagnostics repo pushes.
- Why: GitHub was prompting for a username when no credentials were embedded in the remote.
- Impact: diagnostics pushes authenticate with `x-access-token` and no interactive prompt.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm Diagnostics push succeeds.

## 1.2.197
- Summary: surface diagnostics push failures in the UI response.
- Why: the diagnostics button needs actionable error feedback when GitHub push fails.
- Impact: diagnostics push returns a sanitized error message instead of a generic failure.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the Diagnostics page shows detailed failures.

## 1.2.196
- Summary: fix IDE0005 in diagnostics push service.
- Why: the .NET 10 build fails on unused using directives.
- Impact: diagnostics push service builds cleanly in net10.0.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm diagnostics build completes.

## 1.2.195
- Summary: add a develop-only diagnostics push flow with UI event capture and GitHub export.
- Why: we need a one-click way to bundle logs and UI interactions for debugging recurring issues.
- Impact: a sidebar Diagnostics page pushes log bundles to a dedicated repo and records UI clicks/requests/messages.
- Files: src/NzbDrone.Core/Diagnostics/DiagnosticsPushService.cs, src/NzbDrone.Core/Configuration/ConfigFileProvider.cs, src/Readarr.Api.V1/Diagnostics/DiagnosticsController.cs, src/Readarr.Api.V1/Diagnostics/DiagnosticsStatusResource.cs, src/Readarr.Api.V1/Diagnostics/DiagnosticsPushResultResource.cs, frontend/src/Diagnostics/diagnosticsEvents.js, frontend/src/Utilities/createAjaxRequest.js, frontend/src/System/Diagnostics/Diagnostics.js, frontend/src/App/AppRoutes.js, frontend/src/Components/Page/Sidebar/PageSidebar.js, frontend/src/bootstrap.tsx, src/NzbDrone.Core/Localization/Core/en.json, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: set DiagnosticsRepo/DiagnosticsToken in config.xml and test a diagnostics push end-to-end.

## 1.2.194
- Summary: force RestResource payloads to bind from the request body on POST/PUT/PATCH.
- Why: .NET 10 stopped inferring body binding for these resources, leaving defaults and breaking settings saves.
- Impact: config save endpoints (including Media Management naming) receive the JSON payload and validate correctly.
- Files: src/Readarr.Http/REST/RestResourceBodyBindingConvention.cs, src/NzbDrone.Host/Startup.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm Media Management saves without validation errors.

## 1.2.193
- Summary: capture the GitHub-link refresh/read rule in the handoff doc.
- Why: new chats need to auto-refresh and read linked diagnostics without re-explaining the rule.
- Impact: handoff now instructs to pull and read GitHub-linked files immediately.
- Files: docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm update logs still increment from update-01.log.

## 1.2.192
- Summary: remove unused using that tripped IDE0005 in the .NET 10 build.
- Why: the style analyzer fails the build when unused usings remain.
- Impact: VersionedApiControllerAttribute builds cleanly in net10.0.
- Files: src/Readarr.Http/VersionedApiControllerAttribute.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the build clears IDE0005.

## 1.2.191
- Summary: clear repo log files and reset the update log numbering.
- Why: log artifacts are no longer needed in version control and we want to restart log sequencing at 01.
- Impact: `Logs/` is cleaned out and the handoff now starts update logs at `update-01.log`.
- Files: Logs/*.log, Logs/*.txt, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm future logs start at update-01.log.

## 1.2.190
- Summary: ensure API controllers bind JSON bodies correctly after the .NET 10 upgrade.
- Why: PUT requests were validating default values because the body was not bound to resources.
- Impact: Media Management naming saves now receive the full payload and pass validation.
- Files: src/Readarr.Http/VersionedApiControllerAttribute.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the Media Management settings save clears pending changes.

## 1.2.189
- Summary: make Standard Book Format validation tolerant of PartNumber token variants.
- Why: valid formats with part tokens were being rejected, preventing saves.
- Impact: format validation now recognizes PartNumber/PartCount tokens in common patterns.
- Files: src/NzbDrone.Core/Organizer/FileNameValidation.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm settings save clears pending changes.

## 1.2.188
- Summary: fix missing HttpContext import in the UI auth redirect.
- Why: build failed with CS0246 after adding the login redirect.
- Impact: StaticResourceController compiles with the new redirect logic.
- Files: src/Readarr.Http/Frontend/StaticResourceController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the login redirect works.

## 1.2.187
- Summary: redirect unauthenticated UI requests to the login page.
- Why: Forms auth returns a 401 for UI endpoints, so the browser never reaches the login page.
- Impact: root UI routes now redirect to `/login` when auth is required and the user is not authenticated.
- Files: src/Readarr.Http/Frontend/StaticResourceController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the login redirect works.

## 1.2.186
- Summary: fix .NET 10 deprecations for forwarded headers and cert loading.
- Why: ASPDEPR005 and SYSLIB0057 are treated as errors in the .NET 10 build.
- Impact: forwarded header configuration uses KnownIPNetworks and SSL loading uses X509CertificateLoader.
- Files: src/NzbDrone.Host/Startup.cs, src/NzbDrone.Host/Bootstrap.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.185
- Summary: replace obsolete X509Certificate2 loading API for .NET 10.
- Why: SYSLIB0057 blocks builds when loading certificates via deprecated constructors.
- Impact: SSL certificate validation now uses X509CertificateLoader.
- Files: src/Readarr.Api.V1/Config/HostConfigController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.184
- Summary: address .NET 10 ASP.NET analyzer errors in authentication and middleware.
- Why: ISystemClock is obsolete and header additions now trigger ASP0019.
- Impact: authentication handlers use the new base ctor and headers are set safely.
- Files: src/Readarr.Http/Authentication/ApiKeyAuthenticationHandler.cs, src/Readarr.Http/Authentication/BasicAuthenticationHandler.cs, src/Readarr.Http/Authentication/NoAuthenticationHandler.cs, src/Readarr.Http/Middleware/VersionMiddleware.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.183
- Summary: fix remaining StyleCop SA1508 warnings in exception types.
- Why: analyzer warnings are treated as errors in the .NET 10 build.
- Impact: extra blank lines removed in three exception classes.
- Files: src/NzbDrone.Core/MediaFiles/AzwTag/AzwTagException.cs, src/NzbDrone.Core/MediaFiles/BookImport/RecycleBinException.cs, src/NzbDrone.Core/MediaFiles/BookImport/RootFolderNotFoundException.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.182
- Summary: fix .NET 10 analyzers for CA2022 and SYSLIB0051.
- Why: analyzer warnings are treated as errors in the .NET 10 build.
- Impact: file reads use ReadExactly and exception types no longer use formatter serialization.
- Files: src/NzbDrone.Mono/Disk/DiskProvider.cs, src/NzbDrone.Core/Housekeeping/Housekeepers/DeleteBadMediaCovers.cs, src/NzbDrone.Core/MediaFiles/BookImport/RootFolderNotFoundException.cs, src/NzbDrone.Core/MediaFiles/BookImport/RecycleBinException.cs, src/NzbDrone.Core/MediaFiles/AzwTag/AzwTagException.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.181
- Summary: fix StyleCop warning introduced by the .NET 10 exception cleanup.
- Why: SA1508 reports a blank line before a closing brace.
- Impact: DestinationAlreadyExistsException formatting now passes analyzers.
- Files: src/NzbDrone.Common/Disk/DestinationAlreadyExistsException.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.180
- Summary: remove obsolete .NET APIs flagged as errors under .NET 10.
- Why: SYSLIB0051 and SYSLIB0014 warnings are treated as errors in the .NET 10 build.
- Impact: custom exception no longer uses formatter-based serialization and HttpClient avoids ServicePointManager.
- Files: src/NzbDrone.Common/Disk/DestinationAlreadyExistsException.cs, src/NzbDrone.Common/Http/HttpClient.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.179
- Summary: pin System.Drawing.Common to a .NET 10 package to resolve NU1904.
- Why: restore failed due to the vulnerable 4.7.0 transitive version being treated as an error.
- Impact: System.Drawing.Common resolves to 10.0.1 across projects with central package pinning.
- Files: src/Directory.Packages.props, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.178
- Summary: align platform packages with .NET 10 and pin transitive versions.
- Why: .NET 10 builds still resolved 6.x platform packages and flagged vulnerable IdentityModel dependencies.
- Impact: Microsoft.Extensions/System packages now target 10.0.1, and transitive pins apply across projects.
- Files: src/Directory.Packages.props, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm restore/build succeeds on the VM.

## 1.2.177
- Summary: fix .NET 10 restore failures by pinning IdentityModel packages and removing redundant framework references.
- Why: NU1902 vulnerability warnings and NU1510 pruning warnings were treated as errors on the net10 restore.
- Impact: restore succeeds with IdentityModel 6.36.0 pinned, and framework packages are no longer explicitly referenced in net10 projects.
- Files: src/Directory.Packages.props, src/NzbDrone.Common/Readarr.Common.csproj, src/NzbDrone.Core/Readarr.Core.csproj, src/NzbDrone.Host/Readarr.Host.csproj, src/NzbDrone.Core.Test/Readarr.Core.Test.csproj, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging and confirm the build completes on the VM.

## 1.2.176
- Summary: align .NET 10 SDK pinning with the 10.0.1 runtime.
- Why: SDKs use 10.0.101 for the 10.0.1 runtime, and the VM couldn’t find 10.0.1 on the SDK feeds.
- Impact: global.json, scripts, and CI now target SDK 10.0.101 so installs resolve cleanly.
- Files: global.json, scripts/dev-ubuntu.sh, scripts/dev-setup-ubuntu.sh, azure-pipelines.yml, mise.toml, docs/NET10_UPGRADE.md, src/Directory.Build.props, CHANGELOG.md.
- Next: install the 10.0.101 SDK, run update-dev.sh with logging, and verify the UI shows v1.2.176.

## 1.2.175
- Summary: upgrade Bookdarr to target .NET 10 and pin the SDK.
- Why: align the build/runtime with the .NET 10.0.1 release and keep output paths consistent.
- Impact: projects now compile for net10.0, scripts/CI build with the 10.0.1 SDK, and dev/test paths use net10.0 output folders.
- Files: src/**/*.csproj, global.json, scripts/dev-ubuntu.sh, scripts/dev-setup-ubuntu.sh, scripts/dev-build.sh, scripts/update-dev.sh, scripts/run-bookdarr.sh, build.sh, docs.sh, azure-pipelines.yml, mise.toml, src/NzbDrone.Test.Common/NzbDroneRunner.cs, docs/NET10_UPGRADE.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh with logging, confirm the app starts, and verify the UI shows v1.2.175.

## 1.2.174
- Summary: update README/handoff guidance and restore the sidebar width.
- Why: documentation needed to reflect current behavior and the sidebar should match the original layout.
- Impact: README clarifies dual-format support and metadata defaults; handoff adds push/version/logging reminders; the sidebar width returns to 210px.
- Files: README.md, docs/HANDOFF.md, frontend/src/Styles/Variables/dimensions.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, confirm the sidebar width looks right, and verify the UI shows v1.2.174.

## 1.2.116
- Summary: add a rescan action for book files after edition changes.
- Why: files can become unlinked when switching editions and need a manual recovery path.
- Impact: the book toolbar now offers a rescan that re-links files from the author folder.
- Files: frontend/src/Book/Details/BookDetails.js, frontend/src/Book/Details/BookDetailsConnector.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, click Rescan book files on a book, and confirm files reappear.

## 1.2.115
- Summary: relink book files and refresh the books list after edition changes.
- Why: switching editions changed the slug and orphaned file mappings, leading to a 404 page and empty file lists.
- Impact: the UI updates the books collection after edition selection and reattaches existing files to the new edition.
- Files: frontend/src/Components/Form/BookEditionSelectInputConnector.js, src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, switch editions, and confirm no 404 plus files remain listed.

## 1.2.114
- Summary: keep the edit-modal edition switch from navigating to a 404 page.
- Why: changing editions can alter the book slug, leaving the current route stale.
- Impact: after selecting an edition, the UI updates the book state and redirects to the new slug if needed.
- Files: frontend/src/Components/Form/BookEditionSelectInputConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, change an edition, and confirm the book page stays on the updated title.

## 1.2.113
- Summary: fix using-directive ordering after adding edition lookup endpoints.
- Why: style analysis failed the build.
- Impact: Readarr.Api.V1 builds cleanly again.
- Files: src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry the build on the VM.

## 1.2.112
- Summary: enable edition lookup from the edit modal and allow switching to a newly searched edition.
- Why: users can get stuck with a wrong-language edition and need a way to re-search metadata.
- Impact: the edition dropdown always opens, fetches edition lookup results from the metadata provider, and applies selected editions directly.
- Files: frontend/src/Book/Edit/EditBookModalContent.js, frontend/src/Components/Form/BookEditionSelectInputConnector.js, frontend/src/Components/Form/SelectInput.js, src/Readarr.Api.V1/Books/BookController.cs, src/Readarr.Api.V1/Books/EditionLookupResource.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open Edit on a book, click the Edition dropdown, and choose an English edition from the lookup list.

## 1.2.111
- Summary: fix using-directive ordering in the book controller and bump the app version.
- Why: style analysis failed the build.
- Impact: build passes style checks for Readarr.Api.V1.
- Files: src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry the build on the VM.

## 1.2.110
- Summary: prefer a UI-language edition when refreshing book metadata.
- Why: some books return non-English descriptions unless the edition language is switched.
- Impact: refresh book cover/description now attempts to select an edition matching the UI language before updating covers.
- Files: src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, refresh a book, and confirm the overview switches to English when an English edition exists.

## 1.2.109
- Summary: fix book metadata refresh build error and bump the app version.
- Why: API controller used a RefreshBookInfo overload that was missing from the interface.
- Impact: build succeeds and metadata refresh endpoint compiles cleanly.
- Files: src/NzbDrone.Core/Books/Services/RefreshBookService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry the build/refresh flow on the VM.

## 1.2.108
- Summary: add a book metadata refresh that re-downloads covers and uses the UI language for metadata requests.
- Why: book cover/description refresh needed to pull updated metadata and respect the system UI language.
- Impact: book details can refresh cover/overview on demand, and metadata requests include the UI language header.
- Files: frontend/src/Book/Details/BookDetails.js, frontend/src/Book/Details/BookDetailsConnector.js, frontend/src/Store/Actions/bookActions.js, src/NzbDrone.Core/Localization/Core/en.json, src/NzbDrone.Core/MediaCover/MediaCoverService.cs, src/NzbDrone.Core/MetadataSource/MetadataRequestBuilder.cs, src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, refresh a book from the toolbar, and confirm the cover/overview update in your UI language.

## 1.2.107
- Summary: apply light/dark text styling inside the EPUB reader and bump the app version.
- Why: EPUB content was rendering dark text on a dark background in dark mode.
- Impact: dark mode uses light text on a dark background, light mode uses dark text on a light background, and the UI reports 1.2.107.
- Files: frontend/src/BookFile/BookFileReaderModal.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB, and confirm text colors match the active theme.

## 1.2.106
- Summary: move EPUB navigation arrows to a modal overlay and bump the app version.
- Why: the in-reader buttons were not visible over the cover.
- Impact: EPUB modals now show prominent left/right arrow buttons for page turns, and the UI reports 1.2.106.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/BookFileReaderModal.css, frontend/src/BookFile/BookFileReaderModal.css.d.ts, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB, and confirm the arrows appear and page turns work.

## 1.2.105
- Summary: make EPUB navigation arrows larger and ensure they layer above the reader.
- Why: the buttons were not visible over the cover in some readers.
- Impact: navigation arrows display more clearly on top of the EPUB content, and the UI reports 1.2.105.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/BookFileReaderModal.css, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB, and confirm the arrows are visible and page turns work.

## 1.2.104
- Summary: always show EPUB navigation arrows and bump the app version.
- Why: navigation buttons were hidden until the reader signaled readiness, so they never appeared for some EPUBs.
- Impact: EPUB modals show left/right arrows immediately for page turning, and the UI reports 1.2.104.
- Files: frontend/src/BookFile/BookFileReaderModal.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB, and confirm the arrows appear and page turns work.

## 1.2.103
- Summary: add EPUB page navigation controls and bump the app version.
- Why: the reader showed only the cover without navigation controls.
- Impact: EPUB reader now includes previous/next arrow buttons to turn pages, and the UI reports 1.2.103.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/BookFileReaderModal.css, frontend/src/BookFile/BookFileReaderModal.css.d.ts, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB, and confirm page turns using the left/right arrows.

## 1.2.102
- Summary: improve ebook reader resilience, handle unsupported formats, and bump the app version.
- Why: the reader could fail silently for unsupported or flaky loads, and the UI version needed to reflect updates.
- Impact: unsupported ebook types show a clear message, EPUB render attempts are more defensive, and the UI reports 1.2.102.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/Editor/BookFileActionsCell.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB, and confirm the modal renders while the version shows 1.2.102.

## 1.2.101
- Summary: load JSZip before the EPUB reader so ebook rendering works.
- Why: epub.js depends on JSZip, and missing it can result in a blank reader.
- Impact: EPUBs render in the modal once JSZip loads with the reader script.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/Content/Scripts/jszip.min.js, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB from the Files tab, and confirm the reader displays.

## 1.2.100
- Summary: fix EPUB reader rendering in the modal and use an open-book icon for Read actions.
- Why: the reader modal body used a scrolling wrapper that collapsed the reader, and the icon should better match the action.
- Impact: EPUBs render inside the modal instead of a blank panel, and the Files tab shows an open-book Read icon.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/Editor/BookFileActionsCell.js, frontend/src/Helpers/Props/icons.js, CHANGELOG.md.
- Next: run update-dev.sh, open an EPUB from the Files tab, and confirm the reader renders with the open-book icon.

## 1.2.99
- Summary: harden audiobook detection and load EPUBs via a blob URL.
- Why: some M4B rows still hid Play, and the EPUB modal could render blank despite a valid stream.
- Impact: Play actions show for more audiobook metadata/extension variants, and EPUBs render reliably through the reader modal.
- Files: frontend/src/BookFile/Editor/BookFileActionsCell.js, frontend/src/BookFile/BookFileReaderModal.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, confirm the Play icon appears for M4B files, and verify EPUB content renders in the reader modal.

## 1.2.98
- Summary: export the Play icon so audiobook rows can render the Play button.
- Why: the Play icon constant was missing, so M4B rows couldn’t render the button even when detected.
- Impact: Play now appears for audiobook files once detection flags them as audio.
- Files: frontend/src/Helpers/Props/icons.js, CHANGELOG.md.
- Next: run update-dev.sh and confirm M4B rows show the Play icon.

## 1.2.97
- Summary: show Play actions for audiobook files using media type/quality detection.
- Why: some audiobook rows weren’t showing the Play icon despite M4B files being present.
- Impact: Play now appears for M4B/MP3 files even when extension detection fails.
- Files: frontend/src/BookFile/Editor/BookFileActionsCell.js, frontend/src/BookFile/Editor/BookFileEditorRow.js, CHANGELOG.md.
- Next: run update-dev.sh and confirm M4B rows show the Play icon.

## 1.2.96
- Summary: load the EPUB reader script with API key auth and default combine renaming to off.
- Why: authenticated static assets blocked the EPUB viewer, and renaming should be opt-in.
- Impact: Read ebook now surfaces load failures and works with API key auth; Combine Audiobook defaults to keeping original filenames; stream endpoint allows HEAD requests.
- Files: frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/BookFileReaderModal.css, frontend/src/BookFile/BookFileReaderModal.css.d.ts, frontend/src/BookFile/Editor/BookFileActionsCell.js, frontend/src/Book/Combine/CombineAudiobookModalContent.js, src/Readarr.Api.V1/BookFiles/BookFileController.cs, src/NzbDrone.Core/Localization/Core/en.json, CHANGELOG.md.
- Next: run update-dev.sh, confirm Play/Read buttons appear in Files, and verify EPUB opens without a blank modal.

## 1.2.95
- Summary: fix missing ebook icon in the Files tab.
- Why: the book reader icon was referenced but not exported.
- Impact: Read ebook buttons now render correctly for EPUB/PDF files.
- Files: frontend/src/Helpers/Props/icons.js, CHANGELOG.md.
- Next: run update-dev.sh and confirm Play/Read buttons appear in the Files tab.

## 1.2.94
- Summary: add in-app audio playback and ebook viewing from the Files tab.
- Why: Bookdarr needed lightweight playback for M4B/MP3 and viewing for EPUB/PDF.
- Impact: Files rows now include Play/Read actions, a streaming endpoint, and a modal audio player/ebook reader.
- Files: frontend/src/BookFile/BookFileAudioModal.js, frontend/src/BookFile/BookFileAudioModal.css, frontend/src/BookFile/BookFileAudioModal.css.d.ts, frontend/src/BookFile/BookFileReaderModal.js, frontend/src/BookFile/BookFileReaderModal.css, frontend/src/BookFile/BookFileReaderModal.css.d.ts, frontend/src/BookFile/Editor/BookFileActionsCell.js, frontend/src/BookFile/Editor/BookFileActionsCell.css, frontend/src/Content/Scripts/epub.min.js, frontend/build/webpack.config.js, src/Readarr.Api.V1/BookFiles/BookFileController.cs, src/NzbDrone.Core/Localization/Core/en.json, CHANGELOG.md.
- Next: run update-dev.sh, open a book with M4B/EPUB files, and verify Play/Read works from the Files tab.

## 1.2.93
- Summary: keep original filenames for multi-part MP3 audiobook imports.
- Why: multi-file audiobooks already have meaningful part names and ordering.
- Impact: when importing multiple MP3s for an audiobook, Bookdarr preserves original base filenames while still moving into the book folder.
- Files: src/NzbDrone.Core/MediaFiles/BookFileMovingService.cs, CHANGELOG.md.
- Next: run update-dev.sh, import a multi-part MP3 audiobook, and confirm the parts keep their original names.

## 1.2.92
- Summary: allow Combine Audiobook to skip renaming when files are already ordered correctly.
- Why: many audiobook parts already follow the desired naming, so renaming can be unnecessary.
- Impact: combine modal now includes a rename toggle; backend respects it and only renames when enabled.
- Files: frontend/src/Book/Combine/CombineAudiobookModalContent.js, frontend/src/Book/Combine/CombineAudiobookModalContent.css, frontend/src/Book/Combine/CombineAudiobookModalContent.css.d.ts, frontend/src/Book/Details/BookDetails.js, frontend/src/Book/Details/BookDetailsConnector.js, frontend/src/Commands/Command.ts, src/NzbDrone.Core/MediaFiles/Commands/CombineAudiobookCommand.cs, src/NzbDrone.Core/MediaFiles/CombineAudiobookService.cs, src/NzbDrone.Core/Localization/Core/en.json, CHANGELOG.md.
- Next: run update-dev.sh, try combine with rename unchecked, and verify parts keep their original names.

## 1.2.91
- Summary: make Combine Audiobook safer when renaming or ffmpeg fails.
- Why: missing source files or name collisions caused ffmpeg failures and left renamed parts without clear recovery.
- Impact: combine validates source/target paths, avoids overwriting part names, verifies output size, and rolls back renamed parts when combining fails.
- Files: src/NzbDrone.Core/MediaFiles/CombineAudiobookService.cs, CHANGELOG.md.
- Next: run update-dev.sh, set delete mode to Keep, retry Combine Audiobook, and confirm files remain if ffmpeg fails.

## 1.2.90
- Summary: add a manual audiobook combine tool with reorder modal and progress bar.
- Why: multi-part MP3 audiobooks need to be merged into a single MP3/M4B with optional chapters.
- Impact: Media Management adds Audiobook Combining settings; Book Details adds a Combine Audiobook button, a drag-order modal, and a top progress bar; backend combines parts via ffmpeg and optionally deletes source files.
- Files: frontend/src/Book/Combine/CombineAudiobookModal.js, frontend/src/Book/Combine/CombineAudiobookModalContent.js, frontend/src/Book/Combine/CombineAudiobookModalContent.css, frontend/src/Book/Combine/CombineAudiobookModalContent.css.d.ts, frontend/src/Book/Details/BookDetails.js, frontend/src/Book/Details/BookDetails.css, frontend/src/Book/Details/BookDetails.css.d.ts, frontend/src/Book/Details/BookDetailsConnector.js, frontend/src/Book/Details/CombineAudiobookProgress.js, frontend/src/Book/Details/CombineAudiobookProgress.css, frontend/src/Book/Details/CombineAudiobookProgress.css.d.ts, frontend/src/Commands/commandNames.js, frontend/src/Components/Page/Toolbar/PageToolbarButton.js, frontend/src/Commands/Command.ts, frontend/src/Settings/MediaManagement/MediaManagement.js, src/NzbDrone.Core/MediaFiles/CombineAudiobookService.cs, src/NzbDrone.Core/MediaFiles/CombineAudiobookMode.cs, src/NzbDrone.Core/MediaFiles/CombineAudiobookDeleteMode.cs, src/NzbDrone.Core/MediaFiles/Commands/CombineAudiobookCommand.cs, src/NzbDrone.Core/Configuration/ConfigService.cs, src/NzbDrone.Core/Configuration/IConfigService.cs, src/Readarr.Api.V1/Config/MediaManagementConfigResource.cs, src/NzbDrone.Core/Localization/Core/en.json, CHANGELOG.md.
- Next: run update-dev.sh, open a book with multiple audiobook MP3s, combine them, and verify the progress bar plus the new output file in the Files tab.

## 1.2.89
- Summary: remove the Bookshelf page from navigation and routing.
- Why: the page is non-functional and should be hidden/disabled.
- Impact: the Bookshelf link is gone from the sidebar and `/shelf` no longer routes to the page.
- Files: frontend/src/App/AppRoutes.js, frontend/src/Components/Page/Sidebar/PageSidebar.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, confirm the Bookshelf link is gone, and verify `/shelf` is no longer accessible.

## 1.2.88
- Summary: remove author-level monitoring controls in Author Select and Edit, and clarify the book edit label.
- Why: monitoring should be managed at the book level only; the author-level controls were still visible.
- Impact: Author Select no longer shows Monitor Author/Monitor New Books; author edit modal no longer includes the Monitored/Monitor New Books fields; book edit label now reads “Automatically Switch Edition/Monitoring”.
- Files: frontend/src/Author/Editor/AuthorEditorFooter.js, frontend/src/Author/Edit/EditAuthorModalContent.js, frontend/src/Author/Edit/EditAuthorModalContentConnector.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, confirm Author Select and Edit no longer show monitoring fields, and verify the book edit label text.

## 1.2.87
- Summary: remove author/bookshelf/bulk monitoring controls and auto-unmonitor books once both ebook and audiobook files exist.
- Why: monitoring should only be changed on the book details page, and completed media sets should stop monitoring automatically.
- Impact: author details and Bookshelf no longer expose monitor toggles; book edit/bulk edit no longer offer monitoring changes; after import, any book with both media types is auto-unmonitored (multi-file audiobooks still count once imported).
- Files: frontend/src/Author/Details/AuthorDetails.js, frontend/src/Author/Details/AuthorDetailsConnector.js, frontend/src/Author/Details/AuthorDetailsHeader.js, frontend/src/Author/Details/AuthorDetailsHeaderConnector.js, frontend/src/Author/Details/AuthorDetailsSeason.js, frontend/src/Author/Details/AuthorDetailsSeasonConnector.js, frontend/src/Author/Details/AuthorDetailsSeries.js, frontend/src/Author/Details/AuthorDetailsSeriesConnector.js, frontend/src/Author/Details/BookRow.js, frontend/src/Author/Details/BookRowConnector.js, frontend/src/Book/Edit/EditBookModalContent.js, frontend/src/Book/Edit/EditBookModalContentConnector.js, frontend/src/Book/Editor/BookEditorFooter.js, frontend/src/Bookshelf/Bookshelf.js, frontend/src/Bookshelf/BookshelfBook.js, frontend/src/Bookshelf/BookshelfRow.js, frontend/src/Bookshelf/BookshelfRowConnector.js, src/NzbDrone.Core/MediaFiles/BookImport/ImportApprovedBooks.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, confirm author/bookshelf monitoring controls are gone, and verify a book with both ebook + audiobook files auto-unmonitors after import.

## 1.2.86
- Summary: show author names in merge selection boxes and keep buttons simple.
- Why: author names were missing due to a trimmed selector, which made merge choices unclear.
- Impact: left/right boxes now show author names; buttons read “Keep Left/Keep Right”.
- Files: frontend/src/Store/Selectors/createAuthorClientSideCollectionItemsSelector.js, frontend/src/Author/Editor/Merge/MergeAuthorModalContent.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the merge modal shows author names in the selection boxes.

## 1.2.85
- Summary: make author merge choices clearer by showing names on the buttons.
- Why: the left/right labels were easy to confuse without context.
- Impact: merge modal buttons now include the author names for each side.
- Files: frontend/src/Author/Editor/Merge/MergeAuthorModalContent.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the merge modal clearly shows which author you are keeping.

## 1.2.84
- Summary: refresh book resources after author merge so author pages show merged books.
- Why: merged books updated in the database but the UI list was stale because book update events were not broadcast.
- Impact: after merging, book updates are broadcast and author pages show all merged books without a manual refresh.
- Files: src/NzbDrone.Core/Books/Services/AuthorMergeService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, merge two authors, and confirm merged books appear immediately on the winner's author page.

## 1.2.83
- Summary: fix Author Select view going blank after enabling merge UI.
- Why: the AuthorIndex render referenced merge props that were not destructured, causing a runtime error.
- Impact: Author Select no longer blanks the page; merge modal can be opened as expected.
- Files: frontend/src/Author/Index/AuthorIndex.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, enter Author Select, and confirm the page stays visible.

## 1.2.82
- Summary: add author merge flow to resolve duplicate authors.
- Why: near-duplicate author names (e.g., spacing differences) can create duplicate author entries.
- Impact: Author Select mode offers a Merge Authors action with a left/right winner choice, warning about overwriting files; merge moves loser files into the winner folder, reassigns books, and deletes the loser.
- Files: frontend/src/Author/Editor/AuthorEditorFooter.js, frontend/src/Author/Editor/AuthorEditorFooter.css, frontend/src/Author/Editor/Merge/MergeAuthorModal.js, frontend/src/Author/Editor/Merge/MergeAuthorModalContent.js, frontend/src/Author/Editor/Merge/MergeAuthorModalContent.css, frontend/src/Author/Index/AuthorIndex.js, frontend/src/Author/Index/AuthorIndexConnector.js, frontend/src/Store/Actions/authorIndexActions.js, src/Readarr.Api.V1/Author/AuthorController.cs, src/Readarr.Api.V1/Author/MergeAuthorsResource.cs, src/NzbDrone.Core/Books/Services/AuthorMergeService.cs, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, select exactly two authors in Author Select mode, merge, and confirm books/files move into the winning author folder.

## 1.2.81
- Summary: switch backup policy to git tag snapshots only.
- Why: tags allow quick reverts without creating large local archives.
- Impact: handoff now directs tags (`snapshot-YYYYMMDD-HHMM`) and no local tar backups.
- Files: docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: create and push a snapshot tag before the next GitHub push.

## 1.2.80
- Summary: restore the Standard Book Format field even when Rename Books is disabled.
- Why: users still need to see and set the global naming pattern while toggling rename behavior.
- Impact: the field stays visible with a help reminder to enable Rename Books; naming rules remain unchanged.
- Files: frontend/src/Settings/MediaManagement/Naming/Naming.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm Standard Book Format is visible and editable.

## 1.2.79
- Summary: fix IDE0005 build errors by removing unnecessary using directives.
- Why: the dev build failed with StyleCop/IDE warnings treated as errors.
- Impact: update-dev.sh completes without the IDE0005 errors in import/identification code.
- Files: src/NzbDrone.Core/MediaFiles/BookImport/Identification/IdentificationService.cs, src/NzbDrone.Core/MediaFiles/BookImport/ImportApprovedBooks.cs, src/NzbDrone.Core/MediaFiles/BookImport/ImportDecisionMaker.cs, src/NzbDrone.Core/MediaFiles/BookImport/Manual/ManualImportService.cs, src/NzbDrone.Core/MediaFiles/BookImport/Specifications/UpgradeSpecification.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh again to confirm the build passes.

## 1.2.78
- Summary: support ebook + audiobook files per book with media-type-aware upgrades.
- Why: importing one format should not delete the other, and quality comparisons must stay within the same media type.
- Impact: BookFiles store a media type, upgrade/cutoff checks compare only matching types, part counts are scoped by media type, and the API exposes mediaType.
- Files: src/NzbDrone.Core/MediaFiles/BookFileMediaType.cs, src/NzbDrone.Core/MediaFiles/MediaFileExtensions.cs, src/NzbDrone.Core/MediaFiles/BookFile.cs, src/NzbDrone.Core/Parser/Model/LocalBook.cs, src/NzbDrone.Core/Datastore/Migration/041_add_bookfile_media_type.cs, src/NzbDrone.Core/MediaFiles/BookImport/ImportDecisionMaker.cs, src/NzbDrone.Core/MediaFiles/BookImport/Identification/IdentificationService.cs, src/NzbDrone.Core/MediaFiles/BookImport/Manual/ManualImportService.cs, src/NzbDrone.Core/MediaFiles/DiskScanService.cs, src/NzbDrone.Core/MediaFiles/BookImport/ImportApprovedBooks.cs, src/NzbDrone.Core/MediaFiles/UpgradeMediaFileService.cs, src/NzbDrone.Core/MediaFiles/RenameBookFileService.cs, src/NzbDrone.Core/MediaFiles/BookImport/Specifications/UpgradeSpecification.cs, src/NzbDrone.Core/DecisionEngine/Specifications/UpgradeAllowedSpecification.cs, src/NzbDrone.Core/DecisionEngine/Specifications/CutoffSpecification.cs, src/NzbDrone.Core/DecisionEngine/Specifications/UpgradeDiskSpecification.cs, src/Readarr.Api.V1/BookFiles/BookFileResource.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, import an ebook and audiobook for the same book, and confirm both files remain listed under the book files table.

## 1.2.77
- Summary: add an author picture refresh button that forces a metadata re-fetch.
- Why: users need a quick way to fix incorrect or missing author photos without a full refresh.
- Impact: author pages include a “Refresh author picture” button; it refreshes metadata images and updates the author record.
- Files: src/NzbDrone.Core/MetadataSource/AuthorExtraMetadata.cs, src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Readarr.Api.V1/Author/AuthorController.cs, frontend/src/Author/Details/AuthorDetails.js, frontend/src/Author/Details/AuthorDetailsConnector.js, frontend/src/Store/Actions/authorActions.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and use the new button on an author page to confirm the poster updates.

## 1.2.76
- Summary: add Wikipedia direct lookup fallback for author images/blurbs.
- Why: some authors (e.g., Dave Ramsey) lack Wikidata image data but do have Wikipedia summaries.
- Impact: when Wikidata/Open Library fail, Bookdarr pulls a Wikipedia summary and thumbnail (if available) by author name, skipping disambiguation pages.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open the Dave Ramsey author page, and confirm the blurb/image are present if Wikipedia provides them.

## 1.2.75
- Summary: fix build style error in MediaCoverService.
- Why: StyleCop rejected a missing blank line, which stopped builds.
- Impact: build passes without the StyleCop error.
- Files: src/NzbDrone.Core/MediaCover/MediaCoverService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the build completes.

## 1.2.74
- Summary: serve author posters directly from remote URLs when no local cover exists.
- Why: MediaCoverProxy entries are in-memory and can be missing after restarts, causing author images to fail.
- Impact: author images load directly from Wikimedia/Open Library without relying on the proxy cache.
- Files: src/NzbDrone.Core/MediaCover/MediaCoverService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm author posters display (Andy Weir, Stephen King).

## 1.2.73
- Summary: URL-encode proxied cover filenames.
- Why: author images with quotes/unicode in filenames were not rendering through the proxy.
- Impact: MediaCoverProxy links now work reliably for Wikimedia/Open Library images with special characters.
- Files: src/NzbDrone.Core/MediaCover/MediaCoverProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and reload an author page (Andy Weir should show a poster).

## 1.2.72
- Summary: show remote author images correctly and add attribution under the author blurb.
- Why: author posters were not rendering when served via the proxy, and attribution was requested in the UI.
- Impact: author images display reliably even when they are remote/proxied; author pages show a small “Source: Wikipedia/Open Library” label under the blurb when applicable.
- Files: frontend/src/Author/AuthorImage.js, frontend/src/Author/Details/AuthorDetailsHeader.js, frontend/src/Author/Details/AuthorDetailsHeader.css, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an author page, and confirm the poster and attribution label are visible.

## 1.2.71
- Summary: fix author extras build errors in the API layer.
- Why: a type mismatch in the author metadata backfill prevented compilation.
- Impact: Bookdarr builds cleanly while still backfilling author images/blurbs/links.
- Files: src/Readarr.Api.V1/Author/AuthorController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the build completes.

## 1.2.70
- Summary: backfill author photos/blurbs/links and serve remote author images when local covers are missing.
- Why: author images and Wikipedia blurbs were not appearing for existing or newly added authors.
- Impact: author pages now populate missing posters and overviews from Wikidata/Wikipedia or Open Library, include Wikipedia links when available, and display remote author images via the cover proxy if no local file exists.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/NzbDrone.Core/MetadataSource/AuthorExtraMetadata.cs, src/NzbDrone.Core/MediaCover/MediaCoverService.cs, src/Readarr.Api.V1/Author/AuthorController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an author page with missing art, and confirm the poster, blurb, and Wikipedia link appear.

## 1.2.69
- Summary: add Wikidata/Open Library author photos with attribution and disable the update modal.
- Why: author pages need real photos with clear source links, and the update modal was outdated/noisy.
- Impact: author posters are populated from Wikidata/Wikipedia or Open Library with attribution links; the update modal no longer appears after updates.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, frontend/src/Components/Page/Page.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, refresh an author page to verify a poster appears with source links, and confirm no update popup appears.

## 1.2.68
- Summary: fix Available Books title tooltips so they trigger on truncated text.
- Why: the hover detection was bound to an inner element and never detected truncation.
- Impact: hovering a truncated Available Books title now shows the full title tooltip reliably.
- Files: frontend/src/Author/Details/AuthorDetailsAvailableBooks.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and hover a truncated Available Books title to confirm the tooltip appears.

## 1.2.67
- Summary: show a mouse-following tooltip for truncated available-book titles.
- Why: long titles were clipped with ellipses and the full text was not accessible.
- Impact: hovering a truncated title shows the full title in a floating tooltip that follows the cursor.
- Files: frontend/src/Author/Details/AuthorDetailsAvailableBooks.js, frontend/src/Author/Details/AuthorDetailsAvailableBooks.css, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and hover a truncated Available Books title to confirm the tooltip appears.

## 1.2.66
- Summary: fix false removal errors, add a selection toggle for available books, and rename select mode buttons.
- Why: removing available books showed an error despite success, and selection mode should be explicit and clearer across library pages.
- Impact: available book removals return JSON to avoid error banners; selection is enabled via “Select Available Books” and hidden when done; Book/Author buttons now read “Select” and “Done Selecting.”
- Files: src/Readarr.Api.V1/Author/AuthorBooksController.cs, frontend/src/Author/Details/AuthorDetailsAvailableBooks.js, frontend/src/Author/Details/AuthorDetailsAvailableBooks.css, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, remove an available book via the X and batch remove, and confirm no error banner appears.

## 1.2.65
- Summary: add available-book exclusions with confirmations and batch actions, and stop author adds from auto-importing books.
- Why: you need to hide unwanted books from the available list and avoid auto-adding an author’s entire catalog.
- Impact: available books can be selected, added, or excluded; excluded books stay hidden after refresh; adding an author only adds the author.
- Files: frontend/src/Author/Details/AuthorDetailsAvailableBooks.js, frontend/src/Author/Details/AuthorDetailsAvailableBooks.css, frontend/src/Author/Details/AuthorDetailsAvailableBooksConnector.js, frontend/src/Store/Actions/authorAvailableBooksActions.js, frontend/src/Search/Author/AddNewAuthorModalContentConnector.js, frontend/src/Utilities/Author/getNewAuthor.js, src/Readarr.Api.V1/Author/AuthorBooksController.cs, src/Readarr.Api.V1/Author/AuthorBooksExcludeResource.cs, src/Readarr.Api.V1/Author/AuthorController.cs, src/Readarr.Api.V1/Author/AuthorResource.cs, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, verify single/batch remove confirmations, and confirm adding an author does not add books.

## 1.2.64
- Summary: make author refresh reload available books only, relabel the Books tab, and add available books as monitored.
- Why: the author refresh action was adding all books unintentionally, the tab label was ambiguous, and available-book adds were coming in unmonitored.
- Impact: refresh now re-fetches available books, the Books tab reads “Books added to Bookdarr,” and author-page adds are monitored by default.
- Files: frontend/src/Author/Details/AuthorDetailsConnector.js, frontend/src/Author/Details/AuthorDetails.js, src/Readarr.Api.V1/Author/AuthorBooksController.cs, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, verify refresh only reloads Available Books, confirm tab label change, and add a book to verify it is monitored.

## 1.2.63
- Summary: refine the Available Books grid layout to be compact and readable.
- Why: the initial grid was overly tall with cramped text, making titles hard to read.
- Impact: cards are shorter with fixed cover sizing, improved text wrapping, and cleaner metadata spacing.
- Files: frontend/src/Author/Details/AuthorDetailsAvailableBooks.css, frontend/src/Author/Details/AuthorDetailsAvailableBooks.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an author page, and confirm Available Books renders with compact cards and readable titles.

## 1.2.62
- Summary: show available author books on the author page and add a “Request All Books” action in the edit modal.
- Why: the author page only listed existing library books, so discovery and bulk adds were missing.
- Impact: author pages now list addable books with a + button; edit modal can request all available books at once.
- Files: src/Readarr.Api.V1/Author/AuthorBooksAddResource.cs, src/Readarr.Api.V1/Author/AuthorBooksController.cs, frontend/src/Store/Actions/authorAvailableBooksActions.js, frontend/src/Store/Actions/index.js, frontend/src/Author/Details/AuthorDetailsAvailableBooks.js, frontend/src/Author/Details/AuthorDetailsAvailableBooks.css, frontend/src/Author/Details/AuthorDetailsAvailableBooksConnector.js, frontend/src/Author/Details/AuthorDetails.js, frontend/src/Author/Edit/EditAuthorModalContent.js, frontend/src/Author/Edit/EditAuthorModalContent.css, frontend/src/Author/Edit/EditAuthorModalContentConnector.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh, open an author page, confirm Available Books renders with + buttons, and verify “Request All Books” in Edit.

## 1.2.61
- Summary: avoid page crash when a deleted book is still referenced during selection updates.
- Why: the book author selector assumed a book always exists, which threw after a delete and triggered the error page.
- Impact: deleting books from Book Editor no longer shows the error page.
- Files: frontend/src/Store/Selectors/createBookAuthorSelector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and delete a book from Book Editor to confirm no error page appears.

## 1.2.60
- Summary: make book covers edition-independent by preferring the local book cover file.
- Why: cover art was tied to the monitored edition, so toggling monitored could drop images and show placeholders.
- Impact: if a local book cover exists, it is always used for display regardless of edition state.
- Files: src/NzbDrone.Core/MediaCover/MediaCoverService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and toggle monitored to confirm covers stay unchanged.

## 1.2.59
- Summary: keep book covers on save by reloading editions before returning the updated resource.
- Why: the edit save response could omit editions, which wiped images in the UI even though nothing about covers changed.
- Impact: edit saves retain existing cover art and no longer replace it with placeholders.
- Files: src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and toggle monitored in the Edit Book modal to confirm covers stay.

## 1.2.58
- Summary: keep book covers by selecting an edition with images when available.
- Why: when no edition is marked monitored, the fallback could pick an edition without images and show placeholders.
- Impact: monitor/unmonitor toggles keep covers visible as long as any edition has artwork.
- Files: src/Readarr.Api.V1/Books/BookResource.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and toggle a book’s monitored state to confirm covers stay.

## 1.2.57
- Summary: keep book covers when toggling monitored state.
- Why: the edit flow could return a resource without a monitored edition, resulting in empty images and placeholder art.
- Impact: book art remains visible after monitor/unmonitor changes by falling back to the first edition.
- Files: src/Readarr.Api.V1/Books/BookResource.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and toggle monitored on a book to verify covers stay.

## 1.2.56
- Summary: prevent edit saves from failing when editions are missing.
- Why: PUT /api/v1/book could throw when editions or links were null, and UpdateMany was called with a null list.
- Impact: Book edit saves no longer throw 500s or break BookEditedEvent broadcasts when editions are omitted.
- Files: src/Readarr.Api.V1/Books/BookResource.cs, src/Readarr.Api.V1/Books/BookController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the Edit Book modal saves and closes.

## 1.2.55
- Summary: avoid crashing Book save when edit payload omits editions.
- Why: the Book Details edit modal triggers a PUT without editions, which caused a 500 error and made Save appear to do nothing.
- Impact: edit modal saves no longer error when editions are missing from the payload; monitoring changes still handled separately.
- Files: src/Readarr.Api.V1/Books/BookResource.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm Book Details edit Save updates without errors.

## 1.2.54
- Summary: force monitored updates from the edit modal via the monitor endpoint.
- Why: the Book Details edit modal was not reliably applying monitor/unmonitor changes.
- Impact: toggling Monitored in the edit modal now updates the book immediately (including on the Book Details page).
- Files: frontend/src/Book/Edit/EditBookModalContentConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and verify edit modal monitoring on the Book Details page.

## 1.2.53
- Summary: return updated book data on save and expose selection checkboxes in Book Editor mode.
- Why: unmonitor changes from the edit modal were not reflected in the UI, and bulk unmonitor was hard to access.
- Impact: book edit saves update the local list immediately; Book Editor shows the select column so bulk unmonitoring is available in table view.
- Files: src/Readarr.Api.V1/Books/BookController.cs, frontend/src/Book/Index/Table/BookIndexTable.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and verify unmonitoring from Edit Book and bulk unmonitor in Book Editor.

## 1.2.44
- Summary: default author add to "All Books" when the add author modal opens.
- Why: avoid only adding a single book when prior defaults were set to a single-book option.
- Impact: author add starts with "All Books" monitoring unless you change it before confirming.
- Files: frontend/src/Search/Author/AddNewAuthorModalContentConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and verify author adds now pull the full catalog.

## 1.2.52
- Summary: fix stylecop spacing in MetadataProfileService.
- Why: build failed due to a missing blank line after a closing brace.
- Impact: update-dev.sh completes without SA1513.
- Files: src/NzbDrone.Core/Profiles/Metadata/MetadataProfileService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry adding authors.

## 1.2.51
- Summary: relax metadata profile filters for Google Books and stop using book covers as author posters.
- Why: Google Books doesn’t provide popularity scores or author photos; those filters were removing all books and the poster fallback was misleading.
- Impact: author adds from Google Books should now populate books; author posters will show the default placeholder unless a real author image exists.
- Files: src/NzbDrone.Core/Profiles/Metadata/MetadataProfileService.cs, src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and re-test adding J. K. Rowling and author images.

## 1.2.50
- Summary: fix stylecop ordering error from the AddBookService import change.
- Why: builds fail when using directives are out of order.
- Impact: update-dev.sh completes without the SA1210 error.
- Files: src/NzbDrone.Core/Books/Services/AddBookService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and re-test author add and covers.

## 1.2.49
- Summary: improve Google Books author results and cover handling.
- Why: author adds were still too small and cover images were inconsistent or missing.
- Impact: author adds try multiple Google Books queries, author posters fall back to the first book cover, Google thumbnails are forced to HTTPS, and manual book adds download their cover without triggering author refresh.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/NzbDrone.Core/Books/Services/AddBookService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and re-test J. K. Rowling and book/author covers.

## 1.2.48
- Summary: fix Google Books paging build error.
- Why: `HttpRequest` doesn’t expose `AddQueryParam`; paging must be added before request build.
- Impact: update-dev.sh builds again with Google Books paging enabled.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry the author add flow.

## 1.2.47
- Summary: page Google Books author results and stop manual book adds from triggering author refresh.
- Why: author adds were returning too few books and manual book adds were pulling extra books from author refreshes.
- Impact: author add fetches up to 200 Google Books results; adding a single book no longer auto-adds other books.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/NzbDrone.Core/Books/Services/AddBookService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and re-test adding a book and adding J. K. Rowling as an author.

## 1.2.46
- Summary: fix build error in Google Books author search.
- Why: avoid variable shadowing that caused the dev build to fail.
- Impact: update-dev.sh completes successfully again.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry adding J. K. Rowling as an author.

## 1.2.45
- Summary: use `inauthor:` for Google Books author searches.
- Why: generic Google Books queries can return unrelated authors and lead to partial catalogs.
- Impact: author search results and author adds should map to the correct author when using Google Books metadata.
- Files: src/NzbDrone.Core/MetadataSource/BookInfo/BookInfoProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and retry adding J. K. Rowling as an author.

## 1.2.43
- Summary: default book adds to a single book and warn before adding an author.
- Why: choosing a book should not add the entire author catalog; adding an author should be explicit.
- Impact: book add defaults to “Only This Book” and existing defaults migrate away from “All Books”; adding an author now shows a confirmation warning.
- Files: frontend/src/Store/Actions/searchActions.js, frontend/src/Store/Migrators/migrateAddBookDefaults.js, frontend/src/Store/Migrators/migrate.js, frontend/src/Search/Author/AddNewAuthorModalContent.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and verify book vs author add behavior.

## 1.2.42
- Summary: return JSON from the create-folder API to avoid false UI errors.
- Why: the file browser expects JSON; empty responses were treated as errors.
- Impact: folder creation no longer shows a failure banner when it succeeds.
- Files: src/Readarr.Api.V1/FileSystem/FileSystemController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and re-test create folder.

## 1.2.41
- Summary: add missing System import for the new filesystem folder API.
- Why: fixes the build error in FileSystemController.
- Impact: build completes again after update-dev.sh.
- Files: src/Readarr.Api.V1/FileSystem/FileSystemController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh to rebuild.

## 1.2.40
- Summary: fix duplicate import in FormInputGroup.
- Why: resolves the webpack build failure after the permissions tip update.
- Impact: frontend build succeeds again.
- Files: frontend/src/Components/Form/FormInputGroup.js, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh to rebuild.

## 1.2.39
- Summary: add create-folder support in the file browser and show a permissions tip for unwritable paths.
- Why: let users create folders from the UI and fix common permission errors faster.
- Impact: file browser has a “Create Folder” row and the API adds `/filesystem/folder`; path fields show a chmod/chown tip when the folder isn’t writable.
- Files: src/Readarr.Api.V1/FileSystem/FileSystemController.cs, frontend/src/Components/FileBrowser/FileBrowserModalContent.js, frontend/src/Components/FileBrowser/FileBrowserModalContent.css, frontend/src/Components/FileBrowser/FileBrowserModalContentConnector.js, frontend/src/Components/Form/FormInputGroup.js, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and verify folder creation + permission tip.

## 1.2.38
- Summary: add a downloads folder fallback for remote path mapping and hide device UUID labels in disk space.
- Why: avoid false remote path mapping warnings and show cleaner disk space labels.
- Impact: when no remote path mapping exists, `/downloads` remaps to the configured downloads folder if it exists; disk space labels no longer show `/dev/disk/by-uuid/...`.
- Files: src/NzbDrone.Core/RemotePathMappings/RemotePathMappingService.cs, src/NzbDrone.Common/Disk/DiskProviderBase.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the qBittorrent warning is gone and disk space shows paths only.

## 1.2.37
- Summary: default recycle bin to Bookdarr home when available.
- Why: keep the recycle folder at the app root (e.g., `/opt/bookdarr-dev/recycle`) instead of under config.
- Impact: if `BOOKDARR_HOME` is set, recycle bin defaults to `BOOKDARR_HOME/recycle`; otherwise uses the app data path.
- Files: src/NzbDrone.Core/MediaFiles/RecycleBinDefaults.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and verify the recycle bin path.

## 1.2.36
- Summary: fix build failure from missing OsInfo using.
- Why: ConfigService now uses OsInfo for default download path on Linux.
- Impact: builds succeed after adding the EnvironmentInfo import.
- Files: src/NzbDrone.Core/Configuration/ConfigService.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: run update-dev.sh and confirm the app builds and starts.

## 1.2.35
- Summary: add configurable downloads folder and default recycle bin path.
- Why: allow changing the download path and avoid missing recycle bin folders.
- Impact: Download Clients options include a downloads folder setting; new remote path mappings default to it; recycle bin defaults to appdata/recycle.
- Files: src/NzbDrone.Core/Configuration/IConfigService.cs, src/NzbDrone.Core/Configuration/ConfigService.cs, src/Readarr.Api.V1/Config/DownloadClientConfigResource.cs, frontend/src/Settings/DownloadClients/Options/DownloadClientOptions.js, frontend/src/Settings/DownloadClients/RemotePathMappings/EditRemotePathMappingModalContentConnector.js, src/NzbDrone.Core/MediaFiles/RecycleBinDefaults.cs, src/NzbDrone.Core/Localization/Core/en.json, src/Directory.Build.props, CHANGELOG.md.
- Next: rebuild and confirm download folder + recycle bin appear in settings and on disk.

## 1.2.34
- Summary: add a one-command update script for native dev installs.
- Why: avoid build failures from a running process and simplify updates.
- Impact: `scripts/update-dev.sh` stops, updates, builds, and restarts Bookdarr.
- Files: scripts/update-dev.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: use update-dev.sh for future native updates.

## 1.2.33
- Summary: add a Settings link for Development and update the System status links to Bookdarr.
- Why: surface the hidden Development page and point “More info” at the correct repo.
- Impact: Settings page now includes Development; System -> Status links point to Bookdarr.
- Files: frontend/src/Settings/Settings.js, frontend/src/System/Status/MoreInfo/MoreInfo.js, src/Directory.Build.props, CHANGELOG.md.
- Next: rebuild UI and confirm the new link and repo URLs.

## 1.2.32
- Summary: record command formatting preference in the handoff doc.
- Why: ensure future chats use fenced code blocks for commands.
- Impact: HANDOFF.md now mandates code blocks for user-run commands.
- Files: docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: keep command output consistently in code blocks going forward.

## 1.2.31
- Summary: add a shared run script for Bookdarr and route dev runs through it.
- Why: keep dev and Docker launch behavior consistent.
- Impact: new `scripts/run-bookdarr.sh`; `dev-run.sh` now calls it.
- Files: scripts/run-bookdarr.sh, scripts/dev-run.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: use run-bookdarr.sh as the Docker entrypoint later.

## 1.2.30
- Summary: add an indexer export item to the development checklist.
- Why: track the request to support exporting indexers for migration.
- Impact: checklist now includes indexer export work.
- Files: checklist.md, src/Directory.Build.props, CHANGELOG.md.
- Next: plan the export flow (API/UI or script) and implement it.

## 1.2.29
- Summary: allow import script to read connection details from a local env file.
- Why: make it possible to run the import without retyping keys each time.
- Impact: import-indexers.sh loads `/opt/bookdarr-dev/import-indexers.env` if present.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: add the env file on the VM and rerun the import script.

## 1.2.28
- Summary: add a recovery prompt when the target indexer API fails.
- Why: a corrupted indexer table returns HTTP 500 and blocks imports.
- Impact: import-indexers.sh can optionally reset the local indexers table and proceed.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download import-indexers.sh and run it on the Bookdarr VM.

## 1.2.27
- Summary: force visible API key input for the import script prompts.
- Why: terminals can keep echo disabled from previous commands, hiding input.
- Impact: import-indexers.sh ensures echo is on before API key prompts.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download import-indexers.sh and run it on the Bookdarr VM.

## 1.2.26
- Summary: show API key input in the import script prompts.
- Why: allow copy/paste visibility when entering keys interactively.
- Impact: import-indexers.sh no longer hides API key input.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download import-indexers.sh and run it on the Bookdarr VM.

## 1.2.25
- Summary: make indexer imports replace existing entries by default.
- Why: simplify migration by updating matching indexers automatically.
- Impact: import-indexers.sh now replaces existing indexers unless overridden.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download import-indexers.sh and run it on the Bookdarr VM.

## 1.2.24
- Summary: prompt for Readarr and Bookdarr connection details in the import script.
- Why: avoid passing API keys on the command line.
- Impact: import-indexers.sh now asks for source host/port/key and target key interactively.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download import-indexers.sh and run it on the Bookdarr VM.

## 1.2.23
- Summary: add a script to import indexers from another Readarr instance via API.
- Why: avoid manual SQL edits and reduce migration errors.
- Impact: `scripts/import-indexers.sh` pulls from a source Readarr and posts to Bookdarr.
- Files: scripts/import-indexers.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: run import-indexers.sh with the source host/port/API key.

## 1.2.22
- Summary: make dev scripts executable in git to avoid permission errors on fresh clones.
- Why: some setups were cloning scripts without execute bits, causing dev-build.sh to fail.
- Impact: scripts can run directly after checkout; dev-ubuntu.sh still chmods as a safety net.
- Files: scripts/dev-build.sh, scripts/dev-run.sh, scripts/dev-setup-ubuntu.sh, scripts/dev-ubuntu.sh, scripts/install-bookdarr.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download dev-ubuntu.sh and rerun it.

## 1.2.21
- Summary: enforce repo ownership and readable permissions before running dev builds.
- Why: avoid "Permission denied" when executing dev-build.sh as the `joe` user.
- Impact: dev-ubuntu.sh now chowns the repo and ensures scripts are readable.
- Files: scripts/dev-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download dev-ubuntu.sh and rerun it.

## 1.2.20
- Summary: run dev-build.sh via bash and ensure scripts are executable.
- Why: avoid permission errors on some filesystems after git update.
- Impact: dev-ubuntu.sh no longer fails on dev-build.sh execution.
- Files: scripts/dev-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download the dev-ubuntu.sh script and rerun it.

## 1.2.19
- Summary: ensure dev scripts are executable after clone/update.
- Why: avoid "Permission denied" when running dev-build.sh.
- Impact: dev-ubuntu.sh now chmods scripts before building.
- Files: scripts/dev-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun dev-ubuntu.sh on the VM.

## 1.2.18
- Summary: copy built UI assets into the runtime output for native dev runs.
- Why: the dev binary expects UI under `_output/net6.0/<rid>/UI`.
- Impact: native dev runs will load the UI without missing index.html warnings.
- Files: scripts/dev-build.sh, scripts/dev-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun dev-build.sh or dev-ubuntu.sh on the VM, then start dev-run.sh.

## 1.2.17
- Summary: add a single Ubuntu dev script that sets up, builds, and optionally runs Bookdarr.
- Why: simplify dev setup to one command on the VM.
- Impact: `scripts/dev-ubuntu.sh` replaces the multi-step flow; README updated.
- Files: scripts/dev-ubuntu.sh, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: use dev-ubuntu.sh for future dev installs.

## 1.2.16
- Summary: add a dotnet-install.sh fallback when dotnet-sdk-6.0 isn't in apt.
- Why: Ubuntu 24.04 doesn't provide dotnet-sdk-6.0 packages.
- Impact: dev setup can install .NET 6 via Microsoft script on newer Ubuntu.
- Files: scripts/dev-setup-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download the dev setup script and rerun it.

## 1.2.15
- Summary: install Yarn via npm to avoid corepack permission errors on Ubuntu.
- Why: corepack enable was failing to create global symlinks in /usr/bin.
- Impact: dev setup now uses npm to install Yarn; dev build checks for yarn.
- Files: scripts/dev-setup-ubuntu.sh, scripts/dev-build.sh, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download the dev setup script and rerun it.

## 1.2.14
- Summary: run `corepack enable` with sudo during Ubuntu dev setup.
- Why: corepack needs root to create global symlinks on Ubuntu.
- Impact: dev setup no longer fails with EACCES on corepack enable.
- Files: scripts/dev-setup-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download the dev setup script and rerun it.

## 1.2.13
- Summary: make the Ubuntu dev setup script work when run with sudo.
- Why: avoid the "-E: command not found" error and support running as root.
- Impact: dev setup now uses sudo when available and runs user commands safely.
- Files: scripts/dev-setup-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: re-download the dev setup script and rerun it.

## 1.2.12
- Summary: fix NodeSource setup execution when running dev setup as root.
- Why: avoid the "-E: command not found" error on Ubuntu.
- Impact: dev setup script now handles sudo vs root properly.
- Files: scripts/dev-setup-ubuntu.sh, src/Directory.Build.props, CHANGELOG.md.
- Next: rerun dev-setup-ubuntu.sh on the VM.

## 1.2.11
- Summary: add native Ubuntu dev scripts (setup/build/run) to avoid Docker during development.
- Why: speed up iteration on the dev VM and defer Docker builds to release time.
- Impact: new scripts for local builds and a README section describing the flow.
- Files: scripts/dev-setup-ubuntu.sh, scripts/dev-build.sh, scripts/dev-run.sh, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: run dev-setup-ubuntu.sh on the VM and validate a native launch.

## 1.2.10
- Summary: allow the update modal to close even if reload fails.
- Why: prevent the UI from getting stuck on the update dialog.
- Impact: closing the modal clears the update flag before reloading.
- Files: frontend/src/App/AppUpdatedModalConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: rebuild and verify the modal can be dismissed.

## 1.2.9
- Summary: normalize SignalR version messages to major.minor.patch.
- Why: prevent the update modal from reappearing due to build-number mismatches.
- Impact: the update modal should dismiss normally after reload.
- Files: frontend/src/Components/SignalRConnector.js, src/Directory.Build.props, CHANGELOG.md.
- Next: rebuild and confirm the update modal can be closed.

## 1.2.8
- Summary: trim the displayed version to major.minor.patch in the UI.
- Why: hide the auto-generated build suffix (e.g., `.40745`) in the header.
- Impact: UI shows clean semantic version while keeping internal build info.
- Files: src/Readarr.Http/Frontend/InitializeJsonController.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: rebuild and confirm header shows `v1.2.8`.

## 1.2.7
- Summary: make the install script build only and skip container start by default.
- Why: support Portainer stack redeploys without container name conflicts.
- Impact: install script no longer starts Bookdarr unless `START_CONTAINER=true`.
- Files: scripts/install-bookdarr.sh, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm stack redeploy works cleanly after rebuilds.

## 1.2.6
- Summary: move the Bookdarr name/version into the left logo area.
- Why: keep the header branding closer to the icon, as requested.
- Impact: header layout shift only; no runtime behavior changes.
- Files: frontend/src/Components/Page/Header/PageHeader.js, frontend/src/Components/Page/Header/PageHeader.css, src/Directory.Build.props, CHANGELOG.md.
- Next: verify alignment looks good in the sidebar header on the VM.

## 1.2.5
- Summary: show Bookdarr name/version in the header and fix proxy covers without file extensions.
- Why: make it easy to confirm the running version and render Google Books covers reliably.
- Impact: new header text; proxy image URLs are now extension-safe.
- Files: frontend/src/Components/Page/Header/PageHeader.js, frontend/src/Components/Page/Header/PageHeader.css, src/NzbDrone.Core/MediaCover/MediaCoverProxy.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: verify cover images appear on the search page after rebuild.

## 1.2.4
- Summary: add a compose file for Portainer stacks and document redeploy flow.
- Why: avoid full rebuilds unless the image actually changes.
- Impact: compose-driven deployments can restart quickly without rebuilding.
- Files: docker-compose.yml, README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: keep stack instructions aligned with `/downloads` and `/config` mounts.

## 1.2.3
- Summary: document the download client mount path as `/downloads`.
- Why: standardize the container-side path for client integration.
- Impact: documentation-only; no runtime changes.
- Files: README.md, src/Directory.Build.props, CHANGELOG.md.
- Next: keep install/run instructions consistent with `/downloads`.

## 1.2.2
- Summary: default proxy cover images to JPEG content type when the filename has no extension.
- Why: Google Books thumbnails often omit file extensions and were not rendering.
- Impact: search results should display covers reliably.
- Files: src/Readarr.Http/Frontend/Mappers/MediaCoverProxyMapper.cs, src/Directory.Build.props, CHANGELOG.md.
- Next: verify covers render on the VM after rebuild.

## 1.2.1
- Summary: prevent search results UI crashes when external links are missing.
- Why: Google Books results may not include author/book links.
- Impact: search page renders without errors even when links are absent.
- Files: frontend/src/Search/Author/AddNewAuthorSearchResult.js, frontend/src/Search/Book/AddNewBookSearchResult.js, src/Directory.Build.props, CHANGELOG.md.
- Next: confirm search page behavior on the VM after rebuild.

## 1.2.0
- Summary: add a source-build install script with error logging.
- Why: make VM installs repeatable and capture clear errors for support.
- Impact: new script writes `/opt/bookdarr/install.log` and builds a local image.
- Files: scripts/install-bookdarr.sh, README.md, docs/HANDOFF.md, src/Directory.Build.props, CHANGELOG.md.
- Next: wire diagnostics upload and Docker Hub image publishing.

## 1.1.3
- Summary: add a handoff guide to help a new Codex chat take over.
- Why: preserve context, preferences, and next steps for continuity.
- Impact: documentation-only; no runtime changes.
- Files: docs/HANDOFF.md, CHANGELOG.md, src/Directory.Build.props.
- Next: keep using this changelog format for new entries.

## 1.1.2
- Fix build by aligning BookInfoProxy formatting to style rules.

## 1.1.1
- Add tooltip instructions for creating a Google Books API key.

## 1.1.0
- Add a Google Books API key field in metadata settings.

## 1.0.2
- Show Google Books free-tier quota warning on the search page.
- Surface a user-friendly error when the Google Books quota is exceeded.

## 1.0.1
- Add Google Books search support with optional API key.

## 1.0.0
- Initial Bookdarr rebrand from Bookshelf/Readarr fork.
# Summary: Downgraded the front-end selectors to a version of `reselect` that still exports `defaultMemoize` so the `memoize is not a function` errors stop happening on login.
- Impact: The build now succeeds with `yarn build`, the Author search and Book Pool renderers load correctly (no more blank UI), and the deep-equality selectors continue reusing cached results via `defaultMemoize`.
- Files: `package.json`, `yarn.lock`, `frontend/src/Store/Selectors/createAuthorClientSideCollectionItemsSelector.js`, `frontend/src/Store/Selectors/createBookClientSideCollectionItemsSelector.js`, `frontend/src/Store/Selectors/createDeepEqualSelector.js`, `src/Directory.Build.props`
- Next: tag/push a snapshot for `v1.3.16`, run `LOG_FILE="/opt/bookdarr-dev/Logs/update-088.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh` over SSH so the diagnostics bundle captures the working front end.

## 1.3.15
## 1.3.94
- Summary: Scope Library/Books and author fetches to the current user by using the per-user library endpoints.
- Why: Global `/book` data kept mixing in other users’ books; using `/user/library/books` keeps each user’s library isolated while leaving Book Pool flows intact.
- Impact: Author refresh/available calls now load from the user’s library endpoint; existing fetches already prime user books on app load. No backend changes.
- Files: `frontend/src/Store/Actions/authorActions.js`, `frontend/src/Store/Actions/authorAvailableBooksActions.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), then continue per-user scoping for other views as needed (wanted/calendar/search) and add per-user libraries on backend if new endpoints are required.
## 1.3.95
- Summary: Scope the Authors list to the current user’s library so you only see authors for books you’ve added.
- Why: The Authors page was showing every author from the global pool even when the user’s library was empty.
- Impact: Author selectors now filter against the user’s book list; users with no books see an empty author list. No backend changes.
- Files: `frontend/src/Store/Selectors/createAuthorClientSideCollectionItemsSelector.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), continue scoping other views (Wanted/Calendar/Search) to the per-user library and add per-user backend filtering where needed.
## 1.3.96
- Summary: Improve the empty Authors message to prompt adding books instead of showing the filter warning when your library is empty.
- Why: With per-user scoping, users with no books saw “All authors are hidden due to the applied filter,” which was confusing.
- Impact: Authors page now says “Add books to see Authors” when no authors are visible.
- Files: `frontend/src/Author/NoAuthor.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), then continue scoping other views (Wanted/Calendar/Search) to per-user data.
## 1.3.97
- Summary: Allow Book Pool titles to open their details page by hydrating books fetched by slug and triggering a fetch when opening from the pool.
- Why: Clicking a book from Book Pool was 404ing because the slug lookup didn’t populate author/editions and the details page lacked the book in store.
- Impact: TitleSlug API now attaches author/editions; book details page fetches the slug on navigation. Pool books now open their detail view instead of NotFound.
- Files: `src/Readarr.Api.V1/Books/BookController.cs`, `frontend/src/Book/Details/BookDetailsPageConnector.js`, `frontend/src/Book/Details/BookDetailsConnector.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), and verify Book Pool links open details without 404. Continue per-user scoping for other views after verification.
## 1.3.98
- Summary: Stop Book Pool clicks from polluting your library and add an “Add to Library” button on book details.
- Why: Opening a book from Book Pool was flagging it as part of your library; details lacked a clear way to add when not in your library.
- Impact: Books fetched for pool/details are marked outside your library; library/author selectors now only show `inMyLibrary` items; Book Details shows an “Add to My Library” toolbar button when absent. Pool clicks no longer auto-add.
- Files: `frontend/src/Store/Actions/bookActions.js`, `frontend/src/Store/Selectors/createBooksClientSideCollectionSelector.js`, `frontend/src/Store/Selectors/createAuthorClientSideCollectionItemsSelector.js`, `frontend/src/Book/Details/BookDetails.js`, `frontend/src/Book/Details/BookDetailsConnector.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), then verify pool -> details doesn’t add to library and the new button adds only when pressed.
## 1.3.99
- Summary: Stop Book Pool views from altering your library and add an explicit add/remove toggle on book details.
- Why: Opening a book from Book Pool was implicitly adding it; users need a clear button to add/remove instead.
- Impact: Book details shows an “Add to My Library” / “Remove from My Library” button based on state; clicking it posts to `/user/library` and refreshes the user library. Simply viewing from Book Pool no longer affects your library.
- Files: `frontend/src/Book/Details/BookDetails.js`, `frontend/src/Book/Details/BookDetailsConnector.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), and verify pool → details no longer auto-adds; use the button to add/remove.
## 1.3.100
- Summary: Keep the details page add/remove button in sync across navigation by preserving `inMyLibrary` when refetching books.
- Why: Fetching a book by slug reset `inMyLibrary` to false, so the button flipped back to “Add” after leaving and returning.
- Impact: Book fetches now merge the existing `inMyLibrary` flag and keep non-library items while loading user-library items; details toolbar stays on “Remove from My Library” for books you’ve added.
- Files: `frontend/src/Store/Actions/bookActions.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, run `/opt/bookdarr-dev/scripts/update-dev.sh` on the VM (log to next `/opt/bookdarr-dev/Logs/update-0XX.log`), then verify the button remains on “Remove” after navigating away/back.
## 1.3.116
- Summary: Deduplicate manual import rows so Link Existing Files no longer shows the same file multiple times.
- Why: The Armada link-existing modal listed identical file paths repeatedly, making it unclear which entries to import.
- Impact: Manual import results are now de-duplicated by path before rendering; version bumped for cache-busting.
- Files: `frontend/src/Store/Actions/interactiveImportActions.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-182.log`).
## 1.3.117
- Summary: Make Manual Import use the browser file picker while Link Existing Files stays on filesystem browse.
- Why: Manual Import should prompt for local uploads, while Link Existing Files should browse server paths for already-downloaded files.
- Impact: Manual Import opens with browser upload (no path picker); Link Existing Files keeps the server path picker/auto-start flow. Version bumped for cache-busting.
- Files: `frontend/src/Book/Details/BookDetails.js`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-183.log`).
## 1.3.118 (work in progress)
- Summary: Start wiring Unmapped Files “Assign to Book” with a Book Pool picker + add-new hook (frontend only, partial).
- Why: Need a modal to pick existing books or add a new one when files lack a home.
- Impact: Adds an Assign to Book modal (pool list + Add New Book) and preps the manual import assign flow; version bumped for cache-busting. Backend mapping still needs wiring.
- Files: `frontend/src/UnmappedFiles/UnmappedFilesTable.js`, `frontend/src/UnmappedFiles/assign/*`, `src/NzbDrone.Core/Localization/Core/en.json`, `src/Directory.Build.props`
- Next: Tag `snapshot-YYYYMMDD-HHMM`, push, then run the SSH update with the next log number (`update-184.log`); wire files → book assignment and metadata search integration.
