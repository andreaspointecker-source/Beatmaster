// BeatMaster - Game Setup Screen (Multi-Step Wizard)

class GameSetupScreen {
  constructor() {
    this.container = null;
    this.currentStep = 1; // Step 1-4
    this.totalSteps = 4;
    this.isQuickPlay = false; // Track if this is Quick Play mode

    // Load previous settings or use defaults
    this.loadPreviousSettings();
  }

  loadPreviousSettings() {
    const savedSettings = Storage.get('lastGameSettings');

    if (savedSettings) {
      // Restore previous settings
      this.mode = savedSettings.mode || 'classic';

      // Restore teams with NEW IDs (to avoid conflicts with previous games)
      this.teams = savedSettings.teams ? savedSettings.teams.map(team => ({
        id: Utils.generateUUID(), // Generate new ID
        name: team.name,
        color: team.color
      })) : [
        { id: Utils.generateUUID(), name: 'Team 1', color: '#FF6B6B' },
        { id: Utils.generateUUID(), name: 'Team 2', color: '#4ECDC4' }
      ];

      this.rounds = savedSettings.rounds || 10;
      this.questionTypes = savedSettings.questionTypes || ['song_title', 'artist'];
      this.songDuration = savedSettings.songDuration || CONFIG.GAME.DEFAULT_SONG_DURATION;
      this.onlyVerified = savedSettings.onlyVerified !== undefined ? savedSettings.onlyVerified : true;

      // Restore genre and decade filters
      const allGenres = this.getAvailableGenres();
      const allDecades = this.getAvailableDecades();

      if (savedSettings.enabledGenres) {
        this.genreFilter = allGenres.map(g => ({
          ...g,
          enabled: savedSettings.enabledGenres.includes(g.genre)
        }));
      } else {
        this.genreFilter = allGenres;
      }

      if (savedSettings.enabledDecades) {
        this.decadeFilter = allDecades.map(d => ({
          ...d,
          enabled: savedSettings.enabledDecades.includes(d.decade)
        }));
      } else {
        this.decadeFilter = allDecades;
      }
    } else {
      // Use defaults
      this.mode = 'classic';
      this.teams = [
        { id: Utils.generateUUID(), name: 'Team 1', color: '#FF6B6B' },
        { id: Utils.generateUUID(), name: 'Team 2', color: '#4ECDC4' }
      ];
      this.rounds = 10;
      this.questionTypes = ['song_title', 'artist'];
      this.genreFilter = this.getAvailableGenres();
      this.decadeFilter = this.getAvailableDecades();
      this.songDuration = CONFIG.GAME.DEFAULT_SONG_DURATION;
      this.onlyVerified = true;
    }

    this.showAllGenres = false; // Always start collapsed
  }

  /**
   * Configure default settings for Quick Play mode
   */
  configureQuickPlayDefaults() {
    // Quick Play settings: 5 rounds, 30s duration, all verified songs, all question types
    this.mode = 'quick-play';
    this.rounds = 5;
    this.songDuration = 30;
    this.onlyVerified = true;

    // Enable all question types
    this.questionTypes = Object.values(CONFIG.GAME.QUESTION_TYPES);

    // Enable all genres
    const allGenres = this.getAvailableGenres();
    this.genreFilter = allGenres.map(g => ({ ...g, enabled: true }));

    // Enable all decades
    const allDecades = this.getAvailableDecades();
    this.decadeFilter = allDecades.map(d => ({ ...d, enabled: true }));
  }

