import type { SlotCopy } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { Art } from '@/lib/art';
import { cn } from '@/lib/cn';

export type CardTone = 1 | 2 | 3 | 4 | 5;

type Props = {
  tone: CardTone;
  title: string;
  body: string;
  slot: SlotCopy;
  /** the rendered illustration; without it the slot stays a labelled placeholder */
  art?: Art;
  flipId: string;
  /** mirror = the copy that flies inside the hero; grid = the real in-flow card */
  mode: 'mirror' | 'grid';
};

// Literal class names: Tailwind only generates what it can read in source.
const TONE_CLASS: Record<CardTone, string> = {
  1: 'card-tone-1',
  2: 'card-tone-2',
  3: 'card-tone-3',
  4: 'card-tone-4',
  5: 'card-tone-5',
};

// A card has no height of its own on desktop: the grid row it sits in sizes
// it, and both grids give that row their wrapper's full height, so a mirror
// card and its in-flow twin are the same size by construction.
export function BenefitCard({ tone, title, body, slot, art, flipId, mode }: Props) {
  const hooks =
    mode === 'mirror'
      ? { 'data-hero-card': '', 'data-enter': '' }
      : { 'data-grid-card': '', 'data-reveal-mobile': '' };

  return (
    <article
      {...hooks}
      data-flip-id={flipId}
      className={cn(
        'benefit-card relative min-h-[300px] overflow-hidden rounded-card text-ink',
        TONE_CLASS[tone],
      )}
    >
      {/* data-card-inner: the choreography fades a mirror card's contents in
          after its box has arrived (S2d), so both inner layers carry it. */}
      <div data-card-inner className="relative z-10 flex h-full flex-col p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="type-h3 max-w-[16ch]">{title}</h3>
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-ink/10"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </div>
        <p className="type-body mt-3 max-w-[38ch] text-ink-muted">{body}</p>
      </div>
      {/* The 3D stills are transparent WebPs with their contact shadow baked in,
          so they sit straight on the card fill; the placeholder keeps its tint. */}
      <div data-card-inner className="absolute end-0 bottom-0 w-[64%]">
        <ImageSlot
          title={slot.title}
          description={slot.description}
          width={art?.width ?? 210}
          height={art?.height ?? 170}
          src={art?.src}
          sizes="(min-width: 1024px) 280px, 64vw"
          className={cn('rounded-none', !art && 'rounded-ss-card border-0 bg-ink/5 text-ink')}
        />
      </div>
    </article>
  );
}
