// BeatMaster - Vinyl Animator Module
// Rotating vinyl record overlay for YouTube player

class VinylAnimator {
  /**
   * Creates a new VinylAnimator instance
   * @param {HTMLElement} container - Container for vinyl overlay
   * @param {Object} options - Animation options
   * @param {number} options.rpm - Rotation speed (default: 33.3)
   * @param {string} options.size - Vinyl size (default: '300px')
   */
  constructor(container, options = {}) {
    this.container = container;
    this.rpm = options.rpm || 33.3;
    this.size = options.size || '300px';
    this.isVisible = false;
    this.overlayElement = null;
  }

  /**
   * Shows vinyl overlay and starts rotation
   */
  show() {
    if (this.isVisible) return;

    this.render();
    this.startRotation();
    this.isVisible = true;
  }

  /**
   * Hides vinyl overlay and stops rotation
   */
  hide() {
    if (!this.isVisible) return;

    this.stopRotation();
    this.remove();
    this.isVisible = false;
  }

  /**
   * Renders vinyl overlay DOM
   * @private
   */
  render() {
    // Calculate rotation duration from RPM
    // 33.3 RPM = 60/33.3 = 1.8 seconds per rotation
    const rotationDuration = (60 / this.rpm).toFixed(2);

    const html = `
      <div class="vinyl-overlay relative w-full flex items-center justify-center bg-transparent py-8">
        <!-- Vinyl Record -->
        <div class="vinyl-record-container" style="width: ${this.size}; height: ${this.size};">
          <div class="vinyl-record vinyl-record--spinning" style="animation-duration: ${rotationDuration}s;">
            <!-- Vinyl disc with grooves -->
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <!-- Outer edge -->
              <circle cx="100" cy="100" r="98" fill="#1a1a1a" stroke="#000" stroke-width="2"/>

              <!-- Grooves (concentric circles) -->
              ${this.generateGrooves()}

              <!-- Label area (red center) -->
              <circle cx="100" cy="100" r="40" fill="#00d9ff" opacity="0.9"/>

              <!-- App Name on Label -->
              <text x="100" y="95" text-anchor="middle" font-size="14" font-weight="bold" fill="#000" font-family="Arial, sans-serif">
                BEAT
              </text>
              <text x="100" y="110" text-anchor="middle" font-size="14" font-weight="bold" fill="#000" font-family="Arial, sans-serif">
                MASTER
              </text>

              <!-- Center hole -->
              <circle cx="100" cy="100" r="8" fill="#000"/>

              <!-- Shine effect -->
              <circle cx="100" cy="100" r="98" fill="url(#shine)" opacity="0.15"/>

              <defs>
                <radialGradient id="shine">
                  <stop offset="0%" stop-color="#fff" stop-opacity="0.4"/>
                  <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    `;

    this.container.insertAdjacentHTML('beforeend', html);
    this.overlayElement = this.container.querySelector('.vinyl-overlay');
  }

  /**
   * Generates groove circles for vinyl effect
   * @private
   * @returns {string} SVG circles
   */
  generateGrooves() {
    let grooves = '';
    for (let r = 50; r < 95; r += 3) {
      grooves += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="#0a0a0a" stroke-width="1" opacity="0.3"/>`;
    }
    return grooves;
  }

  /**
   * Starts CSS rotation animation
   * @private
   */
  startRotation() {
    const record = this.container.querySelector('.vinyl-record');
    if (record) {
      record.classList.add('vinyl-record--spinning');
    }
  }

  /**
   * Stops rotation animation
   * @private
   */
  stopRotation() {
    const record = this.container.querySelector('.vinyl-record');
    if (record) {
      record.classList.remove('vinyl-record--spinning');
    }
  }

  /**
   * Removes DOM elements
   * @private
   */
  remove() {
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  /**
   * Checks if vinyl is currently visible
   * @returns {boolean}
   */
  isShowing() {
    return this.isVisible;
  }
}

// Add CSS for vinyl animation (if not already in stylesheet)
if (!document.getElementById('vinyl-animator-styles')) {
  const style = document.createElement('style');
  style.id = 'vinyl-animator-styles';
  style.textContent = `
    .vinyl-record {
      width: 100%;
      height: 100%;
      will-change: transform;
    }

    .vinyl-record--spinning {
      animation: vinyl-rotate linear infinite;
    }

    @keyframes vinyl-rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

// Export to global scope
window.VinylAnimator = VinylAnimator;
