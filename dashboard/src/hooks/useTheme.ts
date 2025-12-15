/**
 * useTheme hook for theme state management
 * Requirements: 1.4
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ThemeMode,
  ThemeConfig,
  defaultLightTheme,
  defaultDarkTheme,
  applyThemeMode,
  getSystemThemePreference,
  serializeTheme,
  parseTheme,
  THEME_MODE_STORAGE_KEY,
  THEME_CONFIG_STORAGE_KEY,
} from '../lib/theme';

/**
 * Return type for the useTheme hook
 */
export interface UseThemeReturn {
  /** Current theme mode (light, dark, or system) */
  mode: ThemeMode;
  /** Current resolved theme (light or dark based on mode and system preference) */
  resolvedTheme: 'light' | 'dark';
  /** Current theme configuration */
  themeConfig: ThemeConfig;
  /** Set the theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark mode */
  toggleMode: () => void;
  /** Set a custom theme configuration */
  setThemeConfig: (config: ThemeConfig) => void;
  /** Reset to default theme */
  resetTheme: () => void;
}

/**
 * Gets the initial theme mode from localStorage or defaults to 'system'
 */
function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  
  const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Gets the initial theme config from localStorage or returns null
 */
function getInitialThemeConfig(): ThemeConfig | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(THEME_CONFIG_STORAGE_KEY);
  if (!stored) return null;
  
  const result = parseTheme(stored);
  return result.success ? result.theme : null;
}


/**
 * Resolves the actual theme (light or dark) based on mode and system preference
 */
function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemThemePreference();
  }
  return mode;
}

/**
 * Hook for managing theme state with persistence
 * 
 * Features:
 * - Light/dark mode toggle
 * - System preference detection
 * - localStorage persistence
 * - Custom theme configuration support
 * 
 * @returns UseThemeReturn object with theme state and controls
 */
export function useTheme(): UseThemeReturn {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(() => {
    const customConfig = getInitialThemeConfig();
    if (customConfig) return customConfig;
    
    const initialMode = getInitialMode();
    const resolved = resolveTheme(initialMode);
    return resolved === 'dark' ? defaultDarkTheme : defaultLightTheme;
  });
  
  const resolvedTheme = resolveTheme(mode);

  // Apply theme mode (dark class) on mount and when mode changes
  useEffect(() => {
    applyThemeMode(mode);
  }, [mode]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyThemeMode('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Note: Theme colors are now handled via CSS variables in index.css
  // The .dark class toggles between light/dark color schemes
  // Custom theme config application is disabled to use OKLCH colors from CSS

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(THEME_MODE_STORAGE_KEY, newMode);
    applyThemeMode(newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [resolvedTheme, setMode]);

  const setThemeConfig = useCallback((config: ThemeConfig) => {
    setThemeConfigState(config);
    localStorage.setItem(THEME_CONFIG_STORAGE_KEY, serializeTheme(config));
  }, []);

  const resetTheme = useCallback(() => {
    const resolved = resolveTheme(mode);
    const defaultConfig = resolved === 'dark' ? defaultDarkTheme : defaultLightTheme;
    setThemeConfigState(defaultConfig);
    localStorage.removeItem(THEME_CONFIG_STORAGE_KEY);
  }, [mode]);

  return {
    mode,
    resolvedTheme,
    themeConfig,
    setMode,
    toggleMode,
    setThemeConfig,
    resetTheme,
  };
}

export default useTheme;
