import type { SiteContent } from '@/content/types';
import { BenefitCard, type CardTone } from '@/components/ui/BenefitCard';
import { SECTION_IDS } from '@/lib/anchors';
import { ART } from '@/lib/art';

type GridProps = { content: SiteContent['benefits']; mode: 'mirror' | 'grid' };

// Card fills in row order: purple 50 (the tone tile 1 carries into the
// hand-over, see HeroChoreography S2b), yellow 50, purple 100.
const TONES: readonly CardTone[] = [1, 2, 3];

// The cards sit in the order they are written, card 2 in the middle column,
// in both languages: RTL fills the same three columns from the other end, so
// the middle one holds the same card either way. The hand-over pairs each
// flying hero card with the grid card at the same index (HeroChoreography,
// Flip.fit) and measures the live box, so the lead card lands in the first
// column — travelling there from the bar, which is centred on the viewport,
// is the one sideways move in the sequence. Stacked (below 1024) the first
// card is the hero's to lift as it scrolls out (M6); the other two reveal in
// flow like every other section.
//
// One grid definition rendered twice (hero mirror + in-flow section) so every
// flying card has, by construction, the exact size of its landing slot: three
// cards beside each other that fill whatever height their wrapper gives them
// (one viewport less the section rhythm on desktop, see `Benefits` and
// `HeroCards`; their minimum height when stacked below 1024).
export function BenefitGrid({ content, mode }: GridProps) {
  return (
    <div
      data-benefits-grid={mode === 'grid' ? '' : undefined}
      className="grid grid-cols-1 gap-[14px] lg:flex-1 lg:auto-rows-fr lg:grid-cols-3"
    >
      {content.cards.map((card, index) => (
        <BenefitCard
          key={index}
          mode={mode}
          flipId={`benefit-${index}`}
          tone={TONES[index] ?? 1}
          title={card.title}
          body={card.body}
          slot={card.slot}
          art={ART.benefits.cards[index]}
          entrance={index === 0 ? 'hero' : 'reveal'}
        />
      ))}
    </div>
  );
}

// One viewport tall on desktop with the section rhythm as its padding, so the
// three cards fill what is left; the heading serves the outline and the nav
// anchor only. `HeroCards` wraps the mirror grid in the same box.
export function Benefits({ content }: { content: SiteContent['benefits'] }) {
  return (
    <section
      id={SECTION_IDS.benefits}
      data-benefits
      className="section relative z-0 scroll-mt-header bg-bg-page lg:flex lg:min-h-svh lg:flex-col"
    >
      <div className="gutter mx-auto w-full max-w-content lg:flex lg:flex-1 lg:flex-col">
        <h2 className="sr-only">{content.title}</h2>
        <BenefitGrid content={content} mode="grid" />
      </div>
    </section>
  );
}
