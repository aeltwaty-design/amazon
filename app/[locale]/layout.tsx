import type { Metadata } from 'next';
import { Cairo, Figtree } from 'next/font/google';
import type { ReactNode } from 'react';
import { Header } from '@/components/ui/Header';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { getContent } from '@/content';
import { DEFAULT_LOCALE, LOCALES, dirFor, isLocale } from '@/lib/i18n';
import '@/styles/globals.css';

// Variable fonts: one file per family covers 400–800, which the brief's body
// (400–500) and display (800) both need; four static cuts would be larger.
const figtree = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-latin' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap', variable: '--font-arabic' });

// Runs before first paint so the hero's [data-enter] pre-hide only applies when
// JS is present; a no-JS visitor sees the content instead of an empty hero.
const HAS_JS = "document.documentElement.classList.add('has-js')";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const { meta } = getContent(locale);
  return {
    title: meta.title,
    description: meta.description,
    alternates: { languages: { ar: '/ar', en: '/en' } },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  // An unknown locale still renders through this layout (the 404 page), so it
  // falls back rather than throwing.
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const content = getContent(locale);

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${figtree.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: HAS_JS }} />
      </head>
      <body className="bg-bg-page font-ui text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-cta-bg focus:px-4 focus:py-2 focus:text-cta-fg"
        >
          {content.a11y.skipToContent}
        </a>
        <Header
          locale={locale}
          content={content.header}
          localeSwitchLabel={content.a11y.localeSwitch}
        />
        {children}
        <ScrollHint labels={{ down: content.a11y.scrollDown, up: content.a11y.scrollUp }} />
      </body>
    </html>
  );
}
