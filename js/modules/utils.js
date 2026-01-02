// BeatMaster - Hilfsfunktionen
// Sammlung von Utility-Funktionen für die gesamte App

const Utils = {
  // ========== ID Generierung ==========

  /**
   * Generiert eine UUID v4
   * @returns {string} UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // ========== String-Manipulation ==========

  /**
   * Normalisiert einen String (lowercase, trim, keine Sonderzeichen)
   * @param {string} str - Zu normalisierender String
   * @returns {string} Normalisierter String
   */
  normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');
  },

  /**
   * Entfernt Artikel (der, die, das, the, a, an) vom Stringanfang
   * @param {string} str - String
   * @returns {string} String ohne Artikel
   */
  removeArticles(str) {
    if (!str) return '';
    return str.replace(/^(der|die|das|the|a|an)\s+/i, '').trim();
  },

  /**
   * Fuzzy String Matching mit Levenshtein-Distanz
   * @param {string} str1 - Erster String
   * @param {string} str2 - Zweiter String
   * @param {number} threshold - Ähnlichkeitsschwelle (0-1, default: 0.8)
   * @returns {boolean} Ob Strings ähnlich genug sind
   */
  fuzzyMatch(str1, str2, threshold = 0.8) {
    if (!str1 || !str2) return false;

    // Normalisiere beide Strings
    const s1 = this.removeArticles(this.normalizeString(str1));
    const s2 = this.removeArticles(this.normalizeString(str2));

    // Exakte Übereinstimmung nach Normalisierung
    if (s1 === s2) return true;

    // Levenshtein-Distanz berechnen
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);

    if (maxLength === 0) return true;

    const similarity = 1 - (distance / maxLength);
    return similarity >= threshold;
  },

  /**
   * Berechnet die Levenshtein-Distanz zwischen zwei Strings
   * @param {string} str1 - Erster String
   * @param {string} str2 - Zweiter String
   * @returns {number} Levenshtein-Distanz
   */
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Initialisiere Matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Berechne Distanz
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Löschung
          matrix[i][j - 1] + 1,      // Einfügung
          matrix[i - 1][j - 1] + cost // Ersetzung
        );
      }
    }

    return matrix[len1][len2];
  },

  // ========== Array-Utilities ==========

  /**
   * Mischt ein Array (Fisher-Yates Shuffle)
   * @param {Array} array - Zu mischendes Array
   * @returns {Array} Gemischtes Array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Wählt zufällige Elemente aus einem Array
   * @param {Array} array - Array
   * @param {number} count - Anzahl zu wählender Elemente
   * @returns {Array} Zufällige Elemente
   */
  getRandomElements(array, count) {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  },

  /**
   * Gewichtete Zufallsauswahl
   * @param {Array} items - Array von Items
   * @param {Array} weights - Array von Gewichtungen
   * @returns {*} Ausgewähltes Item
   */
  weightedRandomSelect(items, weights) {
    if (!items || items.length === 0) return null;
    if (!weights || weights.length !== items.length) {
      // Fallback zu ungew. Zufallsauswahl
      return items[Math.floor(Math.random() * items.length)];
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  },

  // ========== Datum & Zeit ==========

  /**
   * Formatiert ein Datum
   * @param {Date|string} date - Datum
   * @param {string} format - Format (default: 'DD.MM.YYYY')
   * @returns {string} Formatiertes Datum
   */
  formatDate(date, format = 'DD.MM.YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  },

  /**
   * Formatiert eine Dauer in Sekunden zu MM:SS
   * @param {number} seconds - Sekunden
   * @returns {string} Formatierte Zeit (MM:SS)
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  },

  // ========== Validierung ==========

  /**
   * Validiert eine URL
   * @param {string} url - URL
   * @returns {boolean} Ob URL gültig ist
   */
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validiert ein Jahr
   * @param {number} year - Jahr
   * @returns {boolean} Ob Jahr gültig ist
   */
  isValidYear(year) {
    const y = parseInt(year);
    return !isNaN(y) && y >= 1900 && y <= new Date().getFullYear();
  },

  /**
   * Extrahiert YouTube Video ID aus URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID oder null
   */
  extractYouTubeId(url) {
    if (!url) return null;

    // Direkter ID Check (11 Zeichen)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    // YouTube URL Patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  },

  // ========== DOM-Utilities ==========

  /**
   * HTML escapen (XSS-Prävention)
   * @param {string} str - Zu escapender String
   * @returns {string} Escapeter String
   */
  escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Erstellt ein Element aus HTML-String
   * @param {string} html - HTML-String
   * @returns {Element} DOM-Element
   */
  createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },

  // ========== Farb-Utilities ==========

  /**
   * Holt Teamfarben basierend auf Anzahl
   * @param {number} count - Anzahl Teams
   * @returns {Array} Array von Farben
   */
  getTeamColors(count) {
    return CONFIG.TEAM_COLORS.slice(0, Math.min(count, CONFIG.TEAM_COLORS.length));
  },

  // ========== Debounce & Throttle ==========

  /**
   * Debounce-Funktion
   * @param {Function} func - Funktion
   * @param {number} wait - Wartezeit in ms
   * @returns {Function} Debounced Funktion
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle-Funktion
   * @param {Function} func - Funktion
   * @param {number} limit - Limit in ms
   * @returns {Function} Throttled Funktion
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // ========== iOS Detection ==========

  /**
   * Prüft ob iOS
   * @returns {boolean} Ob Gerät iOS ist
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  /**
   * Prüft ob Mobile
   * @returns {boolean} Ob Gerät mobil ist
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
};
