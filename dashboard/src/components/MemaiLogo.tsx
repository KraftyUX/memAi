/**
 * MemaiLogo - Animated SVG logo representing neural/memory activity
 * Requirements: 3.1, 3.2, 3.3, 3.4, 7.1
 */

import { useEffect, useState } from 'react';

export interface MemaiLogoProps {
  /** Additional CSS classes */
  className?: string;
  /** Logo size in pixels (default: 40) */
  size?: number;
  /** Enable/disable animation (default: true, respects prefers-reduced-motion) */
  animated?: boolean;
}

/**
 * Hook to detect user's reduced motion preference
 */
function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Animated memAI logo with orbiting neural nodes
 * - Central brain/memory node
 * - 5 orbiting neural nodes with connecting lines
 * - Smooth CSS animation (respects prefers-reduced-motion)
 */
export function MemaiLogo({ 
  className = '', 
  size = 40, 
  animated = true 
}: MemaiLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  // Node positions for 5 orbiting nodes (evenly distributed)
  const orbitRadius = 14;
  const nodeCount = 5;
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
    return {
      cx: 20 + orbitRadius * Math.cos(angle),
      cy: 20 + orbitRadius * Math.sin(angle),
      delay: i * 0.3,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="memAI logo: animated neural network representing AI memory activity"
      data-testid="memai-logo"
      data-animated={shouldAnimate}
    >
      <title>memAI Logo</title>
      <desc>An animated logo showing a central memory node with orbiting neural connections</desc>
      
      <style>
        {`
          @keyframes orbit {
            from { transform: rotate(0deg); transform-origin: 20px 20px; }
            to { transform: rotate(360deg); transform-origin: 20px 20px; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .memai-orbit-group {
            animation: ${shouldAnimate ? 'orbit 8s linear infinite' : 'none'};
          }
          .memai-node {
            animation: ${shouldAnimate ? 'pulse 2s ease-in-out infinite' : 'none'};
          }
        `}
      </style>

      {/* Orbit path (subtle guide) */}
      <circle
        cx="20"
        cy="20"
        r={orbitRadius}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
      />

      {/* Orbiting nodes group */}
      <g className="memai-orbit-group">
        {/* Connecting lines from center to nodes */}
        {nodes.map((node, i) => (
          <line
            key={`line-${i}`}
            x1="20"
            y1="20"
            x2={node.cx}
            y2={node.cy}
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
        ))}

        {/* Orbiting neural nodes */}
        {nodes.map((node, i) => (
          <circle
            key={`node-${i}`}
            cx={node.cx}
            cy={node.cy}
            r="3"
            fill="currentColor"
            className="memai-node"
            style={{ animationDelay: `${node.delay}s` }}
          />
        ))}
      </g>

      {/* Central brain/memory node */}
      <circle
        cx="20"
        cy="20"
        r="6"
        fill="currentColor"
      />
      
      {/* Inner highlight for depth */}
      <circle
        cx="18"
        cy="18"
        r="2"
        fill="currentColor"
        fillOpacity="0.3"
      />
    </svg>
  );
}

export default MemaiLogo;
