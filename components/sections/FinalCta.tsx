import type { SiteContent } from '@/content/types';
import { Button } from '@/components/ui/Button';
import { SECTION_IDS } from '@/lib/anchors';

export function FinalCta({ content }: { content: SiteContent['finalCta'] }) {
  return (
    <section data-surface="dark" className="surface-hero section text-ink-on-dark">
      <div className="gutter mx-auto flex max-w-content flex-col items-center text-center">
        <h2 data-reveal className="type-h2">
          {content.title}
        </h2>
        <p data-reveal className="type-body-lg mt-4 max-w-[52ch] text-ink-on-dark-muted">
          {content.body}
        </p>
        <div data-reveal className="mt-8">
          <Button href={`#${SECTION_IDS.flow}`} variant="primary-on-dark">
            {content.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
