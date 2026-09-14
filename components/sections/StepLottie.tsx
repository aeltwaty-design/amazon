'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Same chunk the hero's Lottie already pulls, so this adds nothing to the wire.
const Lottie = dynamic(() => import('lottie-react').then((m) => m.Lottie), { ssr: false });

type Props = { src: string; label: string };

/**
 * A "how to subscribe" step's illustration. Unlike the hero tiles, this *is*
 * the card's artwork rather than a flourish, so it mounts everywhere; the box
 * is a fixed square reserved before the player arrives, so the card never
 * shifts. Reduced motion keeps the drawing and drops only the movement: the
 * same file, parked on its first frame.
 */
export function StepLottie({ src, label }: Props) {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const sync = () => setMotionOk(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <div
      role="img"
      aria-label={label}
      className="relative mx-auto aspect-square w-full max-w-[260px]"
    >
      <Lottie src={src} loop={motionOk} autoplay={motionOk} className="size-full" />
    </div>
  );
}
