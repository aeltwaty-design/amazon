import type { Metadata } from 'next';
import { Cairo, Figtree } from 'next/font/google';
import type { ReactNode } from 'react';
import { LayoutShiftProbe } from '@/components/motion/LayoutShiftProbe';
import { Header } from '@/components/ui/Header';
import { ScrollHint } from '@/components/ui/ScrollHint';
import { getContent } from '@/content';
import { DEFAULT_LOCALE, LOCALES, dirFor, isLocale } from '@/lib/i18n';
import '@/styles/globals.css';

const FONT_GATE_TIMEOUT_MS = 1000;

// Variable fonts: one file per family covers 400–800, which the brief's body
// (400–500) and display (800) both need; four static cuts would be larger.
const figtree = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-latin' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], display: 'swap', variable: '--font-arabic' });

// Runs before first paint. `has-js` scopes the hero's [data-enter] pre-hide to
// JS-capable browsers. `fonts-ready` lifts the page's visibility gate once the
// fonts are in: a font swap reflows the Arabic headline, and a reflow on a
// visible element is a layout shift. Hidden elements are not counted, so the
// page paints once, with the right fonts. Font requests are only issued by the
// first layout, so `fonts.ready` is consulted two frames in (it would resolve
// immediately before that); the timeout guards against a font that never
// arrives.
const BOOT = `(function(){var h=document.documentElement;h.classList.add('has-js');var done=false;function ready(){if(done)return;done=true;h.classList.add('fonts-ready')}if(!document.fonts){ready();return}requestAnimationFrame(function(){requestAnimationFrame(function(){document.fonts.ready.then(ready,ready)})});setTimeout(ready,${FONT_GATE_TIMEOUT_MS})})()`;

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
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
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
        {process.env.NODE_ENV === 'development' ? <LayoutShiftProbe /> : null}
      </body>
    </html>
  );
}
