# Design System Technical Specification

## Overview

This document outlines the technical implementation details for migrating from the current custom CSS framework to a Tailwind CSS-based design system inspired by modern music streaming applications.

## Technology Stack Changes

### Current Stack
```
CSS: Custom CSS with CSS Custom Properties
Icons: SVG inline (manual)
Typography: System fonts
Layout: Flexbox with custom classes
```

### New Stack
```
CSS: Tailwind CSS 3.x (utility-first)
Icons: Material Symbols Outlined (Google Fonts)
Typography: Inter (Google Fonts)
Layout: Tailwind Flexbox + Grid utilities
Build: Tailwind CLI (production)
```

## Design Tokens

### Color System

**Tailwind Config:**
```javascript
colors: {
  // Primary palette
  "primary": "#00d9ff",           // Cyan - CTAs, highlights

  // Backgrounds
  "background-light": "#f5f8f8",  // Light mode (optional)
  "background-dark": "#0f2023",   // Main dark background

  // Surfaces
  "surface-dark": "#162a2d",      // Cards, panels (primary)
  "surface-dark-alt": "#1a2c30",  // Alternative surface
  "surface-dark-input": "#20454b", // Input backgrounds

  // Teal accent family (for variety)
  "teal": {
    800: "#0f4c55",  // Ambient glows
  }
}
```

**Opacity Modifiers:**
```css
/* Text */
text-white          /* 100% - Primary text */
text-white/70       /* 70% - Secondary text */
text-white/40       /* 40% - Muted text */
text-white/30       /* 30% - Disabled */

/* Borders */
border-white/5      /* 5% - Subtle borders */
border-white/10     /* 10% - Default borders */
border-white/20     /* 20% - Emphasized borders */
border-primary/20   /* 20% - Primary borders */
border-primary/50   /* 50% - Hover state */

/* Backgrounds */
bg-white/5          /* 5% - Hover overlay */
bg-white/10         /* 10% - Active overlay */
bg-primary/10       /* 10% - Primary tint */
bg-primary/30       /* 30% - Primary emphasis */
```

### Typography Scale

**Font Family:**
```javascript
fontFamily: {
  "display": ["Inter", "sans-serif"]
}
```

**Font Sizes:**
```javascript
// Headings
text-4xl    // 36px - Main titles (Home: "BeatMaster")
text-3xl    // 30px - Large headers
text-2xl    // 24px - Section headers
text-xl     // 20px - Subsections
text-lg     // 18px - Large body

// Body
text-base   // 16px - Primary text
text-sm     // 14px - Secondary text
text-xs     // 12px - Captions, labels
text-[10px] // 10px - Tiny labels

// Display
text-[64px] // 64px - Timer countdown
text-[28px] // 28px - Icons
```

**Font Weights:**
```javascript
font-normal       // 400
font-medium       // 500
font-semibold     // 600
font-bold         // 700
font-extrabold    // 800
font-black        // 900
```

**Text Transforms:**
```css
uppercase           /* Buttons, labels */
tracking-tight      /* Headings */
tracking-wide       /* Buttons (0.025em) */
tracking-widest     /* Labels (0.05-0.15em) */
tracking-[0.25em]   /* Custom spacing */
```

### Spacing System

**Border Radius:**
```javascript
borderRadius: {
  DEFAULT: "1rem",     // 16px - Default cards
  lg: "2rem",          // 32px - Large cards
  xl: "3rem",          // 48px - Extra large
  full: "9999px",      // Fully rounded (buttons, pills)
}
```

**Heights:**
```css
h-10  /* 40px - Ghost buttons */
h-12  /* 48px - Secondary buttons, inputs */
h-14  /* 56px - Primary buttons */
h-16  /* 64px - Large CTAs */
```

**Padding:**
```css
p-4   /* 16px - Card padding (standard) */
p-5   /* 20px - Card padding (comfortable) */
p-6   /* 24px - Screen padding */
px-6  /* 24px - Horizontal screen padding */
```

**Gaps:**
```css
gap-1.5  /* 6px - Visualizer bars */
gap-2    /* 8px - Chip spacing */
gap-3    /* 12px - Card spacing */
gap-4    /* 16px - Section spacing */
gap-6    /* 24px - Large spacing */
```