  /**
   * Get all unique genres from song database with song counts
   */
  getAvailableGenres() {
    const songs = Storage.getSongs() || [];

    // Count songs per genre
    const genreCounts = {};
    songs.forEach(song => {
      const genre = song.genre;
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // Convert to array and sort by count (descending), then alphabetically
    const genres = Object.keys(genreCounts)
      .map(genre => ({
        genre,
        count: genreCounts[genre],
        enabled: true
      }))
      .sort((a, b) => {
        // First sort by count (most songs first)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Then alphabetically
        return a.genre.localeCompare(b.genre);
      });

    return genres;
  }

  /**
   * Get all unique decades from song database with song counts
   */
  getAvailableDecades() {
    const songs = Storage.getSongs() || [];

    // Count songs per decade
    const decadeCounts = {};
    songs.forEach(song => {
      const decade = `${Math.floor(song.year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });

    // Convert to array and sort chronologically (newest first)
    const decades = Object.keys(decadeCounts)
      .map(decade => ({
        decade,
        count: decadeCounts[decade],
        enabled: true
      }))
      .sort((a, b) => {
        // Sort chronologically (newest first)
        return b.decade.localeCompare(a.decade);
      });

    return decades;
  }

  /**
   * Get all available question types from CONFIG
   */
  getAvailableQuestionTypes() {
    return Object.keys(CONFIG.GAME.QUESTION_TYPES).map(key => {
      const type = CONFIG.GAME.QUESTION_TYPES[key];
      const label = CONFIG.GAME.QUESTION_TYPE_LABELS[type];
      return {
        type,
        label: label.label,
        description: label.description
      };
    });
  }

  render(container, params = {}) {
    this.container = container;

    // Check if this is Quick Play mode (only configure once)
    if (params.quickPlay && !this.isQuickPlay) {
      this.isQuickPlay = true;
      this.totalSteps = 1; // Only team setup for Quick Play
      this.configureQuickPlayDefaults();
    }

    const title = this.isQuickPlay ? 'Quick Play' : 'Neues Spiel';

    const html = `
      <div class="flex flex-col h-full min-h-screen w-full">
        <!-- Header -->
        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
          <div class="flex items-center p-4 justify-between">
            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" data-action="back">
              <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <h1 class="text-lg font-bold">${title} (${this.currentStep}/${this.totalSteps})</h1>
            <div class="size-12"></div>
          </div>

          <!-- Progress Bar -->
          <div class="h-1 bg-surface-dark">
            <div class="h-full bg-primary transition-all duration-300" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto px-6 py-8">
          ${this.renderCurrentStep()}
        </main>

        <!-- Footer Navigation -->
        <footer class="sticky bottom-0 bg-background-dark/95 backdrop-blur-md border-t border-white/5 p-4">
          <div class="flex gap-3">
            ${this.currentStep > 1 ? `
              <button class="flex-1 bg-surface-dark text-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all" data-action="prev-step">
                ← Zurück
              </button>
            ` : ''}
            <button class="flex-1 bg-primary text-background-dark px-6 py-3 rounded-full font-bold hover:brightness-110 transition-all" data-action="next-step">
              ${this.currentStep === this.totalSteps ? 'Spiel starten' : 'Weiter →'}
            </button>
          </div>
        </footer>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  renderCurrentStep() {
    if (this.isQuickPlay) {
      // Quick Play mode: only show teams selection
      // We're at step 1, but we show the team selection UI
      return `
        <div class="max-w-2xl mx-auto">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-black text-white mb-2">Spieler / Teams</h2>
            <p class="text-white/60">Wähle die Spieler oder Teams für Quick Play</p>
            <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
              <span class="material-symbols-outlined text-primary text-[20px]">bolt</span>
              <span class="text-sm text-primary font-semibold">5 Runden • 30s pro Song • Alle Fragen</span>
            </div>
          </div>
          ${this.renderTeamsContent()}
        </div>
      `;
    } else {
      // Classic mode: show all 4 steps
      switch (this.currentStep) {
        case 1: return this.renderStep1_GameMode();
        case 2: return this.renderStep2_Teams();
        case 3: return this.renderStep3_RoundsAndQuestions();
        case 4: return this.renderStep4_GenresAndSettings();
        default: return '';
      }
    }
  }

  // ==================== STEP 1: Game Mode ====================
  renderStep1_GameMode() {
    return `
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-black text-white mb-2">Spielmodus wählen</h2>
          <p class="text-white/60">Wähle deinen bevorzugten Spielmodus</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <!-- Classic Mode -->
          <button
            class="p-6 rounded-xl border-2 ${this.mode === 'classic' ? 'bg-primary/10 border-primary' : 'bg-surface-dark border-white/10'} hover:bg-white/5 transition-all text-left"
            data-action="select-mode"
            data-mode="classic"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="text-2xl font-bold text-white mb-1">Classic Mode</div>
                <div class="text-sm text-white/60">Klassisches Musikquiz mit Punktevergabe</div>
              </div>
              ${this.mode === 'classic' ? '<span class="text-primary text-2xl">✓</span>' : ''}
            </div>
            <div class="text-xs text-white/50">
              • Fragen zu Titel, Interpret, Jahr, Genre<br>
              • Zeitlimit pro Runde<br>
              • Punkte für richtige Antworten
            </div>
          </button>

          <!-- Speed Mode (Placeholder) -->
          <button
            class="p-6 rounded-xl border-2 bg-surface-dark/50 border-white/5 opacity-50 cursor-not-allowed text-left"
            disabled
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="text-2xl font-bold text-white mb-1">Speed Mode</div>
                <div class="text-sm text-white/60">Schnelles Quiz gegen die Zeit</div>
              </div>
              <span class="text-xs bg-white/10 px-2 py-1 rounded">Bald verfügbar</span>
            </div>
            <div class="text-xs text-white/50">
              • Kurze Fragerunden<br>
              • Bonus für schnelle Antworten<br>
              • Zeitbonus sammeln
            </div>
          </button>

          <!-- Party Mode (Placeholder) -->
          <button
            class="p-6 rounded-xl border-2 bg-surface-dark/50 border-white/5 opacity-50 cursor-not-allowed text-left"
            disabled
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="text-2xl font-bold text-white mb-1">Party Mode</div>
                <div class="text-sm text-white/60">Spaßmodus für große Gruppen</div>
              </div>
              <span class="text-xs bg-white/10 px-2 py-1 rounded">Bald verfügbar</span>
            </div>
            <div class="text-xs text-white/50">
              • Mini-Games zwischen Runden<br>
              • Zufällige Challenges<br>
              • Power-Ups und Joker
            </div>
          </button>
        </div>
      </div>
    `;
  }

  // ==================== STEP 2: Teams ====================
  renderStep2_Teams() {
    return `
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-black text-white mb-2">Teams erstellen</h2>
          <p class="text-white/60">Füge Teams hinzu und passe sie an</p>
        </div>
        ${this.renderTeamsContent()}
      </div>
    `;
  }

  renderTeamsContent() {
    return `
      <!-- Teams List -->
      <div id="teams-list" class="space-y-3 mb-6">
        ${this.renderTeamsList()}
      </div>

      <!-- Add Team Button -->
      ${this.teams.length < CONFIG.GAME.MAX_TEAMS ? `
        <button class="w-full bg-surface-dark text-white px-6 py-4 rounded-xl font-bold hover:bg-white/10 transition-all border border-white/10" data-action="add-team">
          <span class="material-symbols-outlined align-middle mr-2">add</span>
          Team hinzufügen
        </button>
      ` : ''}
    `;
  }

  renderTeamsList() {
    return this.teams.map((team, index) => `
      <div class="bg-surface-dark p-4 rounded-xl border border-white/10">
        <div class="flex items-center gap-4">
          <!-- Team Number -->
          <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style="background-color: ${team.color}">
            ${index + 1}
          </div>

          <!-- Team Name Input -->
          <input
            type="text"
            value="${this.escapeHtml(team.name)}"
            placeholder="Team Name"
            class="flex-1 bg-surface-dark-input text-white px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none"
            data-action="team-name"
            data-team-id="${team.id}"
          />

          <!-- Color Picker -->
          <input
            type="color"
            value="${team.color}"
            class="w-12 h-12 rounded-lg cursor-pointer"
            data-action="team-color"
            data-team-id="${team.id}"
          />

          <!-- Remove Button -->
          ${this.teams.length > 2 ? `
            <button class="w-10 h-10 rounded-full hover:bg-red-500/10 text-white/60 hover:text-red-500 flex items-center justify-center transition-colors" data-action="remove-team" data-team-id="${team.id}">
              <span class="material-symbols-outlined">close</span>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // ==================== STEP 3: Rounds & Questions ====================
  renderStep3_RoundsAndQuestions() {
    return `
      <div class="max-w-2xl mx-auto">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-black text-white mb-2">Runden & Fragen</h2>
          <p class="text-white/60">Konfiguriere Rundenzahl und Fragetypen</p>
        </div>

        <!-- Rounds Selection -->
        <div class="mb-8">
          <label class="block text-lg font-semibold text-white mb-4">Anzahl Runden</label>
          <div class="flex items-center justify-center gap-4 bg-surface-dark p-6 rounded-xl">
            <button class="w-12 h-12 rounded-full bg-surface-dark border border-white/10 hover:bg-white/10 flex items-center justify-center" data-action="rounds-decrease">
              <span class="material-symbols-outlined">remove</span>
            </button>
            <div class="text-center">
              <div id="rounds-display" class="text-6xl font-black text-primary">${this.rounds}</div>
              <div class="text-xs text-white/50 uppercase tracking-wide mt-1">Runden</div>
            </div>
            <button class="w-12 h-12 rounded-full bg-surface-dark border border-white/10 hover:bg-white/10 flex items-center justify-center" data-action="rounds-increase">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <!-- Question Types -->
        <div>
          <label class="block text-lg font-semibold text-white mb-4">Fragetypen</label>
          <p class="text-sm text-white/60 mb-4">Wähle mindestens einen Fragetyp aus</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${this.renderQuestionTypes()}
          </div>
        </div>
      </div>
    `;
  }

  renderQuestionTypes() {
    const availableTypes = this.getAvailableQuestionTypes();
    return availableTypes.map(qt => {
      const isSelected = this.questionTypes.includes(qt.type);
      return `
        <button
          class="p-4 rounded-xl border-2 ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface-dark border-white/10'} hover:bg-white/5 transition-all text-left"
          data-action="toggle-question-type"
          data-type="${qt.type}"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-bold text-white mb-1">${qt.label}</div>
              <div class="text-xs text-white/60">${qt.description}</div>
            </div>
            ${isSelected ? '<span class="text-primary text-xl ml-2">✓</span>' : ''}
          </div>
        </button>
      `;
    }).join('');
  }

  // ==================== STEP 4: Genres & Settings ====================
  renderStep4_GenresAndSettings() {
    return `
      <div class="max-w-2xl mx-auto space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-black text-white mb-2">Filter & Einstellungen</h2>
          <p class="text-white/60">Wähle Genres, Dekaden und weitere Optionen</p>
        </div>

        <!-- Genres -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <label class="text-lg font-semibold text-white">Genres</label>
            <button
              class="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              data-action="toggle-all-genres"
            >
              <span>${this.showAllGenres ? 'Weniger anzeigen' : 'Alle anzeigen'}</span>
              <span class="material-symbols-outlined" style="font-size: 18px;">
                ${this.showAllGenres ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
          <div id="genres-grid" class="grid grid-cols-2 md:grid-cols-3 gap-2">
            ${this.renderGenres()}
          </div>
        </div>

        <!-- Decades -->
        <div>
          <label class="block text-lg font-semibold text-white mb-4">Dekaden</label>
          <div class="grid grid-cols-3 md:grid-cols-4 gap-2">
            ${this.renderDecades()}
          </div>
        </div>

        <!-- Verified Songs Only -->
        <div>
          <label class="block text-lg font-semibold text-white mb-4">Song-Auswahl</label>
          <button
            class="w-full px-4 py-4 rounded-xl border-2 ${this.onlyVerified ? 'bg-primary/10 border-primary' : 'bg-surface-dark border-white/10'} hover:bg-white/5 transition-all text-left"
            data-action="toggle-verified"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-bold text-white">${this.onlyVerified ? 'Nur geprüfte Songs' : 'Alle Songs (inkl. ungeprüfte)'}</div>
                <div class="text-xs text-white/60 mt-1">${this.onlyVerified ? 'Nur Songs mit korrekten YouTube-Links' : 'Alle Songs in der Datenbank'}</div>
              </div>
              ${this.onlyVerified ? '<span class="text-primary text-2xl ml-3">✓</span>' : ''}
            </div>
          </button>
        </div>

        <!-- Song Duration -->
        <div>
          <label class="block text-lg font-semibold text-white mb-4">Song-Dauer</label>
          <div class="bg-surface-dark p-6 rounded-xl">
            <div class="flex flex-col gap-4">
              <input
                type="range"
                min="${CONFIG.GAME.SONG_DURATION_MIN}"
                max="${CONFIG.GAME.SONG_DURATION_MAX}"
                value="${this.songDuration}"
                class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                data-action="song-duration"
                id="song-duration-slider"
              />
              <div class="flex justify-between text-sm text-white/50">
                <span>${CONFIG.GAME.SONG_DURATION_MIN}s</span>
                <span class="text-2xl font-bold text-primary" id="duration-display">${this.songDuration}s</span>
                <span>${CONFIG.GAME.SONG_DURATION_MAX}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderGenres() {
    // Filter genres based on showAllGenres flag
    let genresToShow = this.genreFilter;

    if (!this.showAllGenres) {
      // Show only top 6 genres by song count (already sorted in getAvailableGenres)
      genresToShow = this.genreFilter.slice(0, 6);
    }

    return genresToShow.map(g => {
      return `
        <button
          class="px-3 py-2 rounded-lg border ${g.enabled ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-surface-dark border-white/10 text-white/70'} hover:bg-white/5 transition-all text-sm font-semibold text-left flex items-center justify-between gap-2"
          data-action="toggle-genre"
          data-genre="${this.escapeHtml(g.genre)}"
        >
          <span class="flex items-center gap-1">
            ${g.enabled ? '<span>✓</span>' : ''}
            <span>${this.escapeHtml(g.genre)}</span>
          </span>
          <span class="text-xs opacity-60">${g.count}</span>
        </button>
      `;
    }).join('');
  }

  renderDecades() {
    return this.decadeFilter.map(d => {
      return `
        <button
          class="px-3 py-2 rounded-lg border ${d.enabled ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-surface-dark border-white/10 text-white/70'} hover:bg-white/5 transition-all text-sm font-semibold text-left flex items-center justify-between gap-2"
          data-action="toggle-decade"
          data-decade="${d.decade}"
        >
          <span class="flex items-center gap-1">
            ${d.enabled ? '<span>✓</span>' : ''}
            <span>${d.decade}</span>
          </span>
          <span class="text-xs opacity-60">${d.count}</span>
        </button>
      `;
    }).join('');
  }

  // ==================== Event Listeners ====================
  attachEventListeners() {
    // Back button
    this.container.querySelector('[data-action="back"]')?.addEventListener('click', () => {
      if (this.currentStep === 1) {
        App.navigate('home');
      } else {
        this.previousStep();
      }
    });

    // Navigation
    this.container.querySelector('[data-action="prev-step"]')?.addEventListener('click', () => {
      this.previousStep();
    });

    this.container.querySelector('[data-action="next-step"]')?.addEventListener('click', () => {
      this.nextStep();
    });

    // Step-specific listeners
    this.attachStepListeners();
  }

  attachStepListeners() {
    if (this.isQuickPlay) {
      // Quick Play mode: always attach team listeners
      this.attachStep2Listeners();
    } else {
      // Classic mode: attach listeners based on current step
      switch (this.currentStep) {
        case 1: this.attachStep1Listeners(); break;
        case 2: this.attachStep2Listeners(); break;
        case 3: this.attachStep3Listeners(); break;
        case 4: this.attachStep4Listeners(); break;
      }
    }
  }

  attachStep1Listeners() {
    this.container.querySelectorAll('[data-action="select-mode"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.mode = e.currentTarget.dataset.mode;
        this.updateUI();
      });
    });
  }

  attachStep2Listeners() {
    // Team name
    this.container.querySelectorAll('[data-action="team-name"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const teamId = e.target.dataset.teamId;
        const team = this.teams.find(t => t.id === teamId);
        if (team) team.name = e.target.value;
      });
    });

    // Team color
    this.container.querySelectorAll('[data-action="team-color"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const teamId = e.target.dataset.teamId;
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
          team.color = e.target.value;
          this.updateUI();
        }
      });
    });

    // Add team
    this.container.querySelector('[data-action="add-team"]')?.addEventListener('click', () => {
      if (this.teams.length < CONFIG.GAME.MAX_TEAMS) {
        const colors = CONFIG.TEAM_COLORS;
        const usedColors = this.teams.map(t => t.color);
        const availableColor = colors.find(c => !usedColors.includes(c)) || colors[this.teams.length % colors.length];

        this.teams.push({
          id: Utils.generateUUID(),
          name: `Team ${this.teams.length + 1}`,
          color: availableColor
        });
        this.updateUI();
      }
    });

    // Remove team
    this.container.querySelectorAll('[data-action="remove-team"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const teamId = e.currentTarget.dataset.teamId;
        this.teams = this.teams.filter(t => t.id !== teamId);
        this.updateUI();
      });
    });
  }

  attachStep3Listeners() {
    // Rounds
    this.container.querySelector('[data-action="rounds-decrease"]')?.addEventListener('click', () => {
      if (this.rounds > CONFIG.GAME.MIN_ROUNDS) {
        this.rounds--;
        this.updateRoundsDisplay();
      }
    });

    this.container.querySelector('[data-action="rounds-increase"]')?.addEventListener('click', () => {
      if (this.rounds < CONFIG.GAME.MAX_ROUNDS) {
        this.rounds++;
        this.updateRoundsDisplay();
      }
    });

    // Question types
    this.container.querySelectorAll('[data-action="toggle-question-type"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.toggleQuestionType(type);
      });
    });
  }

  attachStep4Listeners() {
    // Toggle all genres button
    this.container.querySelector('[data-action="toggle-all-genres"]')?.addEventListener('click', () => {
      this.showAllGenres = !this.showAllGenres;
      this.updateGenresOnly();
    });

    // Genres
    this.container.querySelectorAll('[data-action="toggle-genre"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const genre = e.currentTarget.dataset.genre;
        this.toggleGenre(genre);
      });
    });

    // Decades
    this.container.querySelectorAll('[data-action="toggle-decade"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const decade = e.currentTarget.dataset.decade;
        this.toggleDecade(decade);
      });
    });

    // Verified toggle
    this.container.querySelector('[data-action="toggle-verified"]')?.addEventListener('click', () => {
      this.onlyVerified = !this.onlyVerified;
      this.updateUI();
    });

    // Song duration
    this.container.querySelector('[data-action="song-duration"]')?.addEventListener('input', (e) => {
      this.songDuration = parseInt(e.target.value, 10);
      this.updateDurationDisplay();
    });
  }

  // ==================== Navigation ====================
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validate current step
      if (!this.validateCurrentStep()) {
        return;
      }

      this.currentStep++;
      this.updateUI();
    } else {
      // Start game
      this.startGame();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateUI();
    }
  }

  validateCurrentStep() {
    if (this.isQuickPlay) {
      // Quick Play mode: only validate teams (step 1)
      const emptyNames = this.teams.filter(t => !t.name.trim());
      if (emptyNames.length > 0) {
        App.showNotification('Alle Teams brauchen einen Namen!', 'error');
        return false;
      }
      return true;
    }

    // Classic mode validation
    switch (this.currentStep) {
      case 2:
        // Check teams have names
        const emptyNames = this.teams.filter(t => !t.name.trim());
        if (emptyNames.length > 0) {
          App.showNotification('Alle Teams brauchen einen Namen!', 'error');
          return false;
        }
        return true;

      case 3:
        // Check at least one question type selected
        if (this.questionTypes.length === 0) {
          App.showNotification('Mindestens ein Fragetyp muss ausgewählt sein!', 'error');
          return false;
        }
        return true;

      case 4:
        // Check at least one genre and decade selected
        const enabledGenres = this.genreFilter.filter(g => g.enabled);
        const enabledDecades = this.decadeFilter.filter(d => d.enabled);

        if (enabledGenres.length === 0) {
          App.showNotification('Mindestens ein Genre muss ausgewählt sein!', 'error');
          return false;
        }

        if (enabledDecades.length === 0) {
          App.showNotification('Mindestens eine Dekade muss ausgewählt sein!', 'error');
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // ==================== Toggle Methods ====================
  toggleQuestionType(type) {
    const index = this.questionTypes.indexOf(type);
    if (index > -1) {
      if (this.questionTypes.length === 1) {
        App.showNotification('Mindestens ein Fragetyp muss ausgewählt sein', 'error');
        return;
      }
      this.questionTypes.splice(index, 1);
    } else {
      this.questionTypes.push(type);
    }
    this.updateUI();
  }

  toggleGenre(genre) {
    const g = this.genreFilter.find(item => item.genre === genre);
    if (!g) return;

    if (g.enabled) {
      const enabledCount = this.genreFilter.filter(item => item.enabled).length;
      if (enabledCount === 1) {
        App.showNotification('Mindestens ein Genre muss ausgewählt sein', 'error');
        return;
      }
    }

    g.enabled = !g.enabled;
    this.updateUI();
  }

  toggleDecade(decade) {
    const d = this.decadeFilter.find(item => item.decade === decade);
    if (!d) return;

    if (d.enabled) {
      const enabledCount = this.decadeFilter.filter(item => item.enabled).length;
      if (enabledCount === 1) {
        App.showNotification('Mindestens eine Dekade muss ausgewählt sein', 'error');
        return;
      }
    }

    d.enabled = !d.enabled;
    this.updateUI();
  }

  // ==================== UI Updates ====================
  updateRoundsDisplay() {
    const display = this.container.querySelector('#rounds-display');
    if (display) {
      display.textContent = this.rounds;
    }
  }

  updateDurationDisplay() {
    const display = this.container.querySelector('#duration-display');
    if (display) {
      display.textContent = `${this.songDuration}s`;
    }
  }

  updateGenresOnly() {
    // Update only the genres grid and toggle button without re-rendering entire UI
    const genresGrid = this.container.querySelector('#genres-grid');
    const toggleButton = this.container.querySelector('[data-action="toggle-all-genres"]');

    if (genresGrid) {
      genresGrid.innerHTML = this.renderGenres();

      // Re-attach genre toggle listeners
      genresGrid.querySelectorAll('[data-action="toggle-genre"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const genre = e.currentTarget.dataset.genre;
          this.toggleGenre(genre);
        });
      });
    }

    if (toggleButton) {
      const buttonText = toggleButton.querySelector('span:first-child');
      const buttonIcon = toggleButton.querySelector('.material-symbols-outlined');

      if (buttonText) {
        buttonText.textContent = this.showAllGenres ? 'Weniger anzeigen' : 'Alle anzeigen';
      }
      if (buttonIcon) {
        buttonIcon.textContent = this.showAllGenres ? 'expand_less' : 'expand_more';
      }
    }
  }

  updateUI() {
    // Re-render current step without losing scroll position
    const scrollPos = this.container.querySelector('main')?.scrollTop || 0;
    // Preserve Quick Play mode when re-rendering
    const params = this.isQuickPlay ? { quickPlay: true } : {};
    this.render(this.container, params);
    if (this.container.querySelector('main')) {
      this.container.querySelector('main').scrollTop = scrollPos;
    }
  }

  // ==================== Start Game ====================
  startGame() {
    // Validate
    const songs = Storage.getSongs();
    if (!songs || songs.length === 0) {
      App.showNotification('Keine Songs vorhanden! Füge zuerst Songs hinzu.', 'error');
      return;
    }

    // Filter songs
    const filteredSongs = this.filterSongs(songs);

    if (filteredSongs.length === 0) {
      App.showNotification('Keine Songs entsprechen den gewählten Filtern!', 'error');
      return;
    }

    if (filteredSongs.length < this.rounds) {
      App.showNotification(
        `Nicht genug Songs! ${filteredSongs.length} verfügbar, ${this.rounds} benötigt.`,
        'error'
      );
      return;
    }

    // Create game state
    const gameState = {
      gameId: Utils.generateUUID(),
      mode: this.mode,
      status: 'playing',
      currentRound: 1,
      totalRounds: this.rounds,
      currentTeamIndex: 0,
      teams: this.teams.map(team => ({
        ...team,
        score: 0,
        roundScores: [],
        correctAnswers: 0,
        wrongAnswers: 0,
        streak: 0
      })),
      playedSongs: [],
      playlist: this.generatePlaylist(filteredSongs),
      settings: CONFIG.GAME.DEFAULT_SETTINGS,
      questionTypes: [...this.questionTypes],
      genreFilter: this.genreFilter.filter(g => g.enabled).map(g => g.genre),
      decadeFilter: this.decadeFilter.filter(d => d.enabled).map(d => d.decade),
      songDuration: this.songDuration,
      currentQuestion: null
    };

    Storage.saveGameState(gameState);
    State.set('game', gameState);

    // Save current settings for next game
    this.saveCurrentSettings();

    App.showNotification('Spiel startet!', 'success');

    setTimeout(() => {
      App.navigate('gameplay');
    }, 500);
  }

  saveCurrentSettings() {
    const settings = {
      mode: this.mode,
      teams: this.teams.map(team => ({
        id: team.id,
        name: team.name,
        color: team.color
      })),
      rounds: this.rounds,
      questionTypes: [...this.questionTypes],
      songDuration: this.songDuration,
      onlyVerified: this.onlyVerified,
      enabledGenres: this.genreFilter.filter(g => g.enabled).map(g => g.genre),
      enabledDecades: this.decadeFilter.filter(d => d.enabled).map(d => d.decade)
    };

    Storage.set('lastGameSettings', settings);
  }

  filterSongs(songs) {
    const enabledGenres = this.genreFilter.filter(g => g.enabled).map(g => g.genre);
    const enabledDecades = this.decadeFilter.filter(d => d.enabled).map(d => d.decade);

    return songs.filter(song => {
      // Verified check
      if (this.onlyVerified && song.verified !== true) {
        return false;
      }

      // Genre check
      if (!enabledGenres.includes(song.genre)) {
        return false;
      }

      // Decade check
      const songDecade = `${Math.floor(song.year / 10) * 10}s`;
      if (!enabledDecades.includes(songDecade)) {
        return false;
      }

      return true;
    });
  }

  generatePlaylist(filteredSongs) {
    const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, this.rounds).map(s => s.id);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    // Cleanup
  }
}

window.GameSetupScreen = GameSetupScreen;
