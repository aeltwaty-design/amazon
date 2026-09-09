import Image from 'next/image';
import type { SiteContent } from '@/content/types';
import { SECTION_IDS } from '@/lib/anchors';
import { BRANDS } from '@/lib/art';

// The row carries data-parallax; PageMotion owns the ±24px travel. The
// section clips horizontally so that travel never widens the page.
// Logos are SVGs, which next/image serves as-is; each tile fixes the height
// and lets the wordmark find its own width so nothing is stretched.
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
          {BRANDS.map((brand) => (
            <li
              key={brand.id}
              className="flex h-[72px] items-center justify-center rounded-btn bg-bg-page px-5 lg:h-[84px]"
            >
              <Image
                src={brand.src}
                alt={brand.name}
                width={brand.width}
                height={brand.height}
                className="h-auto max-h-8 w-auto max-w-full object-contain lg:max-h-9"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
