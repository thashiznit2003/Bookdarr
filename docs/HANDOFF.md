# Bookdarr Handoff

Use this file to onboard a new Codex chat.

## Read First (in this order)
- https://github.com/thashiznit2003/Bookdarr/blob/develop/CHANGELOG.md
- https://github.com/thashiznit2003/Bookdarr/blob/develop/README.md
- https://github.com/thashiznit2003/Bookdarr/blob/develop/docs/HANDOFF.md

## Project Summary
- Bookdarr is a fork of Bookshelf/Readarr focused on improved metadata reliability and a friendlier request/search UX.
- Default metadata search uses Google Books (no API key required, shared quota); optional per-instance API key supported.

## User Preferences
- Keep changes small and methodical; avoid assumptions.
- Responses should be concise.
- When responding with commands or copy/paste steps, always use fenced code blocks (no inline commands).
- Create an annotated git tag snapshot before pushing to GitHub; no local tar backups.
- Push updates to GitHub after every change.
- Automatically run the tag and push steps after each change (do not ask the user to do it).
- Update CHANGELOG.md and bump the version after every change.
- Treat `CHANGELOG.md` as the authoritative history; update it before each Git push so the app’s latest behavior is always documented.
- When the version changes, update the top-left app version by bumping `src/Directory.Build.props`.
- Increment the assembly/app version (`src/Directory.Build.props`) before every Git push so the repo always reflects a higher release.
- When giving install commands, use sudo and chain with `&&`.
- Always put commands or code the user should run in fenced code blocks.
- Update commands should `tee` to `/opt/bookdarr-dev/Logs/update-0XX.log`, starting at `update-01.log` now that logs were cleared.
- Update script now pushes a diagnostics bundle before exit for every update and immediately on failures, including the latest update log file (toggle with `DIAGNOSTICS_PUSH=false`).
- Avoid adding repeated `apt-get update` steps in install/build flows.
- Changelog entries must be handoff-friendly (Summary/Why/Impact/Files/Next).
- Provide update commands in fenced code blocks.
- Push to GitHub immediately after tagging.
- Increment the build version in `src/Directory.Build.props` (AssemblyVersion) after each change.
- Run a StyleCop check (full build) before pushing to catch SA/IDE warnings early.
- When a GitHub link is posted, refresh the repo and read the linked file immediately to act on diagnostics.
- Diagnostics push button (develop-only) requires config.xml entries: `DiagnosticsRepo` and `DiagnosticsToken`. Optional: `DiagnosticsGitUserName` and `DiagnosticsGitUserEmail` for git commit identity.
- SSH access is available via the unlocked private key at `~/.ssh/bookdarr-agent` and the command `ssh -i ~/.ssh/bookdarr-agent joe@192.168.0.103`; use this session to rerun `LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" /opt/bookdarr-dev/scripts/update-dev.sh` after each change so diagnostics logs and bundles are pushed automatically.
- Workflow reminder: after implementing a change, run the same SSH update command on the Ubuntu VM (the machine actually running Bookdarr) so that update logs (`/opt/bookdarr-dev/Logs/update-0XX.log`) and diagnostics bundles are generated automatically; no need for the user to re-provide SSH or diagnostics repo details.

## Command Continuity
- If a command was interrupted, rerun it before continuing.
- Keep the latest instructions/commands in this section so every agent knows what to execute next (e.g., the current SSH update command, diagnostics push steps, version bump, StyleCop build, etc.).
- After pushing to GitHub, immediately run the SSH update workflow (`ssh -i ~/.ssh/bookdarr-agent joe@192.168.0.103 'sudo /opt/bookdarr-dev/scripts/update-dev.sh 2>&1 | sudo tee -a /opt/bookdarr-dev/Logs/update-175.log'`) so the Ubuntu VM mirrors the latest version and the diagnostics bundle is generated.

## Diagnostics Workflow

- The diagnostics bundle pushes to `thashiznit2003/Bookdarr-Diagnostics` already happen during `update-dev.sh`, but keep this repo in sync by zipping `/opt/bookdarr-dev/Logs/update-0XX.log` along with any changed log files and pushing the archive as `diagnostics-YYYYMMDD-HHMM.zip`.
- The config helpers in `config.xml` must contain `DiagnosticsRepo` and `DiagnosticsToken` so the update script can commit on your behalf; `DiagnosticsGitUserName` and `DiagnosticsGitUserEmail` set the author identity if necessary.
- When diagnostics fail (non-fast-forward, auth issues, `git symbolic-ref` problems), rerun `scripts/update-dev.sh` via SSH after fetching the latest remote and resolving conflicts; the bundle will be pushed again once the update command completes.
- Track diagnostics versions sequentially by naming the log file `update-0XX.log` and the zipped artifact `diagnostics-YYYYMMDD-HHMM.zip`.
- Keep the Ubuntu VM at `/opt/bookdarr-dev` as the source of truth, and always run updates there so diagnostics match the running service.

