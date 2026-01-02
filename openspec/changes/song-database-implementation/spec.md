# Song Database Implementation - OpenSpec

## Overview

Implement complete song management system including CRUD operations, search, filtering, sorting, import/export, and a comprehensive UI for managing the song library.

**Priority:** High
**Status:** Completed
**Estimated Effort:** 3-4 days
**Started:** 2026-01-01\r\n**Completed:** 2026-01-01

---

## Tasks

### 1. Core Database Module (js/modules/database.js)

#### 1.1 CRUD Operations
- [x] Implement `addSong(songData)` - Create new song with UUID and timestamps
- [x] Implement `getSongById(id)` - Retrieve single song
- [x] Implement `getAllSongs()` - Retrieve all songs sorted by creation date
- [x] Implement `updateSong(id, updates)` - Update existing song
- [x] Implement `deleteSong(id)` - Delete song
- [x] Add validation checks for required fields (title, artist, youtubeId)

**Acceptance Criteria:**
- All operations persist to LocalStorage via Storage module
- Timestamps (createdAt, updatedAt) auto-managed
- Returns appropriate errors for invalid operations
- UUID generation for new songs

#### 1.2 Song Validation
- [x] Implement `validateSong(songData)` - Returns { valid, errors }
- [x] Validate required fields (title, artist, youtubeId)
- [x] Validate optional fields (year range 1800-current, difficulty enum)
- [x] Validate title length (max 200 chars)
- [x] Validate artist length (max 100 chars)
- [x] Implement `validateYouTubeId(id)` - Check format (11 alphanumeric chars)

**Acceptance Criteria:**
- All validation rules enforced
- Clear error messages returned
- YouTube URL extraction supported

#### 1.3 Search & Filter
- [x] Implement `searchSongs(query)` - Search title, artist, album, genre
- [x] Case-insensitive search
- [x] Empty query returns all songs
- [x] Implement `filterSongs(filters)` - Filter by genre, decade, difficulty, tags
- [x] Support multiple filters with AND logic
- [x] Implement decade calculation (1970s = 1970-1979)

**Acceptance Criteria:**
- Search works across multiple fields
- Filters can be combined
- Returns empty array if no matches

#### 1.4 Sorting
- [x] Implement `sortSongs(songs, field, direction)`
- [x] Support fields: title, artist, year, playCount, createdAt
- [x] Support directions: 'asc', 'desc'
- [x] Case-insensitive string sorting

**Acceptance Criteria:**
- All sort fields work correctly
- Both ascending and descending supported

#### 1.5 Import/Export
- [x] Implement `importSongs(jsonData)` - Import from JSON
- [x] Validate JSON structure
- [x] Skip invalid songs with warnings
- [x] Detect duplicates by youtubeId
- [x] Return count of imported songs
- [x] Implement `exportSongs(filters, pretty)` - Export to JSON string
- [x] Support filtered export
- [x] Support pretty formatting

**Acceptance Criteria:**
- Valid JSON imports successfully
- Invalid songs skipped gracefully
- Duplicates detected and skipped
- Export produces valid JSON

---

### 2. Database Manager Screen (js/screens/database-manager.js)

#### 2.1 Song List Display
- [x] Render song cards in responsive grid (1/2/3 columns)
- [x] Display: album art placeholder, title, artist, year, genre badge
- [x] Show play count if > 0
- [x] Add hover effects (brightness, scale)
- [x] Show empty state when no songs

**Acceptance Criteria:**
- Songs display in grid layout
- Responsive on mobile/tablet/desktop
- Empty state shown when database empty

#### 2.2 Add Song Modal
- [x] Create modal form with all fields
- [x] Fields: title*, artist*, year*, genre*, album, youtubeId/URL*, startTime, duration, difficulty, tags
- [x] YouTube URL auto-extraction to ID
- [x] Real-time validation feedback
- [x] Submit creates song and updates UI
- [x] Cancel closes modal

**Acceptance Criteria:**
- Modal opens on "Add Song" button click
- All fields present and labeled
- Validation errors shown inline
- Success closes modal and shows notification
- UI updates reactively

#### 2.3 Edit Song Modal
- [x] Reuse Add Song modal component
- [x] Pre-fill with existing song data
- [x] Update on submit
- [x] Show "Edit Song" title

**Acceptance Criteria:**
- Modal pre-filled with current values
- Updates persist on save
- Cancel discards changes

#### 2.4 Delete Song
- [x] Add delete button to song cards
- [x] Show confirmation modal
- [x] Delete on confirm
- [x] Update UI reactively

**Acceptance Criteria:**
- Confirmation required before delete
- Song removed from UI immediately
- Notification shown on success

#### 2.5 Search UI
- [x] Add search input at top
- [x] Real-time filtering as user types
- [x] Debounce search input (300ms)
- [x] Show result count
- [x] Clear search button

