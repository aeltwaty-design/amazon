import Image from 'next/image';
import type { SiteContent } from '@/content/types';
import { TileLottie } from '@/components/hero/TileLottie';
import { ART, TILE_MOTION } from '@/lib/art';
import { cn } from '@/lib/cn';

type Props = { tiles: SiteContent['hero']['tiles'] };

// Literal class names: Tailwind only generates what it can read in source.
// Design-specified tile washes: purple 50 and yellow 50 alternating.
// Independent of the Benefits cards' tones.
const TONE_CLASS = ['card-tone-1', 'card-tone-2', 'card-tone-1', 'card-tone-2', 'card-tone-1'];

// The reference design's marketplace row: five square tiles under the CTA, an illustration
// at rest and the sector name on hover (or, for a tile in TILE_MOTION, its
// animation; see TileLottie). The row exists from 1024 up only — a phone has
// no room for it under the headline and hands the scroll to the first benefit
// card instead (M6 in MOTION.md). Layout and hover are in styles/globals.css
// (`.hero-tile*`); the choreography owns `transform` on each <li> (gather
// into a pile) while hover moves the inner surface with `translate`, so the
// two never fight. The label is always in the DOM, so assistive tech reads
// the sector names whether or not they are shown; its type scales with the
// tile (`.hero-tile-label` in globals.css).
export function HeroTiles({ tiles }: Props) {
  return (
    <ul data-hero-tiles className="hero-tiles mt-6 w-full lg:mt-6">
      {tiles.map((tile, i) => {
        const art = ART.tiles[tile.id];
        const motion = TILE_MOTION[tile.id];
        return (
          <li
            key={tile.id}
            data-hero-tile
            data-enter
            data-motion={motion ? '' : undefined}
            className={cn('hero-tile', TONE_CLASS[i])}
          >
            <div className="hero-tile-surface absolute inset-0 overflow-hidden rounded-tile">
              <div aria-hidden className="hero-tile-art absolute inset-0 p-[12%]">
                <Image
                  src={art.src}
                  alt=""
                  width={art.width}
                  height={art.height}
                  sizes="216px"
                  className="size-full object-contain"
                />
              </div>
              {motion ? <TileLottie motion={motion} /> : null}
              <div className="hero-tile-label absolute inset-0 flex items-center justify-center p-[4%] text-center">
                {/* one word per line: the label is set large enough that a
                    two-word name needs both lines (whitespace-pre-line) */}
                <span className="whitespace-pre-line text-ink">
                  {tile.label.split(' ').join('\n')}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
