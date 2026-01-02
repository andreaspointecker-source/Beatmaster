// BeatMaster - Countdown Timer Module
// Timestamp-based countdown timer with callbacks

class CountdownTimer {
  /**
   * Creates a new CountdownTimer
   * @param {number} duration - Duration in seconds
   * @param {Object} callbacks - Event callbacks
   * @param {Function} callbacks.onTick - Called each second with remaining time
   * @param {Function} callbacks.onComplete - Called when countdown reaches 0
   */
  constructor(duration, callbacks = {}) {
    this.duration = duration;
    this.remaining = duration;
    this.callbacks = callbacks;
    this.intervalId = null;
    this.startTime = null;
    this.isPaused = false;
  }

  /**
   * Starts the countdown
   */
  start() {
    if (this.intervalId) {
      return; // Already running
    }

    this.startTime = Date.now();
    this.isPaused = false;

    // Immediate first tick
    this.tick();

    // Then tick every second
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  /**
   * Pauses the countdown
   */
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isPaused = true;
    }
  }

  /**
   * Resumes the countdown
   */
  resume() {
    if (!this.intervalId && this.remaining > 0 && this.isPaused) {
      this.startTime = Date.now() - ((this.duration - this.remaining) * 1000);
      this.intervalId = setInterval(() => this.tick(), 1000);
      this.isPaused = false;
    }
  }

  /**
   * Stops and resets the countdown
   */
  stop() {
    this.pause();
    this.remaining = this.duration;
    this.startTime = null;
  }

  /**
   * Handles each tick
   * @private
   */
  tick() {
    if (!this.startTime) return;

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.remaining = Math.max(0, this.duration - elapsed);

    if (this.remaining <= 0) {
      // Countdown complete
      this.pause();
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete();
      }
    } else {
      // Still counting
      if (this.callbacks.onTick) {
        this.callbacks.onTick(this.remaining);
      }
    }
  }

  /**
   * Gets the current remaining time
   * @returns {number} Remaining seconds
   */
  getRemaining() {
    return this.remaining;
  }

  /**
   * Checks if timer is running
   * @returns {boolean}
   */
  isRunning() {
    return this.intervalId !== null;
  }
}

// Export to global scope
window.CountdownTimer = CountdownTimer;
