# Bookdarr

Bookdarr is a fork of [Bookshelf](https://github.com/pennydreadful/bookshelf)
and [Readarr](https://github.com/Readarr/Readarr). The goal is to provide a
stable, self-hosted book manager with improved metadata options.

Bookdarr is an ebook and audiobook collection manager for Usenet and BitTorrent
users. It can monitor multiple RSS feeds for new books from your favorite
authors and will grab, sort, and rename them. Bookdarr can keep both ebook and
audiobook files for the same book in a single instance.

## Getting Started

The container listens on port 8787 and expects a volume mounted at `/config`.
Docker images are published under `thashiznit2003/bookdarr` (Docker Hub) and
`ghcr.io/thashiznit2003/bookdarr` (GHCR). Use the bundled compose file or pull
directly from your preferred registry.

For download client integration, mount your host download folder to
`/downloads` inside the container (example: `-v /qb1/downloads:/downloads`).

### Metadata

Bookdarr supports two metadata providers:

- **Google Books (default)** – fast, broad coverage, no API key required. The quota
  is shared across all users who rely on the public endpoint, so watch for `429`
  responses and only request a key if you routinely hit the limit.
- **BookInfo (`bookinfo.pro`)** – richer author/series metadata and cover fallbacks.
  The provider depends on a dedicated API key and can rate-limit under load, so
  only enable it when you need the extra detail or missing artwork.

Controls:

- Set `GOOGLE_BOOKS_API_KEY` (via config.xml or environment) if you want more quota
  from Google Books without hitting the shared limit.
- Set `METADATA_PROVIDER=bookinfo` to prefer BookInfo; the `METADATA_URL` setting
  can override the default `https://api.bookinfo.pro` base URL if you run behind a
  proxy or mirror.
- Store your BookInfo API key in the “BookInfo API Key” field inside Settings →
  Metadata when you unlock that provider.

Leave the provider fields blank to keep using Google Books silently; Bookdarr no
longer prompts users unnecessarily to switch providers and only surfaces a warning
when rate limits occur.

## Shared Book Pool

Bookdarr now keeps every downloaded book in a global shared pool so additional
users can adopt already-imported files without duplicating downloads. Click the
new **Book Pool** entry in the sidebar (or visit `/bookpool`) to see all shared
books, their ebook/audiobook availability, and whether they require manual attention.
Each row shows an **Add to my library** button that creates a personal claim on the
book and immediately links your library to the shared files—no new downloads are
triggered unless a preferred file is still missing. Use the filters above the grid
to switch between **All** (every shared book, even those without ebook/audiobook
files), **Ready** (titles that already have shared media), and **Needs files** so
you can focus on the books that still require attention.

## Install Script (Source Build)

### Install Script (Source Build)

This uses Docker to build from source and logs output to `/opt/bookdarr/install.log`.
By default it only builds the image; redeploy your Portainer stack to start the container.
If you want to use the locally built image with compose, set
`BOOKDARR_IMAGE=bookdarr:local` in your Portainer stack or `.env` file.

    sudo mkdir -p /opt/bookdarr && sudo curl -L https://raw.githubusercontent.com/thashiznit2003/Bookdarr/develop/scripts/install-bookdarr.sh -o /opt/bookdarr/install-bookdarr.sh && sudo chmod +x /opt/bookdarr/install-bookdarr.sh && sudo /opt/bookdarr/install-bookdarr.sh

### Docker Compose / Portainer Stack

Use `docker-compose.yml` for Portainer stacks or local compose deployments.
It defaults to the published image on Docker Hub. Set `BOOKDARR_IMAGE` if you
prefer GHCR (`ghcr.io/thashiznit2003/bookdarr:latest`) or a local build.

To start or redeploy:

    sudo docker compose -f /opt/bookdarr/docker-compose.yml up -d

To rebuild only when needed:

    sudo /opt/bookdarr/install-bookdarr.sh

### Native Dev on Ubuntu (No Docker)

Use this for faster local builds on a dedicated dev VM. It installs Node 20,
Yarn 1.22.19 (via npm), and .NET SDK 10.0.101, clones the repo to
`/opt/bookdarr-dev`, and creates `/opt/bookdarr-dev/config` for AppData.

One-step setup + build + run (foreground):

    sudo curl -L https://raw.githubusercontent.com/thashiznit2003/Bookdarr/develop/scripts/dev-ubuntu.sh -o /opt/bookdarr-dev.sh && sudo bash /opt/bookdarr-dev.sh

If you only want to build (no run):

    sudo RUN_APP=false bash /opt/bookdarr-dev.sh

You can still use the individual scripts afterward:

    sudo -u joe /opt/bookdarr-dev/scripts/dev-build.sh
    sudo -u joe /opt/bookdarr-dev/scripts/dev-run.sh

### Systemd (Linux only)

Use the bundled unit file and install/uninstall steps in
`docs/LINUX_SYSTEMD.md`.

### Log Retention (Dev VM)

Update logs live in `/opt/bookdarr-dev/Logs` and are not rotated automatically.
See `docs/LOGGING.md` for a logrotate example and cleanup guidance.

## Diagnostics & Update Workflow

Every change to Bookdarr must follow the same tightly-controlled routine so we keep the diagnostics repo, changelog, and UI version in sync:

1. Run the native update script on the Ubuntu VM. Point it at the next sequential `Logs/update-0XX.log` file so the run is logged for later reference:

   ```bash
   LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh
   ```

   When invoking the command over SSH, include the full path so the shell sees the same layout every time:

   ```bash
   ssh -i ~/.ssh/bookdarr-agent joe@192.168.0.103 'LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh'
   ```

   The update script uploads the generated log bundle to `thashiznit2003/Bookdarr-Diagnostics` before exiting, so you can trust it to deliver the diagnostic archive every time (success or failure). Housekeeping note: keep iterating `update-0XX.log` (01, 02, 03, …) for every run so the diagnostics repo shows a linear history.

2. Commit and push your changes to GitHub on `develop` immediately after they build locally. Tag the release as `snapshot-YYYYMMDD-HHMM`, then push the tag along with the branch so the remote mirrors the local history.

3. Update `src/Directory.Build.props` with the new semantic version (e.g., bump from `1.3.26.*` to `1.3.27.*`) and make sure the UI header now reports exactly that version string. The header reads the version from `/initialize.json`, so keep `BuildInfo.Version` aligned with the assembly version.

4. After the push, verify that the diagnostics bundle exists in `Bookdarr-Diagnostics` and that any changed logs are attached. The `Diagnostics` button in the sidebar can trigger the upload manually, but the update script handles it automatically, so this is mostly a sanity check.

These steps are the “always run” checklist in the handoff documentation so that every agent coming after you can follow the same workflow without reminding you again.

## Support

This project won't use Discord for support. If you have a problem, please file
an issue or start a discussion.

## Contributors & Developers

Help is very welcome. Priority is on fixing quality of life issues

- [ ] Monitor series.
- [ ] Hardcover bookshelf import.
- [x] Support ebook and audio files in the same root.

## Roadmap

See `docs/ROADMAP.md` for major upcoming milestones, especially the emerging
multi-user/shared book pool architecture outlined in `docs/MULTI_USER.md`.

### License

This is a derivative work of the [Readarr](https://github.com/Readarr/Readarr)
and [Prowlarr](https://github.com/Prowlarr/Prowlarr) projects which are both
licensed [GPLv3](http://www.gnu.org/licenses/gpl.html). This project is
therefore also licensed under the terms of GPLv3.

Copyright 2025
