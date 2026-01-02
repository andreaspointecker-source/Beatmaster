# Design Document: Extended Game Mode

## Overview

This document outlines the technical design decisions, architecture, and implementation patterns for the Extended Game Mode feature.

**Status:** Proposed
**Last Updated:** 2026-01-02
**Related:** [proposal.md](proposal.md), [tasks.md](tasks.md)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Game Setup Screen                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Question     │  │ Genre/Decade │  │ Song Duration│      │
│  │ Type Selector│  │ Filters      │  │ Slider       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           ↓                                  │
│                    [Start Game] → State                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Gameplay Flow                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 1. Question Animation (QuestionAnimator)            │  │
│  │    - Card shuffle                                     │  │
│  │    - Question reveal                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 2. Preparation Phase (CountdownTimer)               │  │
│  │    - 5 second countdown                               │  │
│  │    - "Macht euch bereit!"                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 3. Playback Phase (VinylAnimator + YouTubePlayer)   │  │
│  │    - Vinyl overlay                                    │  │
│  │    - Hidden video, audible audio                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 4. End Phase (CountdownTimer)                       │  │
│  │    - 5 second countdown                               │  │
│  │    - Signal tone                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Round Reveal Screen                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Song Info    │  │ Video Replay │  │ Team Scoring │      │
│  │ Card         │  │ Button       │  │ Checkboxes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           ↓                                  │
│                    [Nächste Runde] → Next Round             │
└─────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
┌────────────────────────────────────────────────────────────┐
│                        Modules Layer                        │
├────────────────────────────────────────────────────────────┤
│  QuestionAnimator  │  VinylAnimator  │  CountdownTimer    │
│  ─────────────────────────────────────────────────────────  │
│  ManualScoring     │  SoundPlayer    │  FilterEngine      │
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                       Screens Layer                         │
├────────────────────────────────────────────────────────────┤
│  GameSetupScreen   │  GameplayScreen  │  RoundRevealScreen│
└────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────┐
│                      Core Services                          │
├────────────────────────────────────────────────────────────┤
│  State Management  │  Storage         │  Database          │
│  Router            │  YouTubePlayer   │  Utils             │
└────────────────────────────────────────────────────────────┘
```

---

## Module Design

### 1. QuestionAnimator Module

**File:** `js/modules/question-animator.js`

**Purpose:** Manages the card shuffle animation for question selection.

**API Design:**

```javascript
class QuestionAnimator {
  /**
   * Creates a new QuestionAnimator instance
   * @param {HTMLElement} container - Container for animation
   * @param {Object} options - Animation options
   * @param {number} options.duration - Total animation duration (ms)
   * @param {number} options.cardCount - Number of cards to shuffle
   */
  constructor(container, options = {}) {
    this.container = container;
    this.duration = options.duration || 2000;
    this.cardCount = options.cardCount || 5;
  }

  /**
   * Animates question selection and displays question
   * @param {string} questionText - The question to display
   * @returns {Promise<void>} Resolves when animation completes
   */
  async animate(questionText) {
    this.render();
    await this.shuffleCards();
    await this.selectCard();
    this.revealQuestion(questionText);
  }

  /**
   * Renders the card elements
   * @private
   */
  render() { /* ... */ }

  /**
   * Performs shuffle animation
   * @private
   * @returns {Promise<void>}
   */
  shuffleCards() { /* ... */ }

  /**
   * Selects and highlights one card
   * @private
   * @returns {Promise<void>}
   */
  selectCard() { /* ... */ }

  /**
   * Displays question on selected card
   * @private
   * @param {string} text
   */
  revealQuestion(text) { /* ... */ }

