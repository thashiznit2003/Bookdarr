# Bookdarr Architecture Overview

> **Quick Context for Claude Code**: This document provides comprehensive context about the Bookdarr codebase. Read this at the start of new sessions to understand the application without expensive exploration.

## What is Bookdarr?

Bookdarr is a self-hosted ebook and audiobook collection manager forked from Bookshelf and Readarr. It provides automated book monitoring, download management, and library organization.

**Core Capabilities:**
- Monitors RSS feeds from indexers for new books from favorite authors
- Integrates with Usenet and BitTorrent download clients to grab, sort, and rename books
- Keeps both ebook AND audiobook files for the same book in a single unified instance
- Manages metadata from multiple providers (Google Books, BookInfo)
- Handles quality profiles, custom formats, and automatic upgrades

**Key Differentiators:**
- Stable, self-hosted solution
- Improved metadata options compared to predecessors
- Support for both ebooks and audiobooks in one library
- Uses GitHub issues/discussions (no Discord support)

---

## Tech Stack

### Backend (.NET/C#)
- **.NET 10.0** (per global.json)
- **ASP.NET Core** for web hosting
- **SQLite** (primary) and **PostgreSQL** (optional) for database
- **Dapper** for data access (micro-ORM)
- **DryIoc** for dependency injection
- **NLog** for logging
- **SignalR** for real-time communication
- **FluentValidation** for validation
- **RestSharp** for HTTP client operations

### Frontend (React/JavaScript)
- **React 17.0.2** with Redux for state management
- **Webpack 5** for bundling
- **Babel** for transpilation
- **TypeScript** support (partial)
- **CSS Modules** for styling
- **FontAwesome** for icons
- **React Router 5.2.0** for navigation

### Build & Infrastructure
- Multi-platform builds (Linux x64/musl/arm64, macOS, Windows)
- Docker containerization with Alpine Linux + s6-overlay
- MSBuild + Yarn + Webpack build pipeline

---

## Architecture Pattern

**Clean Architecture / Domain-Driven Design** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│   Browser (React/Redux Frontend)   │
├─────────────────────────────────────┤
│   SignalR (Real-time Updates)      │
├─────────────────────────────────────┤
│   Readarr.Api.V1 (REST API)         │
├─────────────────────────────────────┤
│   Readarr.Http (Middleware, Auth)   │
├─────────────────────────────────────┤
│   NzbDrone.Core (Business Logic)    │
├─────────────────────────────────────┤
│   Database (SQLite/PostgreSQL)      │
└─────────────────────────────────────┘
```

---

## Project Structure

### Backend (`/src/`)

- **`NzbDrone.Core/`** - Business logic and domain models
  - `Books/` - Author, book, book file management
  - `MediaFiles/` - File processing, naming, tagging
  - `Download/` - Download client integration, decision engine
  - `Indexers/` - RSS feed monitoring, search providers
  - `ImportLists/` - Goodreads, LazyLibrarian integration
  - `Notifications/` - 43+ notification providers
  - `MetadataSource/` - Google Books, BookInfo providers
  - `Organizer/` - File naming conventions
  - `Parser/` - Regex-based title/quality parsing
  - `Profiles/` - Quality and metadata profiles
  - `Datastore/` - Database access layer

- **`Readarr.Api.V1/`** - REST API endpoints
  - Controllers for authors, books, calendar, downloads, etc.
  - API models (DTOs)

- **`Readarr.Http/`** - Web hosting infrastructure
  - Authentication/authorization
  - Static file serving
  - Middleware

- **`NzbDrone.Host/`** - Application bootstrap
  - Startup configuration
  - Dependency registration

- **`NzbDrone.Common/`** - Shared utilities
  - Disk operations
  - HTTP utilities
  - Environment helpers

### Frontend (`/frontend/src/`)

- **`App/`** - Root application component
- **`Store/`** - Redux store configuration
- **`Author/`** - Author management UI
- **`Book/`** - Book details and management
- **`AddAuthor/`** - Search and add authors
- **`Calendar/`** - Release calendar
- **`Activity/`** - Queue and history
- **`Settings/`** - Configuration pages
- **`System/`** - Status, logs, tasks
- **`Components/`** - Reusable UI components

---

## Key Components & Services

### Books Management
- **Author Management**: Metadata, monitoring, statistics
- **Book Management**: Editions, series tracking, metadata
- **BookFile Management**: Physical file tracking, renaming, metadata tagging
- **Calibre Integration**: Import/export with Calibre libraries

### Media Processing
- **Parser**: Sophisticated regex-based parsing of titles, authors, quality
- **Organizer**: File naming conventions, folder structure management
- **MediaFiles Service**:
  - Audio tagging: MP3, M4A, M4B, FLAC, OGG, WMA, APE, OPUS
  - Ebook tagging: EPUB, AZW3, MOBI, PDF
  - Audiobook combining/splitting
  - Metadata embedding (TagLibSharp)

### Metadata Providers
- **BookInfo** (bookinfo.pro): Richer metadata, better matching, cover fallbacks
- **Google Books**: Fast, broad coverage, optional API key for higher quota
- **Goodreads**: Legacy support via search proxy
- **OpenLibrary**: Series and genre data

### Download Management
- **Decision Engine**: Quality decisions, upgrade logic, rejection handling
- **Download Clients**:
  - Torrent: qBittorrent, Deluge, Transmission, rTorrent, uTorrent, Vuze, Aria2, Flood
  - Usenet: SABnzbd, NZBGet, NZBVortex, Pneumatic
  - Other: Blackhole, Download Station
- **Tracked Downloads**: Progress monitoring, completion handling
- **Failed Download Handling**: Automatic redownloading

### Indexers
- **Newznab/Torznab** protocol support
- **Private Trackers**: MyAnonaMouse, Gazelle (RED, OPS), IPTorrents, Torrentleech, FileList
- **Public**: Nyaa
- **RSS Feed** support

### Import Lists
- Goodreads lists/shelves
- LazyLibrarian sync
- Readarr cross-instance sync

### Notifications (43 providers)
Discord, Slack, Telegram, Email, SMTP, Plex, Subsonic, Kavita, Pushover, Pushbullet, Gotify, Ntfy, Apprise, Custom Scripts, Webhook, Twitter, Signal, Join, and many more

### System Services
- **Authentication**: API keys, forms auth, external auth
- **Backup**: Automated backups with retention
- **Update**: Self-updating mechanism
- **Health Checks**: System diagnostics
- **Task Scheduler**: Background jobs (RSS sync, refresh, cleanup)
- **Remote Path Mappings**: Docker/network path translation

---

## How Components Interact

### Book Acquisition Flow

```
1. RSS Sync (scheduled task)
   ↓
