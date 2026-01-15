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
Docker images will be published under `thashiznit2003/bookdarr`. Until then,
build locally from source.

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
triggered unless a preferred file is still missing.

## Install Script (Source Build)

### Install Script (Source Build)

This uses Docker to build from source and logs output to `/opt/bookdarr/install.log`.
By default it only builds the image; redeploy your Portainer stack to start the container.

    sudo mkdir -p /opt/bookdarr && sudo curl -L https://raw.githubusercontent.com/thashiznit2003/Bookdarr/develop/scripts/install-bookdarr.sh -o /opt/bookdarr/install-bookdarr.sh && sudo chmod +x /opt/bookdarr/install-bookdarr.sh && sudo /opt/bookdarr/install-bookdarr.sh

### Docker Compose / Portainer Stack

Use `docker-compose.yml` for Portainer stacks or local compose deployments.
It assumes a locally built image (`bookdarr:local`) and mounts `/downloads`
inside the container for your download client.

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

Every change to Bookdarr must be accompanied by:

1. A diagnostics push to `thashiznit2003/Bookdarr-Diagnostics`.
2. An update run on the Ubuntu VM via the unlocked SSH key (`~/.ssh/bookdarr-agent`).
3. A git tag (`snapshot-YYYYMMDD-HHMM`) and push on `develop`.
4. A version bump so the UI’s top-left corner matches the new release.

Run this command on the Ubuntu VM after every change (incrementing the `update-0XX.log` file name and keeping the same path):

```bash
LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh
```

Use the unlocked key with:

```bash
ssh -i ~/.ssh/bookdarr-agent joe@192.168.0.103 'LOG_FILE="/opt/bookdarr-dev/Logs/update-0XX.log" sudo /opt/bookdarr-dev/scripts/update-dev.sh'
```

The script now pushes diagnostics bundles before every exit (success or failure),
so the log file you see in `/opt/bookdarr-dev/Logs/update-0XX.log` will automatically
be zipped and committed to `Bookdarr-Diagnostics`. Diagnostics pushes must include
the latest update log plus any log files that changed during the run.

Every change also requires:

- Updating `src/Directory.Build.props` (AssemblyVersion) to the new minor version.
- Ensuring the UI reports the same version string in the top-left corner.
- Tagging the repo (`snapshot-YYYYMMDD-HHMM`) and pushing the tag and commits to `develop`.
- Notifying the diagnostics repo (push the zipped bundle; a `Diagnostics` button exists in
  the sidebar to help, but the update script already pushes the bundle automatically).

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