### Shadow System

**Tailwind Shadows:**
```css
/* Standard shadows */
shadow-sm   /* Subtle card shadow */
shadow-lg   /* Modal, elevated elements */
shadow-xl   /* High elevation */
shadow-2xl  /* Maximum elevation */

/* Custom glow shadows */
shadow-[0_4px_20px_rgba(0,217,255,0.3)]   /* Button glow (normal) */
shadow-[0_4px_30px_rgba(0,217,255,0.5)]   /* Button glow (hover) */
shadow-[0_0_20px_rgba(0,217,255,0.3)]     /* Card glow */
shadow-[0_0_10px_#00d9ff]                 /* Progress bar glow */
shadow-[0_0_10px_rgba(0,217,255,0.1)]     /* Subtle badge glow */

/* Drop shadows */
drop-shadow-lg                             /* Icon shadow */
drop-shadow-[0_0_10px_rgba(0,217,255,0.5)] /* Icon glow */
drop-shadow-[0_0_5px_rgba(0,217,255,0.4)]  /* Text glow */
```

## Component Specifications

### 1. Buttons

**Primary Button:**
```html
<button class="
  w-full h-14
  bg-primary hover:bg-primary/90
  text-background-dark
  rounded-full
  flex items-center justify-center gap-2
  shadow-[0_4px_20px_rgba(0,217,255,0.3)]
  hover:shadow-[0_4px_30px_rgba(0,217,255,0.5)]
  transition-all
  transform active:scale-[0.98]
  font-bold text-base tracking-widest uppercase
  group
">
  <span class="material-symbols-outlined">play_circle</span>
  Neues Spiel Starten
</button>
```

**Secondary Button:**
```html
<button class="
  w-full h-14
  bg-surface-dark hover:bg-white/10
  text-white
  border border-white/10
  rounded-full
  flex items-center justify-center gap-2
  transition-all
  transform active:scale-[0.98]
  font-bold text-base tracking-widest uppercase
">
  <span class="material-symbols-outlined text-primary">resume</span>
  Spiel Fortsetzen
</button>
```

**Outline Button:**
```html
<button class="
  w-full h-12
  bg-transparent hover:bg-white/5
  text-white/90
  border border-white/20 hover:border-white/40
  rounded-full
  flex items-center justify-center gap-2
  transition-all
  active:scale-[0.98]
  font-bold text-sm tracking-widest uppercase
">
  <span class="material-symbols-outlined text-white/60">library_music</span>
  Song-Datenbank
</button>
```

**Ghost Button:**
```html
<button class="
  w-full h-10
  flex items-center justify-center gap-2
  text-white/40 hover:text-white
  transition-colors
  text-xs font-bold tracking-[0.15em] uppercase
">
  <span class="material-symbols-outlined text-lg">settings</span>
  Einstellungen
</button>
```

**Icon Button:**
```html
<button class="
  w-12 h-12
  flex items-center justify-center
  rounded-full
  hover:bg-white/10 active:bg-white/20
  transition-colors
">
  <span class="material-symbols-outlined text-white text-[28px]">
    pause_circle
  </span>
</button>
```

### 2. Cards

**Standard Card:**
```html
<div class="
  bg-surface-dark
  rounded-2xl
  p-4
  border border-white/5
  shadow-sm
  transition-all
  hover:border-primary/50
">
  <!-- Content -->
</div>
```

**Song Card:**
```html
<div class="
  group relative
  flex flex-col gap-3
  rounded-2xl
  bg-surface-dark
  p-4
  shadow-sm
  border border-white/5
  transition-all
  hover:border-primary/50
">
  <div class="flex justify-between items-start">
    <div class="flex flex-col gap-1 min-w-0 pr-4">
      <h3 class="text-base font-bold text-white truncate">
        Song Title
      </h3>
      <p class="text-sm text-white/70 font-medium truncate">
        Artist Name
      </p>
    </div>
    <div class="flex items-center gap-1 shrink-0">
      <!-- Action buttons -->
    </div>
  </div>
  <div class="flex flex-wrap gap-2">
    <!-- Genre/year badges -->
  </div>
</div>
```

