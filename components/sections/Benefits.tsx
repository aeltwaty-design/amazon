import type { SiteContent } from '@/content/types';
import { BenefitCard, type CardTone } from '@/components/ui/BenefitCard';
import { SECTION_IDS } from '@/lib/anchors';
import { ART, type Art } from '@/lib/art';

type GridProps = { content: SiteContent['benefits']; mode: 'mirror' | 'grid' };

// One grid definition rendered twice (hero mirror + in-flow section) so every
// flying card has, by construction, the exact size of its landing slot.
export function BenefitGrid({ content, mode }: GridProps) {
  const [first, second, third, fourth] = content.cards;
  const items: {
    title?: string;
    body?: string;
    slot: SiteContent['benefits']['illustrationSlot'];
    art: Art;
    wide: boolean;
    tone: CardTone;
  }[] = [
    { ...first, art: ART.benefits.cards[0], wide: true, tone: 1 },
    { ...second, art: ART.benefits.cards[1], wide: false, tone: 2 },
    { ...third, art: ART.benefits.cards[2], wide: false, tone: 3 },
    { ...fourth, art: ART.benefits.cards[3], wide: false, tone: 4 },
    { slot: content.illustrationSlot, art: ART.benefits.wide, wide: true, tone: 5 },
  ];

  return (
    <div
      data-benefits-grid={mode === 'grid' ? '' : undefined}
      className="grid grid-cols-1 gap-[14px] lg:grid-cols-3"
    >
      {items.map((item, index) => (
        <BenefitCard
          key={index}
          mode={mode}
          flipId={`benefit-${index}`}
          tone={item.tone}
          wide={item.wide}
          title={item.title}
          body={item.body}
          slot={item.slot}
          art={item.art}
        />
      ))}
    </div>
  );
}

export function Benefits({ content }: { content: SiteContent['benefits'] }) {
  return (
    <section
      id={SECTION_IDS.benefits}
      data-benefits
      className="section relative z-0 scroll-mt-header bg-bg-page"
    >
      <div className="gutter mx-auto max-w-content">
        <h2 data-reveal className="type-h2 mb-10 text-center lg:mb-14">
          {content.title}
        </h2>
        <BenefitGrid content={content} mode="grid" />
      </div>
    </section>
  );
}