## Build/Style Notes
- StyleCop is strict. In `BookInfoProxy.cs`, keep:
  - using directives alphabetized,
  - constants before non-constant fields,
  - multiline method parameters each on their own line.
- Build uses `_output` assets; UI built via `yarn build` and server via `dotnet msbuild`.
- Install script: `scripts/install-bookdarr.sh` (logs to `/opt/bookdarr/install.log`).
- Dev scripts live in `scripts/`: `dev-ubuntu.sh` (one-shot setup), `dev-setup-ubuntu.sh` (deps only), `dev-build.sh`, `dev-run.sh`, `update-dev.sh`.

## Metadata Notes
- Provider default: `MetadataProvider=googlebooks` (config/env `METADATA_PROVIDER` overrides).
- No-key Google Books calls are allowed but quota is shared/unpredictable.
- Optional per-instance key is in Settings -> Metadata -> Search Metadata.
- Quota errors (403/429) surface as user-facing messages.
- Search page shows a Google Books free-tier disclaimer.

## Open Work / Next Steps
- Docker Hub publish pipeline (GitHub Action + secrets).
- Overseerr-like request page.
- Users: backend update endpoint exists (username/email/password + isActive, admin or self) with reset-token scaffolding; frontend has Add/Edit modals and activate/deactivate/delete. Still needed: per-user libraries/book scoping (user_id ownership + auth scoping), self-service password reset via email sender, and confirmation of per-user library isolation.

