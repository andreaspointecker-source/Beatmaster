# Specification: Extended Game Mode

**Type:** Delta (Changes to existing Foundation & Song Database specs)
**Status:** Proposed
**Version:** 1.0.0
**Last Updated:** 2026-01-02

---

## Delta Summary

This specification extends the existing **Foundation** and **Song Database** specifications with new gameplay features:

1. **Game Setup Enhancements** - Configurable question types, genre grouping, decade filters, song duration
2. **Question Selection Animation** - Card shuffle visual effect
3. **Enhanced Playback Flow** - Vinyl overlay, preparation/end timers
4. **Manual Scoring System** - Team-based checkbox scoring with song reveal

---

## ADDED Requirements

### Requirement: Game Configuration Options

The system SHALL provide comprehensive game configuration options in the Game Setup screen.

**Priority:** MUST
**Rationale:** Users need control over gameplay parameters to customize the experience for different party themes and preferences.

#### Scenario: Configuring Question Types

- GIVEN the user is on the Game Setup screen
- WHEN the user views the question type options
- THEN the system SHALL display checkboxes for: Song Title, Artist, Year, Genre, Decade
- AND at least one question type SHALL be selected at all times
- AND attempting to deselect the last remaining question type SHALL display an error notification

#### Scenario: Configuring Genre Filters

- GIVEN the user is on the Game Setup screen
- WHEN the user views the genre filter options
- THEN the system SHALL display genre groups with individual genres listed
- AND each genre group SHALL have an "Enable/Disable" toggle
- AND at least one genre group SHALL be enabled at all times
- AND the system SHALL group related genres (e.g., "Rock & Alternative" includes Rock, Alternative Rock, Classic Rock)

#### Scenario: Configuring Decade Filters

- GIVEN the user is on the Game Setup screen
- WHEN the user views the decade filter options
- THEN the system SHALL display decade checkboxes from 1970s through 2020s
- AND the system SHALL provide an "All Decades" toggle
- AND at least one decade SHALL be selected at all times
- AND attempting to deselect the last decade SHALL display an error notification

#### Scenario: Configuring Song Duration

- GIVEN the user is on the Game Setup screen
- WHEN the user adjusts the song duration slider
- THEN the system SHALL allow duration selection between 15 and 90 seconds
- AND the system SHALL display the current duration value prominently
- AND the default duration SHALL be 30 seconds

#### Scenario: Validating Configuration

- GIVEN the user has configured filters (genres, decades)
- WHEN the user attempts to start the game
- THEN the system SHALL filter the song database by selected criteria
- AND the system SHALL validate that enough songs exist to satisfy the configured number of rounds
- AND if insufficient songs exist, the system SHALL display an error: "Nicht genug Songs für die Filter! X verfügbar, Y benötigt."

---

### Requirement: Question Selection Animation

The system SHALL display a card shuffle animation when selecting a random question for each round.

**Priority:** SHOULD
**Rationale:** Visual feedback makes the question selection process more engaging and creates anticipation.

#### Scenario: Playing Card Shuffle Animation

- GIVEN a new round is starting
- WHEN the question is being selected
- THEN the system SHALL display 5 cards on screen
- AND the cards SHALL animate in a shuffling motion for approximately 1.2 seconds
- AND one card SHALL be selected and moved to the center
- AND the question text SHALL be revealed on the selected card
- AND the total animation duration SHALL be approximately 2 seconds

#### Scenario: Animation Performance

- GIVEN the card shuffle animation is playing
- WHEN the system monitors frame rate
- THEN the animation SHALL maintain at least 30 FPS on mobile devices
- AND the animation SHALL use GPU-accelerated CSS properties only (transform, opacity)

#### Scenario: Animation Fallback

- GIVEN the animation fails to load or encounters an error
- WHEN the error is detected
- THEN the system SHALL immediately display the question text without animation
- AND the system SHALL log the error to the console

---

### Requirement: Preparation Phase

