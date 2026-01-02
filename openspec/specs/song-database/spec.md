# Song Database Specification

## Purpose

Provide comprehensive song management functionality including CRUD operations, search, filtering, and import/export capabilities.

## Requirements

### Requirement: Song CRUD Operations
The system SHALL provide complete Create, Read, Update, Delete operations for songs.

#### Scenario: Add new song
- WHEN `Database.addSong(songData)` is called with valid data
- THEN a new song SHALL be created with a unique UUID
- AND timestamps (createdAt, updatedAt) SHALL be set
- AND the song SHALL be saved to LocalStorage
- AND the song SHALL be returned

#### Scenario: Add song with missing required fields
- GIVEN a song object missing `title` or `artist`
- WHEN `Database.addSong(songData)` is called
- THEN an error SHALL be thrown
- AND no song SHALL be saved

#### Scenario: Get song by ID
- GIVEN a song exists with ID "abc-123"
- WHEN `Database.getSongById('abc-123')` is called
- THEN the song object SHALL be returned

#### Scenario: Get non-existent song
- WHEN `Database.getSongById('invalid-id')` is called
- THEN `null` SHALL be returned

#### Scenario: Get all songs
- WHEN `Database.getAllSongs()` is called
- THEN an array of all songs SHALL be returned
- AND songs SHALL be sorted by creation date (newest first)

#### Scenario: Update song
- GIVEN a song exists with ID "abc-123"
- WHEN `Database.updateSong('abc-123', { title: 'New Title' })` is called
- THEN the song's title SHALL be updated
- AND the `updatedAt` timestamp SHALL be refreshed
- AND the changes SHALL be persisted to LocalStorage

#### Scenario: Update non-existent song
- WHEN `Database.updateSong('invalid-id', data)` is called
- THEN an error SHALL be thrown

#### Scenario: Delete song
- GIVEN a song exists with ID "abc-123"
- WHEN `Database.deleteSong('abc-123')` is called
- THEN the song SHALL be removed from the database
- AND the changes SHALL be persisted to LocalStorage
- AND `true` SHALL be returned

#### Scenario: Delete non-existent song
- WHEN `Database.deleteSong('invalid-id')` is called
- THEN `false` SHALL be returned
- AND no error SHALL be thrown

### Requirement: Song Search
The system SHALL provide text-based search across song metadata.

#### Scenario: Search by title
- GIVEN songs exist with titles "Bohemian Rhapsody", "Stairway to Heaven"
- WHEN `Database.searchSongs('Bohemian')` is called
- THEN only "Bohemian Rhapsody" SHALL be returned

#### Scenario: Search by artist
- GIVEN songs by "Queen" and "Led Zeppelin"
- WHEN `Database.searchSongs('Queen')` is called
- THEN only songs by "Queen" SHALL be returned

#### Scenario: Case-insensitive search
- GIVEN a song with title "Bohemian Rhapsody"
- WHEN `Database.searchSongs('bohemian')` is called
- THEN the song SHALL be found and returned

#### Scenario: Search multiple fields
- WHEN `Database.searchSongs('Rock')` is called
- THEN songs matching "Rock" in title, artist, album, OR genre SHALL be returned

#### Scenario: Empty search query
- WHEN `Database.searchSongs('')` is called
- THEN all songs SHALL be returned

### Requirement: Song Filtering
The system SHALL provide filtering by genre, decade, difficulty, and tags.

#### Scenario: Filter by genre
- GIVEN songs with genres "Rock", "Pop", "Jazz"
- WHEN `Database.filterSongs({ genre: 'Rock' })` is called
- THEN only songs with genre "Rock" SHALL be returned

#### Scenario: Filter by decade
- GIVEN songs from 1970s, 1980s, 1990s
- WHEN `Database.filterSongs({ decade: '1970s' })` is called
- THEN only songs with year 1970-1979 SHALL be returned

#### Scenario: Filter by difficulty
- WHEN `Database.filterSongs({ difficulty: 'hard' })` is called
- THEN only songs with difficulty "hard" SHALL be returned

#### Scenario: Filter by tags
- GIVEN songs with tags ["classic", "party"], ["classic", "slow"]
- WHEN `Database.filterSongs({ tags: ['classic'] })` is called
- THEN all songs containing the "classic" tag SHALL be returned

#### Scenario: Multiple filters (AND logic)
- WHEN `Database.filterSongs({ genre: 'Rock', decade: '1970s' })` is called
- THEN only songs matching BOTH filters SHALL be returned