  /**
   * Cleans up DOM elements
   */
  destroy() { /* ... */ }
}
```

**CSS Classes:**

```css
.question-animator-container { }
.question-card { }
.question-card--shuffling { }
.question-card--selected { }
.question-card__front { }
.question-card__back { }
.question-card__text { }
```

**Animation Timeline:**

1. **0-300ms:** Cards appear (fade in + slide up)
2. **300-1500ms:** Shuffle animation (randomized transform)
3. **1500-2000ms:** One card selected (scale up, move to center)
4. **2000ms+:** Question text revealed (flip card)

---

### 2. VinylAnimator Module

**File:** `js/modules/vinyl-animator.js`

**Purpose:** Displays and animates vinyl record overlay during song playback.

**API Design:**

```javascript
class VinylAnimator {
  /**
   * Creates a new VinylAnimator instance
   * @param {HTMLElement} container - Container for vinyl overlay
   * @param {Object} options - Animation options
   * @param {number} options.rpm - Rotation speed (default: 33.3)
   * @param {string} options.size - Vinyl size (default: '300px')
   */
  constructor(container, options = {}) {
    this.container = container;
    this.rpm = options.rpm || 33.3;
    this.size = options.size || '300px';
    this.isVisible = false;
  }

  /**
   * Shows vinyl overlay and starts rotation
   */
  show() {
    this.render();
    this.startRotation();
    this.isVisible = true;
  }

  /**
   * Hides vinyl overlay and stops rotation
   */
  hide() {
    this.stopRotation();
    this.remove();
    this.isVisible = false;
  }

  /**
   * Renders vinyl overlay DOM
   * @private
   */
  render() { /* ... */ }

  /**
   * Starts CSS rotation animation
   * @private
   */
  startRotation() { /* ... */ }

  /**
   * Stops rotation animation
   * @private
   */
  stopRotation() { /* ... */ }

  /**
   * Removes DOM elements
   * @private
   */
  remove() { /* ... */ }
}
```

**CSS Classes:**

```css
.vinyl-overlay { }
.vinyl-record { }
.vinyl-record--spinning { }
.vinyl-backdrop { }
```

**Animation Details:**

- **Rotation Speed:** 33.3 RPM = 1.8 seconds per rotation
- **Animation:** CSS `@keyframes rotate { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`
- **Performance:** Uses `transform` for GPU acceleration
- **Z-Index:** Overlays YouTube player (z-index: 100)

---

### 3. CountdownTimer Module

**File:** `js/modules/countdown-timer.js`

**Purpose:** Manages countdown timers with callbacks.

**API Design:**

```javascript
class CountdownTimer {
  /**
   * Creates a new CountdownTimer
   * @param {number} duration - Duration in seconds
   * @param {Object} callbacks - Event callbacks
   * @param {Function} callbacks.onTick - Called each second
   * @param {Function} callbacks.onComplete - Called when done
   */
  constructor(duration, callbacks = {}) {
    this.duration = duration;
    this.remaining = duration;
    this.callbacks = callbacks;
    this.intervalId = null;
    this.startTime = null;
  }

  /**
   * Starts the countdown
   */
  start() {
    this.startTime = Date.now();
    this.tick(); // Immediate first tick
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  /**
   * Pauses the countdown
   */
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resumes the countdown
   */
  resume() {
    if (!this.intervalId && this.remaining > 0) {
      this.start();
    }
  }

  /**
   * Stops and resets the countdown
   */
  stop() {
    this.pause();
    this.remaining = this.duration;
  }

  /**
   * Handles each tick
   * @private
   */
  tick() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.remaining = this.duration - elapsed;

    if (this.remaining <= 0) {
      this.remaining = 0;
      this.pause();
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete();
      }
    } else {
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.remaining);
      }
    }
  }
}
```

**UI Component:**

```javascript
// Countdown UI helper
function renderCountdown(container, timer, options = {}) {
  const html = `
    <div class="countdown-overlay">
      <div class="countdown-number" id="countdown-display">${timer.remaining}</div>
      ${options.message ? `<div class="countdown-message">${options.message}</div>` : ''}
    </div>
  `;
  container.innerHTML = html;

  timer.callbacks.onTick = (remaining) => {
    const display = document.getElementById('countdown-display');
    display.textContent = remaining;
    display.classList.add('countdown-pulse');
    setTimeout(() => display.classList.remove('countdown-pulse'), 300);

    // Play sound
    if (options.sound) {
      playSound('beep');
    }
  };
}
```

---

### 4. ManualScoring Module

**File:** `js/modules/manual-scoring.js`

**Purpose:** Handles manual score calculation and team updates.

**API Design:**

```javascript
class ManualScoring {
  /**
   * Creates a new ManualScoring instance
   * @param {Object} gameState - Current game state
   */
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Awards points to a team
   * @param {string} teamId - Team ID
   * @param {string} questionType - Type of question answered
   * @returns {number} Points awarded
   */
  awardPoints(teamId, questionType) {
    const team = this.gameState.teams.find(t => t.id === teamId);
    if (!team) return 0;

    const points = this.calculatePoints(questionType);
    team.score += points;
    team.correctAnswers += 1;
    team.roundScores.push(points);

    return points;
  }

