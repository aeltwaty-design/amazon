'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// lottie-web is ~60 kB gzipped; the dynamic import keeps it out of the
// critical path and the box below reserves the space so nothing shifts.
const Lottie = dynamic(() => import('lottie-react').then((m) => m.Lottie), { ssr: false });

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
  const [autoplay, setAutoplay] = useState<boolean | null>(null);

  useEffect(() => {
    setAutoplay(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
      {autoplay === null ? null : (
        <Lottie
          src={src}
          loop={loop}
          autoplay={autoplay}
          rendererSettings={rendererSettings}
          className="size-full"
        />
      )}
    </div>
  );
}