#### Scenario: No filters
- WHEN `Database.filterSongs({})` is called
- THEN all songs SHALL be returned

### Requirement: Song Sorting
The system SHALL provide sorting by various fields.

#### Scenario: Sort by title ascending
- WHEN `Database.sortSongs(songs, 'title', 'asc')` is called
- THEN songs SHALL be sorted alphabetically by title (A-Z)

#### Scenario: Sort by year descending
- WHEN `Database.sortSongs(songs, 'year', 'desc')` is called
- THEN songs SHALL be sorted by year (newest first)

#### Scenario: Sort by artist
- WHEN `Database.sortSongs(songs, 'artist', 'asc')` is called
- THEN songs SHALL be sorted alphabetically by artist name

#### Scenario: Sort by play count
- WHEN `Database.sortSongs(songs, 'playCount', 'desc')` is called
- THEN songs SHALL be sorted by play count (most played first)

### Requirement: Import Songs
The system SHALL allow importing songs from JSON files.

#### Scenario: Import valid JSON
- GIVEN a valid JSON file with song array
- WHEN `Database.importSongs(jsonData)` is called
- THEN all songs SHALL be validated
- AND valid songs SHALL be added to the database
- AND duplicates SHALL be skipped (based on youtubeId)
- AND the count of imported songs SHALL be returned

#### Scenario: Import with invalid JSON structure
- GIVEN a JSON file with invalid structure
- WHEN `Database.importSongs(jsonData)` is called
- THEN an error SHALL be thrown
- AND no songs SHALL be imported

#### Scenario: Import with some invalid songs
- GIVEN a JSON array with 5 songs, 2 of which are invalid
- WHEN `Database.importSons(jsonData)` is called
- THEN the 3 valid songs SHALL be imported
- AND the 2 invalid songs SHALL be skipped
- AND a warning SHALL be logged for each skipped song

#### Scenario: Import duplicate songs
- GIVEN 3 songs in import file
- AND 2 of them already exist (same youtubeId)
- WHEN `Database.importSongs(jsonData)` is called
- THEN only 1 new song SHALL be imported
- AND duplicates SHALL be logged as skipped

### Requirement: Export Songs
The system SHALL allow exporting songs to JSON format.

#### Scenario: Export all songs
- WHEN `Database.exportSongs()` is called
- THEN a JSON string SHALL be returned
- AND it SHALL contain all songs with complete metadata

#### Scenario: Export filtered songs
- WHEN `Database.exportSongs({ genre: 'Rock' })` is called
- THEN a JSON string SHALL be returned
- AND it SHALL contain only songs matching the filter

#### Scenario: Export with pretty formatting
- WHEN `Database.exportSongs(null, true)` is called
- THEN the JSON SHALL be formatted with indentation
- AND it SHALL be human-readable

#### Scenario: Empty database export
- GIVEN the database is empty
- WHEN `Database.exportSongs()` is called
- THEN a JSON string with an empty songs array SHALL be returned

### Requirement: YouTube ID Validation
The system SHALL validate YouTube video IDs before saving.

#### Scenario: Valid YouTube ID
- GIVEN a YouTube ID "dQw4w9WgXcQ" (11 characters, alphanumeric)
- WHEN `Database.validateYouTubeId(id)` is called
- THEN `true` SHALL be returned

#### Scenario: Invalid YouTube ID format
- GIVEN a YouTube ID "invalid!" (contains special characters)
- WHEN `Database.validateYouTubeId(id)` is called
- THEN `false` SHALL be returned

#### Scenario: YouTube ID too short
- GIVEN a YouTube ID "abc" (less than 11 characters)
- WHEN `Database.validateYouTubeId(id)` is called
- THEN `false` SHALL be returned

#### Scenario: Extract and validate from URL
- GIVEN a YouTube URL "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
- WHEN `Database.addSong({ youtubeUrl: url })` is called
- THEN the ID SHALL be extracted automatically
- AND it SHALL be validated
- AND the song SHALL be saved with the extracted ID

### Requirement: Song Validation
The system SHALL validate all song data before saving.

#### Scenario: Valid song data
- GIVEN complete song data with all required fields
- WHEN `Database.validateSong(songData)` is called
- THEN `{ valid: true, errors: [] }` SHALL be returned

