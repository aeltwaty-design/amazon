'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SiteContent } from '@/content/types';
import { AmazonLogo } from '@/components/brand/AmazonLogo';
import { WalaOneLockup } from '@/components/brand/WalaOneLockup';
import { Button } from '@/components/ui/Button';
import { LocaleToggle } from '@/components/ui/LocaleToggle';
import { SECTION_IDS } from '@/lib/anchors';
import { cn } from '@/lib/cn';
import { dirFor, type Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  content: SiteContent['header'];
  localeSwitchLabel: string;
};

const SOLID_AFTER_PX = 24;

export function Header({ locale, content, localeSwitchLabel }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // State only flips at the threshold, so scrolling does not re-render.
      setScrolled((prev) => {
        const next = window.scrollY > SOLID_AFTER_PX;
        return next === prev ? prev : next;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const tone = scrolled ? 'on-light' : 'on-dark';

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-header transition-colors duration-(--header-surface) ease-out-cubic',
        scrolled ? 'border-b border-line bg-bg-page text-ink' : 'text-ink-on-dark',
      )}
    >
      <div className="gutter mx-auto flex h-full max-w-wide items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Both logos read currentColor, so the header's colour tween recolours
              them (white over the hero, brand/black once solid) with no swap. */}
          <Link href={`/${locale}`} aria-label={content.wordmark} className="inline-flex">
            <WalaOneLockup
              dir={dirFor(locale)}
              tone={scrolled ? 'color' : 'mono'}
              className="h-8 w-auto"
            />
          </Link>
          <span aria-hidden className="hidden h-6 w-px bg-current opacity-30 min-[820px]:block" />
          <div className="hidden min-[820px]:block">
            <AmazonLogo title={content.partnerSlot.title} className="h-6 w-auto" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LocaleToggle
            locale={locale}
            labels={content.toggle}
            ariaLabel={localeSwitchLabel}
            tone={tone}
          />
          <Button
            href={`#${SECTION_IDS.flow}`}
            variant={scrolled ? 'header' : 'header-on-dark'}
            className="hidden min-[820px]:inline-flex"
          >
            {content.cta}
          </Button>
        </div>
      </div>
    </header>
  );
}
