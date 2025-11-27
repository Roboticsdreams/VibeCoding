"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design with media queries
 * @param query - CSS media query string, e.g. '(max-width: 768px)'
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for server-side rendering
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Check if window is available (browser environment)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set the initial value
      setMatches(media.matches);
      
      // Define listener function
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add event listener
      media.addEventListener('change', listener);
      
      // Clean up
      return () => {
        media.removeEventListener('change', listener);
      };
    }
  }, [query]);
  
  return matches;
}