#### Scenario: Missing title
- GIVEN song data without a title
- WHEN `Database.validateSong(songData)` is called
- THEN `{ valid: false, errors: ['Title is required'] }` SHALL be returned

#### Scenario: Missing artist
- GIVEN song data without an artist
- WHEN `Database.validateSong(songData)` is called
- THEN `{ valid: false, errors: ['Artist is required'] }` SHALL be returned

#### Scenario: Invalid year
- GIVEN song data with year 1799 (before 1800)
- WHEN `Database.validateSong(songData)` is called
- THEN an error SHALL be included for invalid year

#### Scenario: Invalid difficulty
- GIVEN song data with difficulty "extreme" (not in allowed values)
- WHEN `Database.validateSong(songData)` is called
- THEN an error SHALL be included for invalid difficulty

#### Scenario: Title too long
- GIVEN song data with title longer than 200 characters
- WHEN `Database.validateSong(songData)` is called
- THEN an error SHALL be included for title length

### Requirement: Database Manager Screen
The system SHALL provide a comprehensive UI for song management.

#### Scenario: Display song list
- WHEN the database-manager screen is rendered
- THEN all songs SHALL be displayed in a scrollable list
- AND each song SHALL show title, artist, year, genre

#### Scenario: Empty database state
- GIVEN the database is empty
- WHEN the database-manager screen is rendered
- THEN an empty state message SHALL be displayed
- AND an "Add Songs" call-to-action SHALL be shown

#### Scenario: Add song button
- GIVEN the database-manager screen is displayed
- WHEN the "Add Song" button is clicked
- THEN a modal form SHALL open
- AND it SHALL contain fields for all song metadata

#### Scenario: Edit song
- GIVEN a song card is displayed
- WHEN the edit button is clicked
- THEN a modal form SHALL open
- AND it SHALL be pre-filled with the song's current data

#### Scenario: Delete song with confirmation
- GIVEN a song card is displayed
- WHEN the delete button is clicked
- THEN a confirmation modal SHALL appear
- AND if confirmed, the song SHALL be deleted
- AND the UI SHALL update to remove the song card

#### Scenario: Search songs in UI
- GIVEN the database-manager screen is displayed
- WHEN text is entered in the search box
- THEN the song list SHALL filter in real-time
- AND only matching songs SHALL be visible

#### Scenario: Filter songs in UI
- GIVEN the database-manager screen is displayed
- WHEN a genre filter is selected
- THEN the song list SHALL update to show only songs of that genre

#### Scenario: Sort songs in UI
- GIVEN the database-manager screen is displayed
- WHEN the sort dropdown is changed to "Year (Newest)"
- THEN the song list SHALL re-order by year descending

#### Scenario: Import via file upload
- GIVEN the database-manager screen is displayed
- WHEN the "Import JSON" button is clicked
- AND a valid JSON file is selected
- THEN the songs SHALL be imported
- AND a success notification SHALL show the count

#### Scenario: Export to file
- GIVEN the database-manager screen is displayed
- WHEN the "Export JSON" button is clicked
- THEN a JSON file download SHALL be triggered
- AND the filename SHALL be "beatmaster-songs-[date].json"

#### Scenario: Bulk selection
- GIVEN multiple songs are displayed
- WHEN the "Select Multiple" mode is activated
- THEN checkboxes SHALL appear on song cards
- AND a bulk actions toolbar SHALL appear

#### Scenario: Bulk delete
- GIVEN multiple songs are selected
- WHEN the "Delete Selected" button is clicked
- THEN a confirmation modal SHALL show the count
- AND if confirmed, all selected songs SHALL be deleted

### Requirement: Default Songs
The system SHALL provide a curated collection of example songs.

#### Scenario: Load default songs
- GIVEN the database is empty
- WHEN the user clicks "Load Example Songs"
- THEN 50+ songs from `data/default-songs.json` SHALL be imported
- AND a success notification SHALL be shown

#### Scenario: Default songs quality
- The default songs SHALL include:
  - Variety of genres (Rock, Pop, Hip-Hop, Jazz, Electronic, Country, etc.)
  - Multiple decades (1960s through 2020s)
  - Mix of difficulties (easy, medium, hard)
  - Well-known songs that are recognizable
  - Valid YouTube IDs for all songs

## Technical Implementation

### Files
- `js/modules/database.js` - Core database CRUD and query logic
- `js/screens/database-manager.js` - Database management UI screen
- `data/default-songs.json` - Curated example song collection