  /**
   * Removes points from a team (undo)
   * @param {string} teamId - Team ID
   * @param {number} points - Points to remove
   */
  removePoints(teamId, points) {
    const team = this.gameState.teams.find(t => t.id === teamId);
    if (!team) return;

    team.score -= points;
    team.correctAnswers -= 1;
    team.roundScores.pop();
  }

  /**
   * Calculates points for question type
   * @private
   * @param {string} questionType
   * @returns {number}
   */
  calculatePoints(questionType) {
    const weights = CONFIG.GAME.DEFAULT_SETTINGS.questionWeights;
    const basePoints = CONFIG.GAME.DEFAULT_SETTINGS.pointsPerCorrect;
    const weight = weights[questionType] || 1;
    return basePoints * weight;
  }

  /**
   * Marks teams as incorrect for a round
   * @param {string[]} teamIds - Team IDs that were incorrect
   */
  markIncorrect(teamIds) {
    teamIds.forEach(teamId => {
      const team = this.gameState.teams.find(t => t.id === teamId);
      if (team) {
        team.wrongAnswers += 1;
        team.roundScores.push(0);
      }
    });
  }

  /**
   * Gets current leaderboard
   * @returns {Array<Object>} Sorted teams
   */
  getLeaderboard() {
    return [...this.gameState.teams]
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({
        rank: index + 1,
        ...team
      }));
  }
}
```

---

### 5. SoundPlayer Utility

**File:** `js/modules/sound-player.js`

**Purpose:** Simple sound effect playback.

**API Design:**

```javascript
const SoundPlayer = {
  sounds: {},
  volume: 1.0,
  muted: false,

  /**
   * Preloads a sound
   * @param {string} name - Sound identifier
   * @param {string} url - Audio file URL
   */
  load(name, url) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds[name] = audio;
  },

  /**
   * Plays a sound
   * @param {string} name - Sound identifier
   */
  play(name) {
    if (this.muted) return;

    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.volume = this.volume;
    sound.play().catch(err => {
      console.warn('Sound playback failed:', err);
    });
  },

  /**
   * Sets volume (0.0 - 1.0)
   * @param {number} volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  },

  /**
   * Toggles mute
   */
  toggleMute() {
    this.muted = !this.muted;
  }
};

// Preload sounds on app init
SoundPlayer.load('beep', '/assets/sounds/beep.mp3');
SoundPlayer.load('finalBeep', '/assets/sounds/final-beep.mp3');
```

---

## Screen Updates

### GameSetupScreen (Modified)

**File:** `js/screens/game-setup.js`

**New Properties:**

```javascript
class GameSetupScreen {
  constructor() {
    // Existing
    this.teams = [...];
    this.rounds = 10;
    this.mode = 'classic';

    // NEW
    this.questionTypes = ['song_title', 'artist']; // Default enabled
    this.genreGroups = this.initializeGenreGroups();
    this.decadeFilter = this.initializeDecadeFilter();
    this.songDuration = CONFIG.GAME.DEFAULT_SONG_DURATION || 30;
  }

  initializeGenreGroups() {
    return [
      {
        name: 'Rock & Alternative',
        genres: ['Rock', 'Alternative Rock', 'Classic Rock', 'Hard Rock'],
        enabled: true
      },
      {
        name: 'Pop & Dance',
        genres: ['Pop', 'Dance', 'Electropop'],
        enabled: true
      },
      {
        name: 'Metal',
        genres: ['Metal', 'Heavy Metal', 'Power Metal'],
        enabled: false
      },
      {
        name: 'Austropop',
        genres: ['Austropop'],
        enabled: true
      },
      {
        name: 'German',
        genres: ['German', 'NDW'],
        enabled: false
      }
    ];
  }