The system SHALL display a 5-second countdown before each song begins playing.

**Priority:** MUST
**Rationale:** Gives players time to prepare and focus before the song starts.

#### Scenario: Displaying Preparation Countdown

- GIVEN the question animation has completed
- WHEN the preparation phase begins
- THEN the system SHALL display a countdown from 5 to 1
- AND the countdown numbers SHALL be large and prominent (minimum 72px font size)
- AND the system SHALL display the message "Macht euch bereit!"
- AND a beep sound SHALL play on each countdown tick
- AND the countdown SHALL complete exactly 5 seconds after starting

#### Scenario: Countdown Accuracy

- GIVEN the countdown is running
- WHEN the system calculates remaining time
- THEN the system SHALL use timestamp-based calculation to prevent drift
- AND the countdown SHALL complete within ±100ms of the expected time

---

### Requirement: Vinyl Overlay During Playback

The system SHALL display a rotating vinyl record animation that completely covers the YouTube video during song playback.

**Priority:** MUST
**Rationale:** Prevents visual spoilers from the video (artist name, song title in thumbnails) while maintaining audio playback.

#### Scenario: Showing Vinyl Overlay

- GIVEN the preparation countdown has completed
- WHEN the song begins playing
- THEN the system SHALL display a vinyl record image/animation
- AND the vinyl SHALL completely cover the YouTube video player
- AND the vinyl SHALL rotate continuously at 33.3 RPM (1.8 seconds per rotation)
- AND the YouTube video audio SHALL play normally
- AND the YouTube video controls and thumbnails SHALL be hidden

#### Scenario: Vinyl Rotation Performance

- GIVEN the vinyl overlay is rotating
- WHEN the system monitors animation performance
- THEN the rotation SHALL use CSS animation for GPU acceleration
- AND the rotation SHALL be smooth with no visible stuttering
- AND the animation SHALL maintain at least 30 FPS

#### Scenario: Hiding Vinyl Overlay

- GIVEN the song playback duration has elapsed
- WHEN the playback ends
- THEN the system SHALL stop the vinyl rotation
- AND the system SHALL remove or hide the vinyl overlay
- AND the system SHALL pause the YouTube video

---

### Requirement: End Phase Countdown

The system SHALL display a 5-second countdown after the song ends to signal the round's completion.

**Priority:** MUST
**Rationale:** Gives players a clear signal that the round has ended and time is up for answering.

#### Scenario: Displaying End Countdown

- GIVEN the song playback has ended
- WHEN the end phase begins
- THEN the system SHALL display a countdown from 5 to 1
- AND the countdown numbers SHALL be large and prominent (minimum 72px font size)
- AND the system SHALL display the message "Runde zu Ende!"
- AND a beep sound SHALL play on each countdown tick (except the last)
- AND a distinct signal tone SHALL play when the countdown reaches 0

#### Scenario: Transitioning to Reveal

- GIVEN the end countdown has completed
- WHEN the countdown reaches 0
- THEN the system SHALL navigate to the Round Reveal screen
- AND the transition SHALL occur within 500ms of countdown completion

---

### Requirement: Song Information Reveal

The system SHALL display comprehensive song information after each round's playback phase.

**Priority:** MUST
**Rationale:** Players need to see the correct answer and verify their guesses.

#### Scenario: Displaying Song Information

- GIVEN the end countdown has completed
- WHEN the Round Reveal screen loads
- THEN the system SHALL display the song's album cover (YouTube thumbnail)
- AND the system SHALL display the song title prominently
- AND the system SHALL display the artist name
- AND the system SHALL display the year, genre, and album (if available)
- AND all text SHALL be properly escaped to prevent XSS

#### Scenario: Album Cover Loading

- GIVEN the album cover is being loaded from YouTube
- WHEN the image fails to load
- THEN the system SHALL display a placeholder image
- AND the system SHALL not block the display of other song information

---

### Requirement: Video Replay Functionality

The system SHALL provide an option to replay the full YouTube video after revealing song information.

