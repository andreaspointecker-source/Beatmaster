# Implementation Tasks: New Design System

## Phase 1: Infrastructure Setup

- [ ] **1.1 Tailwind CSS Integration**
  - [ ] Add Tailwind CDN to index.html (development)
  - [ ] Configure Tailwind with custom theme (colors, fonts, border-radius)
  - [ ] Test Tailwind classes are working

- [ ] **1.2 Google Fonts**
  - [ ] Add Inter font (weights: 400, 500, 600, 700, 800, 900)
  - [ ] Add Material Symbols Outlined icons
  - [ ] Configure font-variation-settings for icons

- [ ] **1.3 Ambient Background System**
  - [ ] Create reusable background glow component
  - [ ] Implement gradient overlays
  - [ ] Test performance on mobile devices

## Phase 2: Component Library

- [ ] **2.1 Button Components**
  - [ ] Primary button (cyan, rounded-full, shadow-glow)
  - [ ] Secondary button (surface-dark, border)
  - [ ] Outline button (transparent, border)
  - [ ] Ghost button (text-only)
  - [ ] Icon button (rounded-full, 40-48px)

- [ ] **2.2 Card Components**
  - [ ] Base card (surface-dark, rounded-2xl, border)
  - [ ] Interactive card (hover effects, border-primary)
  - [ ] Team card (with glow accent line)
  - [ ] Song card (with edit/delete actions)

- [ ] **2.3 Form Components**
  - [ ] Search input (rounded-full, icon-left)
  - [ ] Text input (rounded-xl, focus-ring)
  - [ ] Select dropdown (rounded-full, custom arrow)
  - [ ] Checkbox/Radio (custom styling)

- [ ] **2.4 Navigation Components**
  - [ ] Top header (sticky, backdrop-blur)
  - [ ] Back button (icon-only)
  - [ ] Settings button (icon-only)

- [ ] **2.5 Utility Components**
  - [ ] Pagination (rounded-full, pill-style)
  - [ ] Filter chips (rounded-full, active state)
  - [ ] Tag badges (genre, year)
  - [ ] Progress bar (with glow effect)
  - [ ] Timer circle (SVG ring)

## Phase 3: Screen Migration

### Priority 1: Core Screens

- [ ] **3.1 Home Screen** (`js/screens/home.js`)
  - [ ] Update HTML template with design
  - [ ] Add logo with glow effect
  - [ ] Implement button hierarchy (primary, secondary, outline, ghost)
  - [ ] Add ambient background glows
  - [ ] Test navigation to all screens
  - [ ] Reference: `designs/beatmaster_home_screen/`

- [ ] **3.2 Song Database** (`js/screens/database-manager.js`)
  - [ ] Update header with stats headline
  - [ ] Implement search bar (rounded-full)
  - [ ] Add filter chips row
  - [ ] Create song card grid
  - [ ] Add edit/delete buttons to cards
  - [ ] Implement pagination
  - [ ] Add import/export buttons
  - [ ] Test search, filter, sort functionality
  - [ ] Reference: `designs/beatmaster_song_database/`

- [ ] **3.3 Song Add/Edit Modal** (`js/screens/database-manager.js`)
  - [ ] Create modal overlay
  - [ ] Design form with all fields
  - [ ] Add YouTube ID validation visual feedback
  - [ ] Implement save/cancel actions
  - [ ] Test CRUD operations
  - [ ] Reference: `designs/beatmaster_song_add/edit/`

### Priority 2: Game Flow Screens

- [ ] **3.4 Game Setup** (`js/screens/game-setup.js`)
  - [ ] Update team configuration UI
  - [ ] Add rounds selector
  - [ ] Implement game mode selector
  - [ ] Add settings toggles
  - [ ] Style start button
  - [ ] Test game initialization
  - [ ] Reference: `designs/beatmaster_game_setup/`

- [ ] **3.5 Gameplay Screen** (`js/screens/gameplay.js`)
  - [ ] Add top navigation (pause, round counter, settings)
  - [ ] Implement song progress bar
  - [ ] Create audio visualizer bars (CSS)
  - [ ] Build timer circle with SVG ring
  - [ ] Add active team card
  - [ ] Display question type badges
  - [ ] Style action buttons (stop, replay, skip)
  - [ ] Add ambient glows around timer
  - [ ] Test YouTube player integration
  - [ ] Reference: `designs/beatmaster_gameplay_screen/`

