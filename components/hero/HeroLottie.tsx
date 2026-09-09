'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// lottie-web is ~60 kB gzipped; the dynamic import keeps it out of the
// critical path and the box below reserves the space so nothing shifts.
const Lottie = dynamic(() => import('lottie-react').then((m) => m.Lottie), { ssr: false });

type Props = { src: string; label: string; className?: string; loop?: boolean };

export function HeroLottie({ src, label, className, loop = true }: Props) {
  // Reduced-motion preference is only knowable on the client; until then the
  // box is empty, which is the same thing a slow network would show.
  const [autoplay, setAutoplay] = useState<boolean | null>(null);

  useEffect(() => {
    setAutoplay(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  return (
    <div role="img" aria-label={label} className={cn('overflow-hidden', className)}>
      {autoplay === null ? null : (
        <Lottie src={src} loop={loop} autoplay={autoplay} className="size-full" />
      )}
    </div>
  );
}
