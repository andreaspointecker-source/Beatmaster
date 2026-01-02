// BeatMaster - Song Database Manager Screen

class DatabaseManagerScreen {
  constructor() {
    this.container = null;
    this.songs = [];
    this.filteredSongs = [];
    this.currentPage = 1;
    this.songsPerPage = 25;
    this.searchQuery = '';
    this.unsubscribeSongs = null;
    this.filterType = 'none';
    this.filterValue = 'all';
  }

  render(container) {
    this.container = container;
    this.loadSongs();

    const html = `
      <div class="flex flex-col h-full min-h-screen w-full">
        <!-- Top Navigation Bar -->
        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
          <div class="flex items-center p-4 justify-between">
            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" data-action="back">
              <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Song Database</h1>
            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" data-action="settings">
              <span class="material-symbols-outlined text-white" style="font-size: 24px;">settings</span>
            </button>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col w-full px-4 pb-24">
          <!-- Stats Headline -->
          <div class="py-4">
            <h2 class="text-[28px] font-bold leading-tight tracking-tight" data-role="song-count">${this.songs.length} Songs</h2>
            <p class="text-sm text-white/70 mt-1">Verwalte deine Musik-Bibliothek</p>
          </div>

          <!-- Import/Export Actions (Top) -->
          <div class="flex flex-wrap justify-center gap-3 w-full mb-4">
            <button class="flex-1 min-w-[140px] h-11 flex items-center justify-center gap-2 rounded-full border border-white/20 hover:bg-white/5 transition-colors" data-action="import">
              <span class="material-symbols-outlined text-white/70" style="font-size: 20px;">file_upload</span>
              <span class="text-xs font-bold text-white/70 uppercase tracking-wide">Importieren</span>
            </button>
            <button class="flex-1 min-w-[140px] h-11 flex items-center justify-center gap-2 rounded-full border border-white/20 hover:bg-white/5 transition-colors" data-action="export">
              <span class="material-symbols-outlined text-white/70" style="font-size: 20px;">file_download</span>
              <span class="text-xs font-bold text-white/70 uppercase tracking-wide">Exportieren</span>
            </button>
          </div>

          <!-- Search & Filter -->
          <div class="mb-3 flex flex-col gap-3">
            <label class="relative flex w-full items-center">
              <span class="absolute left-4 text-primary">
                <span class="material-symbols-outlined" style="font-size: 24px;">search</span>
              </span>
              <input
                type="text"
                placeholder="Suche Titel oder Interpret..."
                class="w-full h-12 rounded-full border-none bg-surface-dark-input pl-12 pr-4 text-base font-medium placeholder-white/40 text-white focus:ring-2 focus:ring-primary shadow-sm"
                data-action="search"
              />
            </label>
            <div class="flex gap-2">
              <select class="h-12 w-full rounded-full bg-surface-dark-input border border-white/10 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary" data-action="filter-type">
                <option value="none">Kein Filter</option>
                <option value="tag">Tag</option>
                <option value="genre">Genre</option>
                <option value="year">Jahr</option>
                <option value="decade">Dekade</option>
                <option value="difficulty">Schwierigkeit</option>
                <option value="source">Datei</option>
                <option value="verified">Geprüft</option>
              </select>
              <select class="h-12 w-full rounded-full bg-surface-dark-input border border-white/10 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary" data-action="filter-value">
                <option value="all">Alle</option>
              </select>
            </div>
          </div>

          <!-- Filters & Add Button Row -->
          <div class="flex flex-col gap-4 mb-6">
            <!-- Primary CTA -->
            <button class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-primary text-background-dark hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] gap-2" data-action="add-song">
              <span class="material-symbols-outlined" style="font-size: 24px;">add</span>
              <span class="text-base font-bold tracking-wide uppercase">Neuer Song</span>
            </button>
            <button class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-white/10 text-white hover:bg-white/20 active:scale-[0.98] transition-all gap-2" data-action="test-playlist">
              <span class="material-symbols-outlined" style="font-size: 24px;">playlist_play</span>
              <span class="text-base font-bold tracking-wide uppercase">Playlist testen</span>
            </button>
          </div>

          <!-- Song List -->
          <div class="flex flex-col gap-3" id="song-list">
            ${this.renderSongList()}
          </div>

          <!-- Empty State -->
          ${this.songs.length === 0 ? this.renderEmptyState() : ''}
        </main>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
    this.subscribeToState();
    this.updateFilterOptions();
    this.syncSongsFromDataFolder();
  }

  loadSongs() {
    this.songs = Storage.getSongs() || [];
    this.filteredSongs = [...this.songs];
  }

  renderSongList() {
    if (this.filteredSongs.length === 0) return '';

    return this.filteredSongs.slice(0, this.songsPerPage).map(song => `
      <div class="group relative flex flex-col gap-3 rounded-2xl bg-surface-dark p-4 shadow-sm border border-white/5 transition-all hover:border-primary/50">
        <div class="flex justify-between items-start">
          <div class="flex flex-col gap-1 min-w-0 pr-4">
            <h3 class="text-base font-bold text-white truncate">${Utils.escapeHTML(song.title || 'Unbekannt')}</h3>
            <p class="text-sm text-white/70 font-medium truncate">${Utils.escapeHTML(song.artist || 'Unbekannter Kuenstler')}</p>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-primary hover:bg-primary/10 transition-colors" data-action="edit-song" data-song-id="${song.id}">
              <span class="material-symbols-outlined" style="font-size: 20px;">edit</span>
            </button>
            <button class="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-red-500 hover:bg-red-500/10 transition-colors" data-action="delete-song" data-song-id="${song.id}">
              <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
            </button>
          </div>
        </div>
          <div class="flex flex-wrap gap-2">
          ${song.genre ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">${Utils.escapeHTML(song.genre)}</span>` : ''}
          ${song.year ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70">${song.year}</span>` : ''}
          ${song.verified ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">Geprüft</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  renderEmptyState() {
    return `
      <div class="flex flex-col items-center justify-center py-16 text-center" data-role="empty-state">
        <span class="material-symbols-outlined text-white/20 mb-4" style="font-size: 64px;">library_music</span>
        <h3 class="text-xl font-bold text-white/70 mb-2">Keine Songs vorhanden</h3>
        <p class="text-sm text-white/50 mb-6">Fuege deinen ersten Song hinzu!</p>
        <div class="flex flex-col gap-3">
          <button class="bg-primary text-background-dark px-6 py-3 rounded-full font-bold hover:brightness-110 transition-all" data-action="add-song">
            Song hinzufuegen
          </button>
          <button class="bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all" data-action="load-default-songs">
            Test-Songs laden
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Back button
    this.container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      App.navigate('home');
    });

    // Settings button
    this.container.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      App.navigate('settings');
    });

    // Search
    this.container.querySelector('[data-action="search"]')?.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Filters
    this.container.querySelector('[data-action="filter-type"]')?.addEventListener('change', (e) => {
      this.filterType = e.target.value;
      this.filterValue = 'all';
      this.updateFilterOptions();
      this.applyFilters();
    });

    this.container.querySelector('[data-action="filter-value"]')?.addEventListener('change', (e) => {
      this.filterValue = e.target.value;
      this.applyFilters();
    });

    // Add song
    this.container.querySelectorAll('[data-action="add-song"]').forEach(btn => {
      btn.addEventListener('click', () => this.showAddSongModal());
    });

    // Playlist test
    this.container.querySelector('[data-action="test-playlist"]')?.addEventListener('click', () => {
      this.startPlaylistTest();
    });

    // Edit song
    this.container.querySelectorAll('[data-action="edit-song"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const songId = e.currentTarget.dataset.songId;
        this.showEditSongModal(songId);
      });
    });

    // Delete song
    this.container.querySelectorAll('[data-action="delete-song"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const songId = e.currentTarget.dataset.songId;
        this.deleteSong(songId);
      });
    });

    // Load default songs
    this.container.querySelector('[data-action="load-default-songs"]')?.addEventListener('click', () => {
      this.loadDefaultSongs();
    });

    // Import
    this.container.querySelector('[data-action="import"]')?.addEventListener('click', () => {
      this.importSongs();
    });

    // Export
    this.container.querySelector('[data-action="export"]')?.addEventListener('click', () => {
      this.exportSongs();
    });
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.applyFilters();
  }

  updateSongList() {
    const songList = this.container.querySelector('#song-list');
    if (songList) {
      songList.innerHTML = this.renderSongList();
      this.attachEventListeners();
    }

    const songCount = this.container.querySelector('[data-role="song-count"]');
    if (songCount) {
      songCount.textContent = `${this.songs.length} Songs`;
    }

    const emptyState = this.container.querySelector('[data-role="empty-state"]');
    if (emptyState) {
      emptyState.remove();
    }
    if (this.songs.length === 0) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.renderEmptyState();
      const emptyEl = wrapper.firstElementChild;
      if (emptyEl) {
        this.container.querySelector('main')?.appendChild(emptyEl);
      }
    }
  }

  showAddSongModal() {
    App.showFormModal({
      title: 'Neuen Song hinzufuegen',
      fields: this.getSongFormFields(),
      onSubmit: (formData) => {
        const result = Database.addSong(this.normalizeSongFormData(formData));
        if (!result.success) {
          return { errors: result.errors };
        }
        this.loadSongs();
        this.applyFilters();
        this.updateFilterOptions();
        this.updateSongList();
        App.showNotification('Song erfolgreich hinzugefuegt!', 'success');
        return result;
      }
    });
  }

  showEditSongModal(songId) {
    const song = this.songs.find(s => s.id === songId);
    if (!song) return;

    App.showFormModal({
      title: 'Song bearbeiten',
      fields: this.getSongFormFields(),
      initialValues: {
        title: song.title || '',
        artist: song.artist || '',
        year: song.year || '',
        genre: song.genre || '',
        album: song.album || '',
        youtubeId: song.youtubeId || '',
        startTime: song.startTime || 0,
        duration: song.duration || '',
        difficulty: song.difficulty || 'medium',
        tags: song.tags || []
      },
      submitText: 'Speichern',
      onSubmit: (formData) => {
        const result = Database.updateSong(songId, this.normalizeSongFormData(formData));
        if (!result.success) {
          return { errors: result.errors };
        }
        this.loadSongs();
        this.applyFilters();
        this.updateFilterOptions();
        this.updateSongList();
        App.showNotification('Song aktualisiert!', 'success');
        return result;
      }
    });
  }

  getSongFormFields() {
    const genres = Database.getAllGenres();
    const tags = this.getAllTags();

    return [
      { name: 'title', label: 'Song-Titel', required: true },
      { name: 'artist', label: 'Interpret', required: true },
      { name: 'year', label: 'Jahr', type: 'number', min: 1800, max: new Date().getFullYear(), required: true },
      { name: 'genre', label: 'Genre', required: true, datalistOptions: genres },
      { name: 'album', label: 'Album', required: false },
      { name: 'youtubeId', label: 'YouTube URL/ID', required: true, placeholder: 'https://www.youtube.com/watch?v=...' },
      { name: 'startTime', label: 'Startzeit (Sek.)', type: 'number', min: 0, step: 1 },
      { name: 'duration', label: 'Dauer (Sek.)', type: 'number', min: 1, step: 1 },
      { name: 'difficulty', label: 'Schwierigkeit', type: 'select', options: [
        { value: 'easy', label: 'Leicht' },
        { value: 'medium', label: 'Mittel' },
        { value: 'hard', label: 'Schwer' }
      ] },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: '80s, classic', datalistOptions: tags }
    ];
  }

  normalizeSongFormData(formData) {
    const defaultDuration = CONFIG?.YOUTUBE?.DEFAULT_DURATION || 30;
    const startTimeValue = formData.startTime ? parseInt(formData.startTime) : this.getRandomStartTime();
    const durationValue = formData.duration ? parseInt(formData.duration) : defaultDuration;

    return {
      title: formData.title,
      artist: formData.artist,
      year: formData.year,
      genre: formData.genre,
      album: formData.album,
      youtubeId: formData.youtubeId,
      startTime: startTimeValue,
      duration: durationValue,
      difficulty: formData.difficulty || 'medium',
      tags: Array.isArray(formData.tags) ? formData.tags : []
    };
  }

  startPlaylistTest() {
    if (!this.filteredSongs || this.filteredSongs.length === 0) {
      App.showNotification('Keine Songs fuer die Playlist vorhanden', 'warning');
      return;
    }

    State.set('playlistTest', {
      songs: this.filteredSongs.map(song => ({ ...song })),
      source: this.filterType !== 'none' || this.searchQuery ? 'filtered' : 'all',
      startedAt: new Date().toISOString()
    });
    State.set('playlistTestIndex', 0);
    State.set('playlistTestSource', this.filterType);

    App.navigate('playlist-test');
  }

  getAllTags() {
    const tagSet = new Set();
    this.songs.forEach(song => {
      if (Array.isArray(song.tags)) {
        song.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }

  getRandomStartTime() {
    return Math.floor(Math.random() * 61);
  }

  deleteSong(songId) {
    const song = this.songs.find(s => s.id === songId);
    if (!song) return;

    App.confirm(`Song "${song.title}" wirklich loeschen?`, () => {
      const deleted = Database.deleteSong(songId);
      if (deleted) {
        this.loadSongs();
        this.applyFilters();
        this.updateFilterOptions();
        this.updateSongList();
        App.showNotification('Song geloescht', 'success');
      } else {
        App.showNotification('Song konnte nicht geloescht werden', 'error');
      }
    });
  }

  importSongs() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const result = Database.importSongs(parsed);
          if (result.success) {
            this.loadSongs();
            this.applyFilters();
            this.updateFilterOptions();
            this.updateSongList();
            App.showNotification(`${result.imported} Songs importiert!`, 'success');
            this.persistImportToServer(parsed);
          } else {
            App.showNotification('Import fehlgeschlagen', 'error');
          }
        } catch (error) {
          App.showNotification('Import fehlgeschlagen: Ungueltige JSON-Datei', 'error');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  exportSongs() {
    const data = Database.exportSongs(null, true);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `beatmaster-songs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    App.showNotification('Songs exportiert!', 'success');
  }

  applySearch() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.songs];

    if (this.searchQuery) {
      filtered = filtered.filter(song =>
        (song.title && song.title.toLowerCase().includes(this.searchQuery)) ||
        (song.artist && song.artist.toLowerCase().includes(this.searchQuery)) ||
        (song.genre && song.genre.toLowerCase().includes(this.searchQuery)) ||
        (song.album && song.album.toLowerCase().includes(this.searchQuery))
      );
    }

    if (this.filterType !== 'none' && this.filterValue && this.filterValue !== 'all') {
      const value = this.filterValue.toLowerCase();
      if (this.filterType === 'tag') {
        filtered = filtered.filter(song =>
          Array.isArray(song.tags) && song.tags.some(tag => tag.toLowerCase() === value)
        );
      }
      if (this.filterType === 'genre') {
        filtered = filtered.filter(song => (song.genre || '').toLowerCase() === value);
      }
      if (this.filterType === 'year') {
        filtered = filtered.filter(song => String(song.year) === String(this.filterValue));
      }
      if (this.filterType === 'decade') {
        const decade = parseInt(this.filterValue);
        filtered = filtered.filter(song => song.year >= decade && song.year <= decade + 9);
      }
      if (this.filterType === 'difficulty') {
        filtered = filtered.filter(song => (song.difficulty || '').toLowerCase() === value);
      }
      if (this.filterType === 'verified') {
        const wantsVerified = value === 'geprüft';
        filtered = filtered.filter(song => (song.verified === true) === wantsVerified);
      }
      if (this.filterType === 'source') {
        filtered = filtered.filter(song => (song.__source || '') === this.filterValue);
      }
    }

    this.filteredSongs = filtered;
    this.updateSongList();
  }

  updateFilterOptions() {
    const valueSelect = this.container.querySelector('[data-action="filter-value"]');
    if (!valueSelect) return;

    const options = this.getFilterValueOptions(this.filterType);
    valueSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Alle';
    valueSelect.appendChild(allOption);

    options.forEach(optionValue => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      valueSelect.appendChild(option);
    });

    valueSelect.value = options.includes(this.filterValue) ? this.filterValue : 'all';
    if (valueSelect.value === 'all') {
      this.filterValue = 'all';
    }
  }

