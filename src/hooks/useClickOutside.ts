/**
 * useClickOutside Hook
 * Detects clicks outside of a referenced element and triggers a callback
 */

import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Hook to detect clicks outside of a referenced element
 * @param ref - React ref object for the element to monitor
 * @param handler - Callback function to execute when clicking outside
 * @param enabled - Whether the hook should be active (default: true)
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Use capture phase to ensure we catch the event before it bubbles
    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);

    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
    };
  }, [ref, handler, enabled]);
};