2. Indexers → Fetch new releases
   ↓
3. Parser → Parse title/quality
   ↓
4. Decision Engine → Evaluate against profiles
   ↓
5. Download Service → Send to download client
   ↓
6. Tracked Downloads → Monitor progress
   ↓
7. Completed Download Handler → Process finished downloads
   ↓
8. Import Service → Parse/validate files
   ↓
9. File Naming → Rename according to format
   ↓
10. MediaFile Service → Move to library
    ↓
11. Metadata Service → Write tags/covers
    ↓
12. SignalR → Notify UI
```

### Metadata Refresh Flow

```
1. Author Refresh Command
   ↓
2. ConfigService → Determine provider (Google Books or BookInfo)
   ↓
3. BookInfoProxy/GoogleBooksProxy → Fetch metadata
   ↓
4. Author/Book Services → Update database
   ↓
5. MediaCover Service → Download/cache covers
   ↓
6. Event Aggregator → Broadcast changes
   ↓
7. UI updates via SignalR
```

---

## Notable Patterns & Conventions

### Architecture Patterns
- **Repository Pattern**: Each domain entity has a repository interface/implementation
- **Service Layer**: Business logic encapsulated in service classes
- **CQRS-lite**: Commands for actions, queries for reads
- **Event-Driven**: Event aggregator for cross-cutting concerns
- **Factory Pattern**: Notification/Download Client/Indexer factories
- **Specification Pattern**: Decision engine uses specifications for rules
- **Provider Pattern**: Pluggable indexers, download clients, notifications

### Code Conventions
- **Namespace**: "NzbDrone" namespace (legacy from parent project) maps to "Readarr" project names
- **Lazy Loading**: `LazyLoaded<T>` for related entities
- **Entity Base Class**: All domain models inherit from `Entity<T>`
- **Dependency Injection**: Constructor injection throughout

### Frontend Patterns
- **Container/Component**: Connector components handle Redux, presentational components are pure
- **Duck Pattern**: Redux actions/reducers organized by feature
- **Higher-Order Components**: For common functionality
- **CSS Modules**: Scoped styling per component

### Configuration
- Environment variables for deployment settings
- Database config table for runtime settings
- XML config files (legacy support)
- Central package management (Directory.Packages.props)

### Testing
- **NUnit** for unit tests
- **Selenium** for automation tests
- **Moq** for mocking
- **FluentAssertions** for readable assertions

---

## Common Development Tasks

### Adding a New Notification Provider
1. Create provider class in `src/NzbDrone.Core/Notifications/[Provider]/`
2. Inherit from `NotificationBase<TSettings>`
3. Implement `OnGrab`, `OnReleaseImport`, etc.
4. Add settings class with validation
5. Register in DI container
6. Add frontend component in `frontend/src/Settings/Notifications/`

### Adding a New Download Client
1. Create client in `src/NzbDrone.Core/Download/Clients/[Client]/`
2. Inherit from `DownloadClientBase<TSettings>`
3. Implement `Download`, `GetItems`, `RemoveItem`, etc.
4. Add to frontend settings UI

### Adding a New Indexer
1. Create indexer in `src/NzbDrone.Core/Indexers/[Indexer]/`
2. Inherit from appropriate base (e.g., `TorznabIndexer`)
3. Implement capabilities and search methods
4. Add frontend configuration

### Modifying File Naming
- Logic in `src/NzbDrone.Core/Organizer/FileNameBuilder.cs`
- Token replacement system for dynamic names
- Preview generation for UI

### Adding Metadata Fields
1. Update database migration in `src/NzbDrone.Core/Datastore/Migration/`
2. Add property to entity model
3. Update repository if needed
4. Update API DTOs in `Readarr.Api.V1/`
5. Update frontend Redux models and UI

---

## Key File Paths Reference

| Purpose | Path |
|---------|------|
| Business Logic | `/src/NzbDrone.Core/` |
| REST API | `/src/Readarr.Api.V1/` |
| Frontend | `/frontend/src/` |
| Host/Startup | `/src/NzbDrone.Host/` |
| Utilities | `/src/NzbDrone.Common/` |
| Database Migrations | `/src/NzbDrone.Core/Datastore/Migration/` |
| Tests | `/src/NzbDrone.Core.Test/` |
| Docker | `/alpine.Dockerfile` |
| Build Scripts | `/build.sh`, `/package.sh` |
| Configuration | `appsettings.json`, `global.json` |

---

## Database Schema Highlights

- **Authors**: Author metadata, monitoring settings, statistics
- **Books**: Book details, editions, series information
- **BookFiles**: Physical files, quality, media info
- **DownloadHistory**: Download attempts and outcomes
- **ImportListExclusions**: Books/authors to skip
- **QualityProfiles**: User-defined quality preferences
- **MetadataProfiles**: Metadata filtering rules
- **Config**: Application settings key-value store
- **Commands**: Background task queue

---

## Environment & Deployment

### Configuration Locations
- Linux: `~/.config/Readarr/`
- Windows: `%APPDATA%/Readarr/`
- Docker: `/config/`

### Important Environment Variables
- `READARR__INSTANCENAME`: Instance identifier
- `READARR__POSTGRES__HOST`: PostgreSQL host (if not using SQLite)
- `READARR__APIKEY`: API key for authentication
- `READARR__BRANCH`: Update branch (develop/nightly/master)

### Build Commands
```bash
./build.sh               # Build backend
cd frontend && yarn build # Build frontend
./package.sh             # Create distribution packages
```

---

## Integration Points

### External Services
- **Download Clients**: Various APIs (qBittorrent WebUI, SABnzbd API, etc.)
- **Indexers**: Newznab/Torznab XML API, private tracker APIs
- **Metadata**: Google Books API, BookInfo API, Goodreads (via proxy)
- **Notifications**: REST APIs, webhooks, SMTP
- **Media Servers**: Plex, Subsonic, Kavita APIs

### File System
- Monitors author folders for changes
- Writes metadata to ebook/audiobook files
- Manages cover art cache
- Handles atomic moves and permissions

---

## Performance Considerations

- **Database**: SQLite for simplicity, PostgreSQL for high concurrency
- **Caching**: In-memory caching for metadata and covers
- **Background Tasks**: Scheduled via custom task scheduler
- **SignalR**: Efficient real-time updates to frontend
- **File Scanning**: Incremental scanning, change detection

---

## Security Features

- API key authentication
- Form-based authentication with cookies
- Optional external authentication
- SSL/TLS support
- Path traversal protection
- Input validation via FluentValidation

---

*This document provides a comprehensive overview of Bookdarr's architecture. For specific implementation details, refer to the relevant source files.*
