// BeatMaster - YouTube Player (Minimal IFrame API Wrapper)
const YouTubePlayer = {
  _player: null,
  _apiPromise: null,
  _initPromise: null,
  _containerId: null,
  _isReady: false,
  _forceReinit: false,

  _loadApi() {
    if (this._apiPromise) return this._apiPromise;

    this._apiPromise = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[data-youtube-api]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.dataset.youtubeApi = 'true';
        tag.onerror = () => reject(new Error('YouTube API load failed'));
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => resolve();
    });

    return this._apiPromise;
  },

  init(containerId, forceReinit = false) {
    if (!containerId) return Promise.reject(new Error('Missing containerId'));

    // If force reinit, destroy existing player
    if (forceReinit && this._player) {
      console.log('Force reinitializing YouTube player');
      try {
        this._player.destroy();
      } catch (e) {
        console.warn('Error destroying player during force reinit:', e);
      }
      this._player = null;
      this._isReady = false;
      this._initPromise = null;
    }

    // If player already exists and is ready for the same container, reuse it immediately
    if (this._player && this._containerId === containerId && this._isReady && !forceReinit) {
      console.log('Reusing existing YouTube player (already ready)');
      return Promise.resolve();
    }

    // If initialization is in progress for the same container, return that promise
    if (this._initPromise && this._containerId === containerId && !this._isReady && !forceReinit) {
      console.log('YouTube player initialization in progress, waiting...');
      return this._initPromise;
    }

    // Start new initialization
    console.log('Initializing YouTube player for:', containerId);
    this._containerId = containerId;
    this._isReady = false;

    this._initPromise = this._loadApi().then(() => {
      return new Promise((resolve, reject) => {
        // Destroy old player if exists
        if (this._player) {
          try {
            console.log('Destroying old player before creating new one');
            this._player.destroy();
          } catch (e) {
            console.warn('Error destroying old player:', e);
          }
          this._player = null;
          this._isReady = false;
        }

        // Create new player
        console.log('Creating new YouTube player');
        this._player = new YT.Player(containerId, {
          height: '100%',
          width: '100%',
          videoId: '',
          playerVars: CONFIG?.YOUTUBE?.PLAYER_VARS || { autoplay: 1, controls: 1, rel: 0 },
          events: {
            onReady: () => {
              console.log('YouTube player onReady event fired');
              this._isReady = true;
              resolve();
            },
            onError: (event) => {
              console.error('YouTube player onError event:', event.data);
              this._isReady = false;
              reject(new Error(`YouTube player error: ${event.data}`));
            }
          }
        });
      });
    });

    return this._initPromise;
  },

  // Reset player completely (call when starting new game)
  reset() {
    console.log('Resetting YouTube player');
    if (this._player) {
      try {
        this._player.destroy();
      } catch (e) {
        console.warn('Error destroying player during reset:', e);
      }
    }
    this._player = null;
    this._isReady = false;
    this._initPromise = null;
    this._containerId = null;
  },

  async loadVideo(videoId, startTime = 0) {
    if (!videoId) return Promise.reject(new Error('Missing videoId'));

    // Wait for player to be ready
    if (!this._isReady || !this._player || !this._player.loadVideoById) {
      await this._initPromise;
    }

    return new Promise((resolve, reject) => {
      try {
        this._player.loadVideoById({
          videoId,
          startSeconds: startTime
        });

        // Wait for video to be cued/loaded
        const checkLoaded = setInterval(() => {
          if (this._player && this._player.getPlayerState) {
            const state = this._player.getPlayerState();
            // -1 = unstarted, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
            if (state !== undefined && state >= -1) {
              clearInterval(checkLoaded);
              resolve();
            }
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          resolve(); // Resolve anyway to prevent hanging
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  },

  async play() {
    if (!this._isReady || !this._player) {
      await this._initPromise;
    }

    if (this._player && this._player.playVideo) {
      this._player.playVideo();
    }
  },

  async pause() {
    if (!this._isReady || !this._player) {
      return; // Don't wait if not ready, just skip
    }

    if (this._player && this._player.pauseVideo) {
      this._player.pauseVideo();
    }
  },

  async stop() {
    if (!this._isReady || !this._player) {
      return; // Don't wait if not ready, just skip
    }

    if (this._player && this._player.stopVideo) {
      this._player.stopVideo();
    }
  }
};

window.YouTubePlayer = YouTubePlayer;
