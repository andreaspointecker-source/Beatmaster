// src/styles/theme.js

export const theme = {
  colors: {
    // Hintergrund & Flächen
    backgroundStart: '#111625',
    backgroundEnd: '#1A2235',
    surface: '#1E2638',
    surfaceDark: '#151B2B',
    border: '#2A354D',
    
    // Akzentfarben (Orange zu Gelb)
    accentPrimary: '#FF8C00', // Klares Orange
    gradientStart: '#FF7A00', // Orange (links/unten)
    gradientEnd: '#FFB300',   // Gelb-Orange (rechts/oben)
    
    // Typografie
    textPrimary: '#FFFFFF',
    textSecondary: '#8E9BB0',
    textOnPrimary: '#111625',
  },
  typography: {
    // da wir (noch) keine custom fonts geladen haben, nutzen wir system-sans-fonts
    fontFamily: 'sans-serif',
    sizes: {
      title: 32,
      h1: 24,
      body: 16,
      label: 14,
      small: 12,
    },
    weights: {
      regular: '400',
      medium: '500',
      bold: '700',
      heavy: '800',
    }
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  layout: {
    paddingHorizontal: 20,
    borderRadius: {
      pill: 50,
      card: 16,
      input: 12,
    }
  }
};
