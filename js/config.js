// BeatMaster - Konfigurationskonstanten
// Zentrale Konfiguration für die gesamte App

const CONFIG = {
  APP: {
    NAME: 'BeatMaster',
    VERSION: '1.0.0',
    STORAGE_PREFIX: 'beatmaster_'
  },

  GAME: {
    MIN_TEAMS: 1,
    MAX_TEAMS: 10,
    MIN_ROUNDS: 1,
    MAX_ROUNDS: 50,
    DEFAULT_ROUNDS: 10,

    MODES: {
      CLASSIC: 'classic',
      SPEED: 'speed',
      MARATHON: 'marathon'
    },

    QUESTION_TYPES: {
      SONG_TITLE: 'song_title',
      ARTIST: 'artist',
      YEAR: 'year',
      GENRE: 'genre',
      DECADE: 'decade'
    },

    DEFAULT_SETTINGS: {
      pointsPerCorrect: 100,
      bonusStreakPoints: 50,
      yearTolerance: 2,
      playbackDuration: 30,
      timeLimit: 30,
      questionWeights: {
        song_title: 3,
        artist: 3,
        year: 1,
        genre: 2,
        decade: 1
      }
    },

    // Song Duration Settings
    SONG_DURATION_MIN: 15,
    SONG_DURATION_MAX: 90,
    DEFAULT_SONG_DURATION: 30,

    // Question Type Labels
    QUESTION_TYPE_LABELS: {
      song_title: { label: 'Song-Titel', description: 'Wie heißt der Song?' },
      artist: { label: 'Interpret', description: 'Wer singt den Song?' },
      year: { label: 'Jahr', description: 'Aus welchem Jahr ist der Song?' },
      genre: { label: 'Genre', description: 'Welches Genre hat der Song?' },
      decade: { label: 'Dekade', description: 'Aus welcher Dekade ist der Song?' }
    },

    // Genre Groups (ähnliche Genres zusammengefasst)
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

    // Decades Filter
    DECADES: ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s']
  },

  YOUTUBE: {
    API_LOADING_TIMEOUT: 10000,
    DEFAULT_START_TIME: 30,
    DEFAULT_DURATION: 30,
    PLAYER_VARS: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    }
  },

  UI: {
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300
  },

  STORAGE: {
    KEYS: {
      SONGS: 'beatmaster_songs',
      SETTINGS: 'beatmaster_settings',
      HISTORY: 'beatmaster_history',
      GAME_STATE: 'beatmaster_game_state'
    },
    MAX_SIZE_WARNING: 0.8 // Warne bei 80% Kapazität
  },

  TEAM_COLORS: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788'
  ]
};

// Objekt einfrieren, um Modifikationen zu verhindern
Object.freeze(CONFIG);
