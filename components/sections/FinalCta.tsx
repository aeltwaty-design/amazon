import type { SiteContent } from '@/content/types';
import { AppMockup } from '@/components/ui/AppMockup';
import { Button } from '@/components/ui/Button';
import { SECTION_IDS } from '@/lib/anchors';
import { APP_MAP_SCREEN } from '@/lib/art';
import type { Locale } from '@/lib/i18n';

type Props = { content: SiteContent['finalCta']; locale: Locale };

/**
 * The node's two phones, in its own units (a 1440 × 500 band): the width of
 * each, how far its inline end sits inside the content column's end, and how
 * far its top is below the clip box's. The front phone starts 69 above the
 * band, the one behind it 41 below the band's top edge.
 */
const OVERHANG = 80;
const PHONES = [
  { key: 'back', width: 282, inset: -61, top: OVERHANG + 41, screen: APP_MAP_SCREEN },
  { key: 'front', width: 311, inset: 80, top: OVERHANG - 69, screen: undefined },
] as const;

// The closing band is the UI8 "Aganta" kit's "Download The App Now!" section
// (node 6818:22068): a near-black field lit violet from its inline-start top
// corner (`.surface-band`), the copy against that corner, and two phones
// standing at the far end — the front one rising clear of the band's top edge
// and both cut off flush with its bottom. Their widths and offsets are the
// node's own, and the frame is the same iPhone 14 Pro "Silver" the About
// section uses, so this is the kit's drawing at the kit's proportions.
//
// Two things are not carried over. The node's band is an inset rounded
// rectangle, while every section on this page is full-bleed. And its quick
// action is a pair of app-store badges, while this page has no store links to
// give and closes on the subscribe flow, so the single existing CTA stays.
//
// The phones are decoration — the About phone has already shown the app, and
// nothing here is meant to be read — so the pair is hidden from assistive tech
// and their captures carry no alt. Below lg they are dropped altogether, where
// they would crowd out the words they exist to frame.
export function FinalCta({ content, locale }: Props) {
  return (
    <section
      data-surface="dark"
      className="surface-band section relative isolate flex items-center text-ink-on-dark lg:min-h-[500px] lg:pb-[104px]"
    >
      {/* The band is 500 tall and evenly padded in the node, so the page's
          104/149 section rhythm is levelled off at lg and the copy sits on the
          band's own centre line. */}
      <div className="gutter relative z-10 mx-auto w-full max-w-content">
        <div className="flex flex-col items-center text-center lg:max-w-[50%] lg:items-start lg:text-start">
          <h2 data-reveal className="type-h2">
            {content.title}
          </h2>
          <p
            data-reveal
            className="type-body-lg mt-4 max-w-[46ch] text-ink-on-dark-muted lg:max-w-none"
          >
            {content.body}
          </p>
          <div data-reveal className="mt-10">
            <Button href={`#${SECTION_IDS.flow}`} variant="primary-on-dark">
              {content.cta}
            </Button>
          </div>
        </div>
      </div>
      {/* The clip box starts above the band and ends on its bottom edge, which
          is what lets a phone stand out of the top while being cut by the
          bottom — and keeps the one behind, which reaches past the band's far
          edge, from widening the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-20 bottom-0 hidden overflow-hidden lg:block"
      >
        {PHONES.map(({ key, width, inset, top, screen }) => (
          <div
            key={key}
            className="absolute"
            style={{
              width: `${width}px`,
              top: `${top}px`,
              // the content column's end, then the node's own offset from it
              insetInlineEnd: `calc(50% - var(--container-content) / 2 + ${inset}px)`,
            }}
          >
            <AppMockup
              locale={locale}
              label=""
              glow={false}
              screen={screen}
              className="max-w-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
