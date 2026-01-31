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
- Calendar and automatic monitoring/upgrading of books is gone.  If you want it back, figure out how to implement it properly and fork it yourself. I did not find any metadata providers that provided information for books that had not yet been released, so I didn't see much point in the calendar, which works much better for Movies/TV Shows in Radarr/Sonarr.  I also found Automatic upgrades for books to be pointless, as there's not a huge difference between ebooks and spoken word audiobook qualities, and I didn't want files being deleted willy-nilly, which Readarr seemed to love doing.  Different editions of a book in Bookdarr will now just show up as a different book, and you are free to delete the other editions if you added them. I see how this could be useful for textbook editions that change every year, but did not have that at the forefront of my mind when I made this.  I may revisit this in the future for explicitly textbook purposes. 
- I integrated the web UI to work with phones and tablets.  There are a few quirks, but everything appears functional.  Tested with iPhone 16 Pro and a standard iPad.
- I also added User accounts to Bookdarr, but in a very basic capacity.  The Admin still has all editing rights, while the other users, if not made admins, don't.  I highly encourage someone else to make user accounts better.  I may change this in the future myself, as this is not meant to be a media server, but more an organizer/downloader.
- This application uses the same authentication as Readarr, which has not been upgraded in any substantial ways.  You are responsible for your own cybersecurity.  I wouldn't expose this to the public internet once deployed, and would recommend this stay entirely local.  Again, I highly encourage someone else to fork this if they want to harden authentication.
- Bookdarr, in contrast to Readarr, supports BOTH Audiobooks AND Ebooks in its UI.  No need for hosting two instances of this application.
- Many audiobooks come as multiple MP3/audio files.  The ability to combine these multiple files into one single M4B file is also built in to this application, called "Combine Audiobooks", which is enabled when the app sees multiple audio files in a book's file list.  
- The app has an ebook reader and audiobook player built-in, but you are free to use any other app, for example, the Apple Books app on your iPhone.  You will only need to download the book onto your device to use it, which you can do from Library -> Books -> <Book> -> Files.  Once it is downloaded to your device, it is YOUR responsibility to figure out how to open it in another app.
- Indexers and Download clients should work exactly as they do for Radarr/Sonarr apps, and there are multiple setup guides available on the internet.  I did not change the functionality of the indexers or download clients, so it should be no different from any other -arr app.  Set up Prowlarr and/or Jackett and your download client outside of Bookdarr (usually as separate Docker containers) to make this work for you.  Bookdarr is not responsible for setting up your download client or indexers or what may come of using any such service or application.  Use a VPN. 
- I DID NOT TEST USENET, as I do not use it.  However, I didn't change anything regarding Usenet, so if it doesn't work, feel free to fork it.  
- One small variance with Indexers is that I added Anna's Archive to Bookdarr, so ebooks from Anna's Archive will show up in searches if you enable it.  However, the "Download" button will open the Anna's Archive site for the book file you clicked, where you can then download the file manually using their website, and back in Bookdarr, you can then import it manually into the book in Bookdarr using the button on the toolbar.  This works fine, but does add a few extra steps to acquiring and organizing the files.  I'm not, and OpenAI Codex is apparently not, smart enough to figure out a way to use a download client to implement this in a standard way like torrents. I did try.
- Google Books is used as a secondary metadata provider for book details only, and google likes to throttle.  It is using a free tier by default, which is no worse than googling something in terms of data acquisition.  However, there is an option of adding a Google Books API key to get more searches, if you hit a usage limit.  This Google Books API key additional functionality was implemented by AI (like every other change), and has not been tested, so use at your own risk.  I wanted to ensure it worked using the free tier, but I have hit usage limits, seemingly arbitrarily.  Open Library is the primary metadata provider used to acquire book data.  There is also an option, found in Settings -> Metadata, where you can switch between Google books and Open Library as your primary metadata provider.  Restart the container after switching providers.  There is no guarantee that google books will continue working for this, as I'm not paying google any money and don't recommend you do for this, either.
- Calibre server integration has not been changed from its implementation in Readarr, but has also not been tested, as I do not use it and it doesn't appear to provide much benefit now that many of its features are available in Bookdarr.  However, the functionality should be the same as Readarr for Calibre.  You are free to fork this repo and develop yourself to get Calibre server integration working if it does not work for you.
- No support will ever be provided.  Do not attempt to contact me unless I've contacted you first.  I will not answer.  You're on your own.

## License

Bookdarr remains licensed under GPLv3, inherited from Readarr and Bookshelf.
See `LICENSE` for details. You are free to modify and distribute this software
under that license. All sub-apps for Bookdarr are licensed under their own software license.  
AI kind of implements stuff willy-nilly.  So if something is wrong, I'll try to rectify it, but 
everything used should have had a standard GPLv3 license.

## Origins

This fork began from Readarr and Bookshelf and evolved into Bookdarr. Nearly
all changes in this fork were implemented using OpenAI's Codex extension in VS
Code, with a minimal amount done using Claude Code. The creator is not a traditional 
developer, and makes no claim to the original intent or source of Readarr, Bookshelf, 
ffmpeg, or any ebook conversion, viewing, audiobook playing, or other tools included in Bookdarr. 
The creator does not want your data, does not scrape your data, and will not 
ever try to acquire your data.  Ain't nobody got time for that.  This application is running 
entirely independently on your own machine and is not reporting back to anywhere.
