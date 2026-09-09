import type { SiteContent } from '@/content/types';
import { FOOTER_HREFS } from '@/lib/anchors';

type Props = { content: SiteContent['footer']; wordmark: string };

export function Footer({ content, wordmark }: Props) {
  return (
    <footer className="border-t border-line bg-bg-surface">
      <div className="gutter mx-auto max-w-content py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-8">
          <div>
            <p className="type-h3">{wordmark}</p>
            <p className="type-body mt-3 max-w-[40ch] text-ink-muted">{content.blurb}</p>
          </div>
          {content.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="type-body font-bold">{column.title}</p>
              <ul className="mt-4 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={FOOTER_HREFS[link.id]}
                      className="type-body text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="type-small">{content.partnership}</p>
          <p className="type-small text-ink-muted">{content.draftNote}</p>
        </div>
      </div>
    </footer>
  );
}
