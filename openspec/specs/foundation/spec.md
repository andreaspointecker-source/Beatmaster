# Foundation Specification

## Purpose

Establish the core infrastructure for BeatMaster including state management, data persistence, routing, and UI foundation.

## Requirements

### Requirement: State Management
The system SHALL provide a centralized observable state management system.

#### Scenario: State update triggers subscribers
- GIVEN a component has subscribed to a state key
- WHEN the state value changes via `State.set()`
- THEN all subscribers SHALL be notified with the new value

#### Scenario: State persistence
- GIVEN a state key is marked as persistent
- WHEN the state value changes
- THEN the value SHALL be automatically persisted to LocalStorage

#### Scenario: State initialization
- GIVEN the app is starting
- WHEN `State.init()` is called
- THEN persistent state values SHALL be loaded from LocalStorage

### Requirement: LocalStorage Abstraction
The system SHALL provide a type-safe abstraction layer for LocalStorage operations.

#### Scenario: Save songs to storage
- WHEN `Storage.saveSongs(songs)` is called
- THEN the songs array SHALL be serialized and stored under the key `beatmaster_songs`

#### Scenario: Retrieve songs from storage
- WHEN `Storage.getSongs()` is called
- THEN the stored songs SHALL be deserialized and returned
- AND if no songs exist, an empty array SHALL be returned

#### Scenario: Storage quota monitoring
- WHEN `Storage.getStorageSize()` is called
- THEN the current storage usage SHALL be calculated
- AND if usage exceeds 80%, a warning SHALL be logged

#### Scenario: Export all data
- WHEN `Storage.exportData()` is called
- THEN all app data (songs, settings, history) SHALL be returned as a JSON object

### Requirement: SPA Router
The system SHALL provide hash-based routing for single-page navigation.

#### Scenario: Navigate to screen
- WHEN `App.navigate('database')` is called
- THEN the URL hash SHALL change to `#database`
- AND the database screen controller SHALL be rendered
- AND the previous screen SHALL be destroyed

#### Scenario: Handle browser back button
- GIVEN a user has navigated through multiple screens
- WHEN the browser back button is pressed
- THEN the previous screen SHALL be rendered
- AND the URL hash SHALL reflect the previous route

#### Scenario: Invalid route handling
- WHEN a user navigates to an invalid hash (e.g., `#invalid-route`)
- THEN the system SHALL navigate to the home screen
- AND a notification SHOULD be shown

### Requirement: Screen Controller Pattern
The system SHALL implement a consistent screen controller pattern for all UI screens.

#### Scenario: Render screen
- GIVEN a screen controller class (e.g., `HomeScreen`)
- WHEN `screen.render(container, params)` is called
- THEN the screen's HTML SHALL be rendered into the container
- AND event listeners SHALL be attached

#### Scenario: Destroy screen
- WHEN navigating away from a screen
- THEN the previous screen's `destroy()` method SHALL be called
- AND all event listeners SHALL be cleaned up
- AND any timers/intervals SHALL be cleared

### Requirement: Notification System
The system SHALL provide a toast notification system for user feedback.

#### Scenario: Show success notification
- WHEN `App.showNotification('Saved!', 'success')` is called
- THEN a green toast notification SHALL appear
- AND it SHALL automatically disappear after 3 seconds

#### Scenario: Show error notification
- WHEN `App.showNotification('Error occurred', 'error')` is called
- THEN a red toast notification SHALL appear
- AND it SHALL remain visible for 5 seconds

#### Scenario: Stack multiple notifications
- GIVEN multiple notifications are shown in quick succession
- THEN they SHALL stack vertically
- AND each SHALL dismiss independently after its duration

### Requirement: Modal System
The system SHALL provide a reusable modal dialog system.

#### Scenario: Show modal with confirmation
- WHEN `App.showModal({ title, content, footer })` is called
- THEN a modal overlay SHALL appear
- AND the modal SHALL contain the provided title, content, and footer
- AND clicking the overlay SHALL close the modal

#### Scenario: Modal with custom buttons
- GIVEN a modal with custom footer buttons
- WHEN a button is clicked
- THEN the associated callback SHALL be executed
- AND the modal SHALL close (unless prevented)

### Requirement: Utility Functions
The system SHALL provide common utility functions for data manipulation.

#### Scenario: Generate UUID
- WHEN `Utils.generateUUID()` is called
- THEN a valid UUID v4 string SHALL be returned
- AND it SHALL be unique across calls

#### Scenario: Fuzzy string matching
- GIVEN two strings "Bohemian Rhapsody" and "Bohemian Rapsody" (typo)
- WHEN `Utils.fuzzyMatch(str1, str2, 0.8)` is called
- THEN it SHALL return `true` (similarity >= 80%)

#### Scenario: Fuzzy matching removes articles
- GIVEN strings "The Beatles" and "Beatles"
- WHEN `Utils.fuzzyMatch(str1, str2, 0.8)` is called
- THEN it SHALL return `true` (articles "the", "a", "an" are ignored)

#### Scenario: Levenshtein distance calculation
- GIVEN strings "kitten" and "sitting"
- WHEN `Utils.levenshteinDistance(str1, str2)` is called
- THEN it SHALL return `3` (3 character changes needed)

#### Scenario: Extract YouTube ID from URL
- GIVEN a YouTube URL "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
- WHEN `Utils.extractYouTubeId(url)` is called
- THEN it SHALL return "dQw4w9WgXcQ"

#### Scenario: Shuffle array
- GIVEN an array `[1, 2, 3, 4, 5]`
- WHEN `Utils.shuffleArray(array)` is called
- THEN the array SHALL be shuffled in-place
- AND all elements SHALL still be present

