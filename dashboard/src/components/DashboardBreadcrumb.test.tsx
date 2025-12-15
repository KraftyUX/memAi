/**
 * Unit tests for DashboardBreadcrumb component
 * Requirements: 5.3, 7.2
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DashboardBreadcrumb } from './DashboardBreadcrumb';

describe('DashboardBreadcrumb', () => {
  it('renders correct text content', () => {
    const { getByText } = render(<DashboardBreadcrumb />);
    
    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('has proper ARIA navigation landmark', () => {
    const { container } = render(<DashboardBreadcrumb />);
    
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav?.getAttribute('aria-label')).toBe('breadcrumb');
  });

  it('marks current page with aria-current', () => {
    const { getByText } = render(<DashboardBreadcrumb />);
    
    const dashboardItem = getByText('Dashboard');
    expect(dashboardItem.getAttribute('aria-current')).toBe('page');
    expect(dashboardItem.getAttribute('aria-disabled')).toBe('true');
  });

  it('Home link is focusable', () => {
    const { getByText } = render(<DashboardBreadcrumb />);
    
    const homeLink = getByText('Home');
    expect(homeLink.tagName.toLowerCase()).toBe('a');
    expect(homeLink.getAttribute('href')).toBe('/');
    expect(homeLink.getAttribute('tabIndex')).toBe('0');
  });

  it('has visible focus indicator styles', () => {
    const { getByText } = render(<DashboardBreadcrumb />);
    
    const homeLink = getByText('Home');
    expect(homeLink.className).toContain('focus:ring-2');
  });
});