**Priority:** SHOULD
**Rationale:** Players may want to watch the full video for enjoyment or to verify the song.

#### Scenario: Playing Full Video

- GIVEN the Round Reveal screen is displayed
- WHEN the user clicks the "Video komplett ansehen" button
- THEN the system SHALL display the YouTube video player
- AND the video SHALL start from the beginning (not from the configured startTime)
- AND the video SHALL include standard YouTube controls (play, pause, seek)
- AND the user SHALL be able to close the video player to return to the reveal screen

#### Scenario: Video Player Modal

- GIVEN the full video is playing
- WHEN the user closes the video modal
- THEN the system SHALL pause the video
- AND the system SHALL return focus to the reveal screen
- AND the reveal screen state SHALL remain unchanged (scores not affected)

---

### Requirement: Manual Scoring System

The system SHALL provide a manual scoring interface where the game moderator can mark which teams answered correctly.

**Priority:** MUST
**Rationale:** For MVP, manual scoring is more flexible than automatic answer validation and handles edge cases better.

#### Scenario: Displaying Team Scoring Options

- GIVEN the Round Reveal screen is displayed
- WHEN the scoring section is rendered
- THEN the system SHALL display a checkbox for each team
- AND each checkbox SHALL show the team name and current score
- AND each checkbox SHALL be visually associated with the team's color
- AND the touch target for each checkbox SHALL be at least 44x44 pixels

#### Scenario: Selecting Correct Teams

- GIVEN the team scoring checkboxes are displayed
- WHEN the moderator checks a team's checkbox
- THEN the checkbox SHALL visually indicate selection
- AND the "Next Round" button SHALL become enabled (if disabled)
- AND the system SHALL track which teams are marked as correct

#### Scenario: Deselecting Teams

- GIVEN at least one team checkbox is checked
- WHEN the moderator unchecks all checkboxes
- THEN the "Next Round" button SHALL become disabled
- AND a visual indicator SHALL show the button is disabled

---

### Requirement: Score Calculation and Persistence

The system SHALL calculate points based on question type and persist scores to game state.

**Priority:** MUST
**Rationale:** Scores must be calculated correctly and saved for the final results.

#### Scenario: Calculating Points

- GIVEN a team is marked as correct for a question
- WHEN the moderator proceeds to the next round
- THEN the system SHALL calculate points using the formula: `basePoints * questionTypeWeight`
- AND the system SHALL use question type weights from CONFIG.GAME.DEFAULT_SETTINGS.questionWeights
- AND the default base points SHALL be 100

**Example Point Values:**
- Song Title: 100 × 3 = 300 points
- Artist: 100 × 3 = 300 points
- Genre: 100 × 2 = 200 points
- Year: 100 × 1 = 100 points
- Decade: 100 × 1 = 100 points

#### Scenario: Updating Team Scores

- GIVEN points have been calculated for correct teams
- WHEN scores are updated
- THEN the system SHALL add points to each correct team's total score
- AND the system SHALL increment the team's `correctAnswers` count
- AND the system SHALL append points to the team's `roundScores` array
- AND teams marked as incorrect SHALL have 0 added to their `roundScores` array
- AND teams marked as incorrect SHALL have their `wrongAnswers` count incremented

#### Scenario: Persisting Scores

- GIVEN team scores have been updated
- WHEN the game state is saved
- THEN the system SHALL update the State object via `State.set('game', gameState)`
- AND the system SHALL save the game state to LocalStorage via `Storage.saveGameState(gameState)`
- AND the save SHALL complete before navigating to the next screen

---

### Requirement: Round Progression

The system SHALL manage progression through rounds and transition to the results screen after the final round.

**Priority:** MUST
**Rationale:** Core gameplay requires smooth transitions between rounds.

#### Scenario: Advancing to Next Round