### Requirement: CSS Framework
The system SHALL provide a comprehensive CSS framework with reusable components.

#### Scenario: CSS custom properties
- GIVEN the CSS framework is loaded
- THEN color, spacing, and typography variables SHALL be available in `:root`
- AND they SHALL use the blue/green color scheme

#### Scenario: Responsive button components
- GIVEN a button with class `.btn`
- THEN it SHALL have consistent padding, border-radius, and transitions
- AND variants SHALL exist (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-outline`)

#### Scenario: Card component
- GIVEN an element with class `.card`
- THEN it SHALL have a background, border-radius, and shadow
- AND it SHALL support `.card__header`, `.card__body`, `.card__footer`

#### Scenario: Form components
- GIVEN form inputs with class `.form-group`
- THEN labels SHALL be styled consistently
- AND inputs SHALL have focus states and validation styles

#### Scenario: Mobile-first responsive design
- GIVEN the CSS framework
- THEN base styles SHALL target mobile screens (320px+)
- AND desktop styles SHALL be applied via `@media (min-width: 768px)`

### Requirement: Configuration Management
The system SHALL centralize all configuration constants.

#### Scenario: Access app config
- WHEN code references `CONFIG.APP.NAME`
- THEN it SHALL return "BeatMaster"

#### Scenario: Access game defaults
- WHEN code references `CONFIG.GAME.DEFAULT_SETTINGS.pointsPerCorrect`
- THEN it SHALL return `100`

#### Scenario: Access storage keys
- WHEN code references `CONFIG.STORAGE.KEYS.SONGS`
- THEN it SHALL return "beatmaster_songs"

### Requirement: Home Screen
The system SHALL provide a functional home screen with navigation menu.

#### Scenario: Render home screen
- WHEN the app loads or user navigates to `#home`
- THEN the home screen SHALL display the app logo, subtitle, and menu buttons

#### Scenario: Navigate to new game
- GIVEN the home screen is displayed
- WHEN the "Neues Spiel starten" button is clicked
- THEN the app SHALL navigate to the game-setup screen

#### Scenario: Navigate to song database
- GIVEN the home screen is displayed
- WHEN the "Song-Datenbank" button is clicked
- THEN the app SHALL navigate to the database screen

#### Scenario: Show continue game button
- GIVEN a game is in progress (game state exists with status "playing")
- WHEN the home screen renders
- THEN the "Spiel fortsetzen" button SHALL be visible
- AND clicking it SHALL navigate to the gameplay screen

#### Scenario: Hide continue game button
- GIVEN no game is in progress
- WHEN the home screen renders
- THEN the "Spiel fortsetzen" button SHALL be hidden

## Technical Implementation

### Files
- `js/state.js` - Observable state management
- `js/modules/storage.js` - LocalStorage abstraction
- `js/app.js` - SPA router, notification system, modal system
- `js/modules/utils.js` - Utility functions
- `js/config.js` - Configuration constants
- `js/screens/home.js` - Home screen controller
- `css/main.css` - CSS variables, reset, globals
- `css/components.css` - Reusable UI components
- `css/screens.css` - Screen-specific layouts
- `css/responsive.css` - Media queries
- `index.html` - Main HTML structure

### Loading Order
Scripts MUST be loaded in this order:
1. `config.js`
2. `utils.js`
3. `state.js`
4. `modules/*.js`
5. `screens/*.js`
6. `app.js` (last)

### Dependencies
- None (Vanilla JavaScript)

## Acceptance Criteria

- [ ] State changes trigger all subscribers
- [ ] State persists to LocalStorage automatically
- [ ] Navigation between screens works via hash routing
- [ ] Browser back/forward buttons work correctly
- [ ] Notifications appear and dismiss correctly
- [ ] Modals can be opened and closed
- [ ] UUID generation produces unique IDs
- [ ] Fuzzy matching correctly handles typos and articles
- [ ] YouTube ID extraction works for all URL formats
- [ ] CSS variables are accessible globally
- [ ] Responsive design works on mobile (320px) and desktop (1024px+)
- [ ] Home screen displays all navigation buttons
- [ ] Continue game button shows/hides based on game state
- [ ] No console errors on page load
- [ ] LocalStorage quota monitoring logs warning at 80%

## Status

✅ **Completed** (Phase 1)

## Implementation Notes (2026-01-01)

### Design System Migration
- ✅ Migrated from custom CSS to Tailwind CSS 3.x
- ✅ Implemented Tailwind CDN with custom configuration
- ✅ Added Inter font family from Google Fonts
- ✅ Integrated Material Symbols Outlined icon system
- ✅ Applied cyan (#00d9ff) color scheme throughout

### Critical Fixes Applied
1. **Modal/Notification Overlay Fix**: Added `pointer-events-none` to `#modal-root` and `#notification-root` to prevent blocking clicks on buttons underneath
2. **Event Listener Null Safety**: Fixed home.js attachEventListeners() to check for null before calling addEventListener (prevents crash when hidden buttons return null)
3. **Storage API Conflict**: Changed `window.Storage` references to just `Storage` to avoid conflict with browser's Storage API
4. **Legacy CSS Disabled**: Commented out old CSS files in index.html that were conflicting with Tailwind

### Current Status
- All screens use Tailwind CSS for styling
- Ambient background glows implemented
- Navigation working between all screens
- Debug mode active for troubleshooting
- No console errors on page load

### Known Issues
- Service Worker registration fails on file:// protocol (expected, works on HTTP server)
- Icon assets (192x192) not found (will be created in Phase 7: PWA)

### Next Steps
- Implement functional Song Database screen (Phase 2)
- Disable debug mode for production
- Create production Tailwind build
