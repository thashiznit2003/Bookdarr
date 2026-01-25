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

I decided that I wanted to read more, and preferably listen to Audiobooks as my 2026 New Year's resolution, and as an avid user of the -arr stack, I decided to try making Readarr work for me.  

Readarr, as it exists now, sucks. Thus, I forked a fork of it and made Bookdarr:

- Readarr is the obvious base of this program, but Readarr has been deprecated and not updated for several years.  Bookshelf was an attempt at restoring functionality, but lacked in a few areas.  But no fault of the person who made that fork!  Book stuff online likes to hide behind paywalls and shitty APIs, and until AI became mainstream, would have required a massive undertaking and many people to fix.  
- Calendar and automatic monitoring/upgrading of books is gone.  If you want it back, figure out how to implement it properly and fork it yourself. I did not find any metadata providers that provided information for books that had not been released, so I didn't see much point in the calendar, which works much better for Movies/TV Shows in Radarr/Sonarr.  Automatic upgrades for books is also pointless, as there's not much difference between ebooks and spoken word audiobook qualities, and I didn't want files being deleted willy-nilly, which Readarr seemed to love doing.  Different editions of a book in Bookdarr will now just show up as a different book, and you are free to delete the other editions if you added them. 
- I integrated the web UI to work with phones and tablets.  There are a few quirks, but everything appears functional.  Tested with iPhone 16 Pro and a standard iPad.
- I also added User accounts to Bookdarr, but in a very basic capacity.  The Admin still has all editing rights, while the other users, if not made admins, don't.  I highly encourage someone else to make user accounts better.
- This application uses the same authentication as Readarr, which has not been upgraded in any substantial ways.  You are responsible for your own cybersecurity.  I wouldn't expose this to the public internet once deployed.  Again, I highly encourage someone else to fork this if they want to harden authentication.
- Bookdarr, in contrast to Readarr, supports BOTH Audiobooks AND Ebooks in its UI.  No need for hosting two instances of this application.
- The app does have a reader and audiobook player built-in, but you are free to use any other app, for example, the Apple Books app on your iPhone.  You will only need to download the book onto your device to use it, which you can do from Library -> Books -> <Book> -> Files
- I have integrated ffmpeg into this application, in order to convert multi-file audiobooks into a single m4b file.  It's a little slow, but appears to work well.  If it doesn't work for you, the fork button is above.  
- Indexers and Download clients are incorporated exactly like they are for Radarr/Sonarr apps, and there are multiple setup guides available on the internet.  Set up Prowlarr and/or Jackett and your download client, outside of Bookdarr (usually as separate Docker containers) to make this work for you.  Bookdarr is not responsible for setting up your download client or indexers or what may come of using any such service or application.
- I DID NOT TEST USENET.  However, I didn't change anything regarding Usenet, so it should work as it did/does in Readarr/Radarr/Sonarr.  If it doesn't work, fork it.  
- One variance with Indexers is that I added Anna's Archive to Bookdarr, so they will show up in searches if enabled.  However, the "Download" button will open the Anna's Archive site for the book file you clicked, where you can download the file manually, and then import it manually into the book in Bookdarr.  This works fine, but adds a few extra steps to acquiring and organizing the files.  I'm not smart enough to figure out a way to use a download client to do this all automatically. 
- Google Books is used as a metadata provider for book details only.  It is using a free tier by default, which is no worse than googling something in terms of data acquisition.  However, there is an option of adding a Google Books API key to get more searches, if you hit a usage limit.  This Google Books API key functionality was implemented by AI (like every other change), and has not been tested, so use at your own risk.  I wanted to ensure it worked using the free tier, and only once did I hit a usage limit.  Open Library is a backup metadata provider, also being used to acquire book data when Google Books may not have information.  There is also an option, found in Settings -> Metadata, where you can switch between Google books and Open Library as your primary metadata provider.  Restart the container after switching providers.  
- Calibre server integration has not been changed from its implementation in Readarr, but has also not been tested, as I do not use it and it doesn't appear to provide much benefit now that many of its features are available in Bookdarr.  However, the functionality should be the same as Readarr for Calibre.  You are free to fork this repo and develop yourself to get Calibre server integration working if it does not work for you.
- No support is provided, do not attempt to contact me, I will not answer. Use at your own risk.

## License

Bookdarr remains licensed under GPLv3, inherited from Readarr and Bookshelf.
See `LICENSE` for details. You are free to modify and distribute this software
under that license.

## Origins

This fork began from Readarr and Bookshelf and evolved into Bookdarr. Nearly
all changes in this fork were implemented using OpenAI's Codex extension in VS
Code, with a minimal amount done using Claude Code. The creator is not a traditional 
developer, and makes no claim to the original intent or source of Readarr, Bookshelf, 
ffmpeg, or any ebook conversion, viewing, audiobook playing, or other tools included in Bookdarr. 
The creator does not want your data, does not scrape your data, and will not 
ever try to acquire your data.  Ain't nobody got time for that.  This application is running 
entirely independently on your own machine and is not reporting back to anywhere.
