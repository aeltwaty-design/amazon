import type { SiteContent } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { SECTION_IDS } from '@/lib/anchors';
import { ART } from '@/lib/art';
import { formatInteger, type Locale } from '@/lib/i18n';

type Props = { content: SiteContent['howTo']; locale: Locale };

export function HowTo({ content, locale }: Props) {
  return (
    <section id={SECTION_IDS.howTo} className="section scroll-mt-header bg-bg-page">
      <div className="gutter mx-auto max-w-content">
        <h2 data-reveal className="type-h2 text-center">
          {content.title}
        </h2>
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {content.steps.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              className="flex flex-col rounded-card bg-bg-surface p-6 lg:p-7"
            >
              {/* The <ol> already numbers the step for assistive tech. */}
              <span
                aria-hidden
                className="type-toggle num flex size-10 items-center justify-center rounded-pill bg-brand text-ink-on-dark"
              >
                {formatInteger(i + 1, locale)}
              </span>
              <div className="mt-6">
                <ImageSlot
                  title={step.slot.title}
                  description={step.slot.description}
                  width={ART.howTo[i]?.width ?? 320}
                  height={ART.howTo[i]?.height ?? 200}
                  src={ART.howTo[i]?.src}
                  sizes="(min-width: 1024px) 340px, 90vw"
                  className="rounded-plan"
                />
              </div>
              <h3 className="type-h3 mt-6">{step.title}</h3>
              <p className="type-body mt-3 text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
