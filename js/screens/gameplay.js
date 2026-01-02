// BeatMaster - Gameplay Screen

class GameplayScreen {

  constructor() {

    this.container = null;

    this.gameState = null;

    this.currentSong = null;

    this.questionAnimator = null;

    this.vinylAnimator = null;

    this.currentTimer = null;

    this.playerScores = {}; // Track player scores

    this.playlistTestState = null;

    this.playlistTimer = null;

    this.isPlaylistPaused = false;

  }



  async render(container) {

    this.container = container;

    this.gameState = State.get('game');



    // Check if we have a valid game state

    if (!this.gameState || !this.gameState.playlist || this.gameState.playlist.length === 0) {

      this.renderNoGame();

      return;

    }



    // Reset YouTube player when starting new game (round 1)

    if (this.gameState.currentRound === 1) {

      console.log('New game detected - resetting YouTube player');

      YouTubePlayer.reset();

    }



    // Render game UI

    this.renderGameUI();



    // Start the round

    await this.playRound();

  }



  renderNoGame() {

    this.container.innerHTML = `

      <div class="flex flex-col h-full min-h-screen w-full">

        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">

          <div class="flex items-center p-4 justify-between">

            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" onclick="App.navigate('home')">

              <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>

            </button>

            <h1 class="text-lg font-bold">Gameplay</h1>

            <div class="size-12"></div>

          </div>

        </header>



        <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">

          <span class="material-symbols-outlined text-white/30 mb-4" style="font-size: 64px;">error</span>

          <h2 class="text-2xl font-bold text-white mb-2">Kein aktives Spiel</h2>

          <p class="text-white/60 mb-6">Starte ein neues Spiel im Hauptmenü</p>

          <button class="bg-primary text-background-dark px-6 py-3 rounded-full font-bold hover:brightness-110" onclick="App.navigate('home')">Zum Hauptmenü</button>

        </main>

      </div>

    `;

  }



  renderGameUI() {

    const roundInfo = `${this.gameState.currentRound}/${this.gameState.totalRounds}`;



    this.container.innerHTML = `

      <div class="flex flex-col h-full min-h-screen w-full">

        <!-- Header -->

        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">

          <div class="flex items-center p-4 justify-center">

            <div class="bg-surface-dark/80 backdrop-blur border border-white/10 px-5 py-2 rounded-full shadow-lg">

              <span class="text-xs font-bold tracking-widest uppercase text-primary">Runde ${roundInfo}</span>

            </div>

          </div>

        </header>



        <!-- Main Content Area -->

        <main id="gameplay-main" class="flex-1 flex flex-col items-center justify-center px-6 pb-24">

          <!-- Animations and content will be rendered here -->

        </main>



        <!-- Control Buttons (Fixed Bottom) -->

        <div class="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/95 backdrop-blur-md border-t border-white/5 p-4">

          <div class="max-w-md mx-auto flex items-center justify-center">

            <button

              class="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500/30 transition-all"

              data-action="stop"

            >

              <span class="material-symbols-outlined" style="font-size: 24px;">stop</span>

              <span class="font-semibold">Beenden</span>

            </button>

          </div>

        </div>



        <!-- YouTube Player (Hidden off-screen) -->

        <div id="youtube-player-container" class="absolute -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden opacity-0 pointer-events-none">

          <div id="youtube-player"></div>

        </div>

      </div>

    `;



    // Attach stop button

    this.container.querySelector('[data-action="stop"]')?.addEventListener('click', () => {

      this.stopGame();

    });

  }



  async playRound() {

    const mainContent = this.container.querySelector('#gameplay-main');

    if (!mainContent) return;



    try {

      // Get current song

      const songId = this.gameState.playlist[this.gameState.currentRound - 1];

      this.currentSong = Database.getSongById(songId);



      if (!this.currentSong) {

        App.showNotification('Song nicht gefunden!', 'error');

        this.endGame();

        return;

      }



      // Generate question

      const question = this.generateQuestion();

      this.gameState.currentQuestion = question;

      State.set('game', this.gameState);



      // 1. Question Animation

      await this.showQuestionAnimation(mainContent);



      // 2. Preparation Countdown

      await this.showPreparationCountdown(mainContent);



      // 3. Play Song with Vinyl Overlay

      await this.playSongWithVinyl(mainContent);



      // 4. End Countdown

      await this.showEndCountdown(mainContent);



      // 5. Navigate to Reveal

      this.navigateToReveal();



    } catch (error) {

      console.error('Round playback error:', error);

      App.showNotification('Fehler beim Abspielen der Runde', 'error');

      this.endGame();

    }

  }



