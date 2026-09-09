import type { SiteContent } from '@/content/types';
import { AppMockup } from '@/components/ui/AppMockup';
import { SECTION_IDS } from '@/lib/anchors';

export function About({ content }: { content: SiteContent['about'] }) {
  return (
    <section id={SECTION_IDS.about} className="section scroll-mt-header bg-bg-page">
      <div className="gutter mx-auto grid max-w-content items-center gap-12 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-20">
        <div>
          <h2 data-reveal className="type-h2">
            {content.title}
          </h2>
          <p data-reveal className="type-body-lg mt-6 max-w-[60ch] text-ink-muted">
            {content.body}
          </p>
          <dl data-reveal className="mt-10 grid grid-cols-3 divide-x divide-line">
            {content.stats.map((stat) => (
              // Visual order is value over label; DOM order keeps <dt> before <dd>.
              <div key={stat.label} className="flex flex-col-reverse px-5 first:ps-0 last:pe-0">
                <dt className="type-small mt-1 text-ink-muted">{stat.label}</dt>
                <dd className="type-h3 num">
                  <bdi>{stat.value}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div data-reveal className="mx-auto w-full max-w-[400px]">
          <AppMockup copy={content.mockup} label={content.screenshotSlot.title} />
        </div>
      </div>
    </section>
  );
}
