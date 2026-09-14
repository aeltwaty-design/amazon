import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { SiteContent } from '@/content/types';
import { SECTION_IDS } from '@/lib/anchors';
import { BRAND_ROWS } from '@/lib/art';

// Each row repeats its six logos COPIES times so it is wider than any viewport
// plus the marquee travel (--brands-marquee-travel, PageMotion): the tiles are
// square now and so much narrower, which takes five copies — 30 tiles are
// 3840px at ≥1024 (104 + 24 gap) and 3120px below (88 + 16), against a
// 2560px viewport and 480px of travel. Flex centring makes the surplus
// overflow both edges equally, so the resting and reduced-motion layouts are
// symmetric, and the section's overflow-x-clip hides it without a scroll
// container. Only the middle copy, the one on screen at rest, is exposed to
// assistive tech. Tile widths are fixed so nothing is ever measured.
const COPIES = 5;
const EXPOSED_COPY = Math.floor(COPIES / 2);
// Below lg the outer two copies are not rendered: three copies (18 tiles,
// ~1856px) already overflow a 360px viewport by ~750px a side against 240px
// of travel, and a phone has no use for 60 images in two rows.

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
      </div>
      {/* block children, not grid items: a grid track would grow to the row's
          3576px content width and push the overflow to one side; a block-level
          flex row is exactly the section wide, so it overflows both sides. */}
      <div className="mt-12 space-y-4 lg:space-y-6">
        {BRAND_ROWS.map((row, index) => (
          <ul
            key={index}
            data-marquee={index % 2 ? 'reverse' : 'forward'}
            className="flex justify-center gap-4 lg:gap-6"
          >
            {Array.from({ length: COPIES }, (_, copy) =>
              row.map((brand) => {
                const exposed = copy === EXPOSED_COPY;
                return (
                  <li
                    key={`${copy}-${brand.id}`}
                    aria-hidden={exposed ? undefined : true}
                    className={cn(
                      'flex size-[88px] flex-none items-center justify-center rounded-btn bg-bg-page lg:size-[104px]',
                      // a phone needs three copies to overflow both edges by more than the travel; the outer two are desktop's
                      (copy === 0 || copy === COPIES - 1) && 'hidden lg:flex',
                    )}
                  >
                    <Image
                      src={brand.src}
                      alt={exposed ? brand.name : ''}
                      width={brand.width}
                      height={brand.height}
                      sizes="(min-width: 1024px) 104px, 88px"
                      // the section clips horizontally, so a lazy loader never sees a tile
                      // outside the viewport and it would pop in as it slides on; the twelve
                      // files are ~3 kB each
                      loading="eager"
                      // the canvas already holds the logo at its normalised size and is white, like
                      // the tile, so the image simply fills the square
                      className="size-full object-contain"
                    />
                  </li>
                );
              }),
            )}
          </ul>
        ))}
      </div>
    </section>
  );
}
