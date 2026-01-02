// BeatMaster - History Screen (Placeholder)
class HistoryScreen {
  render(container) {
    container.innerHTML = `
      <div class="flex flex-col h-full min-h-screen w-full">
        <header class="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5">
          <div class="flex items-center p-4 justify-between">
            <button class="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors" onclick="App.navigate('home')">
              <span class="material-symbols-outlined text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <h1 class="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Spiel-Historie</h1>
            <div class="size-12"></div>
          </div>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <span class="material-symbols-outlined text-white/20 mb-4" style="font-size: 64px;">history</span>
          <h2 class="text-2xl font-bold text-white mb-2">Spiel-Historie</h2>
          <p class="text-white/60 mb-6">Wird in Phase 6 implementiert</p>
          <button class="bg-primary text-background-dark px-6 py-3 rounded-full font-bold hover:brightness-110" onclick="App.navigate('home')">Zurück zum Hauptmenü</button>
        </main>
      </div>
    `;
  }
  destroy() {}
}
window.HistoryScreen = HistoryScreen;
