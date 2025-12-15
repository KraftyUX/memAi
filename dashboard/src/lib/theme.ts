/**
 * Theme configuration and utilities for the memAI Dashboard
 * Requirements: 7.1, 7.2, 7.3
 */

/**
 * Theme color configuration interface
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
}

/**
 * Complete theme configuration interface
 */
export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  radius: string;
}

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Result type for theme parsing operations
 */
export type ThemeParseResult = 
  | { success: true; theme: ThemeConfig }
  | { success: false; error: string };

/**
 * Default light theme configuration
 */
export const defaultLightTheme: ThemeConfig = {
  name: 'default-light',
  colors: {
    primary: '231 77% 66%',
    secondary: '270 40% 46%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222.2 84% 4.9%',
    border: '214.3 31.8% 91.4%',
    muted: '210 40% 96.1%',
    mutedForeground: '215.4 16.3% 46.9%',
    accent: '210 40% 96.1%',
    accentForeground: '222.2 47.4% 11.2%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '210 40% 98%',
  },
  radius: '0.75rem',
};


/**
 * Default dark theme configuration
 */
export const defaultDarkTheme: ThemeConfig = {
  name: 'default-dark',
  colors: {
    primary: '231 77% 66%',
    secondary: '270 40% 46%',
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 8%',
    cardForeground: '210 40% 98%',
    border: '217.2 32.6% 25%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
  },
  radius: '0.75rem',
};

/**
 * Serializes a ThemeConfig object to a JSON string
 * Requirements: 7.1
 * 
 * @param theme - The theme configuration to serialize
 * @returns JSON string representation of the theme
 */
export function serializeTheme(theme: ThemeConfig): string {
  return JSON.stringify(theme);
}

/**
 * Parses a JSON string into a ThemeConfig object
 * Requirements: 7.2, 7.3
 * 
 * @param json - The JSON string to parse
 * @returns ThemeParseResult indicating success with theme or failure with error
 */
export function parseTheme(json: string): ThemeParseResult {
  try {
    const parsed = JSON.parse(json);
    
    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Invalid theme: not an object' };
    }
    
    if (typeof parsed.name !== 'string' || parsed.name.trim() === '') {
      return { success: false, error: 'Invalid theme: missing or invalid name' };
    }
    
    if (!parsed.colors || typeof parsed.colors !== 'object') {
      return { success: false, error: 'Invalid theme: missing or invalid colors' };
    }
    
    if (typeof parsed.radius !== 'string') {
      return { success: false, error: 'Invalid theme: missing or invalid radius' };
    }
    
    // Validate all required color fields
    const requiredColors: (keyof ThemeColors)[] = [
      'primary', 'secondary', 'background', 'foreground',
      'card', 'cardForeground', 'border', 'muted', 'mutedForeground',
      'accent', 'accentForeground', 'destructive', 'destructiveForeground'
    ];
    
    for (const colorKey of requiredColors) {
      if (typeof parsed.colors[colorKey] !== 'string') {
        return { success: false, error: `Invalid theme: missing or invalid color '${colorKey}'` };
      }
    }
    
    return { success: true, theme: parsed as ThemeConfig };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error';
    return { success: false, error: `Failed to parse theme JSON: ${errorMessage}` };
  }
}


/**
 * CSS variable name mapping for theme colors
 */
const colorToCssVar: Record<keyof ThemeColors, string> = {
  primary: '--primary',
  secondary: '--secondary',
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  border: '--border',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
};

/**
 * Applies a theme configuration by updating CSS variables on the document root
 * Requirements: 7.2
 * 
 * @param theme - The theme configuration to apply
 */
export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  
  // Apply color variables
  for (const [colorKey, cssVar] of Object.entries(colorToCssVar)) {
    const colorValue = theme.colors[colorKey as keyof ThemeColors];
    if (colorValue) {
      root.style.setProperty(cssVar, colorValue);
    }
  }
  
  // Apply radius
  root.style.setProperty('--radius', theme.radius);
}

/**
 * Gets the current system color scheme preference
 * 
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
export function getSystemThemePreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Applies the dark mode class to the document based on mode
 * 
 * @param mode - The theme mode to apply
 */
export function applyThemeMode(mode: ThemeMode): void {
  const root = document.documentElement;
  const isDark = mode === 'dark' || (mode === 'system' && getSystemThemePreference() === 'dark');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Storage key for persisting theme mode preference
 */
export const THEME_MODE_STORAGE_KEY = 'memai-dashboard-theme-mode';

/**
 * Storage key for persisting custom theme configuration
 */
export const THEME_CONFIG_STORAGE_KEY = 'memai-dashboard-theme-config';
