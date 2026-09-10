import type { SiteContent } from '@/content/types';
import { HeroCards } from '@/components/hero/HeroCards';
import { HeroChoreography } from '@/components/hero/HeroChoreography';
import { HeroLottie } from '@/components/hero/HeroLottie';
import { HeroTiles } from '@/components/hero/HeroTiles';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { SECTION_IDS } from '@/lib/anchors';
import { HERO_LOTTIE } from '@/lib/art';
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
      className="relative z-10 min-h-svh bg-bg-page text-ink-on-dark"
    >
      {/* The purple gradient is its own layer so the choreography can fade it
          to the page background mid-pin (S6) — a background-image cannot be
          tweened, an opacity can. */}
      <div data-hero-surface aria-hidden className="surface-hero absolute inset-0" />
      <div className="gutter relative mx-auto flex min-h-svh max-w-content flex-col items-center justify-center pt-header pb-6">
        {/* The text block fades out at S3 while the tiles below must stay put
            until the pile hands over to the card, hence the two siblings. */}
        <div data-hero-text className="flex flex-col items-center text-center">
          <div data-hero-lockup data-enter className="mb-3">
            <WalaOneLockup dir={dirFor(locale)} title={lockupLabel} className="h-12 w-auto" />
          </div>
          <p
            data-hero-eyebrow
            data-enter
            className="type-toggle rounded-pill bg-accent px-4 py-2 text-ink"
          >
            {content.eyebrow}
          </p>
          <h1 className="type-display mt-3 flex flex-wrap items-center justify-center gap-x-[0.25em]">
            {words(content.h1Lead).map((word, i) => (
              <span key={`lead-${i}`} data-hero-word data-enter className="inline-block">
                {word}
              </span>
            ))}
            {/* 1.5× the line by design (the line it sits on grows with it); the
                box takes the artwork's own aspect and has no backing. */}
            <span
              data-hero-art
              style={{ aspectRatio: `${HERO_LOTTIE.crop.w} / ${HERO_LOTTIE.crop.h}` }}
              className="inline-flex h-[1.5em] shrink-0 overflow-hidden align-middle"
            >
              <HeroLottie
                src={HERO_LOTTIE.src}
                crop={HERO_LOTTIE.crop}
                label={content.illustrationSlot.title}
                className="size-full"
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
            className="type-body-lg mt-3 max-w-[640px] text-ink-on-dark-muted"
          >
            {content.sub}
          </p>
          <p
            data-hero-price
            data-enter
            className="mt-3 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1"
          >
            <Price halalas={PRICE.subtotal} locale={locale} size="lead" />
            <span className="type-body text-ink-on-dark-muted">{content.perYear}</span>
            <span className="type-body text-ink-on-dark-muted">
              {content.wasLabel} <Price halalas={PRICE.list} locale={locale} strike />
            </span>
            <span className="type-small w-full text-ink-on-dark-muted">{priceLead}</span>
          </p>
          <div data-hero-ctas data-enter className="mt-5 flex flex-wrap justify-center gap-4">
            <Button href={`#${SECTION_IDS.flow}`} variant="primary-on-dark">
              {content.cta}
            </Button>
            <Button href={`#${SECTION_IDS.about}`} variant="ghost">
              {content.ghostCta}
            </Button>
          </div>
        </div>
        <HeroTiles tiles={content.tiles} />
      </div>
      <HeroCards content={benefits} />
      <HeroChoreography locale={locale} />
    </section>
  );
}
