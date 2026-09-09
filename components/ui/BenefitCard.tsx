import type { SlotCopy } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { cn } from '@/lib/cn';

export type CardTone = 1 | 2 | 3 | 4 | 5;

type Props = {
  tone: CardTone;
  title?: string;
  body?: string;
  slot: SlotCopy;
  wide?: boolean;
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

export function BenefitCard({ tone, title, body, slot, wide = false, flipId, mode }: Props) {
  const hooks =
    mode === 'mirror'
      ? { 'data-hero-card': '', 'data-enter': '' }
      : { 'data-grid-card': '', 'data-reveal-mobile': '' };

  return (
    <article
      {...hooks}
      data-flip-id={flipId}
      data-wide={wide}
      className={cn(
        'benefit-card relative overflow-hidden rounded-card text-ink',
        TONE_CLASS[tone],
        wide ? 'min-h-[260px] lg:col-span-3 lg:h-[320px]' : 'min-h-[300px] lg:h-[347px]',
      )}
    >
      <div className="relative z-10 flex h-full flex-col p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4">
          {title ? (
            <h3 className="type-h3 max-w-[16ch]">{title}</h3>
          ) : (
            <span className="sr-only">{slot.title}</span>
          )}
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
        {body ? <p className="type-body mt-3 max-w-[38ch] text-ink-muted">{body}</p> : null}
      </div>
      <div className={cn('absolute end-0 bottom-0', wide ? 'w-[38%] max-w-[420px]' : 'w-[58%]')}>
        <ImageSlot
          title={slot.title}
          description={slot.description}
          width={wide ? 420 : 210}
          height={wide ? 200 : 170}
          className="rounded-none rounded-ss-card border-0 bg-ink/5"
        />
      </div>
    </article>
  );
}
