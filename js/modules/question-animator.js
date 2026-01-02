// BeatMaster - Question Animator Module
// Card shuffle animation for question selection

class QuestionAnimator {
  /**
   * Creates a new QuestionAnimator instance
   * @param {HTMLElement} container - Container for animation
   * @param {Object} options - Animation options
   * @param {number} options.duration - Total animation duration (ms)
   * @param {number} options.cardCount - Number of cards to shuffle
   */
  constructor(container, options = {}) {
    this.container = container;
    this.duration = options.duration || 2000;
    this.cardCount = options.cardCount || 5;
    this.animationContainer = null;
    this.timeouts = []; // Track all timeouts for cleanup
    this.isAborted = false; // Track if animation was aborted
  }

  /**
   * Animates question selection and displays question
   * @param {string} questionText - The question to display
   * @returns {Promise<void>} Resolves when animation completes
   */
  async animate(questionText) {
    try {
      this.render();
      await this.shuffleCards();
      await this.selectCard();
      this.revealQuestion(questionText);
      await this.wait(2500); // Show question for 2.5 seconds
    } catch (error) {
      console.error('Question animation failed:', error);
      // Fallback: show question immediately
      this.container.innerHTML = `
        <div class="flex items-center justify-center min-h-[200px]">
          <div class="text-2xl font-bold text-white text-center px-6">${questionText}</div>
        </div>
      `;
    }
  }

  /**
   * Renders the card elements
   * @private
   */
  render() {
    const html = `
      <div class="question-animator-container flex items-center justify-center min-h-[400px] p-6">
        <div class="relative" style="width: 280px; height: 350px;">
          ${Array.from({ length: this.cardCount }, (_, i) => `
            <div class="question-card absolute" data-card="${i}" style="z-index: ${this.cardCount - i}; left: 50%; top: 50%; margin-left: -120px; margin-top: -150px; width: 240px; height: 300px;">
              <div class="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 backdrop-blur-sm shadow-xl flex items-center justify-center">
                <div class="question-card-content flex items-center justify-center h-full w-full">
                  <span class="text-8xl opacity-30">?</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.container.innerHTML = html;
    this.animationContainer = this.container.querySelector('.question-animator-container');

    // Set initial positions (stacked in center)
    const cards = this.container.querySelectorAll('.question-card');
    cards.forEach((card, index) => {
      card.style.transform = `translate(0, 0) rotate(0deg)`;
      card.style.opacity = '1';
    });
  }

  /**
   * Performs shuffle animation (synchronized with 4-second sound)
   * @private
   * @returns {Promise<void>}
   */
  shuffleCards() {
    return new Promise(resolve => {
      const cards = this.container.querySelectorAll('.question-card');

      // First: Spread cards out (1000ms)
      cards.forEach((card, index) => {
        const angle = (index / this.cardCount) * Math.PI * 2;
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotate = (Math.random() - 0.5) * 20;

        card.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
      });

      const timeout1 = setTimeout(() => {
        // Play card mix sound at the moment when actual shuffling starts
        if (window.SoundPlayer && window.SoundPlayer.isLoaded('cardMix')) {
          window.SoundPlayer.play('cardMix');
        }

        // Second: Shuffle around randomly (1800ms)
        cards.forEach((card, index) => {
          const randomX = (Math.random() - 0.5) * 200;
          const randomY = (Math.random() - 0.5) * 150;
          const randomRotate = (Math.random() - 0.5) * 40;

          card.style.transition = 'transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
          card.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
        });

        const timeout2 = setTimeout(() => {
          // Third: More shuffle movement (1200ms)
          cards.forEach((card, index) => {
            const randomX = (Math.random() - 0.5) * 180;
            const randomY = (Math.random() - 0.5) * 130;
            const randomRotate = (Math.random() - 0.5) * 35;

            card.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
          });

          const timeout3 = setTimeout(resolve, 1200);
          this.timeouts.push(timeout3);
        }, 1800);
        this.timeouts.push(timeout2);
      }, 1000);
      this.timeouts.push(timeout1);
    });
  }

  /**
   * Selects and highlights one card
   * @private
   * @returns {Promise<void>}
   */
  selectCard() {
    return new Promise(resolve => {
      const cards = this.container.querySelectorAll('.question-card');
      const selectedIndex = Math.floor(Math.random() * this.cardCount);

      cards.forEach((card, index) => {
        if (index === selectedIndex) {
          // Selected card: move to center and scale up
          card.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
          card.style.transform = 'translate(0, 0) rotate(0deg) scale(1.1)';
          card.style.opacity = '1';
          card.style.zIndex = '10';
        } else {
          // Other cards: fade out
          card.style.transition = 'opacity 0.5s ease-out';
          card.style.opacity = '0';
        }
      });

      const timeout = setTimeout(resolve, 500);
      this.timeouts.push(timeout);
    });
  }

  /**
   * Displays question on selected card
   * @private
   * @param {string} text
   */
  revealQuestion(text) {
    const selectedCard = Array.from(this.container.querySelectorAll('.question-card'))
      .find(card => card.style.opacity === '1');

    if (selectedCard) {
      const cardContent = selectedCard.querySelector('.question-card-content');
      cardContent.innerHTML = `
        <div class="px-6 py-4 text-center w-full">
          <div class="text-xl md:text-2xl font-bold text-white animate-fade-in leading-tight">
            ${this.escapeHtml(text)}
          </div>
        </div>
      `;
    }
  }

  /**
   * Helper to wait for a duration (abortable)
   * @private
   * @param {number} ms
   * @returns {Promise<void>}
   */
  wait(ms) {
    return new Promise(resolve => {
      const timeout = setTimeout(resolve, ms);
      this.timeouts.push(timeout);
    });
  }

  /**
   * Abort the animation and clean up all timeouts
   */
  abort() {
    this.isAborted = true;
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  /**
   * Escapes HTML to prevent XSS
   * @private
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleans up DOM elements
   */
  destroy() {
    if (this.animationContainer) {
      this.animationContainer.remove();
      this.animationContainer = null;
    }
  }
}

// Export to global scope
window.QuestionAnimator = QuestionAnimator;