**Team Card (with glow accent):**
```html
<div class="
  bg-gradient-to-br from-surface-dark/90 to-background-dark/90
  backdrop-blur-md
  border border-white/10
  p-5
  rounded-3xl
  text-center
  shadow-xl
  relative overflow-hidden
">
  <!-- Top glow accent -->
  <div class="
    absolute top-0 left-0
    w-full h-1
    bg-gradient-to-r from-transparent via-primary/50 to-transparent
  "></div>

  <p class="
    text-[10px] uppercase text-white/50
    font-bold tracking-widest mb-2
  ">
    Jetzt dran
  </p>
  <h2 class="text-2xl font-bold text-white tracking-tight">
    Die Party Löwen
  </h2>
</div>
```

### 3. Form Elements

**Search Input:**
```html
<label class="relative flex w-full items-center">
  <span class="absolute left-4 text-primary">
    <span class="material-symbols-outlined" style="font-size: 24px;">
      search
    </span>
  </span>
  <input
    type="text"
    placeholder="Search title or artist..."
    class="
      w-full h-12
      rounded-full
      border-none
      bg-surface-dark-input
      pl-12 pr-4
      text-base font-medium
      placeholder-white/40
      text-white
      focus:ring-2 focus:ring-primary
      shadow-sm
    "
  />
</label>
```

**Filter Chip:**
```html
<button class="
  flex h-9 shrink-0
  items-center justify-center gap-x-2
  rounded-full
  bg-surface-dark-input
  pl-4 pr-3
  border-none
  shadow-sm
  active:scale-95
  transition-transform
">
  <span class="text-sm font-medium whitespace-nowrap">All Genres</span>
  <span class="material-symbols-outlined text-white/60" style="font-size: 20px;">
    keyboard_arrow_down
  </span>
</button>
```

### 4. Badges & Tags

**Genre Badge:**
```html
<span class="
  inline-flex items-center
  px-2.5 py-1
  rounded-full
  text-xs font-semibold
  bg-primary/10
  text-primary
  shadow-[0_0_10px_rgba(0,217,255,0.1)]
">
  Rock
</span>
```

**Year Badge:**
```html
<span class="
  inline-flex items-center
  px-2.5 py-1
  rounded-full
  text-xs font-semibold
  bg-white/10
  text-white/70
">
  1975
</span>
```

### 5. Progress & Timer

**Progress Bar:**
```html
<div class="h-1.5 bg-white/5 rounded-full overflow-hidden w-full">
  <div class="
    h-full
    bg-primary
    shadow-[0_0_10px_#00d9ff]
    rounded-r-full
    w-[35%]
  "></div>
</div>
```

**Timer Circle (SVG):**
```html
<div class="
  w-56 h-56
  rounded-full
  relative
  flex items-center justify-center
  bg-surface-dark/30
  backdrop-blur-sm
  shadow-2xl
">
  <!-- Background glow -->
  <div class="
    absolute inset-0
    bg-primary/10
    blur-3xl
    rounded-full
    transform scale-150
  "></div>

  <!-- SVG Ring -->
  <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
    <!-- Track -->
    <circle
      cx="50" cy="50" r="46"
      fill="transparent"
      stroke="rgba(255,255,255,0.05)"
      stroke-width="3"
    />
    <!-- Progress -->
    <circle
      cx="50" cy="50" r="46"
      fill="transparent"
      stroke="#00d9ff"
      stroke-width="3"
      stroke-linecap="round"
      stroke-dasharray="289"
      stroke-dashoffset="60"
      class="drop-shadow-[0_0_6px_rgba(0,217,255,0.6)]"
    />
  </svg>

  <!-- Time Display -->
  <div class="text-center z-10 flex flex-col items-center">
    <span class="
      block text-[64px] font-black
      tracking-tighter text-white
      leading-none drop-shadow-lg
    ">
      00:15
    </span>
    <span class="
      text-[10px] font-bold uppercase
      tracking-[0.2em] text-white/40 mt-2
    ">
      Sekunden
    </span>
  </div>
</div>
```

