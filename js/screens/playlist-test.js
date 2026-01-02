// BeatMaster - Playlist Test Screen
class PlaylistTestScreen {
  constructor() {
    this.container = null;
    this.currentSong = null;
    this.playlistTestState = null;
    this.playlistTimer = null;
    this.isPlaylistPaused = false;
  }

  render(container) {
    this.container = container;
    this.renderPlaylistTest();
  }

  renderPlaylistTest() {
    this.playlistTestState = State.get('playlistTest');
    const songs = Array.isArray(this.playlistTestState?.songs) ? this.playlistTestState.songs : [];

    if (songs.length === 0) {
      this.container.innerHTML = `
        <div class="flex flex-col h-full min-h-screen w-full">
          <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
            <div class="flex items-center p-4 justify-between">
              <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" onclick="App.navigate('database')">
                <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>
              </button>
              <h1 class="text-lg font-bold">Playlist Test</h1>
              <div class="size-12"></div>
            </div>
          </header>
          <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <span class="material-symbols-outlined text-white/30 mb-4" style="font-size: 64px;">queue_music</span>
            <h2 class="text-2xl font-bold text-white mb-2">Keine Songs vorhanden</h2>
            <p class="text-white/60 mb-6">Bitte filtere Songs in der Datenbank und starte den Playlist-Test erneut.</p>
            <button class="bg-primary text-background-dark px-6 py-3 rounded-full font-bold hover:brightness-110" onclick="App.navigate('database')">Zur Song-Datenbank</button>
          </main>
        </div>
      `;
      return;
    }

    const total = songs.length;
    const index = Math.max(0, Math.min(State.get('playlistTestIndex') || 0, total - 1));
    State.set('playlistTestIndex', index);

    this.container.innerHTML = `
      <div class="flex flex-col h-full min-h-screen w-full">
        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
          <div class="flex items-center p-4 justify-between">
            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" data-action="back">
              <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <div class="flex flex-col items-center">
              <h1 class="text-lg font-bold">Playlist Test</h1>
              <p class="text-xs text-white/50" data-role="playlist-position">Song ${index + 1} / ${total}</p>
            </div>
            <div class="size-12"></div>
          </div>
        </header>

        <main class="flex-1 flex flex-col gap-6 px-6 pb-28 pt-6">
          <div class="bg-surface-dark/60 border border-white/10 rounded-2xl overflow-hidden">
            <div class="aspect-video w-full bg-black/60">
              <div id="youtube-player-test" class="w-full h-full"></div>
            </div>
            <div class="p-4 space-y-2">
              <h2 class="text-xl font-bold text-white" data-role="song-title">-</h2>
              <p class="text-white/70" data-role="song-artist">-</p>
              <p class="text-sm text-white/50" data-role="song-meta">-</p>
              <div class="flex flex-wrap gap-2 pt-2">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300" data-role="verified-badge" style="display:none;">
                  Geprueft
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <button class="w-full h-12 rounded-full bg-primary text-background-dark font-bold hover:brightness-110 transition-all" data-action="verify">
              Song als geprueft markieren
            </button>
            <button class="w-full h-12 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all" data-action="edit">
              Song bearbeiten
            </button>
            <button class="w-full h-12 rounded-full bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-all" data-action="delete">
              Song loeschen
            </button>
          </div>
        </main>

        <div class="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/95 backdrop-blur-md border-t border-white/5 p-4">
          <div class="max-w-md mx-auto flex items-center justify-between gap-3">
            <button class="flex-1 h-12 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all" data-action="prev">
              <span class="material-symbols-outlined align-middle">skip_previous</span>
            </button>
            <button class="flex-1 h-12 rounded-full bg-primary text-background-dark font-bold hover:brightness-110 transition-all" data-action="toggle-play">
              <span class="material-symbols-outlined align-middle" data-role="play-icon">pause</span>
            </button>
            <button class="flex-1 h-12 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all" data-action="next">
              <span class="material-symbols-outlined align-middle">skip_next</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      this.cleanup();
      App.navigate('database');
    });

    this.container.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
      this.playlistNavigate(-1, false);
    });

    this.container.querySelector('[data-action="next"]')?.addEventListener('click', () => {
      this.playlistNavigate(1, false);
    });

    this.container.querySelector('[data-action="toggle-play"]')?.addEventListener('click', () => {
      this.togglePlaylistPlayback();
    });

    this.container.querySelector('[data-action="verify"]')?.addEventListener('click', () => {
      this.toggleVerifyCurrentSong();
    });

    this.container.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      this.editCurrentSong();
    });

    this.container.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      this.deleteCurrentSong();
    });

    this.loadPlaylistSong(index, true);
  }

  getPlaylistSongs() {
    return Array.isArray(this.playlistTestState?.songs) ? this.playlistTestState.songs : [];
  }

  getSongAtIndex(index) {
    const songs = this.getPlaylistSongs();
    if (!songs[index]) return null;
    const songId = songs[index].id;
    return songId ? (Database.getSongById(songId) || songs[index]) : songs[index];
  }

  updatePlaylistHeader() {
    const songs = this.getPlaylistSongs();
    const total = songs.length;
    const index = Math.max(0, Math.min(State.get('playlistTestIndex') || 0, total - 1));
    const position = this.container.querySelector('[data-role="playlist-position"]');
    if (position) {
      position.textContent = `Song ${index + 1} / ${total}`;
    }
  }

  async loadPlaylistSong(index, autoplay) {
    const songs = this.getPlaylistSongs();
    if (songs.length === 0) return;

    const clamped = Math.max(0, Math.min(index, songs.length - 1));
    State.set('playlistTestIndex', clamped);
    this.updatePlaylistHeader();

    const song = this.getSongAtIndex(clamped);
    if (!song) return;

    this.currentSong = song;
    this.isPlaylistPaused = !autoplay;
    this.updatePlaylistInfo(song);

    try {
      await YouTubePlayer.init('youtube-player-test', true);
      const startTime = song.startTime || 0;
      await YouTubePlayer.loadVideo(song.youtubeId, startTime);
      if (autoplay) {
        await YouTubePlayer.play();
      } else {
        await YouTubePlayer.pause();
      }
      this.updatePlaylistPlayIcon();
      this.startPlaylistTimer(song, autoplay);
    } catch (error) {
      console.error('Playlist test video error:', error);
      App.showNotification('Video konnte nicht geladen werden', 'error');
    }
  }

  updatePlaylistInfo(song) {
    const title = this.container.querySelector('[data-role="song-title"]');
    const artist = this.container.querySelector('[data-role="song-artist"]');
    const meta = this.container.querySelector('[data-role="song-meta"]');
    const badge = this.container.querySelector('[data-role="verified-badge"]');

    if (title) title.textContent = song.title || '-';
    if (artist) artist.textContent = song.artist || '-';
    if (meta) {
      const year = song.year ? String(song.year) : '-';
      const genre = song.genre || '-';
      meta.textContent = `${year} - ${genre}`;
    }

    if (badge) {
      badge.style.display = song.verified ? 'inline-flex' : 'none';
    }

    const verifyBtn = this.container.querySelector('[data-action="verify"]');
    if (verifyBtn) {
      if (song.verified) {
        verifyBtn.textContent = 'Pruefung rueckgaengig';
      } else {
        verifyBtn.textContent = 'Song als geprueft markieren';
      }
      verifyBtn.disabled = false;
      verifyBtn.classList.remove('opacity-60');
    }
  }

  updatePlaylistPlayIcon() {
    const icon = this.container.querySelector('[data-role="play-icon"]');
    if (icon) {
      icon.textContent = this.isPlaylistPaused ? 'play_arrow' : 'pause';
    }
  }

  startPlaylistTimer(song, autoplay) {
    if (this.playlistTimer) {
      this.playlistTimer.stop();
      this.playlistTimer = null;
    }

    const fallbackDuration = CONFIG?.YOUTUBE?.DEFAULT_DURATION || 30;
    const duration = song.duration ? parseInt(song.duration, 10) : fallbackDuration;

    this.playlistTimer = new CountdownTimer(duration, {
      onComplete: () => {
        this.playlistTimer = null;
        this.playlistNavigate(1, true);
      }
    });

    if (autoplay) {
      this.playlistTimer.start();
    }
  }

  playlistNavigate(step, autoAdvance) {
    const songs = this.getPlaylistSongs();
    if (songs.length === 0) return;
    const currentIndex = State.get('playlistTestIndex') || 0;
    let nextIndex = currentIndex + step;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= songs.length) nextIndex = songs.length - 1;
    if (nextIndex === currentIndex && autoAdvance) {
      this.isPlaylistPaused = true;
      this.updatePlaylistPlayIcon();
      return;
    }
    this.loadPlaylistSong(nextIndex, true);
  }

  async togglePlaylistPlayback() {
    if (!this.currentSong) return;
    if (this.isPlaylistPaused) {
      this.isPlaylistPaused = false;
      await YouTubePlayer.play();
      if (this.playlistTimer) {
        this.playlistTimer.resume();
      } else {
        this.startPlaylistTimer(this.currentSong, true);
      }
    } else {
      this.isPlaylistPaused = true;
      await YouTubePlayer.pause();
      if (this.playlistTimer) {
        this.playlistTimer.pause();
      }
    }
    this.updatePlaylistPlayIcon();
  }

  toggleVerifyCurrentSong() {
    if (!this.currentSong) return;
    const nextValue = !this.currentSong.verified;
    const result = Database.updateSong(this.currentSong.id, { verified: nextValue });
    if (result.success) {
      this.currentSong = result.song;
      this.updatePlaylistInfo(result.song);
      App.showNotification(nextValue ? 'Song als geprueft markiert' : 'Pruefung rueckgaengig', 'success');
    } else {
      App.showNotification('Song konnte nicht geprueft werden', 'error');
    }
  }

  editCurrentSong() {
    if (!this.currentSong) return;
    App.showFormModal({
      title: 'Song bearbeiten',
      fields: this.getPlaylistFormFields(),
      initialValues: {
        title: this.currentSong.title || '',
        artist: this.currentSong.artist || '',
        year: this.currentSong.year || '',
        genre: this.currentSong.genre || '',
        album: this.currentSong.album || '',
        youtubeId: this.currentSong.youtubeId || '',
        startTime: this.currentSong.startTime || 0,
        duration: this.currentSong.duration || '',
        difficulty: this.currentSong.difficulty || 'medium',
        tags: this.currentSong.tags || [],
        verified: this.currentSong.verified ? 'true' : 'false'
      },
      submitText: 'Speichern',
      onSubmit: (formData) => {
        const updates = this.normalizePlaylistFormData(formData);
        const result = Database.updateSong(this.currentSong.id, updates);
        if (!result.success) {
          return { errors: result.errors };
        }
        this.currentSong = result.song;
        this.updatePlaylistInfo(result.song);
        this.loadPlaylistSong(State.get('playlistTestIndex') || 0, false);
        App.showNotification('Song aktualisiert!', 'success');
        return result;
      }
    });
  }

  deleteCurrentSong() {
    if (!this.currentSong) return;
    const currentIndex = State.get('playlistTestIndex') || 0;
    App.confirm(`Song "${this.currentSong.title}" wirklich loeschen?`, () => {
      const deleted = Database.deleteSong(this.currentSong.id);
      if (!deleted) {
        App.showNotification('Song konnte nicht geloescht werden', 'error');
        return;
      }

      const songs = this.getPlaylistSongs().filter(song => song.id !== this.currentSong.id);
      State.set('playlistTest', {
        ...this.playlistTestState,
        songs
      });
      this.playlistTestState = State.get('playlistTest');

      if (songs.length === 0) {
        this.cleanup();
        App.showNotification('Song geloescht', 'success');
        App.navigate('database');
        return;
      }

      const nextIndex = Math.min(currentIndex, songs.length - 1);
      State.set('playlistTestIndex', nextIndex);
      App.showNotification('Song geloescht', 'success');
      this.loadPlaylistSong(nextIndex, true);
    });
  }

  getPlaylistFormFields() {
    const genres = Database.getAllGenres();
    const tags = this.getAllPlaylistTags();

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
      { name: 'verified', label: 'Geprueft', type: 'select', options: [
        { value: 'true', label: 'Ja' },
        { value: 'false', label: 'Nein' }
      ] },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: '80s, classic', datalistOptions: tags }
    ];
  }

  getAllPlaylistTags() {
    const songs = Storage.getSongs() || [];
    const tagSet = new Set();
    songs.forEach(song => {
      if (Array.isArray(song.tags)) {
        song.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }

  normalizePlaylistFormData(formData) {
    const fallbackDuration = CONFIG?.YOUTUBE?.DEFAULT_DURATION || 30;
    const startTimeValue = formData.startTime ? parseInt(formData.startTime, 10) : 0;
    const durationValue = formData.duration ? parseInt(formData.duration, 10) : fallbackDuration;

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
      verified: formData.verified === 'true',
      tags: Array.isArray(formData.tags) ? formData.tags : []
    };
  }

  cleanup() {
    if (this.playlistTimer) {
      this.playlistTimer.stop();
      this.playlistTimer = null;
    }
    YouTubePlayer.stop();
  }

  destroy() {
    this.cleanup();
  }
}

window.PlaylistTestScreen = PlaylistTestScreen;
