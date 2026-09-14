'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

// True once the element has come within `margin` of the viewport, and true
// from then on: what a lazily mounted player needs, since unmounting it again
// would only refetch. Without IntersectionObserver it is simply true.
export function useNear<T extends Element>(margin = '200px'): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin, near]);

  return [ref, near];
}