### 6. Audio Visualizer (CSS)

```html
<div class="flex items-end justify-center gap-1.5 h-12 w-full max-w-[240px]">
  <div class="w-1.5 bg-primary/30 rounded-full h-4"></div>
  <div class="w-1.5 bg-primary/60 rounded-full h-8"></div>
  <div class="w-1.5 bg-primary rounded-full h-12 shadow-[0_0_8px_#00d9ff]"></div>
  <div class="w-1.5 bg-primary/80 rounded-full h-7"></div>
  <div class="w-1.5 bg-primary rounded-full h-10 shadow-[0_0_8px_#00d9ff]"></div>
  <div class="w-1.5 bg-primary/40 rounded-full h-5"></div>
  <div class="w-1.5 bg-primary rounded-full h-11 shadow-[0_0_8px_#00d9ff]"></div>
  <div class="w-1.5 bg-primary/70 rounded-full h-6"></div>
  <div class="w-1.5 bg-primary/30 rounded-full h-3"></div>
</div>
```

## Ambient Background System

**Base Structure:**
```html
<body class="
  bg-background-dark
  min-h-screen
  font-display
  antialiased
  text-white
  overflow-hidden
  relative
">
  <!-- Ambient Background Effects -->
  <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <!-- Top center glow -->
    <div class="
      absolute top-[-150px] left-1/2 -translate-x-1/2
      w-[600px] h-[600px]
      bg-primary/10
      rounded-full
      blur-[120px]
    "></div>

    <!-- Bottom right glow -->
    <div class="
      absolute bottom-[-100px] right-[-50px]
      w-[400px] h-[400px]
      bg-teal-800/20
      rounded-full
      blur-[100px]
    "></div>
  </div>

  <!-- Main Content Container -->
  <div class="relative z-10 ...">
    <!-- Content -->
  </div>
</body>
```

**Radial Gradient Alternative:**
```css
bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
from-[#1a383f]
to-background-dark
```

## Material Symbols Configuration

**Global Style:**
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}
```

**Common Sizes:**
```css
text-lg     /* 18px - Small icons */
text-[20px] /* 20px - Filter chips */
text-[24px] /* 24px - Standard icons */
text-[28px] /* 28px - Navigation icons */
text-6xl    /* 60px - Hero icons */
```

## Animation & Transitions

**Standard Transitions:**
```css
transition-all      /* All properties */
transition-colors   /* Colors only */
transition-transform /* Transform only */
```

**Transform Effects:**
```css
active:scale-[0.98]          /* Button press */
hover:scale-110              /* Icon hover */
group-hover:scale-110        /* Group hover */
transform scale-125          /* Enlarged glow */
```

**Duration:**
```css
duration-200  /* Fast (buttons) */
duration-300  /* Default */
```

## Responsive Breakpoints

**Tailwind Defaults:**
```css
/* Mobile first (default) */
sm:  /* 640px+ */
md:  /* 768px+ */
lg:  /* 1024px+ */
xl:  /* 1280px+ */
```

**Common Patterns:**
```css
text-4xl md:text-5xl     /* Larger heading on desktop */
flex-col md:flex-row     /* Stack on mobile, row on desktop */
gap-4 md:gap-6           /* More spacing on desktop */
px-4 md:px-6             /* More padding on desktop */
```

## Performance Optimizations

### Tailwind Production Build

```bash
# Install Tailwind CLI
npm install -D tailwindcss

# Create tailwind.config.js
npx tailwindcss init

# Build CSS
npx tailwindcss -i ./src/input.css -o ./css/tailwind.css --minify
```

**Purge Config:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './js/**/*.js',
  ],
  // ... rest of config
}
```

### Font Loading Strategy

```html
<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load with display swap -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
  rel="stylesheet"
>
```

## Browser Support

**Target Browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

**Required Polyfills:**
- None (modern browsers only)

**Vendor Prefixes:**
- Handled by Tailwind's autoprefixer

---

**Design System Version:** 2.0
**Based On:** `designs/` folder mockups
**Status:** Ready for implementation