**Acceptance Criteria:**
- Search filters list in real-time
- Performance remains smooth with 100+ songs
- Result count accurate

#### 2.6 Filter UI
- [x] Add filter dropdown for genre
- [x] Add filter dropdown for decade
- [x] Add filter dropdown for difficulty
- [x] Show active filter badges
- [x] Clear all filters button
- [x] Combine with search

**Acceptance Criteria:**
- Filters work independently and combined
- Active filters clearly visible
- Can clear individual or all filters

#### 2.7 Sort UI
- [x] Add sort dropdown (Title A-Z, Title Z-A, Year Newest, Year Oldest, Artist A-Z, Most Played)
- [x] Apply sort to filtered/searched results
- [x] Persist sort preference to State

**Acceptance Criteria:**
- All sort options work correctly
- Sort persists across navigation

#### 2.8 Import/Export UI
- [x] Add "Import JSON" button
- [x] File picker for JSON files
- [x] Show import progress/result notification
- [x] Add "Export JSON" button
- [x] Trigger download with filename: `beatmaster-songs-[date].json`
- [x] Add "Export Filtered" option

**Acceptance Criteria:**
- File upload works
- Import shows success count and errors
- Export downloads valid JSON file
- Filtered export only includes visible songs

#### 2.9 Bulk Operations
- [x] Add "Select Multiple" toggle button
- [x] Show checkboxes on song cards when active
- [x] Select all / Deselect all buttons
- [x] Bulk delete selected songs
- [x] Confirmation shows count
- [x] Exit selection mode after action

**Acceptance Criteria:**
- Can select multiple songs
- Bulk delete works correctly
- Confirmation shows accurate count

---

### 3. Default Songs (data/default-songs.json)

- [x] Create JSON file with 50+ songs
- [x] Include variety of genres (Rock, Pop, Hip-Hop, Jazz, Electronic, Country, Metal, etc.)
- [x] Include multiple decades (1960s-2020s)
- [x] Include mix of difficulties (easy, medium, hard)
- [x] All songs have valid YouTube IDs
- [x] Add "Load Example Songs" button to empty state
- [x] Import default songs on button click

**Song Categories (Suggested):**
- Classic Rock: Queen, Led Zeppelin, Pink Floyd, The Beatles
- Pop: Michael Jackson, Madonna, Beyoncé, Taylor Swift
- Hip-Hop: Eminem, Tupac, Biggie, Kendrick Lamar
- Electronic: Daft Punk, The Prodigy, Avicii
- Jazz: Miles Davis, John Coltrane, Ella Fitzgerald
- Country: Johnny Cash, Dolly Parton, Garth Brooks
- Metal: Metallica, Iron Maiden, Black Sabbath
- 80s Hits, 90s Hits, 2000s Hits, 2010s Hits

**Acceptance Criteria:**
- At least 50 songs total
- Balanced distribution across genres and decades
- All YouTube IDs verified as working
- Songs are recognizable/popular

---

### 4. State Integration

- [x] Subscribe to 'songs' state in DatabaseManagerScreen
- [x] Update UI when songs change
- [x] Trigger State.set('songs', newSongs) on all mutations
- [x] Auto-persist to Storage via State

**Acceptance Criteria:**
- UI updates reactively on song changes
- Multiple screens can observe song list
- State persists across page reloads

---

### 5. Utilities Integration

- [x] Use Utils.generateUUID() for song IDs
- [x] Use Utils.extractYouTubeId() for URL parsing
- [x] Use Utils.fuzzyMatch() for search (optional enhancement)
- [x] Add Utils.escapeHTML() for XSS prevention in templates

**Acceptance Criteria:**
- UUID generation works
- YouTube URL extraction supports all formats (watch?v=, youtu.be/, embed/)

---

### 6. Modal System Implementation

#### 6.1 Generic Modal Component
- [x] Create reusable modal in app.js
- [x] `App.showModal({ title, content, footer, onClose })`
- [x] Backdrop blur effect
- [x] Close on backdrop click
- [x] Close on Escape key
- [x] Prevent body scroll when open
- [x] Add `pointer-events-auto` to modal content (not container)

**Acceptance Criteria:**
- Modal centers on screen
- Backdrop clickable to close
- ESC key closes modal
- Can render HTML content

#### 6.2 Form Modal Helper
- [x] `App.showFormModal({ title, fields, onSubmit, initialValues })`
- [x] Auto-generate form from field definitions
- [x] Field types: text, number, select, textarea, tags
- [x] Built-in validation display
- [x] Submit/Cancel buttons

**Acceptance Criteria:**
- Forms render from config
- Validation errors shown inline
- Submit calls callback with form data

---

### 7. Notification System Enhancement

- [x] Ensure notifications have `pointer-events-auto` on toast elements
- [x] Test notification stacking
- [x] Add notification types: success, error, warning, info
- [x] Auto-dismiss timers (success: 3s, error: 5s, warning: 4s)