  async showQuestionAnimation(container) {

    // Animate question selection

    this.questionAnimator = new QuestionAnimator(container);

    await this.questionAnimator.animate(this.gameState.currentQuestion.text);



    // Clean up

    if (this.questionAnimator) {

      this.questionAnimator.destroy();

      this.questionAnimator = null;

    }

  }



  async showPreparationCountdown(container) {

    container.innerHTML = `

      <div class="countdown-container flex flex-col items-center justify-center min-h-[400px]">

        <div id="countdown-number" class="text-9xl font-black text-primary mb-6"></div>

        <div class="text-xl text-white/70 uppercase tracking-wider">Macht euch bereit!</div>

      </div>

    `;



    return new Promise(resolve => {

      const display = container.querySelector('#countdown-number');



      this.currentTimer = new CountdownTimer(5, {

        onTick: (remaining) => {

          display.textContent = remaining;

          display.classList.add('animate-pulse');

          setTimeout(() => display.classList.remove('animate-pulse'), 300);



          // Play sound

          if (SoundPlayer.isLoaded('beep')) {

            SoundPlayer.play('beep');

          }

        },

        onComplete: () => {

          this.currentTimer = null;

          resolve();

        }

      });



      this.currentTimer.start();

    });

  }



  async playSongWithVinyl(container) {

    // Show question above vinyl

    const questionText = this.gameState.currentQuestion?.text || 'Hört genau zu...';

    container.innerHTML = `

      <div class="flex flex-col items-center justify-center min-h-[400px] px-6">

        <div class="mb-8 text-center">

          <div class="text-2xl md:text-3xl font-bold text-primary animate-pulse">

            ${this.escapeHtml(questionText)}

          </div>

        </div>

        <div id="vinyl-target" class="w-full"></div>

      </div>

    `;



    // Load and play YouTube video

    try {

      // Initialize player ONCE (will reuse if already exists)

      await YouTubePlayer.init('youtube-player');

      console.log('YouTube Player ready');



      // Load video and wait for it to be ready

      const startTime = this.currentSong.startTime || 0;

      await YouTubePlayer.loadVideo(this.currentSong.youtubeId, startTime);

      console.log('Video loaded:', this.currentSong.youtubeId);



      // Play video

      await YouTubePlayer.play();

      const started = await YouTubePlayer.waitForState([1], 6000);
      if (!started) {
        console.warn('Video start delayed, continuing playback flow');
      }

      // Show vinyl overlay AFTER video starts (or timeout)

      const vinylTarget = container.querySelector('#vinyl-target');

      if (vinylTarget) {

        this.vinylAnimator = new VinylAnimator(vinylTarget);

        this.vinylAnimator.show();

      }

    } catch (error) {

      console.error('YouTube player error:', error);

      App.showNotification('Video konnte nicht geladen werden', 'error');



      // Show vinyl anyway for visual consistency

      const vinylTarget = container.querySelector('#vinyl-target');

      if (vinylTarget) {

        this.vinylAnimator = new VinylAnimator(vinylTarget);

        this.vinylAnimator.show();

      }

    }



    // Wait for configured song duration using pausable timer

    const duration = this.gameState.songDuration || 30;



    return new Promise(resolve => {

      this.currentTimer = new CountdownTimer(duration, {

        onTick: (remaining) => {

          // Silent countdown (no display needed)

        },

        onComplete: () => {

          this.currentTimer = null;

          resolve();

        }

      });



      this.currentTimer.start();

    }).then(async () => {

      // Stop playback

      await YouTubePlayer.pause();



      if (this.vinylAnimator) {

        this.vinylAnimator.hide();

        this.vinylAnimator = null;

      }

    });

  }



  async showEndCountdown(container) {

    container.innerHTML = `

      <div class="countdown-container flex flex-col items-center justify-center min-h-[400px]">

        <div id="countdown-number" class="text-9xl font-black text-red-500 mb-6"></div>

        <div class="text-xl text-white/70 uppercase tracking-wider">Runde zu Ende!</div>

      </div>

    `;



    return new Promise(resolve => {

      const display = container.querySelector('#countdown-number');



      this.currentTimer = new CountdownTimer(5, {

        onTick: (remaining) => {

          display.textContent = remaining;

          display.classList.add('animate-pulse');

          setTimeout(() => display.classList.remove('animate-pulse'), 300);



          // Play sound (final beep on last second)

          if (remaining === 1 && SoundPlayer.isLoaded('finalBeep')) {

            SoundPlayer.play('finalBeep');

          } else if (SoundPlayer.isLoaded('beep')) {

            SoundPlayer.play('beep');

          }

        },

        onComplete: () => {

          this.currentTimer = null;

          resolve();

        }

      });



      this.currentTimer.start();

    });

  }



