import type { Metadata } from 'next';
import { Cairo, Figtree } from 'next/font/google';
import type { ReactNode } from 'react';
import { BootSignals } from '@/components/motion/BootSignals';
import { LayoutShiftProbe } from '@/components/motion/LayoutShiftProbe';
import { Header } from '@/components/ui/Header';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { getContent } from '@/content';
import { BOOT_SCRIPT } from '@/lib/boot';
import { DEFAULT_LOCALE, LOCALES, dirFor, isLocale } from '@/lib/i18n';
import '@/styles/globals.css';

// Variable fonts: one file per family covers 400–800, which the brief's body
// (400–500) and display (800) both need; four static cuts would be larger.
const figtree = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-latin' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap', variable: '--font-arabic' });

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
        {/* First paint only; BootSignals re-applies the same attributes after each mount. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="bg-bg-page font-ui text-ink antialiased">
        <BootSignals />
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
        <ScrollHint label={content.a11y.scrollUp} />
        {process.env.NODE_ENV === 'development' ? <LayoutShiftProbe /> : null}
      </body>
    </html>
  );
}
