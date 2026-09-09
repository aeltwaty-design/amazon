import type { SiteContent } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { SECTION_IDS } from '@/lib/anchors';
import { fmt } from '@/lib/i18n';

const LOGO_COUNT = 10;

// The row carries data-parallax; PageMotion owns the ±24px travel. The
// section clips horizontally so that travel never widens the page.
export function Brands({ content }: { content: SiteContent['brands'] }) {
  return (
    <section
      id={SECTION_IDS.brands}
      className="section scroll-mt-header overflow-x-clip bg-bg-surface"
    >
      <div className="gutter mx-auto max-w-wide text-center">
        <h2 data-reveal className="type-h2">
          {content.title}
        </h2>
        <p data-reveal className="type-body-lg mx-auto mt-4 max-w-[60ch] text-ink-muted">
          {content.subtitle}
        </p>
        <ul
          data-parallax="brands-row"
          className="mx-auto mt-12 grid max-w-content grid-cols-3 gap-4 sm:grid-cols-5 lg:gap-6"
        >
          {Array.from({ length: LOGO_COUNT }, (_, i) => (
            <li key={i}>
              <ImageSlot
                title={fmt(content.logoSlot, { n: i + 1 })}
                width={132}
                height={72}
                className="rounded-btn bg-bg-page"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
