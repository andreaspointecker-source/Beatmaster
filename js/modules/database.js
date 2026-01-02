// BeatMaster - Song Database
// Vollständige Song-Datenbank mit CRUD, Search, Filter, Sort, Import/Export

const Database = {
  // ========== CRUD Operations ==========

  /**
   * Erstellt einen neuen Song
   * @param {Object} songData - Song-Daten
   * @returns {Object} Ergebnis { success, song, errors }
   */
  addSong(songData) {
    const result = { success: false, song: null, errors: [] };

    // Validierung
    const validation = this.validateSong(songData);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    // Song erstellen
    const song = {
      id: Utils.generateUUID(),
      title: songData.title.trim(),
      artist: songData.artist.trim(),
      year: parseInt(songData.year),
      genre: songData.genre.trim(),
      album: songData.album ? songData.album.trim() : '',
      youtubeId: this._extractYouTubeIdSafe(songData.youtubeId),
      startTime: songData.startTime ? parseInt(songData.startTime) : 0,
      duration: songData.duration ? parseInt(songData.duration) : null,
      difficulty: songData.difficulty || 'medium',
      tags: Array.isArray(songData.tags) ? songData.tags : [],
      verified: !!songData.verified,
      __source: songData.__source || 'added-songs.json',
      playCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Songs laden, hinzufügen, speichern
    const songs = Storage.getSongs();
    songs.push(song);

    if (Storage.saveSongs(songs)) {
      State.set('songs', songs);
      result.success = true;
      result.song = song;
      this._persistNewSong(song);
    } else {
      result.errors.push('Fehler beim Speichern');
    }

    return result;
  },

  /**
   * Lädt einen Song anhand seiner ID
   * @param {string} id - Song-ID
   * @returns {Object|null} Song oder null
   */
  getSongById(id) {
    const songs = Storage.getSongs();
    return songs.find(s => s.id === id) || null;
  },

  /**
   * Lädt alle Songs sortiert nach Erstellungsdatum
   * @returns {Array} Array von Songs
   */
  getAllSongs() {
    const songs = Storage.getSongs();
    return songs.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  /**
   * Aktualisiert einen bestehenden Song
   * @param {string} id - Song-ID
   * @param {Object} updates - Zu aktualisierende Felder
   * @returns {Object} Ergebnis { success, song, errors }
   */
  updateSong(id, updates) {
    const result = { success: false, song: null, errors: [] };

    const songs = Storage.getSongs();
    const index = songs.findIndex(s => s.id === id);
    const originalSong = index >= 0 ? { ...songs[index] } : null;

    if (index === -1) {
      result.errors.push('Song nicht gefunden');
      return result;
    }

    // Merge updates mit bestehendem Song
    const updatedSong = { ...songs[index], ...updates };
    updatedSong.updatedAt = new Date().toISOString();

    // Extrahiere YouTube-ID falls URL übergeben wurde
    if (updates.youtubeId) {
      updatedSong.youtubeId = this._extractYouTubeIdSafe(updates.youtubeId);
    }

    // Validierung
    const validation = this.validateSong(updatedSong);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    // Speichern
    songs[index] = updatedSong;
    if (Storage.saveSongs(songs)) {
      State.set('songs', songs);
      result.success = true;
      result.song = updatedSong;
      if (originalSong) {
        this._persistUpdatedSong(originalSong, updatedSong);
      }
    } else {
      result.errors.push('Fehler beim Speichern');
    }

    return result;
  },

  /**
   * Löscht einen Song
   * @param {string} id - Song-ID
   * @returns {boolean} Erfolg
   */
  deleteSong(id) {
    const songs = Storage.getSongs();
    const filteredSongs = songs.filter(s => s.id !== id);
    const deletedSong = songs.find(s => s.id === id);

    if (filteredSongs.length === songs.length) {
      return false; // Song nicht gefunden
    }

    if (Storage.saveSongs(filteredSongs)) {
      State.set('songs', filteredSongs);
      if (deletedSong) {
        this._persistDeletedSong(deletedSong);
      }
      return true;
    }

    return false;
  },

  // ========== Validation ==========

  /**
   * Validiert Song-Daten
   * @param {Object} songData - Song-Daten
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validateSong(songData) {
    const errors = [];
    const title = songData.title ? songData.title.trim() : '';
    const artist = songData.artist ? songData.artist.trim() : '';
    const genre = songData.genre ? songData.genre.trim() : '';
    const youtubeInput = songData.youtubeId ? songData.youtubeId.trim() : '';

    // Required: Title
    if (!title) {
      errors.push('Titel ist erforderlich');
    } else if (title.length > 200) {
      errors.push('Titel darf maximal 200 Zeichen lang sein');
    }

    // Required: Artist
    if (!artist) {
      errors.push('Artist ist erforderlich');
    } else if (artist.length > 100) {
      errors.push('Artist darf maximal 100 Zeichen lang sein');
    }

    // Required: Year
    const year = parseInt(songData.year);
    const currentYear = new Date().getFullYear();
    if (!year || isNaN(year)) {
      errors.push('Jahr ist erforderlich');
    } else if (year < 1800 || year > currentYear) {
      errors.push(`Jahr muss zwischen 1800 und ${currentYear} liegen`);
    }

    // Required: Genre
    if (!genre) {
      errors.push('Genre ist erforderlich');
    }

    // Required: YouTube ID
    if (!youtubeInput) {
      errors.push('YouTube-ID ist erforderlich');
    } else {
      const ytValidation = this.validateYouTubeId(youtubeInput);
      if (!ytValidation.valid) {
        errors.push(ytValidation.error);
      }
    }

    // Optional: Difficulty
    if (songData.difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(songData.difficulty)) {
        errors.push('Difficulty muss easy, medium oder hard sein');
      }
    }

    // Optional: Tags
    if (songData.tags !== undefined) {
      if (!Array.isArray(songData.tags)) {
        errors.push('Tags muessen ein Array sein');
      } else if (songData.tags.some(tag => typeof tag !== 'string')) {
        errors.push('Tags muessen Strings sein');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validiert YouTube-ID
   * @param {string} id - YouTube-ID oder URL
   * @returns {Object} { valid: boolean, error: string }
   */
  validateYouTubeId(id) {
    if (!id) {
      return { valid: false, error: 'YouTube-ID ist leer' };
    }

    const extractedId = this._extractYouTubeIdSafe(id);

    if (!extractedId) {
      return { valid: false, error: 'Ungültige YouTube-ID oder URL' };
    }

    // YouTube IDs sind 11 Zeichen lang: alphanumerisch, -, _
    if (!/^[a-zA-Z0-9_-]{11}$/.test(extractedId)) {
      return { valid: false, error: 'YouTube-ID muss 11 Zeichen lang sein' };
    }

    return { valid: true, error: null };
  },

  /**
   * Extrahiert YouTube-ID sicher
   * @param {string} input - ID oder URL
   * @returns {string} Extrahierte ID
   * @private
   */
  _extractYouTubeIdSafe(input) {
    if (!input) return '';
    const id = Utils.extractYouTubeId(input.trim());
    return id || input.trim();
  },

  // ========== Search & Filter ==========

  /**
   * Sucht Songs nach Query
   * @param {string} query - Suchbegriff
   * @returns {Array} Gefundene Songs
   */
  searchSongs(query) {
    const songs = this.getAllSongs();

    if (!query || query.trim().length === 0) {
      return songs;
    }

    const searchTerm = query.toLowerCase().trim();

    return songs.filter(song => {
      return (
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm) ||
        (song.album && song.album.toLowerCase().includes(searchTerm)) ||
        (song.genre && song.genre.toLowerCase().includes(searchTerm)) ||
        (song.tags && song.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    });
  },

  /**
   * Filtert Songs nach Kriterien
   * @param {Object} filters - Filter-Objekt { genre, decade, difficulty, tags }
   * @returns {Array} Gefilterte Songs
   */
  filterSongs(filters) {
    let songs = this.getAllSongs();

    if (!filters || Object.keys(filters).length === 0) {
      return songs;
    }

    // Filter: Genre
    if (filters.genre && filters.genre !== 'all') {
      songs = songs.filter(song =>
        song.genre && song.genre.toLowerCase() === filters.genre.toLowerCase()
      );
    }

    // Filter: Decade
    if (filters.decade && filters.decade !== 'all') {
      const decadeStart = parseInt(filters.decade);
      const decadeEnd = decadeStart + 9;
      songs = songs.filter(song =>
        song.year >= decadeStart && song.year <= decadeEnd
      );
    }

    // Filter: Difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
      songs = songs.filter(song =>
        song.difficulty === filters.difficulty
      );
    }

    // Filter: Tags (mindestens ein Tag muss übereinstimmen)
    if (filters.tags && filters.tags.length > 0) {
      const tagSet = new Set(filters.tags.map(tag => tag.toLowerCase()));
      songs = songs.filter(song =>
        song.tags && song.tags.some(tag => tagSet.has(tag.toLowerCase()))
      );
    }

    return songs;
  },

  // ========== Sorting ==========

  /**
   * Sortiert Songs
   * @param {Array} songs - Zu sortierende Songs
   * @param {string} field - Sortierfeld (title, artist, year, playCount, createdAt)
   * @param {string} direction - Richtung ('asc' oder 'desc')
   * @returns {Array} Sortierte Songs
   */
  sortSongs(songs, field = 'createdAt', direction = 'desc') {
    const sorted = [...songs];

    sorted.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // String-Felder: case-insensitive
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      // Datums-Felder
      if (field === 'createdAt' || field === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  },

  // ========== Import/Export ==========

  /**
   * Importiert Songs aus JSON
   * @param {string|Object} jsonData - JSON-String oder Objekt
   * @returns {Object} Ergebnis { success, imported, skipped, duplicates, errors }
   */
  importSongs(jsonData) {
    const result = {
      success: false,
      imported: 0,
      skipped: 0,
      duplicates: 0,
      errors: []
    };

    try {
      // Parse JSON falls String
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

      // Validiere Struktur
      if (!Array.isArray(data)) {
        throw new Error('Import-Daten müssen ein Array sein');
      }

      const existingSongs = Storage.getSongs();
      const existingYouTubeIds = new Set(existingSongs.map(s => s.youtubeId));

      // Importiere Songs
      data.forEach((songData, index) => {
        // Prüfe auf Duplikat (YouTube-ID)
        const ytId = this._extractYouTubeIdSafe(songData.youtubeId);
        if (existingYouTubeIds.has(ytId)) {
          const existing = existingSongs.find(s => s.youtubeId === ytId);
          if (existing && songData.__source && !existing.__source) {
            existing.__source = songData.__source;
          }
          result.duplicates++;
          return;
        }

        // Validiere Song
        const validation = this.validateSong(songData);
        if (!validation.valid) {
          result.skipped++;
          result.errors.push(`Song ${index + 1}: ${validation.errors.join(', ')}`);
          return;
        }

        // Erstelle Song
        const song = {
          id: songData.id || Utils.generateUUID(),
          title: songData.title.trim(),
          artist: songData.artist.trim(),
          year: parseInt(songData.year),
          genre: songData.genre.trim(),
          album: songData.album ? songData.album.trim() : '',
          youtubeId: ytId,
          startTime: songData.startTime ? parseInt(songData.startTime) : 0,
          duration: songData.duration ? parseInt(songData.duration) : null,
          difficulty: songData.difficulty || 'medium',
          tags: Array.isArray(songData.tags) ? songData.tags : [],
          verified: !!songData.verified,
          __source: songData.__source,
          playCount: songData.playCount || 0,
          createdAt: songData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        existingSongs.push(song);
        existingYouTubeIds.add(ytId);
        result.imported++;
      });

      // Speichern
      if (Storage.saveSongs(existingSongs)) {
        State.set('songs', existingSongs);
        result.success = true;
      } else {
        throw new Error('Fehler beim Speichern');
      }

    } catch (error) {
      result.errors.push(error.message);
    }

    return result;
  },

  /**
   * Exportiert Songs als JSON
   * @param {Object} filters - Optional: Filter-Objekt
   * @param {boolean} pretty - Pretty-Print JSON
   * @returns {string} JSON-String
   */
  exportSongs(filters = null, pretty = true) {
    let songs = this.getAllSongs();

    // Filtere falls gewünscht
    if (filters) {
      songs = this.filterSongs(filters);
    }

    // Entferne interne Felder (optional)
    const exportData = songs.map(song => ({
      title: song.title,
      artist: song.artist,
      year: song.year,
      genre: song.genre,
      album: song.album,
      youtubeId: song.youtubeId,
      startTime: song.startTime,
      duration: song.duration,
      difficulty: song.difficulty,
      tags: song.tags,
      playCount: song.playCount
    }));

    return JSON.stringify(exportData, null, pretty ? 2 : 0);
  },

  // ========== Utilities ==========

  /**
   * Holt alle Genres aus der Datenbank
   * @returns {Array} Sortierte Genre-Liste
   */
  getAllGenres() {
    const songs = this.getAllSongs();
    const genres = new Set(songs.map(s => s.genre));
    return Array.from(genres).sort();
  },

  /**
   * Holt alle Dekaden aus der Datenbank
   * @returns {Array} Sortierte Dekaden-Liste
   */
  getAllDecades() {
    const songs = this.getAllSongs();
    const decades = new Set(songs.map(s => Math.floor(s.year / 10) * 10));
    return Array.from(decades).sort((a, b) => b - a);
  },

  /**
   * Inkrementiert den Play Count eines Songs
   * @param {string} id - Song-ID
   */
  incrementPlayCount(id) {
    const songs = Storage.getSongs();
    const song = songs.find(s => s.id === id);

    if (song) {
      song.playCount = (song.playCount || 0) + 1;
      song.updatedAt = new Date().toISOString();
      Storage.saveSongs(songs);
      State.set('songs', songs);
    }
  },

  _persistNewSong(song) {
    try {
      fetch('/api/songs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song)
      }).catch(() => {});
    } catch {
      // ignore
    }
  },

  _persistUpdatedSong(originalSong, updatedSong) {
    try {
      fetch('/api/songs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalTitle: originalSong.title,
          originalArtist: originalSong.artist,
          originalYear: originalSong.year,
          updates: updatedSong
        })
      }).catch(() => {});
    } catch {
      // ignore
    }
  },

  _persistDeletedSong(song) {
    try {
      fetch('/api/songs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: song.id,
          title: song.title,
          artist: song.artist,
          year: song.year
        })
      }).catch(() => {});
    } catch {
      // ignore
    }
  }
};

window.Database = Database;
