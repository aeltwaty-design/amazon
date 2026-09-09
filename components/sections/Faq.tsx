import type { SiteContent } from '@/content/types';
import { FaqAccordion } from '@/components/ui/Faq';
import { SECTION_IDS } from '@/lib/anchors';

export function Faq({ content }: { content: SiteContent['faq'] }) {
  return (
    <section id={SECTION_IDS.faq} className="section scroll-mt-header bg-bg-page">
      <div className="gutter mx-auto grid max-w-content gap-10 lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-20">
        {/* self-start is what lets a grid child stick; without it the track stretches. */}
        <div data-reveal className="self-start lg:sticky lg:top-[calc(var(--spacing-header)+24px)]">
          <h2 className="type-h2">{content.title}</h2>
          <p className="type-body-lg mt-4 text-ink-muted">{content.description}</p>
        </div>
        <div data-reveal>
          <FaqAccordion items={content.items} />
        </div>
      </div>
    </section>
  );
}
