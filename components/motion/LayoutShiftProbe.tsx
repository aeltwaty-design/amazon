'use client';

import { useEffect } from 'react';

type LayoutShift = PerformanceEntry & {
  value: number;
  hadRecentInput: boolean;
  sources?: { node?: Node | null }[];
};

// Development only. Scroll-driven transforms never register as layout shifts,
// so anything this logs is a real shift to fix (acceptance: CLS = 0).
export function LayoutShiftProbe() {
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;
    let total = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShift[]) {
        if (entry.hadRecentInput) continue;
        total += entry.value;
        console.warn(
          `[CLS] +${entry.value.toFixed(4)} (total ${total.toFixed(4)})`,
          entry.sources?.map((s) => s.node).filter(Boolean),
        );
      }
    });
    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      return;
    }
    return () => observer.disconnect();
  }, []);
  return null;
}