  initializeDecadeFilter() {
    return [
      { decade: '1970s', enabled: true },
      { decade: '1980s', enabled: true },
      { decade: '1990s', enabled: true },
      { decade: '2000s', enabled: false },
      { decade: '2010s', enabled: false },
      { decade: '2020s', enabled: false }
    ];
  }
}
```

**New Methods:**

```javascript
toggleQuestionType(type) {
  const index = this.questionTypes.indexOf(type);
  if (index > -1) {
    this.questionTypes.splice(index, 1);
  } else {
    this.questionTypes.push(type);
  }
  // Require at least 1
  if (this.questionTypes.length === 0) {
    this.questionTypes.push(type);
    App.showNotification('Mindestens ein Fragetyp erforderlich', 'error');
  }
  this.updateQuestionTypeUI();
}

toggleGenreGroup(groupName) {
  const group = this.genreGroups.find(g => g.name === groupName);
  if (group) {
    group.enabled = !group.enabled;
    // Require at least 1 genre enabled
    const anyEnabled = this.genreGroups.some(g => g.enabled);
    if (!anyEnabled) {
      group.enabled = true;
      App.showNotification('Mindestens ein Genre erforderlich', 'error');
    }
  }
  this.updateGenreUI();
}

toggleDecade(decade) {
  const dec = this.decadeFilter.find(d => d.decade === decade);
  if (dec) {
    dec.enabled = !dec.enabled;
    // Require at least 1 decade
    const anyEnabled = this.decadeFilter.some(d => d.enabled);
    if (!anyEnabled) {
      dec.enabled = true;
      App.showNotification('Mindestens eine Dekade erforderlich', 'error');
    }
  }
  this.updateDecadeUI();
}

updateSongDuration(value) {
  this.songDuration = parseInt(value, 10);
  this.updateDurationDisplay();
}

validateSetup() {
  const songs = Storage.getSongs();
  const filteredSongs = this.filterSongs(songs);

  if (filteredSongs.length < this.rounds) {
    App.showNotification(
      `Nicht genug Songs für die Filter! ${filteredSongs.length} verfügbar, ${this.rounds} benötigt.`,
      'error'
    );
    return false;
  }

  return true;
}

filterSongs(songs) {
  // Filter by genres
  const enabledGenres = this.genreGroups
    .filter(g => g.enabled)
    .flatMap(g => g.genres);

  // Filter by decades
  const enabledDecades = this.decadeFilter
    .filter(d => d.enabled)
    .map(d => d.decade);

  return songs.filter(song => {
    const genreMatch = enabledGenres.includes(song.genre);
    const decade = Math.floor(song.year / 10) * 10 + 's'; // "1980s"
    const decadeMatch = enabledDecades.includes(decade);
    return genreMatch && decadeMatch;
  });
}
```

---

### GameplayScreen (Modified)

**File:** `js/screens/gameplay.js`

**New Flow:**

```javascript
class GameplayScreen {
  async playRound() {
    const gameState = State.get('game');
    const currentSong = this.getCurrentSong();
    const question = this.generateQuestion();

    // 1. Question Animation
    await this.showQuestionAnimation(question);

    // 2. Preparation Phase
    await this.showPreparationCountdown();

    // 3. Playback Phase
    await this.playWithVinylOverlay(currentSong);

    // 4. End Phase
    await this.showEndCountdown();

    // 5. Navigate to Reveal
    App.navigate('round-reveal');
  }

  async showQuestionAnimation(question) {
    const animator = new QuestionAnimator(
      this.container.querySelector('#question-container')
    );
    await animator.animate(question.text);
  }

  async showPreparationCountdown() {
    return new Promise(resolve => {
      const timer = new CountdownTimer(5, {
        onTick: (remaining) => {
          // Update UI
          this.updateCountdownDisplay(remaining);
          SoundPlayer.play('beep');
        },
        onComplete: () => {
          resolve();
        }
      });
      renderCountdown(this.container, timer, {
        message: 'Macht euch bereit!',
        sound: true
      });
      timer.start();
    });
  }

