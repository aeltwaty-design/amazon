import Image from 'next/image';
import type { SiteContent } from '@/content/types';
import { HeroCards } from '@/components/hero/HeroCards';
import { HeroChoreography } from '@/components/hero/HeroChoreography';
import { HeroLottie } from '@/components/hero/HeroLottie';
import { HeroTiles } from '@/components/hero/HeroTiles';
import { Button } from '@/components/ui/Button';
import { Interpolate } from '@/components/ui/Interpolate';
import { Price } from '@/components/ui/Price';
import { SECTION_IDS } from '@/lib/anchors';
import { HERO_LOTTIE, HERO_SURFACE } from '@/lib/art';
import type { Locale } from '@/lib/i18n';
import { PRICE, PRICING } from '@/lib/pricing';

type Props = {
  locale: Locale;
  content: SiteContent['hero'];
  benefits: SiteContent['benefits'];
};

const words = (text: string) => text.split(' ').filter(Boolean);

export function Hero({ locale, content, benefits }: Props) {
  return (
    <section
      data-hero
      data-surface="dark"
      className="relative z-10 min-h-svh bg-bg-page text-ink-on-dark"
    >
      {/* The surface is its own layer so the choreography can fade it to the
          page background mid-pin (S6): the Figma spectral image over a matching
          underlay, preloaded because it is the first paint. */}
      <div
        data-hero-surface
        aria-hidden
        className="absolute inset-0 overflow-hidden bg-bg-hero-image"
      >
        <Image
          src={HERO_SURFACE.src}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
      </div>
      <div className="gutter relative mx-auto flex min-h-svh max-w-content flex-col items-center justify-center pt-header pb-6">
        {/* The text block fades out at S3 while the tiles below must stay put
            until the pile hands over to the card, hence the two siblings. */}
        <div data-hero-text className="flex flex-col items-center text-center">
          <h1 className="type-display flex flex-wrap items-center justify-center gap-x-[0.25em]">
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
            <span className="type-small w-full text-ink-on-dark-muted">
              <Interpolate
                template={content.priceLead}
                vars={{
                  total: <Price halalas={PRICE.total} locale={locale} />,
                  saving: <Price halalas={PRICE.discount} locale={locale} format="riyals" />,
                  discountPct: PRICING.discountPct,
                }}
              />
            </span>
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
