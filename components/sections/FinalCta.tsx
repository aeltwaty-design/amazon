import type { SiteContent } from '@/content/types';
import { AppMockup } from '@/components/ui/AppMockup';
import { Button } from '@/components/ui/Button';
import { SECTION_IDS } from '@/lib/anchors';
import { ABOUT_MOCKUP } from '@/lib/art';
import type { Locale } from '@/lib/i18n';

type Props = { content: SiteContent['finalCta']; locale: Locale };

/** the phone frame's own centre in the composition, as a share of its height */
const FRAME_CENTRE =
  (100 * (ABOUT_MOCKUP.layout.frame.y + ABOUT_MOCKUP.layout.frame.h / 2)) / ABOUT_MOCKUP.layout.h;

// The closing band follows the UI8 "Aganta" kit's "Download The App Now!"
// section (node 6818:22068): one flat violet field 1440 × 500, the copy held
// against the inline start (the node sets its text block at x 100 — 7 % — and
// 615 wide), and a phone standing right of centre, tall enough that the band's
// top and bottom edges cut it rather than contain it (the node's frame runs
// from y −69 to 563 inside a 500-tall band). Two things the node does are not
// carried over: its band is an inset rounded rectangle, while every section on
// this page is full-bleed, and its quick-action row is a pair of app-store
// badges, while this page has no store links to give and closes on the
// subscribe flow — so the single existing CTA stays.
//
// The band is 500 tall and symmetrically padded in the node, so the page's
// 104/149 section rhythm is levelled off at lg: under an uneven block padding
// the flex centre lands 23 px above the band's own, which would cut the phone
// deeply at the top and not at all at the bottom. Level, at 40 % of the
// container, the phone stands 114 % of the band's height — the node's ratio.
//
// The phone is the composition the About section already uses, and this is its
// second appearance, so here it is decoration: hidden from assistive tech and
// captioned with an empty alt. Below lg it is dropped altogether, where it
// would crowd out the words it exists to frame.
export function FinalCta({ content, locale }: Props) {
  return (
    <section
      data-surface="dark"
      className="section relative isolate flex items-center overflow-hidden bg-brand text-ink-on-dark lg:min-h-[500px] lg:pb-[104px]"
    >
      <div className="gutter relative mx-auto w-full max-w-content">
        <div className="flex flex-col items-center text-center lg:max-w-[52%] lg:items-start lg:text-start">
          <h2 data-reveal className="type-h2">
            {content.title}
          </h2>
          {/* White, not the muted on-dark ink: that token is 4.0:1 on Primary
              600, and this is body copy, which owes 4.5:1. */}
          <p data-reveal className="type-body-lg mt-4 max-w-[46ch]">
            {content.body}
          </p>
          <div data-reveal className="mt-8">
            <Button href={`#${SECTION_IDS.flow}`} variant="primary-on-dark">
              {content.cta}
            </Button>
          </div>
        </div>
        {/* Centred on the phone, not on the composition: the glow leaves a
            tail of empty box below the frame, so centring the box would hang
            the phone 15 px high and cut it unevenly. */}
        <div
          aria-hidden
          className="pointer-events-none absolute end-0 top-1/2 hidden w-[40%] lg:block"
          style={{ translate: `0 -${FRAME_CENTRE}%` }}
        >
          <AppMockup locale={locale} label="" className="max-w-none" />
        </div>
      </div>
    </section>
  );
}
