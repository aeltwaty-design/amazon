import type { SiteContent } from '@/content/types';
import { HeroCards } from '@/components/hero/HeroCards';
import { HeroChoreography } from '@/components/hero/HeroChoreography';
import { HeroLottie } from '@/components/hero/HeroLottie';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { SECTION_IDS } from '@/lib/anchors';
import { dirFor, fmt, type Locale } from '@/lib/i18n';
import { WalaOneLockup } from '@/components/brand/WalaOneLockup';
import { PRICE, PRICING, formatMoney, formatRiyals } from '@/lib/pricing';

type Props = {
  locale: Locale;
  content: SiteContent['hero'];
  benefits: SiteContent['benefits'];
  lockupLabel: string;
};

const words = (text: string) => text.split(' ').filter(Boolean);

export function Hero({ locale, content, benefits, lockupLabel }: Props) {
  const priceLead = fmt(content.priceLead, {
    total: formatMoney(PRICE.total),
    saving: formatRiyals(PRICE.discount),
    discountPct: PRICING.discountPct,
  });

  return (
    <section
      data-hero
      data-surface="dark"
      className="surface-hero relative z-10 min-h-svh text-ink-on-dark"
    >
      <div
        data-hero-text
        className="gutter mx-auto flex min-h-svh max-w-content flex-col items-center justify-center pt-header pb-[164px] text-center"
      >
        <div data-hero-lockup data-enter className="mb-4">
          <WalaOneLockup dir={dirFor(locale)} title={lockupLabel} className="h-12 w-auto" />
        </div>
        <p
          data-hero-eyebrow
          data-enter
          className="type-toggle rounded-pill bg-accent px-4 py-2 text-ink"
        >
          {content.eyebrow}
        </p>
        <h1 className="type-display mt-4 flex flex-wrap items-center justify-center gap-x-[0.25em]">
          {words(content.h1Lead).map((word, i) => (
            <span key={`lead-${i}`} data-hero-word data-enter className="inline-block">
              {word}
            </span>
          ))}
          <span
            data-hero-art
            className="inline-flex h-[0.95em] w-[1.75em] shrink-0 overflow-hidden rounded-[0.18em] align-middle"
          >
            <HeroLottie
              src="/lottie/hero-illustration.json"
              label={content.illustrationSlot.title}
              className="size-full bg-cta-glow"
            />
          </span>
          {words(content.h1Tail).map((word, i) => (
            <span key={`tail-${i}`} data-hero-word data-enter className="inline-block">
              {word}
            </span>
          ))}
        </h1>
        <p
          data-hero-sub
          data-enter
          className="type-body-lg mt-4 max-w-[640px] text-ink-on-dark-muted"
        >
          {content.sub}
        </p>
        <p
          data-hero-price
          data-enter
          className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1"
        >
          <Price halalas={PRICE.subtotal} locale={locale} size="lead" />
          <span className="type-body text-ink-on-dark-muted">{content.perYear}</span>
          <span className="type-body text-ink-on-dark-muted">
            {content.wasLabel} <Price halalas={PRICE.list} locale={locale} strike />
          </span>
          <span className="type-small w-full text-ink-on-dark-muted">{priceLead}</span>
        </p>
        <div data-hero-ctas data-enter className="mt-6 flex flex-wrap justify-center gap-4">
          <Button href={`#${SECTION_IDS.flow}`} variant="primary-on-dark">
            {content.cta}
          </Button>
          <Button href={`#${SECTION_IDS.about}`} variant="ghost">
            {content.ghostCta}
          </Button>
        </div>
        <p data-hero-trust data-enter className="type-small mt-4 text-ink-on-dark-muted">
          {content.trust.join(' · ')}
        </p>
      </div>
      <HeroCards content={benefits} />
      <HeroChoreography locale={locale} />
    </section>
  );
}
