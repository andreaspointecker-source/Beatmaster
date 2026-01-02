// BeatMaster - Sound Player Module
// Simple sound effect playback utility

const SoundPlayer = {
  sounds: {},
  volume: 1.0,
  muted: false,
  unlocked: false,

  /**
   * Preloads a sound
   * @param {string} name - Sound identifier
   * @param {string} url - Audio file URL
   */
  load(name, url) {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds[name] = audio;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  },

  /**
   * Plays a sound
   * @param {string} name - Sound identifier
   * @param {Object} options - Playback options
   * @param {number} options.volume - Override volume (0.0 - 1.0)
   */
  play(name, options = {}) {
    if (this.muted) return;

    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    try {
      // Clone the audio for overlapping playback
      const clone = sound.cloneNode();
      clone.volume = options.volume !== undefined ? options.volume : this.volume;
      clone.play().catch(err => {
        console.warn('Sound playback failed:', err);
      });
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  },

  /**
   * Unlocks audio playback on mobile browsers after user gesture
   */
  unlock() {
    if (this.unlocked) return;
    const sound = Object.values(this.sounds)[0];
    if (!sound) return;

    const previousVolume = sound.volume;
    sound.volume = 0;
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = previousVolume;
      this.unlocked = true;
    }).catch(() => {
      sound.volume = previousVolume;
    });
  },

  /**
   * Installs a one-time gesture listener to unlock audio
   */
  enableUnlockOnFirstGesture() {
    if (this.unlocked || typeof window === 'undefined') return;

    const handler = () => {
      this.unlock();
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('keydown', handler);
    };

    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
  },

  /**
   * Sets global volume (0.0 - 1.0)
   * @param {number} volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  },

  /**
   * Toggles mute
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  /**
   * Sets mute state
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.muted = muted;
  },

  /**
   * Checks if a sound is loaded
   * @param {string} name
   * @returns {boolean}
   */
  isLoaded(name) {
    return !!this.sounds[name];
  },

  /**
   * Unloads a sound
   * @param {string} name
   */
  unload(name) {
    if (this.sounds[name]) {
      this.sounds[name].pause();
      delete this.sounds[name];
    }
  },

  /**
   * Unloads all sounds
   */
  unloadAll() {
    Object.keys(this.sounds).forEach(name => this.unload(name));
  }
};

// Preload default sounds (when files are available)
// For now, we'll use placeholder URLs that can be replaced later
// Users can add their own sounds in assets/sounds/
if (typeof window !== 'undefined') {
  // Note: These will fail to load until actual sound files are added
  // But the app will still work without sounds
  SoundPlayer.load('beep', '/assets/sounds/beep.mp3');
  SoundPlayer.load('finalBeep', '/assets/sounds/final-beep.mp3');
  SoundPlayer.load('sieg', '/assets/sounds/sieg.mp3');
  SoundPlayer.load('cardMix', '/assets/sounds/card-mix.mp3');
  SoundPlayer.enableUnlockOnFirstGesture();
}

// Export to global scope
window.SoundPlayer = SoundPlayer;