  generateQuestion() {

    const questionTypes = this.gameState.questionTypes || ['song_title', 'artist'];

    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];



    const questionTexts = {

      song_title: 'Wie heißt dieser Song?',

      artist: 'Wer singt diesen Song?',

      year: 'Aus welchem Jahr ist dieser Song?',

      genre: 'Welches Genre ist dieser Song?',

      decade: 'Aus welcher Dekade ist dieser Song?'

    };



    // Get correct answer for later verification

    const correctAnswers = {

      song_title: this.currentSong.title,

      artist: this.currentSong.artist,

      year: this.currentSong.year.toString(),

      genre: this.currentSong.genre,

      decade: `${Math.floor(this.currentSong.year / 10) * 10}s`

    };



    return {

      type: randomType,

      text: questionTexts[randomType],

      correctAnswer: correctAnswers[randomType]

    };

  }



  navigateToReveal() {

    // Show song info with player answer inputs

    const mainContent = this.container.querySelector('#gameplay-main');

    if (!mainContent) return;



    const question = this.gameState.currentQuestion;



    mainContent.innerHTML = `

      <div class="flex flex-col items-center justify-center min-h-[400px] px-6">

        <!-- Song Info -->

        <div class="mb-6 text-center">

          <h2 class="text-4xl font-black text-white mb-4">${this.escapeHtml(this.currentSong.title)}</h2>

          <p class="text-2xl text-primary mb-2">${this.escapeHtml(this.currentSong.artist)}</p>

          <p class="text-lg text-white/60">${this.currentSong.year} • ${this.escapeHtml(this.currentSong.genre)}</p>

        </div>



        <!-- Divider -->

        <div class="w-full max-w-md border-t border-white/10 my-6"></div>



        <!-- Player Answers Section -->

        <div class="w-full max-w-md mb-8">

          <h3 class="text-xl font-bold text-white mb-4 text-center">Wer hatte es richtig?</h3>

          <p class="text-sm text-white/60 mb-4 text-center">

            Frage: <span class="text-primary">${this.escapeHtml(question.text)}</span><br>

            Antwort: <span class="text-white font-semibold">${this.escapeHtml(question.correctAnswer)}</span>

          </p>



          <div id="player-answers" class="space-y-3">

            ${this.renderPlayerCheckboxes()}

          </div>

        </div>



        <!-- Next Round Button -->

        <button

          class="bg-primary text-background-dark px-8 py-4 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg"

          data-action="next-round"

        >

          ${this.gameState.currentRound >= this.gameState.totalRounds ? 'Spiel beenden' : 'Nächste Runde'}

        </button>

      </div>

    `;



    // Attach event listener

    mainContent.querySelector('[data-action="next-round"]')?.addEventListener('click', () => {

      this.collectPlayerAnswers();

      this.proceedToNextRound();

    });

  }



  renderPlayerCheckboxes() {

    const teams = this.gameState.teams || [];



    if (teams.length === 0) {

      return '<p class="text-white/60 text-center">Keine Teams vorhanden</p>';

    }



    return teams.map((team, index) => `

      <div class="flex items-center gap-3 bg-surface-dark/50 p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-all">

        <input

          type="checkbox"

          id="team-${index}"

          class="w-6 h-6 rounded border-2 border-primary/50 bg-background-dark checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"

        >

        <label for="team-${index}" class="flex-1 text-lg font-semibold text-white cursor-pointer">

          <span class="inline-block w-4 h-4 rounded-full mr-2" style="background-color: ${team.color}"></span>

          ${this.escapeHtml(team.name)}

        </label>

      </div>

    `).join('');

  }



  collectPlayerAnswers() {

    const teams = this.gameState.teams || [];



    teams.forEach((team, index) => {

      const checkbox = this.container.querySelector(`#team-${index}`);

      if (checkbox && checkbox.checked) {

        // Initialize team score if not exists

        if (!this.playerScores[team.name]) {

          this.playerScores[team.name] = 0;

        }

        this.playerScores[team.name]++;

      }

    });

  }



  async proceedToNextRound() {

    // Check if game is complete

    if (this.gameState.currentRound >= this.gameState.totalRounds) {

      this.showWinnerScreen();

      return;

    }



    // Move to next round

    this.gameState.currentRound++;

    this.gameState.playedSongs.push(this.currentSong.id);

    State.set('game', this.gameState);

    Storage.saveGameState(this.gameState);



    // Update round display in header

    const roundDisplay = this.container.querySelector('header .text-primary');

    if (roundDisplay) {

      const roundInfo = `${this.gameState.currentRound}/${this.gameState.totalRounds}`;

      roundDisplay.textContent = `Runde ${roundInfo}`;

    }



    // Play next round WITHOUT re-rendering entire UI

    const mainContent = this.container.querySelector('#gameplay-main');

    if (mainContent) {

      await this.playRound();

    }

  }



  escapeHtml(text) {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;

  }



  stopGame() {

    App.confirm('Spiel abbrechen und zum Startbildschirm zurückkehren?', () => {

      this.cleanup();

      // Clear game state to prevent resume

      State.set('game', null);

      Storage.clearGameState();

      App.navigate('home');

    });

  }



  showWinnerScreen() {

    // Determine winner(s)

    const teams = this.gameState.teams || [];

    if (teams.length === 0) {

      this.endGame();

      return;

    }



    // Get scores and find max

    const scores = teams.map(team => ({

      name: team.name,

      color: team.color,

      score: this.playerScores[team.name] || 0

    }));



    const maxScore = Math.max(...scores.map(s => s.score));

    const winners = scores.filter(s => s.score === maxScore);



    // Show winner animation

    const mainContent = this.container.querySelector('#gameplay-main');

    if (!mainContent) return;



    mainContent.innerHTML = `

      <style>

        @keyframes confetti-fall {

          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }

          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }

        }

        @keyframes trophy-bounce {

          0%, 100% { transform: translateY(0) scale(1); }

          50% { transform: translateY(-20px) scale(1.1); }

        }

        @keyframes trophy-glow {

          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6)); }

          50% { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.9)); }

        }

        .trophy-animated {

          animation: trophy-bounce 2s ease-in-out infinite, trophy-glow 2s ease-in-out infinite;

        }

        .confetti {

          position: fixed;

          width: 10px;

          height: 10px;

          top: -10px;

          animation: confetti-fall linear forwards;

          z-index: 100;

        }

      </style>



      <!-- Confetti Container -->

      <div id="confetti-container" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 100;"></div>



      <div class="flex flex-col items-center justify-center min-h-[400px] px-6">

        <!-- Trophy Image -->

        <div class="mb-8">

          <img

            src="assets/images/pokal.png"

            alt="Pokal"

            class="trophy-animated"

            style="width: 200px; height: auto; object-fit: contain;"

          />

        </div>



        <!-- Winner Text -->

        <div class="text-center mb-6">

          <h2 class="text-5xl font-black text-white mb-4 animate-pulse">

            ${winners.length === 1 ? 'Sieger!' : 'Unentschieden!'}

          </h2>

          <div class="space-y-2">

            ${winners.map(w => `

              <p class="text-3xl font-bold text-primary flex items-center justify-center gap-3">

                <span class="inline-block w-6 h-6 rounded-full" style="background-color: ${w.color}"></span>

                <span>${this.escapeHtml(w.name)} - ${w.score} ${w.score === 1 ? 'Punkt' : 'Punkte'}</span>

              </p>

            `).join('')}

          </div>

        </div>



        <!-- All Scores -->

        <div class="w-full max-w-md mb-8 bg-surface-dark/50 rounded-xl p-6 border border-white/10">

          <h3 class="text-xl font-bold text-white mb-4 text-center">Endergebnis</h3>

          <div class="space-y-2">

            ${scores.sort((a, b) => b.score - a.score).map((s, index) => `

              <div class="flex items-center justify-between py-2 px-4 rounded-lg ${index === 0 ? 'bg-primary/20 border border-primary/30' : 'bg-background-dark/50'}">

                <div class="flex items-center gap-2">

                  <span class="inline-block w-4 h-4 rounded-full" style="background-color: ${s.color}"></span>

                  <span class="text-lg font-semibold text-white">${this.escapeHtml(s.name)}</span>

                </div>

                <span class="text-lg font-bold ${index === 0 ? 'text-primary' : 'text-white/60'}">${s.score}</span>

              </div>

            `).join('')}

          </div>

        </div>



        <!-- Return Button -->

        <button

          class="bg-primary text-background-dark px-8 py-4 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg"

          data-action="back-home"

        >

          Zum Hauptmenü

        </button>

      </div>

    `;



    // Play victory sound

    if (SoundPlayer.isLoaded('sieg')) {

      SoundPlayer.play('sieg');

    }



    // Launch confetti

    this.launchConfetti();



    // Attach event listener

    mainContent.querySelector('[data-action="back-home"]')?.addEventListener('click', () => {

      this.cleanup();

      State.set('game', null);

      Storage.clearGameState();

      App.navigate('home');

    });

  }



  launchConfetti() {

    const container = this.container.querySelector('#confetti-container');

    if (!container) return;



    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8', '#f7dc6f', '#bb8fce'];

    const confettiCount = 100;



    for (let i = 0; i < confettiCount; i++) {

      setTimeout(() => {

        const confetti = document.createElement('div');

        confetti.className = 'confetti';

        confetti.style.left = Math.random() * 100 + '%';

        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';

        confetti.style.animationDelay = '0s';



        // Random shapes

        if (Math.random() > 0.5) {

          confetti.style.borderRadius = '50%';

        }



        container.appendChild(confetti);



        // Remove after animation

        setTimeout(() => {

          confetti.remove();

        }, 5000);

      }, i * 30);

    }

  }



  endGame() {

    this.cleanup();

    this.gameState.status = 'completed';

    State.set('game', this.gameState);

    Storage.saveGameState(this.gameState);



    App.showNotification('Spiel beendet!', 'success');

    App.navigate('results');

  }



  sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

  }



  cleanup() {

    // Stop any running timers

    if (this.currentTimer) {

      this.currentTimer.stop();

      this.currentTimer = null;

    }

    if (this.playlistTimer) {

      this.playlistTimer.stop();

      this.playlistTimer = null;

    }



    // Hide vinyl if showing

    if (this.vinylAnimator) {

      this.vinylAnimator.hide();

      this.vinylAnimator = null;

    }



    // Stop YouTube player

    YouTubePlayer.stop();



    // Clean up question animator

    if (this.questionAnimator) {

      this.questionAnimator.abort();

      this.questionAnimator.destroy();

      this.questionAnimator = null;

    }

  }



  destroy() {

    this.cleanup();

  }



  // ==================== PLAYLIST TEST MODE (Legacy) ====================

  // Keep existing playlist test functionality for database manager



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

                  Geprüft

                </span>

              </div>

            </div>

          </div>



          <div class="grid grid-cols-1 gap-3">

            <button class="w-full h-12 rounded-full bg-primary text-background-dark font-bold hover:brightness-110 transition-all" data-action="verify">

              Song als geprüft markieren

            </button>

            <button class="w-full h-12 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all" data-action="edit">

              Song bearbeiten

            </button>

            <button class="w-full h-12 rounded-full bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-all" data-action="delete">

              Song löschen

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

    const songs = Array.isArray(this.playlistTestState?.songs) ? this.playlistTestState.songs : [];

    return songs;

  }



  getSongAtIndex(index) {

    const songs = this.getPlaylistSongs();

    if (!songs[index]) return null;

    const songId = songs[index].id;

    if (songId) {

      return Database.getSongById(songId) || songs[index];

    }

    return songs[index];

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

      meta.textContent = `${year} • ${genre}`;

    }



    if (badge) {

      badge.style.display = song.verified ? 'inline-flex' : 'none';

    }



    const verifyBtn = this.container.querySelector('[data-action="verify"]');

    if (verifyBtn) {

      if (song.verified) {

        verifyBtn.textContent = 'Prüfung rückgängig';

        verifyBtn.disabled = false;

        verifyBtn.classList.remove('opacity-60');

      } else {

        verifyBtn.textContent = 'Song als geprüft markieren';

        verifyBtn.disabled = false;

        verifyBtn.classList.remove('opacity-60');

      }

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

      App.showNotification(nextValue ? 'Song als geprüft markiert' : 'Prüfung rückgängig', 'success');

    } else {

      App.showNotification('Song konnte nicht geprüft werden', 'error');

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

    App.confirm(`Song "${this.currentSong.title}" wirklich löschen?`, () => {

      const deleted = Database.deleteSong(this.currentSong.id);

      if (!deleted) {

        App.showNotification('Song konnte nicht gelöscht werden', 'error');

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

        App.showNotification('Song gelöscht', 'success');

        App.navigate('database');

        return;

      }



      const nextIndex = Math.min(currentIndex, songs.length - 1);

      State.set('playlistTestIndex', nextIndex);

      App.showNotification('Song gelöscht', 'success');

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

      { name: 'verified', label: 'Geprüft', type: 'select', options: [

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

}



window.GameplayScreen = GameplayScreen;