  getFilterValueOptions(type) {
    if (type === 'tag') {
      return this.getAllTags();
    }
    if (type === 'genre') {
      return Database.getAllGenres();
    }
    if (type === 'year') {
      const years = new Set(this.songs.map(song => song.year).filter(Boolean));
      return Array.from(years).sort((a, b) => b - a).map(String);
    }
    if (type === 'decade') {
      const decades = new Set(this.songs.map(song => Math.floor(song.year / 10) * 10).filter(Boolean));
      return Array.from(decades).sort((a, b) => b - a).map(String);
    }
    if (type === 'difficulty') {
      const diffs = new Set(this.songs.map(song => song.difficulty).filter(Boolean));
      return Array.from(diffs).sort();
    }
    if (type === 'verified') {
      return ['geprüft', 'ungeprüft'];
    }
    if (type === 'source') {
      const sources = new Set(this.songs.map(song => song.__source).filter(Boolean));
      return Array.from(sources).sort((a, b) => a.localeCompare(b));
    }
    return [];
  }

  async loadDefaultSongs() {
    try {
      const response = await fetch('/api/songs/all', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('Default songs konnten nicht geladen werden');
      }
      const data = await response.json();
      const result = Database.importSongs(data);
      if (result.success) {
        this.loadSongs();
        this.applyFilters();
        this.updateFilterOptions();
        this.updateSongList();
        App.showNotification(`${result.imported} Test-Songs geladen`, 'success');
      } else {
        App.showNotification('Test-Songs konnten nicht geladen werden', 'error');
      }
    } catch (error) {
      App.showNotification('Test-Songs konnten nicht geladen werden', 'error');
    }
  }