- GIVEN the moderator has marked correct teams
- WHEN the moderator clicks "Nächste Runde"
- THEN the system SHALL save scores to game state
- AND the system SHALL increment `currentRound` by 1
- AND the system SHALL navigate to the Gameplay screen
- AND a new question SHALL be selected from the configured question types
- AND a new song SHALL be selected from the remaining playlist

#### Scenario: Completing Final Round

- GIVEN the current round equals the total rounds
- WHEN the moderator clicks "Ergebnisse anzeigen"
- THEN the system SHALL save final scores to game state
- AND the system SHALL set `game.status` to "completed"
- AND the system SHALL navigate to the Results screen
- AND the Results screen SHALL display final team rankings

---

### Requirement: Playlist Generation with Filters

The system SHALL generate a playlist that respects the configured genre and decade filters.

**Priority:** MUST
**Rationale:** Ensures only relevant songs are played during the game.

#### Scenario: Filtering Songs by Genre

- GIVEN the user has selected specific genre groups
- WHEN the game starts and generates a playlist
- THEN the system SHALL only include songs whose genre matches an enabled genre group
- AND songs with genres not in any enabled group SHALL be excluded

#### Scenario: Filtering Songs by Decade

- GIVEN the user has selected specific decades
- WHEN the playlist is generated
- THEN the system SHALL calculate each song's decade as `Math.floor(year / 10) * 10 + 's'` (e.g., 1985 → "1980s")
- AND the system SHALL only include songs whose decade is enabled
- AND songs from unselected decades SHALL be excluded

#### Scenario: Combined Filtering

- GIVEN both genre and decade filters are configured
- WHEN the playlist is generated
- THEN the system SHALL only include songs that match BOTH the genre filter AND the decade filter
- AND the filtered list SHALL be shuffled randomly
- AND the system SHALL select the first N songs (where N = totalRounds)

#### Scenario: Insufficient Songs

- GIVEN the configured filters result in fewer songs than rounds
- WHEN the user attempts to start the game
- THEN the system SHALL prevent game start
- AND the system SHALL display an error notification
- AND the error message SHALL specify how many songs are available vs. required

---

### Requirement: Question Type Selection Logic

The system SHALL randomly select question types from the configured enabled types for each round.

**Priority:** MUST
**Rationale:** Ensures variety while respecting user preferences.

#### Scenario: Random Question Type Selection

- GIVEN a new round is starting
- WHEN a question type is selected
- THEN the system SHALL randomly choose from the enabled question types
- AND each enabled type SHALL have equal probability of selection
- AND disabled question types SHALL never be selected

#### Scenario: Question Text Generation

- GIVEN a question type has been selected
- WHEN the question text is generated
- THEN the system SHALL use the appropriate German question text:
  - `song_title` → "Wie heißt dieser Song?"
  - `artist` → "Wer singt diesen Song?"
  - `year` → "Aus welchem Jahr ist dieser Song?"
  - `genre` → "Welches Genre ist dieser Song?"
  - `decade` → "Aus welcher Dekade ist dieser Song?"

---

## MODIFIED Requirements

### Requirement: Game State Schema (Modified)

The game state schema SHALL be extended to include new configuration options.

**Original:** See Foundation spec - Game State schema
**Modified:** Add the following fields to game state:

```javascript
{
  // ... existing fields ...

  // NEW FIELDS
  questionTypes: ["song_title", "artist"],           // Array of enabled question type strings
  genreFilter: {                                     // Object mapping group names to genre arrays
    "Rock & Alternative": ["Rock", "Alternative Rock", "Classic Rock"],
    "Pop & Dance": ["Pop", "Dance"]
  },
  decadeFilter: ["1970s", "1980s", "1990s"],        // Array of enabled decade strings
  songDuration: 30,                                  // Number of seconds (15-90)

  currentQuestion: {                                 // Current round's question
    type: "song_title",
    text: "Wie heißt dieser Song?",
    correctAnswer: "Bohemian Rhapsody"
  }
}
```

#### Scenario: Backwards Compatibility

