'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useNear } from '@/hooks/useNear';

// Same chunk the hero's Lottie already pulls, so this adds nothing to the wire.
const LottiePlayer = dynamic(() => import('@/components/ui/LottiePlayer'), { ssr: false });

type Props = { src: string; label: string };

/**
 * A "how to subscribe" step's illustration. Unlike the hero tiles, this *is*
 * the card's artwork rather than a flourish, so it mounts everywhere — but
 * only once its card is within 200px of the viewport, so the file is fetched
 * on approach rather than at page load, and it plays only while on screen.
 * The box is a fixed square reserved before the player arrives, so the card
 * never shifts. Reduced motion keeps the drawing and drops only the movement:
 * the same file, parked on its first frame.
 */
export function StepLottie({ src, label }: Props) {
  const [motionOk, setMotionOk] = useState<boolean | null>(null);
  const [box, near] = useNear<HTMLDivElement>();

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const sync = () => setMotionOk(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <div
      ref={box}
      role="img"
      aria-label={label}
      className="relative mx-auto aspect-square w-full max-w-[260px]"
    >
      {near && motionOk !== null ? (
        <LottiePlayer
          src={src}
          loop
          playback={motionOk ? 'in-view' : 'off'}
          className="size-full"
        />
      ) : null}
    </div>
  );
}
