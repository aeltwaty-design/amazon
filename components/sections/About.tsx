import type { SiteContent } from '@/content/types';
import { AppMockup } from '@/components/ui/AppMockup';
import { CountUp } from '@/components/ui/CountUp';
import { CalendarDaysIcon, LayerGroupIcon, TagsIcon } from '@/components/ui/Icon';
import { SECTION_IDS } from '@/lib/anchors';
import type { Locale } from '@/lib/i18n';

type Props = { content: SiteContent['about']; locale: Locale };

// One glyph per stat, in the stats' order: offers and discounts, sectors,
// months. Font Awesome Solid, in a brand-wash chip before the number; the
// label under the number still carries the meaning, so the chip is hidden
// from assistive tech.
const STAT_ICONS = [TagsIcon, LayerGroupIcon, CalendarDaysIcon] as const;

export function About({ content, locale }: Props) {
  return (
    <section id={SECTION_IDS.about} className="section scroll-mt-header bg-bg-page">
      <div className="gutter mx-auto grid max-w-content items-center gap-12 lg:grid-cols-[1fr_minmax(0,480px)] lg:gap-20">
        <div>
          <h2 data-reveal className="type-h2">
            {content.title}
          </h2>
          <p data-reveal className="type-body-lg mt-6 max-w-[60ch] text-ink-muted">
            {content.body}
          </p>
          <dl data-reveal className="mt-10 grid grid-cols-3 divide-x divide-line">
            {content.stats.map((stat, i) => {
              const Glyph = STAT_ICONS[i] ?? TagsIcon;
              return (
                // Visual order is value over label; DOM order keeps <dt> before <dd>.
                <div key={stat.label} className="flex flex-col-reverse px-5 first:ps-0 last:pe-0">
                  <dt className="type-small mt-1 text-ink-muted">{stat.label}</dt>
                  <dd className="type-h3 num flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-brand-wash text-brand"
                    >
                      <Glyph className="size-4" />
                    </span>
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
        <div data-reveal className="mx-auto w-full max-w-[480px]">
          <AppMockup locale={locale} label={content.screenshotSlot.title} />
        </div>
      </div>
    </section>
  );
}