### Data Schema
```javascript
{
  id: "uuid-v4",
  title: "Song Title",           // Required, max 200 chars
  artist: "Artist Name",          // Required, max 100 chars
  year: 1975,                     // Required, 1800-current year
  genre: "Rock",                  // Required
  album: "Album Name",            // Optional
  youtubeId: "dQw4w9WgXcQ",      // Required, 11 chars
  startTime: 30,                  // Optional, seconds
  duration: 20,                   // Optional, seconds (default: 30)
  difficulty: "medium",           // Optional: easy, medium, hard
  tags: ["classic", "70s"],       // Optional, array of strings
  playCount: 0,                   // Auto-managed
  lastPlayed: null,               // Auto-managed, ISO timestamp
  createdAt: "2026-01-01T...",   // Auto-generated
  updatedAt: "2026-01-01T..."    // Auto-updated
}
```

### Allowed Values
- **Difficulty:** `"easy"`, `"medium"`, `"hard"`
- **Genre:** Flexible, but suggested: Rock, Pop, Hip-Hop, R&B, Country, Jazz, Electronic, Classical, Reggae, Blues, Metal, Folk, Latin, Indie, Alternative, Soul, Funk
- **Year:** 1800 - current year
- **YouTube ID:** 11 alphanumeric characters (A-Z, a-z, 0-9, -, _)

### Dependencies
- `js/modules/storage.js` - For LocalStorage persistence
- `js/modules/utils.js` - For UUID generation, YouTube ID extraction
- `js/state.js` - For reactive song list updates

## Acceptance Criteria

- [ ] Can add a new song with all metadata
- [ ] Can edit existing song and see changes reflected
- [ ] Can delete song with confirmation
- [ ] Can search songs by title, artist, album, genre
- [ ] Can filter by genre, decade, difficulty, tags
- [ ] Can sort by title, artist, year, play count
- [ ] Can import valid JSON file
- [ ] Invalid songs in import are skipped with warnings
- [ ] Duplicate songs are detected and skipped
- [ ] Can export all songs to JSON
- [ ] Can export filtered songs to JSON
- [ ] YouTube URLs are automatically parsed to extract ID
- [ ] Invalid YouTube IDs are rejected
- [ ] Song validation catches all required field errors
- [ ] Database manager screen displays all songs
- [ ] Empty state is shown when no songs exist
- [ ] Real-time search filters song list
- [ ] Filter dropdowns update song list
- [ ] Sort dropdown re-orders song list
- [ ] Can select multiple songs for bulk operations
- [ ] Bulk delete removes all selected songs
- [ ] Can load 50+ default example songs
- [ ] All CRUD operations persist to LocalStorage
- [ ] UI updates reactively when songs change

## Status

🔄 **Ready to Implement** (Phase 2 - Next)

## Current Implementation Status (2026-01-01)

### Completed
- ✅ Database module stub created ([js/modules/database.js](js/modules/database.js))
- ✅ Database Manager screen UI implemented with Tailwind ([js/screens/database-manager.js](js/screens/database-manager.js))
- ✅ Navigation to database screen working
- ✅ Empty state placeholder visible

### Pending Implementation
- ⏳ Core database CRUD operations (addSong, updateSong, deleteSong, getSongById, getAllSongs)
- ⏳ Search functionality (searchSongs)
- ⏳ Filter functionality (filterSongs by genre, decade, difficulty, tags)
- ⏳ Sort functionality (sortSongs)
- ⏳ Import/Export JSON
- ⏳ Song validation (validateSong, validateYouTubeId)
- ⏳ Add Song modal form
- ⏳ Edit Song modal form
- ⏳ Delete confirmation modal
- ⏳ Real-time search UI
- ⏳ Filter dropdowns
- ⏳ Sort dropdown
- ⏳ Bulk selection & delete
- ⏳ Create default-songs.json with 50+ songs

### Design Notes
- Using Tailwind CSS for all UI components
- Material Symbols icons for actions (add, edit, delete, search, filter, sort)
- Empty state shows call-to-action to add first song or import examples
- Song cards display: album art placeholder, title, artist, year, genre badges
- Hover states with brightness and scale transitions
- Mobile-first responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)

### Next Immediate Steps
1. Implement database.js CRUD operations
2. Connect Add Song button to modal form
3. Implement song card rendering with real data
4. Add search input with real-time filtering
5. Create default-songs.json file