  subscribeToState() {
    if (this.unsubscribeSongs) return;
    this.unsubscribeSongs = State.subscribe('songs', (songs) => {
      this.songs = Array.isArray(songs) ? songs : [];
      this.applyFilters();
      this.updateFilterOptions();
      this.updateSongList();
    });
  }

  destroy() {
    if (this.unsubscribeSongs) {
      this.unsubscribeSongs();
      this.unsubscribeSongs = null;
    }
  }

  async syncSongsFromDataFolder() {
    try {
      const response = await fetch('/api/songs/all', { cache: 'no-cache' });
      if (!response.ok) return;
      const data = await response.json();
      const result = Database.importSongs(data);
      if (result.success && result.imported > 0) {
        this.loadSongs();
        this.applyFilters();
        this.updateFilterOptions();
        this.updateSongList();
      }
    } catch (error) {
      // Server ggf. nicht erreichbar - keine UI-Fehlermeldung noetig
      console.warn('Song sync failed:', error);
    }
  }

  async persistImportToServer(data) {
    try {
      const response = await fetch('/api/songs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Import file could not be created');
      }
      const result = await response.json();
      if (result && result.file) {
        this.applySourceToSongs(data, result.file);
        App.showNotification(`Import gespeichert: ${result.file}`, 'success');
      }
    } catch (error) {
      App.showNotification('Import konnte nicht im data-Ordner gespeichert werden', 'warning');
    }
  }

  applySourceToSongs(data, sourceFile) {
    const songs = Array.isArray(data) ? data : (data && data.songs ? data.songs : []);
    if (!Array.isArray(songs) || songs.length === 0) return;

    const stored = Storage.getSongs() || [];
    const updated = stored.map(song => {
      const match = songs.find(item => {
        const ytId = Utils.extractYouTubeId(item.youtubeId || '') || (item.youtubeId || '');
        return ytId && ytId === song.youtubeId;
      });
      if (match && !song.__source) {
        return { ...song, __source: sourceFile };
      }
      return song;
    });

    Storage.saveSongs(updated);
    State.set('songs', updated);
  }
}

window.DatabaseManagerScreen = DatabaseManagerScreen;











