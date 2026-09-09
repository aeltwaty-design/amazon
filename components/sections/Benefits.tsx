import type { SiteContent } from '@/content/types';
import { BenefitCard, type CardTone } from '@/components/ui/BenefitCard';
import { SECTION_IDS } from '@/lib/anchors';

type GridProps = { content: SiteContent['benefits']; mode: 'mirror' | 'grid' };

// One grid definition rendered twice (hero mirror + in-flow section) so every
// flying card has, by construction, the exact size of its landing slot.
export function BenefitGrid({ content, mode }: GridProps) {
  const [first, second, third, fourth] = content.cards;
  const items: {
    title?: string;
    body?: string;
    slot: SiteContent['benefits']['illustrationSlot'];
    wide: boolean;
    tone: CardTone;
  }[] = [
    { ...first, wide: true, tone: 1 },
    { ...second, wide: false, tone: 2 },
    { ...third, wide: false, tone: 3 },
    { ...fourth, wide: false, tone: 4 },
    { slot: content.illustrationSlot, wide: true, tone: 5 },
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
