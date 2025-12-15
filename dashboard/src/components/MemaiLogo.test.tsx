/**
 * Unit tests for MemaiLogo component
 * Requirements: 3.1, 3.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemaiLogo } from './MemaiLogo';

// Mock matchMedia for reduced motion testing
function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(cb);
        if (idx > -1) listeners.splice(idx, 1);
      },
      dispatchEvent: vi.fn(),
    })),
  });

  return {
    triggerChange: (newMatches: boolean) => {
      listeners.forEach(cb => cb({ matches: newMatches } as MediaQueryListEvent));
    },
  };
}

describe('MemaiLogo', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders SVG with correct structure', () => {
    const { getByTestId, container } = render(<MemaiLogo />);
    
    const logo = getByTestId('memai-logo');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName.toLowerCase()).toBe('svg');
    
    // Check for central node
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(6); // 1 orbit path + 5 nodes + 1 central + 1 highlight
    
    // Check for connecting lines
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(5); // 5 connecting lines
  });

  it('applies custom size', () => {
    const { getByTestId } = render(<MemaiLogo size={64} />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.getAttribute('width')).toBe('64');
    expect(logo.getAttribute('height')).toBe('64');
  });

  it('applies custom className', () => {
    const { getByTestId } = render(<MemaiLogo className="custom-class" />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.classList.contains('custom-class')).toBe(true);
  });

  it('has proper ARIA attributes for accessibility', () => {
    const { getByTestId, container } = render(<MemaiLogo />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.getAttribute('role')).toBe('img');
    expect(logo.getAttribute('aria-label')).toContain('memAI logo');
    
    // Check for title and desc elements
    const title = container.querySelector('title');
    const desc = container.querySelector('desc');
    expect(title).toBeInTheDocument();
    expect(desc).toBeInTheDocument();
  });

  it('animates by default when reduced motion is not preferred', () => {
    mockMatchMedia(false);
    const { getByTestId } = render(<MemaiLogo />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.getAttribute('data-animated')).toBe('true');
  });

  it('disables animation when user prefers reduced motion', () => {
    mockMatchMedia(true);
    const { getByTestId } = render(<MemaiLogo />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.getAttribute('data-animated')).toBe('false');
  });

  it('disables animation when animated prop is false', () => {
    mockMatchMedia(false);
    const { getByTestId } = render(<MemaiLogo animated={false} />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.getAttribute('data-animated')).toBe('false');
  });

  it('uses default size of 40', () => {
    const { getByTestId } = render(<MemaiLogo />);
    
    const logo = getByTestId('memai-logo');
    expect(logo.getAttribute('width')).toBe('40');
    expect(logo.getAttribute('height')).toBe('40');
  });
});