- GIVEN an existing game state from an older version
- WHEN the game state is loaded
- THEN the system SHALL provide default values for missing fields:
  - `questionTypes` defaults to all types
  - `genreFilter` defaults to all genres enabled
  - `decadeFilter` defaults to all decades enabled
  - `songDuration` defaults to 30
  - `currentQuestion` defaults to null (generated on first round)

---

### Requirement: CONFIG Constants (Modified)

The CONFIG object SHALL be extended with new game configuration constants.

**Original:** See Foundation spec - CONFIG.GAME
**Modified:** Add the following to CONFIG.GAME:

```javascript
CONFIG.GAME = {
  // ... existing fields ...

  // NEW FIELDS
  SONG_DURATION_MIN: 15,
  SONG_DURATION_MAX: 90,
  DEFAULT_SONG_DURATION: 30,

  GENRE_GROUPS: [
    {
      name: 'Rock & Alternative',
      genres: ['Rock', 'Alternative Rock', 'Classic Rock', 'Hard Rock']
    },
    {
      name: 'Pop & Dance',
      genres: ['Pop', 'Dance', 'Electropop']
    },
    {
      name: 'Metal',
      genres: ['Metal', 'Heavy Metal', 'Power Metal']
    },
    {
      name: 'Austropop',
      genres: ['Austropop']
    },
    {
      name: 'German',
      genres: ['German', 'NDW', 'Schlager']
    }
  ],

  DECADES: ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'],

  QUESTION_TYPE_LABELS: {
    song_title: { label: 'Song-Titel', description: 'Wie heißt der Song?' },
    artist: { label: 'Interpret', description: 'Wer singt den Song?' },
    year: { label: 'Jahr', description: 'Aus welchem Jahr ist der Song?' },
    genre: { label: 'Genre', description: 'Welches Genre hat der Song?' },
    decade: { label: 'Dekade', description: 'Aus welcher Dekade ist der Song?' }
  }
};
```

---

## REMOVED Requirements

**None.** This change proposal is purely additive and does not remove any existing requirements.

---

## Non-Functional Requirements

### Performance Requirements

**NFR-1: Animation Frame Rate**
- The system SHALL maintain at least 30 FPS for all animations on mobile devices
- The system SHOULD maintain 60 FPS on desktop devices
- Animations SHALL use GPU-accelerated CSS properties only (transform, opacity)

**NFR-2: Timer Accuracy**
- Countdown timers SHALL complete within ±100ms of the expected duration
- Timer implementation SHALL use timestamp-based calculation to prevent drift
- Timer ticks SHALL not block the main thread

**NFR-3: State Persistence Performance**
- Game state saves to LocalStorage SHALL complete within 50ms
- The system SHALL not block user interaction during saves
- Failed saves SHALL display an error notification without crashing

### Usability Requirements

**NFR-4: Touch Target Sizes**
- All interactive elements SHALL have a minimum touch target size of 44x44 pixels
- Checkboxes SHALL have clear visual feedback on tap
- Buttons SHALL provide visual feedback on press (active state)

**NFR-5: Responsive Design**
- All new UI SHALL be mobile-first and responsive
- The system SHALL function correctly on screen widths from 320px to 1920px
- Text SHALL remain readable at all supported screen sizes

**NFR-6: Accessibility**
- All interactive elements SHALL be keyboard accessible
- Focus indicators SHALL be clearly visible
- Screen readers SHALL be able to announce countdown timers via aria-live
- Color contrast SHALL meet WCAG 2.1 AA standards (4.5:1 for normal text)

### Reliability Requirements

**NFR-7: Error Recovery**
- Animation failures SHALL fallback to static display without blocking gameplay
- YouTube API failures SHALL display an error and allow skipping to reveal
- LocalStorage quota exceeded SHALL warn the user without losing current round data

---

## Acceptance Criteria

### Must Have (MVP Launch)

