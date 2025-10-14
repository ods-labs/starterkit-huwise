'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'desktop';

const BREAKPOINT_MOBILE = 1024;

export function useBreakpoint(): {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isDesktop: boolean;
  width: number;
} {
  const [width, setWidth] = useState<number>(0);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWidth(currentWidth);
      setBreakpoint(currentWidth <= BREAKPOINT_MOBILE ? 'mobile' : 'desktop');
    };

    // Initialiser avec la largeur actuelle
    handleResize();

    // Écouter les changements de taille
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isDesktop: breakpoint === 'desktop',
    width
  };
}