  async playWithVinylOverlay(song) {
    const playerContainer = this.container.querySelector('#player-container');

    // Show vinyl overlay
    const vinyl = new VinylAnimator(playerContainer);
    vinyl.show();

    // Load and play song
    await YouTubePlayer.loadVideo(song.youtubeId, song.startTime);
    YouTubePlayer.play();

    // Wait for duration
    const gameState = State.get('game');
    await this.sleep(gameState.songDuration * 1000);

    // Stop playback
    YouTubePlayer.pause();
    vinyl.hide();
  }

  async showEndCountdown() {
    return new Promise(resolve => {
      const timer = new CountdownTimer(5, {
        onTick: (remaining) => {
          this.updateCountdownDisplay(remaining);
          if (remaining === 1) {
            SoundPlayer.play('finalBeep');
          } else {
            SoundPlayer.play('beep');
          }
        },
        onComplete: () => {
          resolve();
        }
      });
      renderCountdown(this.container, timer, {
        message: 'Runde zu Ende!',
        sound: true
      });
      timer.start();
    });
  }

  generateQuestion() {
    const gameState = State.get('game');
    const questionTypes = gameState.questionTypes;
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    const questionTexts = {
      song_title: 'Wie heißt dieser Song?',
      artist: 'Wer singt diesen Song?',
      year: 'Aus welchem Jahr ist dieser Song?',
      genre: 'Welches Genre ist dieser Song?',
      decade: 'Aus welcher Dekade ist dieser Song?'
    };

    return {
      type: randomType,
      text: questionTexts[randomType]
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

### RoundRevealScreen (New)

**File:** `js/screens/round-reveal.js`

**Implementation:**

```javascript
class RoundRevealScreen {
  constructor() {
    this.container = null;
    this.scorer = null;
    this.checkedTeams = new Set();
  }

  render(container) {
    this.container = container;
    const gameState = State.get('game');
    const currentSong = this.getCurrentSong(gameState);

    this.scorer = new ManualScoring(gameState);

    const html = `
      <div class="reveal-screen">
        <h1>Runde ${gameState.currentRound} / ${gameState.totalRounds}</h1>

        ${this.renderSongInfo(currentSong)}
        ${this.renderVideoReplay(currentSong)}
        ${this.renderTeamScoring(gameState)}

        <button
          id="next-round-btn"
          class="btn-primary"
          disabled
        >
          ${gameState.currentRound < gameState.totalRounds ? 'Nächste Runde' : 'Ergebnisse anzeigen'}
        </button>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners(gameState);
  }

  renderSongInfo(song) {
    return `
      <div class="song-info-card">
        <img src="https://i.ytimg.com/vi/${song.youtubeId}/maxresdefault.jpg"
             alt="Cover"
             class="song-cover"
             onerror="this.src='/assets/images/placeholder.png'">
        <h2>${Utils.escapeHtml(song.title)}</h2>
        <p class="artist">${Utils.escapeHtml(song.artist)}</p>
        <div class="metadata">
          <span>${song.year}</span>
          <span>${song.genre}</span>
          ${song.album ? `<span>${Utils.escapeHtml(song.album)}</span>` : ''}
        </div>
      </div>
    `;
  }

  renderVideoReplay(song) {
    return `
      <button id="replay-video-btn" class="btn-secondary">
        <span class="material-symbols-outlined">play_circle</span>
        Video komplett ansehen
      </button>
    `;
  }

  renderTeamScoring(gameState) {
    return `
      <div class="team-scoring">
        <h3>Richtige Antworten</h3>
        <div class="team-checkboxes">
          ${gameState.teams.map(team => `
            <label class="team-checkbox">
              <input
                type="checkbox"
                data-team-id="${team.id}"
                class="team-checkbox-input">
              <span class="checkbox-custom" style="border-color: ${team.color};"></span>
              <span class="team-name">${Utils.escapeHtml(team.name)}</span>
              <span class="team-score">${team.score} Punkte</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners(gameState) {
    // Team checkboxes
    const checkboxes = this.container.querySelectorAll('.team-checkbox-input');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', (e) => {
        const teamId = e.target.dataset.teamId;
        if (e.target.checked) {
          this.checkedTeams.add(teamId);
        } else {
          this.checkedTeams.delete(teamId);
        }
        this.updateNextButton();
      });
    });

    // Video replay
    this.container.querySelector('#replay-video-btn')?.addEventListener('click', () => {
      this.playFullVideo(this.getCurrentSong(gameState));
    });

    // Next round
    this.container.querySelector('#next-round-btn')?.addEventListener('click', () => {
      this.submitScoresAndContinue(gameState);
    });
  }

  updateNextButton() {
    const btn = this.container.querySelector('#next-round-btn');
    btn.disabled = this.checkedTeams.size === 0;
  }

  submitScoresAndContinue(gameState) {
    const currentQuestion = gameState.currentQuestion;

    // Award points to checked teams
    this.checkedTeams.forEach(teamId => {
      this.scorer.awardPoints(teamId, currentQuestion.type);
    });

    // Mark unchecked teams as incorrect
    const uncheckedTeams = gameState.teams
      .filter(t => !this.checkedTeams.has(t.id))
      .map(t => t.id);
    this.scorer.markIncorrect(uncheckedTeams);

    // Update state
    State.set('game', gameState);
    Storage.saveGameState(gameState);

    // Navigate
    if (gameState.currentRound < gameState.totalRounds) {
      gameState.currentRound++;
      State.set('game', gameState);
      App.navigate('gameplay');
    } else {
      gameState.status = 'completed';
      State.set('game', gameState);
      App.navigate('results');
    }
  }

  playFullVideo(song) {
    // Show modal with full video
    App.showModal({
      title: song.title,
      content: `
        <div id="modal-player" style="width: 100%; aspect-ratio: 16/9;"></div>
      `,
      onOpen: () => {
        YouTubePlayer.loadVideo(song.youtubeId, 0);
        YouTubePlayer.play();
      },
      onClose: () => {
        YouTubePlayer.pause();
      }
    });
  }

  getCurrentSong(gameState) {
    const songId = gameState.playlist[gameState.currentRound - 1];
    return Database.getSongById(songId);
  }

  destroy() {
    // Cleanup
  }
}
```

---

## Data Flow

### Game State Schema (Extended)

```javascript
{
  gameId: "uuid",
  mode: "classic",
  status: "playing",
  currentRound: 3,
  totalRounds: 10,
  currentTeamIndex: 0,

  // NEW: Extended configuration
  questionTypes: ["song_title", "artist", "year"],
  genreFilter: {
    "Rock & Alternative": ["Rock", "Alternative Rock", "Classic Rock"],
    "Pop & Dance": ["Pop", "Dance"]
  },
  decadeFilter: ["1970s", "1980s", "1990s"],
  songDuration: 30,

  // Existing
  teams: [...],
  playedSongs: ["id1", "id2"],
  playlist: ["id3", "id4", ...],

  // NEW: Current question
  currentQuestion: {
    type: "song_title",
    text: "Wie heißt dieser Song?",
    correctAnswer: "Bohemian Rhapsody"
  },

  settings: {...}
}
```

### State Update Flow

```
User Action → Screen Event Handler → Update Local State → State.set() → Storage.saveGameState()
                                                                      ↓
                                                            Subscribers Notified
                                                                      ↓
                                                             UI Re-renders
