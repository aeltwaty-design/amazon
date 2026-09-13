import Image from 'next/image';
import type { SiteContent } from '@/content/types';
import { ART } from '@/lib/art';
import { cn } from '@/lib/cn';

type Props = { tiles: SiteContent['hero']['tiles'] };

// Literal class names: Tailwind only generates what it can read in source.
// Design-specified tile washes: purple 50 and yellow 50 alternating.
// Independent of the Benefits cards' tones.
const TONE_CLASS = ['card-tone-1', 'card-tone-2', 'card-tone-1', 'card-tone-2', 'card-tone-1'];

// noon One's marketplace row: five square tiles under the CTA, an illustration
// at rest and the sector name on hover. Layout, hover and the mobile strip are
// in styles/globals.css (`.hero-tile*`); the choreography owns `transform` on
// each <li> (gather into a pile) while hover moves the inner surface with
// `translate`, so the two never fight. The label is always in the DOM, so
// assistive tech reads the sector names whether or not they are shown; its
// type scales with the tile (`.hero-tile-label` in globals.css).
export function HeroTiles({ tiles }: Props) {
  return (
    <ul data-hero-tiles className="hero-tiles mt-6 w-full lg:mt-6">
      {tiles.map((tile, i) => {
        const art = ART.tiles[tile.id];
        return (
          <li key={tile.id} data-hero-tile data-enter className={cn('hero-tile', TONE_CLASS[i])}>
            <div className="hero-tile-surface absolute inset-0 flex flex-col overflow-hidden rounded-tile">
              <div
                aria-hidden
                className="hero-tile-art relative min-h-0 flex-1 p-[12%] lg:absolute lg:inset-0"
              >
                <Image
                  src={art.src}
                  alt=""
                  width={art.width}
                  height={art.height}
                  sizes="(min-width: 1024px) 216px, 160px"
                  className="size-full object-contain"
                />
              </div>
              <div className="hero-tile-label px-[4%] pb-3 text-center lg:absolute lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-[4%]">
                <span className="text-ink">{tile.label}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
