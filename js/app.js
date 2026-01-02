// BeatMaster - Main App
// SPA Router und App-Initialisierung

const App = {
  // Aktueller Screen
  currentScreen: null,

  // Container-Elemente
  elements: {
    mainContent: null,
    screenContainer: null,
    modalRoot: null,
    notificationRoot: null,
    loadingOverlay: null
  },

  // Registrierte Screens
  screens: {},

  /**
   * Initialisiert die App
   */
  async init() {
    console.log('🎵 BeatMaster wird initialisiert...');

    try {
      // Hole DOM-Elemente
      this.elements.mainContent = document.getElementById('main-content');
      this.elements.screenContainer = this.elements.mainContent.querySelector('.screen-container');
      this.elements.modalRoot = document.getElementById('modal-root');
      this.elements.notificationRoot = document.getElementById('notification-root');
      this.elements.loadingOverlay = document.getElementById('loading-overlay');

      // Lade initialen State aus Storage
      State.loadInitialState();
      await this.loadDefaultSongsIfEmpty();

      // Registriere Screens
      this.registerScreens();

      // Initialisiere Router
      this.initRouter();

      // Event Listeners
      this.setupEventListeners();

      // Navigiere zur Startseite oder gespeichertem State
      const initialRoute = this.getInitialRoute();
      this.navigate(initialRoute);

      console.log('✅ BeatMaster erfolgreich initialisiert!');
    } catch (error) {
      console.error('❌ Fehler bei App-Initialisierung:', error);
      this.showError('App konnte nicht gestartet werden. Bitte Seite neu laden.');
    }
  },

  /**
   * Registriert alle verfügbaren Screens
   */
  registerScreens() {
    // Screens werden von den jeweiligen Screen-Controllern registriert
    // Siehe z.B. js/screens/home.js
    this.screens = {
      'home': window.HomeScreen,
      'database': window.DatabaseManagerScreen,
      'game-setup': window.GameSetupScreen,
      'gameplay': window.GameplayScreen,
      'playlist-test': window.PlaylistTestScreen,
      'scoreboard': window.ScoreboardScreen,
      'results': window.ResultsScreen,
      'settings': window.SettingsScreen,
      'history': window.HistoryScreen
    };

    // Debug: Zeige welche Screens fehlen
    Object.keys(this.screens).forEach(key => {
      if (!this.screens[key]) {
        console.warn(`⚠️ Screen "${key}" nicht geladen!`);
      } else {
        console.log(`✅ Screen "${key}" registriert`);
      }
    });
  },

  /**
   * Initialisiert den Hash-basierten Router
   */
  initRouter() {
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });
  },

  /**
   * Behandelt Routenänderungen
   */
  handleRouteChange() {
    const route = window.location.hash.slice(1) || 'home';
    this.navigate(route, false); // false = kein pushState
  },

  /**
   * Navigiert zu einem Screen
   * @param {string} route - Route (z.B. 'home', 'game-setup')
   * @param {boolean} updateHash - Ob Hash aktualisiert werden soll
   * @param {Object} params - Route-Parameter
   */
  navigate(route, updateHash = true, params = {}) {
    // Normalisiere Route
    route = route.replace(/^#?\/?/, ''); // Entferne # und führende /
    if (!route) route = 'home';

    // Prüfe ob Screen existiert
    const ScreenController = this.screens[route];
    if (!ScreenController) {
      console.warn(`Screen "${route}" nicht gefunden, navigiere zu Home`);
      this.navigate('home');
      return;
    }

    // Aktualisiere Hash falls nötig
    if (updateHash) {
      window.location.hash = `#${route}`;
    }

    // Zeige Loading
    this.showLoading();

    try {
      // Cleanup aktueller Screen
      if (this.currentScreen && this.currentScreen.destroy) {
        this.currentScreen.destroy();
      }

      // Leere Container
      this.elements.screenContainer.innerHTML = '';

      // Initialisiere neuen Screen
      const screen = new ScreenController();
      screen.render(this.elements.screenContainer, params);

      // Speichere aktuellen Screen
      this.currentScreen = screen;

      // Update State
      State.set('currentScreen', route);

      console.log(`📄 Navigiert zu: ${route}`);
    } catch (error) {
      console.error(`Fehler beim Laden von Screen "${route}":`, error);
      this.showError(`Fehler beim Laden der Seite.`);
    } finally {
      // Verstecke Loading
      this.hideLoading();
    }
  },

  /**
   * Holt initiale Route
   * @returns {string} Route
   */
  getInitialRoute() {
    // Prüfe Hash
    const hash = window.location.hash.slice(1);
    if (hash) return hash;

    // Prüfe gespeicherten Spielstatus
    const gameState = Storage.getGameState();
    if (gameState && gameState.status === 'playing') {
      return 'gameplay';
    }

    // Default: Home
    return 'home';
  },

  /**
   * Setup globaler Event Listeners
   */
  setupEventListeners() {
    // Zurück-Button im Browser
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // Online/Offline Events
    window.addEventListener('online', () => {
      this.showNotification('Internetverbindung wiederhergestellt', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('Keine Internetverbindung - Offline-Modus', 'warning');
    });

    // Error Handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    // Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  },

  /**
   * Laedt Default-Songs, wenn die Datenbank leer ist
   */
  async loadDefaultSongsIfEmpty() {
    const songs = Storage.getSongs();
    if (songs && songs.length > 0) return;

    try {
      const response = await fetch('/api/songs/all', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('Default songs konnten nicht geladen werden');
      }
      const data = await response.json();
      const result = Database.importSongs(data);
      if (result.success) {
        this.showNotification(`${result.imported} Test-Songs geladen`, 'success', 3000);
      }
    } catch (error) {
      console.warn('Default songs konnten nicht geladen werden:', error);
    }
  },

  // ========== UI Helper ==========

  /**
   * Zeigt Loading Overlay
   */
  showLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'flex';
    }
  },

  /**
   * Versteckt Loading Overlay
   */
  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'none';
    }
  },

  /**
   * Zeigt eine Notification
   * @param {string} message - Nachricht
   * @param {string} type - Typ (success, error, warning, info)
   * @param {number} duration - Dauer in ms
   */
  showNotification(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate-slideInDown`;

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-message">${Utils.escapeHTML(message)}</div>
      </div>
      <button class="notification-close" aria-label="Schließen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    `;

    // Close Button Handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification);
    });

    // Füge zu Container hinzu
    this.elements.notificationRoot.appendChild(notification);

    // Auto-Remove nach Dauer
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }
  },

  /**
   * Entfernt eine Notification
   * @param {Element} notification - Notification-Element
   */
  removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  },

  /**
   * Zeigt einen Fehler
   * @param {string} message - Fehlermeldung
   */
  showError(message) {
    this.showNotification(message, 'error', 5000);
  },

  /**
   * Zeigt Erfolgs-Nachricht
   * @param {string} message - Nachricht
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  },

  /**
   * Zeigt ein Modal
   * @param {Object} options - Modal-Optionen
   * @returns {Element} Modal-Element
   */
  showModal({ title, content, footer, onClose }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay pointer-events-auto backdrop-blur-sm flex items-center justify-center fixed inset-0 z-50 bg-black/70 px-4';

    const modal = document.createElement('div');
    modal.className = 'modal pointer-events-auto w-full max-w-lg rounded-2xl bg-surface-dark border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto';

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10';
    header.innerHTML = `
      <h2 class="modal-title text-lg font-bold text-white">${Utils.escapeHTML(title)}</h2>\n      <button class="modal-close size-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-label="Schliessen">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body px-6 py-5';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    // Zusammensetzen
    modal.appendChild(header);
    modal.appendChild(body);
    if (footer) {
      const footerEl = document.createElement('div');
      footerEl.className = 'modal-footer flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-surface-dark';
      if (typeof footer === 'string') {
        footerEl.innerHTML = footer;
      } else {
        footerEl.appendChild(footer);
      }
      modal.appendChild(footerEl);
    }
    overlay.appendChild(modal);

    // Close Handler
    const previousOverflow = document.body.style.overflow;
    const closeModal = () => {
      document.removeEventListener('keydown', escHandler);
      document.body.style.overflow = previousOverflow;
      overlay.remove();
      if (onClose) onClose();
    };
    overlay.close = closeModal;

    header.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // ESC Key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', escHandler);

    // Zeige Modal
    document.body.style.overflow = 'hidden';
    this.elements.modalRoot.appendChild(overlay);

    return overlay;
  },

  /**
   * Zeigt Confirm-Dialog
   * @param {string} message - Nachricht
   * @param {Function} onConfirm - Callback bei Bestätigung
   * @param {Function} onCancel - Callback bei Abbruch
   */
  confirm(message, onConfirm, onCancel) {
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button class="btn btn-outline" data-action="cancel">Abbrechen</button>
      <button class="btn btn-primary" data-action="confirm">Bestätigen</button>
    `;

    const modal = this.showModal({
      title: 'Bestätigung',
      content: `<p>${Utils.escapeHTML(message)}</p>`,
      footer: footer,
      onClose: () => {
        if (onCancel) onCancel();
      }
    });

    footer.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      modal.close();
      if (onConfirm) onConfirm();
    });

    footer.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      modal.close();
      if (onCancel) onCancel();
    });
  },

  /**
   * Zeigt Form-Modal
   * @param {Object} options - { title, fields, onSubmit, initialValues, submitText, cancelText }
   * @returns {Element} Modal-Element
   */
  showFormModal({ title, fields, onSubmit, initialValues = {}, submitText = 'Speichern', cancelText = 'Abbrechen' }) {
    // Erstelle Formular
    const form = document.createElement('form');
    form.className = 'modal-form flex flex-col gap-4';
    const formId = `modal-form-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    form.id = formId;

    // Generiere Formularfelder
    fields.forEach(field => {
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group flex flex-col gap-2';

      // Label
      const label = document.createElement('label');
      label.textContent = field.label + (field.required ? ' *' : '');
      label.className = 'text-sm font-semibold text-white/70';
      label.setAttribute('for', `field-${field.name}`);
      formGroup.appendChild(label);

      // Input
      let input;
      let tagsApi = null;
      const isTagsField = field.type === 'tags';

      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = field.rows || 3;
      } else if (field.type === 'tags') {
        const tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'flex flex-col gap-2';

        const inputRow = document.createElement('div');
        inputRow.className = 'flex items-center gap-2';

        input = document.createElement('input');
        input.type = 'text';
        input.placeholder = field.placeholder || 'Tag1, Tag2';
        input.dataset.fieldType = 'tags';
        input.dataset.selectedTags = '[]';

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors';
        addButton.textContent = 'Hinzufuegen';

        const selectedList = document.createElement('div');
        selectedList.className = 'flex flex-wrap gap-2';

        const suggestions = document.createElement('div');
        suggestions.className = 'flex flex-wrap gap-2';
        suggestions.style.display = 'none';

        const getSelectedTags = () => {
          try {
            return JSON.parse(input.dataset.selectedTags || '[]');
          } catch {
            return [];
          }
        };

        const renderSelected = (tags) => {
          selectedList.innerHTML = '';
          tags.forEach(tag => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/20';
            chip.textContent = tag;

            const remove = document.createElement('span');
            remove.textContent = 'x';
            remove.className = 'text-white/60';
            chip.appendChild(remove);

            chip.addEventListener('click', () => {
              const updated = getSelectedTags().filter(t => t !== tag);
              input.dataset.selectedTags = JSON.stringify(updated);
              renderSelected(updated);
            });
            selectedList.appendChild(chip);
          });
        };

        const setSelectedTags = (tags) => {
          const unique = Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));
          input.dataset.selectedTags = JSON.stringify(unique);
          renderSelected(unique);
        };

        const addTags = (raw) => {
          const next = raw
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);
          if (next.length === 0) return;
          setSelectedTags([...getSelectedTags(), ...next]);
          input.value = '';
          suggestions.style.display = 'none';
          suggestions.innerHTML = '';
        };

        const renderSuggestions = (term) => {
          const options = Array.isArray(field.datalistOptions) ? field.datalistOptions : [];
          if (!term) {
            suggestions.style.display = 'none';
            suggestions.innerHTML = '';
            return;
          }

          const selected = new Set(getSelectedTags().map(tag => tag.toLowerCase()));
          const matches = options
            .filter(tag => tag.toLowerCase().includes(term) && !selected.has(tag.toLowerCase()))
            .slice(0, 10);

          suggestions.innerHTML = '';
          if (matches.length === 0) {
            suggestions.style.display = 'none';
            return;
          }

          matches.forEach(tag => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20';
            chip.textContent = tag;
            chip.addEventListener('click', () => {
              addTags(tag);
            });
            suggestions.appendChild(chip);
          });
          suggestions.style.display = 'flex';
        };

        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addTags(input.value);
          }
        });

        input.addEventListener('input', () => {
          renderSuggestions(input.value.trim().toLowerCase());
        });

        addButton.addEventListener('click', () => {
          addTags(input.value);
        });

        inputRow.appendChild(input);
        inputRow.appendChild(addButton);
        tagsWrapper.appendChild(inputRow);
        tagsWrapper.appendChild(selectedList);
        tagsWrapper.appendChild(suggestions);

        if (Array.isArray(field.datalistOptions) && field.datalistOptions.length > 0) {
          const dropdown = document.createElement('select');
          dropdown.className = 'w-full rounded-xl bg-surface-dark-input border border-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors';

          const placeholder = document.createElement('option');
          placeholder.value = '';
          placeholder.textContent = 'Tag auswaehlen';
          dropdown.appendChild(placeholder);

          field.datalistOptions.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            dropdown.appendChild(option);
          });

          dropdown.addEventListener('change', () => {
            if (dropdown.value) {
              addTags(dropdown.value);
              dropdown.value = '';
            }
          });

          tagsWrapper.appendChild(dropdown);
        }
        formGroup.appendChild(tagsWrapper);

        tagsApi = { setSelectedTags };
      } else if (field.type === 'select') {
        input = document.createElement('select');
        field.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = typeof opt === 'object' ? opt.value : opt;
          option.textContent = typeof opt === 'object' ? opt.label : opt;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        if (field.placeholder) input.placeholder = field.placeholder;
      }

      input.id = `field-${field.name}`;
      input.name = field.name;
      input.className = 'w-full rounded-xl bg-surface-dark-input border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors';
      if (field.required) input.required = true;

      if (!isTagsField && field.datalistOptions && field.datalistOptions.length > 0) {
        const listId = `datalist-${field.name}-${Math.floor(Math.random() * 100000)}`;
        input.setAttribute('list', listId);
        const datalist = document.createElement('datalist');
        datalist.id = listId;
        field.datalistOptions.forEach(optionValue => {
          const option = document.createElement('option');
          option.value = optionValue;
          datalist.appendChild(option);
        });
        formGroup.appendChild(datalist);
      }

      // Setze initialen Wert
      if (initialValues[field.name] !== undefined) {
        if (field.type === 'tags' && Array.isArray(initialValues[field.name])) {
          if (tagsApi) {
            tagsApi.setSelectedTags(initialValues[field.name]);
          }
          input.value = '';
        } else {
          input.value = initialValues[field.name];
        }
      }

      if (!isTagsField) {
        formGroup.appendChild(input);
      }

      // Validation Error Container
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error text-sm text-red-400';
      errorDiv.style.display = 'none';
      formGroup.appendChild(errorDiv);

      form.appendChild(formGroup);
    });

    // Footer mit Buttons
    const footer = document.createElement('div');
    footer.innerHTML = `
      <button type="button" class="btn btn-outline bg-white/10 text-white hover:bg-white/20 px-5 py-2 rounded-full font-semibold transition-colors" data-action="cancel">${Utils.escapeHTML(cancelText)}</button>
      <button type="submit" class="btn btn-primary bg-primary text-background-dark hover:brightness-110 px-5 py-2 rounded-full font-semibold transition-all" data-action="submit" form="${formId}">${Utils.escapeHTML(submitText)}</button>
    `;

    // Form Submit Handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Sammle Formulardaten
      const formData = {};
      const formElements = form.elements;

      for (let element of formElements) {
        if (element.name) {
          if (element.dataset.fieldType === 'tags') {
            let selected = [];
            try {
              selected = JSON.parse(element.dataset.selectedTags || '[]');
            } catch {
              selected = [];
            }
            const pending = (element.value || '')
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean);
            const combined = Array.from(new Set([...selected, ...pending]));
            formData[element.name] = combined;
          } else {
            formData[element.name] = element.value;
          }
        }
      }

      // Rufe Callback auf
      if (onSubmit) {
        const result = onSubmit(formData);

        // Falls Validierungsfehler zurueckgegeben werden
        if (result && result.errors && result.errors.length > 0) {
          this.showFormErrors(form, result.errors);
          return;
        }

        // Schliesse Modal bei Erfolg
        modal.close();
      }
    });

    // Cancel Button Handler
    footer.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      modal.close();
    });

    // Zeige Modal
    const modal = this.showModal({
      title,
      content: form,
      footer
    });

    // Fokussiere erstes Input
    const firstInput = form.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    return modal;
  },
  /**
   * Zeigt Validierungsfehler im Formular an
   * @param {Element} form - Formular-Element
   * @param {Array} errors - Array von Fehlermeldungen
   */
  showFormErrors(form, errors) {
    // Verstecke alle bisherigen Fehler
    form.querySelectorAll('.form-error').forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });

    // Zeige neue Fehler
    errors.forEach(error => {
      // Versuche Fehler einem spezifischen Feld zuzuordnen
      const errorDiv = form.querySelector('.form-error');
      if (errorDiv) {
        errorDiv.textContent = error;
        errorDiv.style.display = 'block';
      }
    });
  }
};

// Initialisiere App wenn DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Globaler Zugriff (für Debugging und Screen-Controller)
window.App = App;