```

---

## Performance Considerations

### Animation Performance

**Target:** 60 FPS on mobile devices

**Techniques:**
1. **GPU Acceleration:** Use `transform` and `opacity` only (no width/height/top/left)
2. **will-change:** Add `will-change: transform` to animated elements
3. **requestAnimationFrame:** Use for JavaScript animations
4. **CSS Animations:** Prefer CSS over JS for simple animations

**Example:**

```css
.vinyl-record {
  will-change: transform;
  animation: rotate 1.8s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Timer Accuracy

**Problem:** setInterval can drift over time

**Solution:** Timestamp-based countdown

```javascript
tick() {
  const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
  this.remaining = this.duration - elapsed;

  if (this.remaining <= 0) {
    // Complete
  }
}
```

### State Updates

**Problem:** Frequent state updates can cause re-renders

**Solution:** Batch updates where possible

```javascript
// Bad: Multiple state updates
State.set('game.currentRound', 4);
State.set('game.teams[0].score', 500);
State.set('game.playedSongs', [...]);

// Good: Single state update
const game = State.get('game');
game.currentRound = 4;
game.teams[0].score = 500;
game.playedSongs = [...];
State.set('game', game);
```

---

## Error Handling

### YouTube API Failures

```javascript
async playWithVinylOverlay(song) {
  try {
    await YouTubePlayer.loadVideo(song.youtubeId, song.startTime);
    YouTubePlayer.play();
  } catch (error) {
    console.error('YouTube playback failed:', error);
    App.showNotification('Video konnte nicht geladen werden', 'error');

    // Fallback: Skip to reveal
    App.navigate('round-reveal');
  }
}
```

### Storage Quota Exceeded

```javascript
Storage.saveGameState(gameState) {
  try {
    localStorage.setItem(CONFIG.STORAGE.KEYS.GAME_STATE, JSON.stringify(gameState));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      App.showNotification('Speicher voll! Spiel kann nicht gespeichert werden.', 'error');
      // Option: Clear old game history
    }
  }
}
```

### Animation Failures

```javascript
async animate(questionText) {
  try {
    await this.shuffleCards();
    await this.selectCard();
    this.revealQuestion(questionText);
  } catch (error) {
    console.error('Animation failed:', error);
    // Fallback: Show question immediately without animation
    this.container.innerHTML = `<div class="question-text">${questionText}</div>`;
  }
}
```

---

## Testing Strategy

### Unit Tests (Manual)

1. **QuestionAnimator**
   - Animation completes in expected time
   - Question text displays correctly
   - Cleanup removes all DOM elements

2. **CountdownTimer**
   - Countdown reaches 0 exactly
   - onTick called correct number of times
   - Pause/resume works correctly

3. **ManualScoring**
   - Points calculated correctly per question type
   - Leaderboard sorted correctly
   - Undo functionality works

### Integration Tests

1. **Full Game Flow**
   - Setup → Gameplay → Reveal → Next Round
   - All animations play correctly
   - Scores persist across rounds

2. **State Persistence**
   - Game state saved to LocalStorage
   - Game can be resumed after page reload
   - State updates trigger UI changes

### Visual Regression Tests

1. Take screenshots of:
   - Game setup with all options visible
   - Card shuffle animation (mid-animation)
   - Vinyl overlay during playback
   - Reveal screen with song info

2. Compare across:
   - Different screen sizes (320px, 768px, 1920px)
   - Different browsers (Chrome, Firefox, Safari)

---

## Security Considerations

### XSS Prevention

All user input is escaped:

```javascript
Utils.escapeHtml(song.title)
Utils.escapeHtml(team.name)
```

### YouTube Embed Safety

Use YouTube's privacy-enhanced mode:

```javascript
YouTubePlayer.loadVideo(videoId) {
  // Uses youtube-nocookie.com domain
  // Disables recommended videos from other channels
}
```

### LocalStorage Safety

No sensitive data stored (only game state and songs).

---

## Accessibility

### Keyboard Navigation

- All interactive elements focusable
- Tab order follows visual order
- Enter/Space activates buttons/checkboxes

### Screen Reader Support

```html
<div class="countdown-overlay" role="timer" aria-live="assertive">
  <div class="countdown-number" aria-label="Countdown">5</div>
</div>

<label class="team-checkbox">
  <input type="checkbox" aria-label="Team Rockstars richtige Antwort">
  <span>Team Rockstars</span>
</label>
```

### Color Contrast

- Text on background: 4.5:1 minimum
- Team colors checked for readability

---

## Future Enhancements

### Phase 6+

1. **Settings Toggle for Animations**
   - Disable card shuffle if performance is poor
   - Disable vinyl animation (show static image)

2. **Custom Genre Groups**
   - Allow users to create custom genre combinations
   - Save presets for quick setup

3. **Score Change Animation**
   - Animated counter when points are awarded
   - Confetti for high scores

4. **Undo Button**
   - Allow undoing score assignment
   - Grace period before locking scores

5. **Auto-Save Presets**
   - Save favorite configurations
   - Quick setup buttons ("Rock Night", "80s Party", etc.)

---

## Conclusion

This design follows BeatMaster's existing patterns:
- **Vanilla JS/CSS** - No frameworks
- **Observable State** - Centralized state management
- **Screen Controllers** - Modular screen architecture
- **Mobile-First** - Responsive design
- **Progressive Enhancement** - Core features work everywhere

The implementation is estimated at **12-17 hours** and introduces **5 new modules** and **1 new screen**.
