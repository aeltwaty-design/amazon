'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// The player (and lottie-web's light engine with it) is loaded on demand so it
// stays out of the critical path; the box below reserves the space so nothing
// shifts when it arrives. See components/ui/LottiePlayer.tsx.
const LottiePlayer = dynamic(() => import('@/components/ui/LottiePlayer'), { ssr: false });

type Crop = { x: number; y: number; w: number; h: number };

type Props = {
  src: string;
  label: string;
  className?: string;
  loop?: boolean;
  /** region of the composition to show, in its own units; omit for the whole canvas */
  crop?: Crop;
};

export function HeroLottie({ src, label, className, loop = true, crop }: Props) {
  // Reduced-motion preference is only knowable on the client; until then the
  // box is empty, which is the same thing a slow network would show.
  const [motionOk, setMotionOk] = useState<boolean | null>(null);

  useEffect(() => {
    setMotionOk(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // A custom viewBox crops without touching the file; the SVG renderer reads
  // it once at load, which is fine because `crop` is a build-time constant.
  const rendererSettings = crop
    ? {
        viewBoxSize: `${crop.x} ${crop.y} ${crop.w} ${crop.h}`,
        preserveAspectRatio: 'xMidYMid meet',
      }
    : undefined;

  return (
    <div role="img" aria-label={label} className={cn('overflow-hidden', className)}>
      {motionOk === null ? null : (
        // Plays while the headline is on screen and pauses once the hero has
        // scrolled out; reduced motion holds the first frame.
        <LottiePlayer
          src={src}
          loop={loop}
          playback={motionOk ? 'in-view' : 'off'}
          rendererSettings={rendererSettings}
          className="size-full"
        />
      )}
    </div>
  );
}
