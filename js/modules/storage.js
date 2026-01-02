// BeatMaster - LocalStorage Abstraktionsschicht
// Zentrale Verwaltung aller Daten-Persistierung

const Storage = {
  /**
   * Holt einen Wert aus LocalStorage
   * @param {string} key - Key
   * @param {*} defaultValue - Default-Wert falls nicht vorhanden
   * @returns {*} Wert oder Default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Storage.get error for key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Speichert einen Wert in LocalStorage
   * @param {string} key - Key
   * @param {*} value - Wert
   * @returns {boolean} Erfolg
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded!');
        this._handleQuotaExceeded();
      } else {
        console.error(`Storage.set error for key "${key}":`, error);
      }
      return false;
    }
  },

  /**
   * Entfernt einen Wert aus LocalStorage
   * @param {string} key - Key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage.remove error for key "${key}":`, error);
    }
  },

  /**
   * Leert kompletten LocalStorage
   */
  clear() {
    try {
      localStorage.clear();
      console.log('LocalStorage cleared');
    } catch (error) {
      console.error('Storage.clear error:', error);
    }
  },

  // ========== Songs ==========

  /**
   * Lädt Songs aus LocalStorage
   * @returns {Array} Songs-Array
   */
  getSongs() {
    const data = this.get(CONFIG.STORAGE.KEYS.SONGS, { songs: [], version: '1.0' });
    return data.songs || [];
  },

  /**
   * Speichert Songs in LocalStorage
   * @param {Array} songs - Songs-Array
   * @returns {boolean} Erfolg
   */
  saveSongs(songs) {
    const data = {
      songs: songs,
      version: '1.0',
      lastSync: new Date().toISOString()
    };
    return this.set(CONFIG.STORAGE.KEYS.SONGS, data);
  },

  // ========== Einstellungen ==========

  /**
   * Lädt Einstellungen aus LocalStorage
   * @returns {Object} Einstellungen
   */
  getSettings() {
    const defaultSettings = {
      general: {
        theme: 'dark',
        soundEffects: true,
        soundVolume: 0.7,
        animations: true,
        language: 'de'
      },
      gameDefaults: {
        mode: CONFIG.GAME.MODES.CLASSIC,
        rounds: CONFIG.GAME.DEFAULT_ROUNDS,
        teamCount: 2,
        ...CONFIG.GAME.DEFAULT_SETTINGS
      }
    };

    return this.get(CONFIG.STORAGE.KEYS.SETTINGS, defaultSettings);
  },

  /**
   * Speichert Einstellungen in LocalStorage
   * @param {Object} settings - Einstellungen
   * @returns {boolean} Erfolg
   */
  saveSettings(settings) {
    return this.set(CONFIG.STORAGE.KEYS.SETTINGS, settings);
  },

  // ========== Spiel-Historie ==========

  /**
   * Lädt Spiel-Historie aus LocalStorage
   * @returns {Object} Historie
   */
  getHistory() {
    const defaultHistory = {
      games: [],
      stats: {
        totalGamesPlayed: 0,
        totalSongsPlayed: 0,
        favoriteGenre: null,
        mostPlayedSong: null
      }
    };

    return this.get(CONFIG.STORAGE.KEYS.HISTORY, defaultHistory);
  },

  /**
   * Speichert Spiel-Historie in LocalStorage
   * @param {Object} history - Historie
   * @returns {boolean} Erfolg
   */
  saveHistory(history) {
    return this.set(CONFIG.STORAGE.KEYS.HISTORY, history);
  },

  /**
   * Fügt ein Spiel zur Historie hinzu
   * @param {Object} gameData - Spieldaten
   */
  addGameToHistory(gameData) {
    const history = this.getHistory();
    history.games.unshift(gameData); // Neustes zuerst

    // Behalte max. 100 Spiele
    if (history.games.length > 100) {
      history.games = history.games.slice(0, 100);
    }

    // Aktualisiere Statistiken
    history.stats.totalGamesPlayed = history.games.length;
    history.stats.totalSongsPlayed += gameData.songsPlayed || 0;

    this.saveHistory(history);
  },

  // ========== Spielstatus ==========

  /**
   * Lädt aktuellen Spielstatus aus SessionStorage/LocalStorage
   * @returns {Object|null} Spielstatus oder null
   */
  getGameState() {
    // Versuche zuerst SessionStorage
    try {
      const sessionData = sessionStorage.getItem(CONFIG.STORAGE.KEYS.GAME_STATE);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.warn('SessionStorage nicht verfügbar:', error);
    }

    // Fallback zu LocalStorage
    return this.get(CONFIG.STORAGE.KEYS.GAME_STATE, null);
  },

  /**
   * Speichert Spielstatus in SessionStorage/LocalStorage
   * @param {Object} gameState - Spielstatus
   * @returns {boolean} Erfolg
   */
  saveGameState(gameState) {
    if (!gameState) {
      this.clearGameState();
      return true;
    }

    // Speichere in SessionStorage (bevorzugt)
    try {
      sessionStorage.setItem(CONFIG.STORAGE.KEYS.GAME_STATE, JSON.stringify(gameState));
    } catch (error) {
      console.warn('SessionStorage.setItem failed:', error);
    }

    // Speichere auch in LocalStorage als Backup
    return this.set(CONFIG.STORAGE.KEYS.GAME_STATE, gameState);
  },

  /**
   * Löscht gespeicherten Spielstatus
   */
  clearGameState() {
    try {
      sessionStorage.removeItem(CONFIG.STORAGE.KEYS.GAME_STATE);
    } catch (error) {
      console.warn('SessionStorage nicht verfügbar:', error);
    }
    this.remove(CONFIG.STORAGE.KEYS.GAME_STATE);
  },

  // ========== Import/Export ==========

  /**
   * Exportiert alle Daten als JSON
   * @returns {string} JSON-String
   */
  exportData() {
    const data = {
      songs: this.getSongs(),
      settings: this.getSettings(),
      history: this.getHistory(),
      exportedAt: new Date().toISOString(),
      version: CONFIG.APP.VERSION
    };

    return JSON.stringify(data, null, 2);
  },

  /**
   * Importiert Daten aus JSON
   * @param {string} jsonString - JSON-String
   * @returns {Object} Ergebnis mit Erfolg und Fehlern
   */
  importData(jsonString) {
    const result = {
      success: false,
      errors: [],
      imported: {
        songs: 0,
        settings: false,
        history: 0
      }
    };

    try {
      const data = JSON.parse(jsonString);

      // Validiere Datenstruktur
      if (!data || typeof data !== 'object') {
        throw new Error('Ungültiges Datenformat');
      }

      // Importiere Songs
      if (Array.isArray(data.songs)) {
        this.saveSongs(data.songs);
        result.imported.songs = data.songs.length;
      }

      // Importiere Einstellungen
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings(data.settings);
        result.imported.settings = true;
      }

      // Importiere Historie
      if (data.history && data.history.games) {
        this.saveHistory(data.history);
        result.imported.history = data.history.games.length;
      }

      result.success = true;
    } catch (error) {
      result.errors.push(error.message);
      console.error('Import error:', error);
    }

    return result;
  },

  // ========== Storage-Info ==========

  /**
   * Berechnet genutzte Storage-Größe
   * @returns {Object} Größeninfo
   */
  getStorageSize() {
    let total = 0;
    const sizes = {};

    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = (localStorage[key].length + key.length) * 2; // UTF-16
          sizes[key] = size;
          total += size;
        }
      }
    } catch (error) {
      console.error('getStorageSize error:', error);
    }

    return {
      totalBytes: total,
      totalKB: (total / 1024).toFixed(2),
      totalMB: (total / (1024 * 1024)).toFixed(2),
      items: sizes,
      percentage: this._getStoragePercentage(total)
    };
  },

  /**
   * Prüft ob Storage-Quota fast ausgeschöpft ist
   * @returns {boolean} Ob Warnung angezeigt werden sollte
   */
  isQuotaWarning() {
    const size = this.getStorageSize();
    return size.percentage >= (CONFIG.STORAGE.MAX_SIZE_WARNING * 100);
  },

  /**
   * Berechnet Storage-Nutzung in Prozent
   * @param {number} usedBytes - Genutzte Bytes
   * @returns {number} Prozent
   * @private
   */
  _getStoragePercentage(usedBytes) {
    // Schätzung: 5-10MB Limit für LocalStorage (Browser-abhängig)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    return Math.min(100, (usedBytes / estimatedLimit) * 100);
  },

  /**
   * Behandelt Quota-Exceeded Fehler
   * @private
   */
  _handleQuotaExceeded() {
    console.warn('LocalStorage quota exceeded!');

    // Zeige Warnung an Benutzer
    if (window.App && window.App.showNotification) {
      window.App.showNotification(
        'Speicher voll! Bitte exportiere deine Daten und lösche alte Einträge.',
        'error'
      );
    }

    // Logge Storage-Größe
    const size = this.getStorageSize();
    console.log('Storage size:', size);
  }
};
