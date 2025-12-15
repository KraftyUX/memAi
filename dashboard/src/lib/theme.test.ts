/**
 * Property-based tests for theme serialization
 * Uses fast-check for property-based testing
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { serializeTheme, parseTheme, ThemeConfig, ThemeColors } from './theme';

// Arbitrary for generating valid HSL color strings (format: "H S% L%")
const hslColorArbitrary = fc
  .tuple(
    fc.float({ min: 0, max: 360, noNaN: true }),
    fc.float({ min: 0, max: 100, noNaN: true }),
    fc.float({ min: 0, max: 100, noNaN: true })
  )
  .map(([h, s, l]) => `${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%`);

// Arbitrary for generating valid ThemeColors objects
const themeColorsArbitrary: fc.Arbitrary<ThemeColors> = fc.record({
  primary: hslColorArbitrary,
  secondary: hslColorArbitrary,
  background: hslColorArbitrary,
  foreground: hslColorArbitrary,
  card: hslColorArbitrary,
  cardForeground: hslColorArbitrary,
  border: hslColorArbitrary,
  muted: hslColorArbitrary,
  mutedForeground: hslColorArbitrary,
  accent: hslColorArbitrary,
  accentForeground: hslColorArbitrary,
  destructive: hslColorArbitrary,
  destructiveForeground: hslColorArbitrary,
});

// Arbitrary for generating valid radius strings (e.g., "0.5rem", "1rem")
const radiusArbitrary = fc
  .float({ min: 0, max: 2, noNaN: true })
  .map((r) => `${r.toFixed(2)}rem`);

// Arbitrary for generating valid theme names (non-empty strings)
const themeNameArbitrary = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim() !== '');

// Arbitrary for generating valid ThemeConfig objects
const themeConfigArbitrary: fc.Arbitrary<ThemeConfig> = fc.record({
  name: themeNameArbitrary,
  colors: themeColorsArbitrary,
  radius: radiusArbitrary,
});

describe('Theme Serialization - Property Tests', () => {
  /**
   * **Feature: dashboard-ux-elevation, Property 7: Theme serialization round-trip**
   * **Validates: Requirements 7.1, 7.2**
   *
   * For any valid ThemeConfig object, serializing to JSON and then parsing back
   * should produce an equivalent ThemeConfig object.
   */
  it('Property 7: Theme serialization round-trip', () => {
    fc.assert(
      fc.property(themeConfigArbitrary, (theme) => {
        // Serialize the theme to JSON
        const serialized = serializeTheme(theme);

        // Parse the JSON back to a ThemeConfig
        const parseResult = parseTheme(serialized);

        // Parsing should succeed
        if (!parseResult.success) {
          return false;
        }

        const parsed = parseResult.theme;

        // The parsed theme should be equivalent to the original
        const nameMatches = parsed.name === theme.name;
        const radiusMatches = parsed.radius === theme.radius;

        // Check all color fields match
        const colorKeys: (keyof ThemeColors)[] = [
          'primary',
          'secondary',
          'background',
          'foreground',
          'card',
          'cardForeground',
          'border',
          'muted',
          'mutedForeground',
          'accent',
          'accentForeground',
          'destructive',
          'destructiveForeground',
        ];

        const colorsMatch = colorKeys.every(
          (key) => parsed.colors[key] === theme.colors[key]
        );

        return nameMatches && radiusMatches && colorsMatch;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dashboard-ux-elevation, Property 8: Invalid theme handling**
   * **Validates: Requirements 7.3**
   *
   * For any invalid JSON string, the theme parser should not throw an exception
   * and should return an error result (success: false).
   */
  it('Property 8: Invalid theme handling', () => {
    // Arbitrary for generating invalid JSON strings
    const invalidJsonArbitrary = fc.oneof(
      // Completely invalid JSON syntax
      fc.string().filter((s) => {
        try {
          JSON.parse(s);
          return false; // Valid JSON, exclude it
        } catch {
          return true; // Invalid JSON, include it
        }
      }),
      // Valid JSON but not a valid theme (missing required fields)
      fc.constant('{}'),
      fc.constant('null'),
      fc.constant('[]'),
      fc.constant('123'),
      fc.constant('"just a string"'),
      // Object missing name
      fc.constant('{"colors": {}, "radius": "0.5rem"}'),
      // Object with empty name
      fc.constant('{"name": "", "colors": {}, "radius": "0.5rem"}'),
      // Object with whitespace-only name
      fc.constant('{"name": "   ", "colors": {}, "radius": "0.5rem"}'),
      // Object missing colors
      fc.constant('{"name": "test", "radius": "0.5rem"}'),
      // Object with invalid colors (not an object)
      fc.constant('{"name": "test", "colors": "invalid", "radius": "0.5rem"}'),
      // Object missing radius
      fc.constant('{"name": "test", "colors": {}}'),
      // Object with invalid radius (not a string)
      fc.constant('{"name": "test", "colors": {}, "radius": 123}'),
      // Object with missing color fields
      fc.constant('{"name": "test", "colors": {"primary": "0 0% 0%"}, "radius": "0.5rem"}'),
      // Object with invalid color field type
      fc.constant('{"name": "test", "colors": {"primary": 123, "secondary": "0 0% 0%", "background": "0 0% 0%", "foreground": "0 0% 0%", "card": "0 0% 0%", "cardForeground": "0 0% 0%", "border": "0 0% 0%", "muted": "0 0% 0%", "mutedForeground": "0 0% 0%", "accent": "0 0% 0%", "accentForeground": "0 0% 0%", "destructive": "0 0% 0%", "destructiveForeground": "0 0% 0%"}, "radius": "0.5rem"}')
    );

    fc.assert(
      fc.property(invalidJsonArbitrary, (invalidJson) => {
        // parseTheme should never throw an exception
        let result;
        try {
          result = parseTheme(invalidJson);
        } catch {
          // If an exception is thrown, the property fails
          return false;
        }

        // The result should indicate failure (success: false)
        return result.success === false && typeof result.error === 'string';
      }),
      { numRuns: 100 }
    );
  });
});
