import type { SiteContent } from '@/content/types';
import { SECTION_IDS } from '@/lib/anchors';
import { formatInteger, type Locale } from '@/lib/i18n';

type Props = { content: SiteContent['terms']; locale: Locale };

export function Terms({ content, locale }: Props) {
  return (
    <section id={SECTION_IDS.terms} className="section scroll-mt-header bg-bg-page">
      <div className="gutter mx-auto max-w-content">
        <h2 data-reveal className="type-h2">
          {content.title}
        </h2>
        <ol data-reveal className="mt-10 divide-y divide-line border-y border-line">
          {content.items.map((item, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-4 py-4">
              <span aria-hidden className="type-body num text-ink-muted">
                {formatInteger(i + 1, locale)}
              </span>
              <p className="type-body">{item}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