- ✅ Game setup allows configuring: question types, genres, decades, song duration
- ✅ At least one option must be selected for question types, genres, and decades
- ✅ Card shuffle animation plays smoothly (30+ FPS)
- ✅ Vinyl overlay completely hides YouTube video during playback
- ✅ Preparation and end countdowns run for exactly 5 seconds each
- ✅ Sound effects play on countdown ticks
- ✅ Song information displays correctly on reveal screen
- ✅ Manual scoring checkboxes work for all teams
- ✅ Points are calculated correctly based on question type
- ✅ Scores persist to LocalStorage
- ✅ "Next Round" button is disabled until at least one team is checked
- ✅ Game progresses through all rounds correctly
- ✅ Results screen displays after final round

### Should Have (Post-MVP)

- Settings toggle to disable animations for performance
- Undo button for accidental score changes
- Auto-save configuration presets
- Song preview in setup to verify filters work correctly

### Could Have (Future Enhancements)

- Custom user-defined genre groups
- Animated score change counters
- Confetti animation for winning team
- Export/share results as image

---

## Traceability Matrix

| Requirement | Affected Files | Tests |
|-------------|---------------|-------|
| Game Configuration Options | `js/screens/game-setup.js`, `js/config.js` | Functional: Setup UI, Validation |
| Question Selection Animation | `js/modules/question-animator.js` | Visual: Animation smoothness |
| Preparation Phase | `js/screens/gameplay.js`, `js/modules/countdown-timer.js` | Functional: Timer accuracy |
| Vinyl Overlay | `js/modules/vinyl-animator.js`, `js/screens/gameplay.js` | Visual: Overlay coverage, Performance: FPS |
| End Phase Countdown | `js/modules/countdown-timer.js` | Functional: Timer accuracy, Sound playback |
| Song Information Reveal | `js/screens/round-reveal.js` | Functional: Data display, XSS prevention |
| Video Replay | `js/screens/round-reveal.js` | Functional: Video playback |
| Manual Scoring | `js/modules/manual-scoring.js`, `js/screens/round-reveal.js` | Functional: Score calculation, Persistence |
| Score Persistence | `js/modules/storage.js`, `js/state.js` | Functional: LocalStorage writes |
| Round Progression | `js/screens/round-reveal.js`, `js/app.js` | Integration: Full game flow |
| Playlist Generation | `js/screens/game-setup.js`, `js/modules/database.js` | Functional: Filtering logic |
| Question Type Selection | `js/screens/gameplay.js` | Functional: Random selection |

---

## Dependencies

### Internal Dependencies
- Foundation Spec (State Management, Router, Storage)
- Song Database Spec (CRUD, Filtering)
- YouTube Player Module (existing)

### External Dependencies
- YouTube IFrame API (already integrated)
- Browser APIs: LocalStorage, Audio, requestAnimationFrame

### Asset Dependencies
- `/assets/images/vinyl-record.svg` (or PNG)
- `/assets/sounds/beep.mp3`
- `/assets/sounds/final-beep.mp3`
- `/assets/images/placeholder.png` (for failed album covers)

---

## Glossary

- **Genre Group:** A collection of related music genres treated as a single filter option (e.g., "Rock & Alternative")
- **Decade:** A 10-year period represented as a string (e.g., "1980s")
- **Question Type:** A category of question that can be asked (song_title, artist, year, genre, decade)
- **Round:** A single iteration of question → playback → reveal → scoring
- **Playlist:** An ordered list of song IDs selected for the game based on filters
- **Manual Scoring:** The process of a game moderator marking which teams answered correctly using checkboxes
- **Vinyl Overlay:** A visual animation of a rotating vinyl record that covers the YouTube video player

---

## Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-02 | BeatMaster Team | Initial specification |

---

## Notes

- This specification is written in Delta format as it modifies existing Foundation and Song Database specs
- All new features maintain backwards compatibility with existing game states
- No breaking changes to existing APIs
- Implementation follows existing BeatMaster patterns (Vanilla JS, Screen Controllers, Observable State)
- Estimated implementation time: 12-17 hours across 5 phases
