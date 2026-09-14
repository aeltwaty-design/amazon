'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { LottieHandle } from 'lottie-react';
import type { TileMotion } from '@/lib/art';

// Loaded on demand like the headline's Lottie (HeroLottie); the same chunk
// serves both, so this costs nothing extra on the wire.
const LottiePlayer = dynamic(() => import('@/components/ui/LottiePlayer'), { ssr: false });

/**
 * When a tile plays its animation instead of showing its label: a hover-capable
 * desktop with motion allowed. `.hero-tile-motion` in styles/globals.css keys
 * off the same query, so what is mounted and what is shown always agree.
 */
export const TILE_MOTION_QUERY =
  '(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)';

type Props = { motion: TileMotion };

// The animation a tile cross-fades to on hover, in place of its label. Nothing
// is fetched or rendered until the query matches, so touch devices and
// reduced-motion users get the still and the label exactly as before. Hover is
// read from the <li>, the element the CSS :hover rules use, so the playhead and
// the cross-fade agree: enter restarts from frame 0, leave pauses, and a
// cross-fade that ends hidden pauses too (the pin turns the tiles' pointer
// events off while a pointer may still sit on one).
export function TileLottie({ motion }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<LottieHandle>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(TILE_MOTION_QUERY);
    const sync = () => setActive(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = box.current;
    const tile = el?.closest<HTMLElement>('[data-hero-tile]');
    if (!active || !el || !tile) return;
    const restart = () => {
      handle.current?.seek(0);
      handle.current?.play();
    };
    const pause = () => handle.current?.pause();
    const settled = () => {
      if (getComputedStyle(el).opacity === '0') pause();
    };
    tile.addEventListener('pointerenter', restart);
    tile.addEventListener('pointerleave', pause);
    el.addEventListener('transitionend', settled);
    return () => {
      tile.removeEventListener('pointerenter', restart);
      tile.removeEventListener('pointerleave', pause);
      el.removeEventListener('transitionend', settled);
    };
  }, [active]);

  // A pointer already on the tile when the file arrives should not have to
  // leave and come back.
  const ready = () => {
    if (box.current?.closest('[data-hero-tile]')?.matches(':hover')) {
      handle.current?.seek(0);
      handle.current?.play();
    }
  };

  const { x, y, w, h } = motion.crop;
  return (
    <div ref={box} aria-hidden className="hero-tile-motion absolute inset-0 p-[8%]">
      {active ? (
        <LottiePlayer
          lottieRef={handle}
          src={motion.src}
          loop
          playback="off"
          subscriptions={{ ready }}
          rendererSettings={{
            viewBoxSize: `${x} ${y} ${w} ${h}`,
            preserveAspectRatio: 'xMidYMid meet',
          }}
          className="size-full"
        />
      ) : null}
    </div>
  );
}
