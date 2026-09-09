'use client';

import { useEffect, useState } from 'react';

// A string that changes when the viewport has settled at a new size, used as
// a dependency to rebuild ScrollTriggers. Height-only changes are ignored on
// touch devices: the address bar showing and hiding fires resize on every
// scroll, and rebuilding the hero mid-scroll would make the cards flicker.
export function useViewportKey(debounceMs: number): string {
  const [key, setKey] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const precise = window.matchMedia('(hover: hover)').matches;
    const read = () =>
      precise ? `${window.innerWidth}x${window.innerHeight}` : `${window.innerWidth}`;
    let last = read();
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const next = read();
        if (next !== last) {
          last = next;
          setKey(next);
        }
      }, debounceMs);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [debounceMs]);

  return key;
}