- [ ] **3.6 Answer Reveal** (`js/screens/gameplay.js`)
  - [ ] Create reveal animation
  - [ ] Show correct answer with glow
  - [ ] Display points awarded
  - [ ] Add team score update
  - [ ] Implement continue button
  - [ ] Test state transitions
  - [ ] Reference: `designs/beatmaster_answer_reveal/`

- [ ] **3.7 Scoreboard** (`js/screens/scoreboard.js`)
  - [ ] Create team ranking cards
  - [ ] Add score animations
  - [ ] Highlight leading team
  - [ ] Display round summary
  - [ ] Add next round button
  - [ ] Test score calculations
  - [ ] Reference: `designs/beatmaster_scoreboard/`

- [ ] **3.8 Results Screen** (`js/screens/results.js`)
  - [ ] Create winner announcement
  - [ ] Add podium visualization
  - [ ] Display final scores
  - [ ] Show game statistics
  - [ ] Add confetti animation (winner celebration)
  - [ ] Implement share/new game buttons
  - [ ] Test game completion flow
  - [ ] Reference: `designs/beatmaster_results/`

### Priority 3: Utility Screens

- [ ] **3.9 History** (`js/screens/history.js`)
  - [ ] Create game history list
  - [ ] Add game detail cards
  - [ ] Implement date filtering
  - [ ] Add export history button
  - [ ] Test history persistence
  - [ ] Reference: `designs/beatmaster_history/`

- [ ] **3.10 Settings** (`js/screens/settings.js`)
  - [ ] Create settings sections
  - [ ] Add toggle switches
  - [ ] Implement sliders (volume, etc.)
  - [ ] Add reset/export buttons
  - [ ] Test settings persistence
  - [ ] Reference: `designs/beatmaster_settings/`

## Phase 4: Polish & Refinement

- [ ] **4.1 Animations & Transitions**
  - [ ] Add button press animations (scale-98)
  - [ ] Implement page transitions
  - [ ] Add modal open/close animations
  - [ ] Create score update animations
  - [ ] Add subtle hover effects
  - [ ] Test 60fps performance

- [ ] **4.2 Responsive Design**
  - [ ] Test on mobile portrait (320px-767px)
  - [ ] Test on mobile landscape (568px+)
  - [ ] Test on tablet (768px-1023px)
  - [ ] Test on desktop (1024px+)
  - [ ] Adjust font sizes and spacing
  - [ ] Optimize touch targets (min 44px)

- [ ] **4.3 Accessibility**
  - [ ] Verify keyboard navigation
  - [ ] Test screen reader compatibility
  - [ ] Ensure color contrast (WCAG AA)
  - [ ] Add focus indicators
  - [ ] Test with reduced motion

- [ ] **4.4 Cross-Browser Testing**
  - [ ] Chrome (desktop & mobile)
  - [ ] Firefox
  - [ ] Safari (desktop & iOS)
  - [ ] Edge
  - [ ] Fix any browser-specific issues

## Phase 5: Production Optimization

- [ ] **5.1 Tailwind Production Build**
  - [ ] Install Tailwind CLI
  - [ ] Configure purge for unused classes
  - [ ] Build production CSS
  - [ ] Replace CDN with local file
  - [ ] Verify bundle size < 50KB

- [ ] **5.2 Font Optimization**
  - [ ] Subset Inter font to used characters
  - [ ] Use font-display: swap
  - [ ] Preload critical fonts
  - [ ] Optimize Material Symbols loading

- [ ] **5.3 Performance Audit**
  - [ ] Run Lighthouse audit
  - [ ] Optimize Largest Contentful Paint
  - [ ] Reduce Cumulative Layout Shift
  - [ ] Improve Time to Interactive
  - [ ] Target 90+ performance score

## Testing Checklist

- [ ] All screens load without errors
- [ ] Navigation between screens works
- [ ] State persists across page reloads
- [ ] Forms validate correctly
- [ ] Animations run smoothly (60fps)
- [ ] Touch/click targets are accessible (44px+)
- [ ] No console errors or warnings
- [ ] CSS bundle size < 50KB
- [ ] Lighthouse performance score > 90
- [ ] Works on all target browsers
- [ ] Responsive on all breakpoints
- [ ] WCAG AA accessibility compliance

## Documentation

- [ ] Update README with Tailwind info
- [ ] Document component patterns
- [ ] Create design system guide
- [ ] Add screenshots to docs
- [ ] Update UI design spec with implemented changes

---

**Total Tasks:** ~75 individual tasks
**Estimated Time:** 10-12 days
**Priority:** High
