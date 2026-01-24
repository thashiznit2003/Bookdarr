# Bookdarr

Bookdarr is a fork of [Readarr](https://github.com/Readarr/Readarr) and
[Bookshelf](https://github.com/pennydreadful/bookshelf). It is a self-hosted
manager for ebooks and audiobooks with a shared book pool and a mobile-friendly
web UI.

Bookdarr has only been tested as a Linux Docker deployment. No support is
provided.

## Quick Start (Docker Hub)

Bookdarr listens on port 8787 and expects these volume mounts:

- `/config` for the application data
- `/books` for your library root
- `/downloads` for your download client output

Docker Compose (recommended for Portainer stacks):

```yaml
services:
  bookdarr:
    image: thashiznit2003/bookdarr:latest
    container_name: bookdarr
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=UTC
    volumes:
      - /bookdarr/config:/config
      - /bookdarr/books:/books
      - /bookdarr/downloads:/downloads
    ports:
      - "8787:8787"
    restart: unless-stopped
```

## Usage Notes

- The mobile web UI is available for phones and tablets.
- For reading or listening, use a native ebook reader or audiobook player on
  your device of choice.
- No support is provided. Use at your own risk.

## License

Bookdarr remains licensed under GPLv3, inherited from Readarr and Bookshelf.
See `LICENSE` for details. You are free to modify and distribute this software
under that license.

## Origins

This fork began from Readarr and Bookshelf and evolved into Bookdarr. Nearly
all changes in this fork were implemented using OpenAI's Codex extension in VS
Code, with a minimal amount done using Claude Code. The creator makes no claim
to the original intent or source of Readarr, Bookshelf, ffmpeg, or any ebook
conversion, viewing, audiobook playing, or other tools included in Bookdarr.
