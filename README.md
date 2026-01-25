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

It is recommended to give Bookdarr a healthy amount of storage space if you intend to download Audiobooks, as they can get pretty large.

Downloads should be where your download client saves what is downloaded.  Change the volume path accordingly for your system.  

## Usage Notes

- The mobile web UI is available for phones and tablets.
- Bookdarr supports BOTH Audiobooks AND Ebooks in its UI.  No need for hosting two instances of this application.  
- For reading or listening, use a native ebook reader or audiobook player on
  your device of choice.
- The app does have a reader and audiobook player built-in, but you are free to use any other app, for example, the Apple Books app on your iPhone.  You will only need to download the book onto your device to use it, which you can do from the Library -> Books -> <Book> -> Files
- I have integrated ffmpeg into this application, in order to convert multi-file audiobooks into a single m4b file.  It's a little slow, but appears to work well.  If it doesn't work for you, the fork button is above.  
- Indexers and Download clients are incorporated exactly like they are for Radarr/Sonarr apps, and there are multiple setup guides available on the internet.  Set up Prowlarr and/or Jackett and your download client, outside of Bookdarr (usually as separate Docker containers) to make this work for you.  Bookdarr is not responsible for setting up your download client or indexers or what may come of using any such service or application.
- Google Books is used as a metadata provider for book details only.  It is using a free tier by default, which is no worse than googling something in terms of data acquisition.  However, there is an option of adding a Google Books API key to get more searches, if you hit a usage limit.  This Google Books API key functionality has not been tested, so use at your own risk.  I wanted to ensure it worked using the free tier, and only once hit a usage limit.  Open Library is a backup metadata provider, also being used to acquire book data when Google Books may not have information.
- Calibre server integration exists, but has not been tested, as I do not use it.  Functionality should be the same as Readarr used.  You are free to fork this repo and develop yourself to get Calibre server integration working if it does not work for you.
- No support is provided, do not contact me. Use at your own risk.

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
The creator does not want your data, does not scrape your data, and will not 
ever try to acquire your data.  This application is running entirely independently 
on your own machine and is not reporting back to anywhere.
