import type { SiteContent } from '@/content/types';
import { PlanCard } from '@/components/ui/PlanCard';
import { SECTION_IDS } from '@/lib/anchors';
import type { Locale } from '@/lib/i18n';

type Props = { content: SiteContent['pricing']; locale: Locale };

export function Pricing({ content, locale }: Props) {
  return (
    <section
      id={SECTION_IDS.pricing}
      className="section scroll-mt-header overflow-x-clip bg-bg-surface"
    >
      <div className="gutter mx-auto flex max-w-content flex-col items-center">
        <h2 data-reveal className="type-h2 text-center">
          {content.title}
        </h2>
        <div className="mt-12 flex w-full justify-center">
          <PlanCard locale={locale} content={content} />
        </div>
      </div>
    </section>
  );
}
