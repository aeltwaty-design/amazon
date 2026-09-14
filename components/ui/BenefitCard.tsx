import type { SlotCopy } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { BenefitArt } from '@/lib/art';
import { cn } from '@/lib/cn';

export type CardTone = 1 | 2 | 3 | 4 | 5;

type Props = {
  tone: CardTone;
  title: string;
  body: string;
  slot: SlotCopy;
  /** what the card shows at its foot; without it the slot stays a labelled placeholder */
  art?: BenefitArt;
  flipId: string;
  /** mirror = the copy that flies inside the hero; grid = the real in-flow card */
  mode: 'mirror' | 'grid';
  /**
   * How a grid card arrives below 1024: `reveal` through PageMotion's batch,
   * `hero` lifted by the hero's own scroll (the first card, M6 in MOTION.md).
   * One owner per card: PageMotion's reveal overwrites every tween on its
   * targets, so a card the hero animates must never be in its batch.
   */
  entrance?: 'reveal' | 'hero';
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
// card and its in-flow twin are the same size by construction. A phone card
// only raises the stacked minimum, so the copy and the phone never meet.
export function BenefitCard({
  tone,
  title,
  body,
  slot,
  art,
  flipId,
  mode,
  entrance = 'reveal',
}: Props) {
  const hooks =
    mode === 'mirror'
      ? { 'data-hero-card': '', 'data-enter': '' }
      : entrance === 'hero'
        ? { 'data-grid-card': '', 'data-hero-lift': '' }
        : { 'data-grid-card': '', 'data-reveal-mobile': '' };
  const phone = art?.kind === 'phone';

  return (
    <article
      {...hooks}
      data-flip-id={flipId}
      className={cn(
        'benefit-card relative overflow-hidden rounded-card text-ink',
        // stacked, a phone card holds the copy plus a phone box 60% of its own height
        phone ? 'min-h-[500px]' : 'min-h-[300px]',
        TONE_CLASS[tone],
      )}
    >
      {/* data-card-inner: the choreography fades a mirror card's contents in
          after its box has arrived (S2d), so both inner layers carry it. */}
      <div
        data-card-inner
        className="relative z-10 flex h-full flex-col items-center p-6 text-center lg:p-7"
      >
        <h3 className="type-h3 max-w-[16ch]">{title}</h3>
        <p className="type-body mt-3 max-w-[38ch] text-ink-muted">{body}</p>
      </div>
      {/* The 3D stills are transparent WebPs with their contact shadow baked in,
          so they sit straight on the card fill; the placeholder keeps its tint.
          A phone is already cropped to its top three quarters (npm run
          render:phone) and fits bottom-centred into a box that is a share of
          the card's height as well as its width, so it scales with the card and
          stays clear of the copy on short cards; the rounded corners never
          reach it, and below lg the box is capped in px because a stacked card
          can be far wider than a phone. */}
      <div
        data-card-inner
        className={
          phone
            ? 'absolute inset-x-0 bottom-0 mx-auto h-[68%] w-[64%] max-w-[240px] lg:h-[76%] lg:w-[72%] lg:max-w-none'
            : 'absolute end-0 bottom-0 w-[64%]'
        }
      >
        <ImageSlot
          title={slot.title}
          description={slot.description}
          width={art?.width ?? 210}
          height={art?.height ?? 170}
          src={art?.src}
          sizes={phone ? '(min-width: 1024px) 250px, 240px' : '(min-width: 1024px) 280px, 64vw'}
          className={cn(
            'rounded-none',
            phone && 'h-full w-full object-contain object-bottom',
            !art && 'rounded-ss-card border-0 bg-ink/5 text-ink',
          )}
        />
      </div>
    </article>
  );
}