## Recent Changes (since last handoff)
- Guard against clearing the user library view when `/user/library/books` returns empty; client preserves existing items; version bumped to 1.3.110.
- Combine audiobooks: backend accepts 1+ parts, UI enables with a single MP3/FLAC (convert to M4B); version bumped to 1.3.109.
- Combine audiobooks supports FLAC sources in backend and now enables the UI button for FLAC/MP3 parts; version bumped to 1.3.108.
- Combine audiobooks supports FLAC sources (transcodes when needed) instead of erroring; version bumped to 1.3.107.
- Wanted Missing Files now removes the Convert column and links search to book details; version bumped to 1.3.106.
- Wanted user-scoped pages fixed: registered new thunks, added translations, and table column metadata so Missing Files/File Upgrades render instead of blanking the page; version bumped to 1.3.105.
- Wanted is now user-scoped: new endpoints for Missing Files and File Upgrades (per-user library, per-format flags, no monitoring); UI routes now point to user missing-files/file-upgrades lists with search/convert links. Version bumped to 1.3.104.
- Calendar UI is hidden (sidebar link and route removed) until we have a provider with reliable future release dates; version bumped to 1.3.103.
- Book Pool availability now considers all ebook/audiobook files (not just “shared” ones) so status badges update as soon as files are added; version bumped to 1.3.102.
- User-library fetch now keeps non-library books in the store while toggling `inMyLibrary`, preventing book details from 404’ing after a remove; version bumped to 1.3.101.
- Users: toolbar Add/Refresh icons, sidebar link, Add/Edit modals (username/email/password), and actions wired to the new update endpoint; activate/deactivate/delete still available. Update API now accepts `isActive`; email captured on create; logout menu keeps Restart (with confirm) and removed Shutdown/Keyboard Shortcuts.
- Fixed manual import modal skipping upload screen by clearing folder state when modal opens with useBrowserUpload mode.
- Added multi-machine workflow scripts (switch-to-laptop.sh, switch-to-desktop.sh, sync-from-remote.sh) for seamless switching between desktop and laptop.
- Added .claude.json with project instructions for Claude Code sessions, including multi-machine workflow documentation.
- Shortened toolbar button labels to prevent overlap ("Refresh Metadata", "Rescan Files").
- Added "Allow Automatic Book Upgrades" setting to prevent automatic downloads of better quality versions for books with existing files.
- Added a manual book creation flow with optional fields, a cover upload action, and book-level manual import tools.
- Manual add modal fields are full-width for title/author/date; “Only This Book” monitor now maps to a valid manual add value.
- Root folder selectors now fetch root folders on app connect and on selector mount so existing paths appear immediately.
- Manual import now supports browser file uploads with server-side staging under the app data folder.
- Manual import upload UI lists selected file names before upload and uploaded file names after completion.
- Fixed manual import upload build issues (string.IsNullOrWhiteSpace usage in the new upload handler).
- Fixed Files tab ebook icon export so Read buttons render.
- Added Play/Read actions in the Files tab with audio and ebook modals plus a stream endpoint.
- Multi-part MP3 audiobook imports now preserve original filenames instead of renaming on import.
- Combine Audiobook modal now includes a rename toggle so files can be combined without renaming.
- Combine Audiobook now validates source paths, avoids overwriting part names, verifies output file size, and rolls back renamed parts if combining fails.
- Added Audiobook Combining settings (mode, chapters, delete mode) and a manual Combine Audiobook flow on the book details page.
- Combine modal supports drag-reordering MP3 parts and triggers an ffmpeg-based combine command with a top progress bar; output files are added and source parts are deleted per settings.
- Bookshelf page is removed from the sidebar and no longer routed at `/shelf`.
- Author Select no longer shows Monitor Author/Monitor New Books controls.
- Author edit modal no longer includes Monitored/Monitor New Books fields.
- Book edit label now reads “Automatically Switch Edition/Monitoring”.
- Monitoring controls were removed from Author Details, Bookshelf, and Book Editor/Edit Modal; monitoring now only changes on Book Details.
- Imports now auto-unmonitor books once both ebook + audiobook files exist (multi-file audiobook imports count as complete after import).
- Author merge modal now shows author names in the left/right boxes; buttons are plain Keep Left/Keep Right.
- Author merge modal buttons now include author names for clarity.
- Author merge now broadcasts BookUpdated events so merged books appear on the winner's author page immediately.
- Fixed Author Select blank page caused by missing merge props in AuthorIndex.
- Added Author Merge flow in Author Select mode with left/right winner choice and overwrite warning.
- Standard Book Format is always visible in Media Management; help text reminds users to enable Rename Books.
- Removed redundant using directives that caused IDE0005 build failures.
- Added media type tracking for BookFiles (ebook vs audiobook) with a DB migration to backfill existing rows.
- Upgrade/cutoff decisions now compare files within the same media type so ebooks and audiobooks can coexist.
- Import/rename logic now scopes part counts to the media type to keep multi-part audiobooks consistent.
- BookFile API resources now expose `mediaType`.
- Added a “Refresh author picture” button that forces a metadata re-fetch for images.
- Added a Wikipedia-by-name fallback (summary + thumbnail) for authors without Wikidata/Open Library art.
- Fixed a StyleCop build error in MediaCoverService.
- Author posters now use remote URLs directly when no local cover exists (avoids proxy cache misses).
- MediaCoverProxy now URL-encodes filenames so author images render even with quotes/unicode.
- Author images now render correctly when the URL is proxied (no poster-size replacement).
- Author pages show a small attribution label under the blurb when the source is Wikipedia/Open Library.
- Fixed author extras backfill build errors in the API layer.
- Author pages now backfill missing posters/blurbs/links on load and persist them to metadata.
- Author posters fall back to the media-cover proxy when no local author cover exists.
- Wikidata lookups now return Wikipedia links/blurbs even when no image is available.
- Author posters now pull from Wikidata/Wikipedia or Open Library with attribution links.
- Update modal on app reloads is disabled.
- Available Books title tooltip detection now triggers on the truncated title element.
- Available Books titles now show a mouse-following tooltip when truncated.
- Available Books: removal endpoint now returns JSON to avoid false error banners on success.
- Available Books selection is explicit via “Select Available Books”/“Done Selecting”; checkboxes and batch buttons are hidden unless selection mode is enabled.
- Book/Author selection buttons are renamed to “Book Select/Done Selecting” and “Author Select/Done Selecting.”
- EPUB reader script now loads with API key auth and surfaces a load-failed message instead of a blank modal.
- Combine Audiobook now defaults to keeping original filenames (rename is opt-in), and the book-file stream endpoint allows HEAD requests.
- Play actions now show for audiobook rows using media type/quality detection in addition to file extension.
- Play detection now handles media type/quality/extension variants more defensively, and the EPUB reader now loads the stream into a blob URL before rendering to avoid blank modals.
- Removed Windows/macOS-specific guardrails, process handling, path checks, and related test skips; system folders and runtime behavior are now Linux-only.
- Dropped the mapped network drive validator and Windows-service warnings in import/logging.
- Added a .NET 10 upgrade plan doc at `docs/NET10_UPGRADE.md`.

## Git Snapshot Convention
- Create an annotated tag in the format `snapshot-YYYYMMDD-HHMM` before each push and push the tag to GitHub.

## New Machine Bootstrap (Dev)
- Target path: `/opt/bookdarr-dev` with config at `/opt/bookdarr-dev/config`.
- Recommended one-shot setup (Ubuntu): download and run `scripts/dev-ubuntu.sh` from `develop`, which installs Node 20 + Yarn 1.22.19 + .NET 6 SDK and builds/starts the app.
- Update flow on the VM (logs for diagnostics):

```
sudo /opt/bookdarr-dev/scripts/update-dev.sh 2>&1 | sudo tee -a /opt/bookdarr-dev/Logs/update-01.log
```
- Manual dev run: `sudo -u joe /opt/bookdarr-dev/scripts/dev-run.sh` (foreground) or `sudo -u joe nohup /opt/bookdarr-dev/scripts/dev-run.sh >/opt/bookdarr-dev/run.log 2>&1 &` (background).
- Dev instance serves at `http://<vm-ip>:8787` and reports status at `/api/v1/system/status`.
- The Ubuntu VM (`/opt/bookdarr-dev`) is the live system when running Bookdarr for development; use the unlocked ssh key (`~/.ssh/bookdarr-agent`) to log in, run updates, and push diagnostics (no additional credentials needed).
