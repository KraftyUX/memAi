/**
 * Main entry point for the memAI Dashboard
 * Requirements: 1.1
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import {
  applyThemeMode,
  THEME_MODE_STORAGE_KEY,
  type ThemeMode,
} from './lib/theme';

/**
 * Initialize theme before React renders to prevent flash of unstyled content
 */
function initializeTheme(): void {
  // Get stored theme mode or default to system
  const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
  const mode: ThemeMode = storedMode === 'light' || storedMode === 'dark' || storedMode === 'system'
    ? storedMode
    : 'system';

  // Apply theme mode immediately
  applyThemeMode(mode);

  // Listen for system theme changes when in system mode
  if (mode === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const currentMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
      if (currentMode === 'system' || !currentMode) {
        applyThemeMode('system');
      }
    });
  }
}

// Initialize theme before rendering
initializeTheme();

// Mount React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
