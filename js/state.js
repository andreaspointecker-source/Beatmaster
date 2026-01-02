// BeatMaster - Globales State Management
// Observable Pattern für reaktive State-Updates

const State = {
  // Privater State
  _state: {
    currentScreen: 'home',
    songs: [],
    settings: null,
    game: null,
    history: null,
    playlistTest: null,
    playlistTestIndex: 0,
    playlistTestSource: null
  },

  // Observer-Callbacks
  _observers: {},

  /**
   * Holt einen Wert aus dem State
   * @param {string} key - State-Key
   * @returns {*} Wert
   */
  get(key) {
    return this._state[key];
  },

  /**
   * Setzt einen Wert im State und benachrichtigt Observer
   * @param {string} key - State-Key
   * @param {*} value - Wert
   */
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;

    // Benachrichtige Observer
    this._notify(key, value, oldValue);

    // Bei bestimmten Keys: Auto-Persist
    this._autoPersist(key, value);
  },

  /**
   * Aktualisiert mehrere State-Werte gleichzeitig
   * @param {Object} updates - Key-Value Paare
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value);
    });
  },

  /**
   * Registriert einen Observer für einen Key
   * @param {string} key - State-Key
   * @param {Function} callback - Callback-Funktion (value, oldValue)
   * @returns {Function} Unsubscribe-Funktion
   */
  subscribe(key, callback) {
    if (!this._observers[key]) {
      this._observers[key] = [];
    }

    this._observers[key].push(callback);

    // Gib Unsubscribe-Funktion zurück
    return () => this.unsubscribe(key, callback);
  },

  /**
   * Entfernt einen Observer
   * @param {string} key - State-Key
   * @param {Function} callback - Callback-Funktion
   */
  unsubscribe(key, callback) {
    if (!this._observers[key]) return;

    const index = this._observers[key].indexOf(callback);
    if (index > -1) {
      this._observers[key].splice(index, 1);
    }
  },

  /**
   * Benachrichtigt alle Observer eines Keys
   * @param {string} key - State-Key
   * @param {*} value - Neuer Wert
   * @param {*} oldValue - Alter Wert
   * @private
   */
  _notify(key, value, oldValue) {
    if (!this._observers[key]) return;

    this._observers[key].forEach(callback => {
      try {
        callback(value, oldValue);
      } catch (error) {
        console.error(`State observer error for key "${key}":`, error);
      }
    });

    // Wildcard-Observer (*) für alle Änderungen
    if (this._observers['*']) {
      this._observers['*'].forEach(callback => {
        try {
          callback(key, value, oldValue);
        } catch (error) {
          console.error('State wildcard observer error:', error);
        }
      });
    }
  },

  /**
   * Auto-Persist für bestimmte Keys
   * @param {string} key - State-Key
   * @param {*} value - Wert
   * @private
   */
  _autoPersist(key, value) {
    // Diese Keys werden automatisch gespeichert
    const persistKeys = {
      'songs': 'saveSongs',
      'settings': 'saveSettings',
      'game': 'saveGameState',
      'history': 'saveHistory'
    };

    if (persistKeys[key] && typeof Storage !== 'undefined') {
      try {
        Storage[persistKeys[key]](value);
      } catch (error) {
        console.error(`Auto-persist failed for key "${key}":`, error);
      }
    }
  },

  /**
   * Lädt initialen State aus LocalStorage
   */
  loadInitialState() {
    if (typeof Storage === 'undefined') {
      console.warn('Storage not available, using default state');
      return;
    }

    try {
      // Lade Songs
      const songs = Storage.getSongs();
      if (songs) {
        this._state.songs = songs;
      }

      // Lade Einstellungen
      const settings = Storage.getSettings();
      if (settings) {
        this._state.settings = settings;
      }

      // Lade Historie
      const history = Storage.getHistory();
      if (history) {
        this._state.history = history;
      }

      // Lade Spielstatus (falls vorhanden)
      const gameState = Storage.getGameState();
      if (gameState) {
        this._state.game = gameState;
      }

      console.log('Initial state loaded from storage');
    } catch (error) {
      console.error('Failed to load initial state:', error);
    }
  },

  /**
   * Setzt den State zurück
   * @param {boolean} clearStorage - Ob Storage auch geleert werden soll
   */
  reset(clearStorage = false) {
    this._state = {
      currentScreen: 'home',
      songs: [],
      settings: null,
      game: null,
      history: null,
      playlistTest: null,
      playlistTestIndex: 0,
      playlistTestSource: null
    };

    if (clearStorage && typeof Storage !== 'undefined') {
      Storage.clear();
    }

    // Benachrichtige alle Observer über Reset
    Object.keys(this._observers).forEach(key => {
      this._notify(key, this._state[key], undefined);
    });

    console.log('State reset' + (clearStorage ? ' (including storage)' : ''));
  },

  /**
   * Exportiert den kompletten State (für Debugging)
   * @returns {Object} State-Kopie
   */
  export() {
    return JSON.parse(JSON.stringify(this._state));
  },

  /**
   * Importiert State (für Debugging/Testing)
   * @param {Object} stateData - State-Daten
   */
  import(stateData) {
    Object.entries(stateData).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
};

// Debug-Helper (nur in Dev-Mode)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.DEBUG_STATE = State;
  console.log('Debug: State object available as window.DEBUG_STATE');
}