**Acceptance Criteria:**
- Notifications appear in top-right
- Stack correctly when multiple shown
- Colors match type (green, red, yellow, blue)

---

### 8. Debug Mode Cleanup

- [x] Set `window.DEBUG = false` in production
- [x] Remove or comment out debug script block
- [x] Keep console logging in CONFIG.DEBUG mode
- [x] Remove red button outlines
- [x] Remove ripple effects
- [x] Remove debug info box

**Acceptance Criteria:**
- No debug UI visible in production
- Console clean (only intentional logs)
- Performance improved

---

## Testing Checklist

### Functional Tests
- [x] Can add a new song with all fields
- [x] Can add song with only required fields
- [x] Cannot add song with missing required fields
- [x] YouTube URL automatically extracts to ID
- [x] Can edit existing song
- [x] Edit updates shown immediately
- [x] Can delete song with confirmation
- [x] Search filters songs in real-time
- [x] Search is case-insensitive
- [x] Filter by genre works
- [x] Filter by decade works
- [x] Filter by difficulty works
- [x] Multiple filters combine correctly
- [x] Sort by title A-Z works
- [x] Sort by year newest works
- [x] Sort by artist works
- [x] Can import valid JSON file
- [x] Import skips invalid songs with warning
- [x] Import detects duplicates
- [x] Can export all songs to JSON
- [x] Can export filtered songs
- [x] Exported JSON is valid and importable
- [x] Can select multiple songs
- [x] Can bulk delete selected songs
- [x] Can load example songs from empty state

### UI/UX Tests
- [x] Empty state shows when no songs
- [x] Song cards display all info correctly
- [x] Grid responsive on mobile (1 col)
- [x] Grid responsive on tablet (2 cols)
- [x] Grid responsive on desktop (3 cols)
- [x] Add modal opens and closes
- [x] Edit modal pre-fills data
- [x] Delete confirmation shows
- [x] Notifications appear for actions
- [x] Search input has clear button
- [x] Filter badges show active filters
- [x] Hover effects on cards work
- [x] Buttons have active states

### Edge Cases
- [x] Empty database handled gracefully
- [x] Single song displays correctly
- [x] 100+ songs perform well
- [x] Very long song titles truncate
- [x] Special characters in titles/artists display correctly
- [x] Invalid YouTube IDs rejected
- [x] Corrupt JSON import handled
- [x] LocalStorage quota warning (if implemented)

### Browser Compatibility
- [x] Chrome (latest)
- [x] Firefox (latest)
- [x] Edge (latest)
- [x] Safari (latest) - iOS and macOS

---

## File Changes

### New Files
- `data/default-songs.json` - Example song collection

### Modified Files
- `js/modules/database.js` - Full implementation
- `js/screens/database-manager.js` - Full UI implementation
- `js/app.js` - Add modal system
- `js/modules/utils.js` - Add extractYouTubeId, escapeHTML
- `index.html` - Remove debug mode (set DEBUG = false)

### Dependencies
- `js/state.js` - For reactive updates
- `js/modules/storage.js` - For persistence
- `js/config.js` - For constants

---

## Implementation Order

**Day 1: Core Database Module**
1. Implement CRUD operations (4h)
2. Implement validation (2h)
3. Implement search & filter (2h)

**Day 2: Import/Export & Modal System**
1. Implement sorting (1h)
2. Implement import/export (2h)
3. Create modal system in app.js (3h)
4. Test all database operations (2h)

**Day 3: Database Manager UI**
1. Implement Add Song modal (3h)
2. Implement Edit/Delete (2h)
3. Implement search/filter/sort UI (3h)

**Day 4: Polish & Default Songs**
1. Implement bulk operations (2h)
2. Create default-songs.json (3h)
3. Integration testing (2h)
4. Remove debug mode (1h)

---

## Success Criteria

Complete when:
- All CRUD operations working and persisted
- Search, filter, sort functional
- Import/Export working with error handling
- Add/Edit/Delete UI fully functional
- 50+ example songs available
- All tests passing
- Debug mode removed
- No console errors
- Smooth performance with 100+ songs

---

## Notes

### YouTube ID Formats to Support
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s
dQw4w9WgXcQ (direct ID)
```

### Validation Rules
- **Title:** Required, 1-200 chars
- **Artist:** Required, 1-100 chars
- **Year:** Required, 1800-current year
- **Genre:** Required, any string
- **YouTube ID:** Required, 11 alphanumeric chars (A-Z, a-z, 0-9, -, _)
- **Difficulty:** Optional, enum: easy, medium, hard
- **Tags:** Optional, array of strings

### LocalStorage Keys
- `beatmaster_songs` - Song array
- Managed via Storage.saveSongs() / getSongs()

---

**Last Updated:** 2026-01-01
**Next Review:** Completed


