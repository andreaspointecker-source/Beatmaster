// BeatMaster - Scoreboard Screen (Placeholder)
class ScoreboardScreen {
  render(container) {
    container.innerHTML = `
      <div class="flex flex-col h-full min-h-screen w-full">
        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
          <div class="flex items-center p-4 justify-between">
            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" onclick="App.navigate('home')">
              <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Zwischenstand</h1>
            <div class="size-12"></div>
          </div>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span class="material-symbols-outlined text-primary mb-4 animate-pulse" style="font-size: 64px;">leaderboard</span>
          <h2 class="text-2xl font-bold text-white mb-2">Scoreboard</h2>
          <p class="text-white/60 mb-6">Wird in Phase 5 implementiert</p>
          <p class="text-sm text-white/40 mb-8">Hier wird der aktuelle Punktestand<br/>zwischen den Runden angezeigt</p>
          <button class="bg-primary text-background-dark px-6 py-3 rounded-full font-bold hover:brightness-110" onclick="App.navigate('home')">Zurück zum Hauptmenü</button>
        </main>
      </div>
    `;
  }
  destroy() {}
}
window.ScoreboardScreen = ScoreboardScreen;
