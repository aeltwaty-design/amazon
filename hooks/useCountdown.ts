'use client';

import { useEffect, useState } from 'react';

const remainingAt = (startedAt: number, seconds: number) =>
  Math.max(0, Math.ceil((startedAt + seconds * 1000 - Date.now()) / 1000));

// Wall-clock, not decrement: background tabs throttle intervals to ≥1s, so
// counting ticks drifts; recomputing from startedAt cannot.
export function useCountdown(seconds: number, startedAt: number): number {
  const [remaining, setRemaining] = useState(() => remainingAt(startedAt, seconds));

  useEffect(() => {
    setRemaining(remainingAt(startedAt, seconds));
    const id = setInterval(() => {
      const next = remainingAt(startedAt, seconds);
      setRemaining(next);
      if (next === 0) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [startedAt, seconds]);

  return remaining;
}
