// BeatMaster - Home Screen
// Startbildschirm mit Hauptmenü

class HomeScreen {
  constructor() {
    this.container = null;
  }

  /**
   * Rendert den Home Screen
   * @param {Element} container - Container-Element
   */
  render(container) {
    this.container = container;

    const html = `
      <div class="flex flex-col h-full min-h-screen w-full px-6 py-4">
        <!-- Hero Section: Logo & Title -->
        <div class="flex-1 flex flex-col items-center justify-center py-6 min-h-[35vh]">
          <div class="relative mb-8 group">
            <!-- Glow behind logo -->
            <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full transform scale-125"></div>
            <!-- Logo Circle -->
            <div class="relative flex items-center justify-center w-28 h-28 rounded-full bg-surface-dark border border-primary/20 shadow-2xl shadow-primary/10">
              <span class="material-symbols-outlined text-primary text-6xl drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]">music_note</span>
            </div>
          </div>
          <div class="text-center space-y-3">
            <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Beat<span class="text-primary">Master</span>
            </h1>
            <h3 class="text-white/70 text-lg font-semibold tracking-wide leading-tight">
              Dein ultimatives Musik-Quiz
            </h3>
          </div>
        </div>

        <!-- Button Stack -->
        <div class="flex flex-col gap-4 w-full pb-8">
          <!-- Primary Action -->
          <button class="relative w-full h-14 bg-primary hover:bg-primary/90 text-background-dark rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,217,255,0.3)] hover:shadow-[0_4px_30px_rgba(0,217,255,0.5)] transition-all transform active:scale-[0.98] group" data-action="new-game">
            <span class="material-symbols-outlined absolute left-6 text-[28px]">play_circle</span>
            <span class="font-bold text-base md:text-lg tracking-widest uppercase">Neues Spiel Starten</span>
          </button>

          <!-- Secondary Action -->
          <button class="relative w-full h-14 bg-surface-dark hover:bg-white/10 text-white border border-white/10 rounded-full flex items-center justify-center transition-all transform active:scale-[0.98] group" data-action="continue-game" style="display:none;">
            <span class="material-symbols-outlined absolute left-6 text-primary text-[24px]">resume</span>
            <span class="font-bold text-base tracking-widest uppercase">Spiel Fortsetzen</span>
          </button>

          <!-- Outline Actions Stack -->
          <div class="flex flex-col gap-3 mt-2">
            <button class="relative w-full h-12 bg-transparent hover:bg-white/5 text-white/90 border border-white/20 hover:border-white/40 rounded-full flex items-center justify-center transition-all active:scale-[0.98]" data-action="song-database">
              <span class="material-symbols-outlined absolute left-6 text-white/60 text-[20px]">library_music</span>
              <span class="font-bold text-sm tracking-widest uppercase">Song-Datenbank</span>
            </button>
            <button class="relative w-full h-12 bg-transparent hover:bg-white/5 text-white/90 border border-white/20 hover:border-white/40 rounded-full flex items-center justify-center transition-all active:scale-[0.98]" data-action="history">
              <span class="material-symbols-outlined absolute left-6 text-white/60 text-[20px]">history</span>
              <span class="font-bold text-sm tracking-widest uppercase">Spiel-Historie</span>
            </button>
          </div>

          <!-- Ghost Action -->
          <button class="mt-4 w-full h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors gap-2" data-action="settings">
            <span class="material-symbols-outlined text-lg">settings</span>
            <span class="text-xs font-bold tracking-[0.15em] uppercase">Einstellungen</span>
          </button>
        </div>

        <!-- Footer Info -->
        <div class="mt-auto pb-6 text-center">
          <div class="w-12 h-1 bg-white/10 mx-auto rounded-full mb-4"></div>
          <p class="text-white/30 text-[10px] md:text-xs font-medium tracking-widest uppercase font-mono">
            v${CONFIG.APP.VERSION}
          </p>
          <p class="text-white/30 text-[10px] md:text-xs font-medium tracking-widest uppercase font-mono mt-1">
            Produced by Candy
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.attachEventListeners();
    this.checkContinueGame();
  }

  /**
   * Prüft ob ein Spiel fortgesetzt werden kann
   */
  checkContinueGame() {
    const gameState = Storage.getGameState();
    const continueBtn = this.container.querySelector('[data-action="continue-game"]');

    if (gameState && gameState.status === 'playing') {
      continueBtn.style.display = 'flex';
    }
  }

  /**
   * Bindet Event Listeners
   */
  attachEventListeners() {
    // Neues Spiel
    const newGameBtn = this.container.querySelector('[data-action="new-game"]');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        App.navigate('game-setup');
      });
    }

    // Spiel fortsetzen
    const continueBtn = this.container.querySelector('[data-action="continue-game"]');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        App.navigate('gameplay');
      });
    }

    // Song-Datenbank
    const databaseBtn = this.container.querySelector('[data-action="song-database"]');
    if (databaseBtn) {
      databaseBtn.addEventListener('click', () => {
        App.navigate('database');
      });
    }

    // Historie
    const historyBtn = this.container.querySelector('[data-action="history"]');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        App.navigate('history');
      });
    }

    // Einstellungen
    const settingsBtn = this.container.querySelector('[data-action="settings"]');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        App.navigate('settings');
      });
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    // Cleanup wenn nötig
  }
}

// Globaler Export
window.HomeScreen = HomeScreen;
