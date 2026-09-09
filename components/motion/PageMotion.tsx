'use client';

import { useViewportKey } from '@/hooks/useViewportKey';
import { dirX, type Locale } from '@/lib/i18n';
import { ScrollTrigger, ease, gsap, readSeconds, useGSAP } from '@/lib/motion';

const REVEAL_STAGGER_S = 0.06;
const REVEAL_Y = 24;
const BRAND_PARALLAX_PX = 24;
const PRICING_TILT_DEG = 4;

// Owns every ScrollTrigger outside the hero: section reveals, the brand-row
// parallax and the pricing-card tilt. Rebuilt on locale change and resize.
export function PageMotion({ locale }: { locale: Locale }) {
  const viewportKey = useViewportKey(200);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motionOk: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
        (ctx) => {
          const conditions = (ctx.conditions ?? {}) as Record<string, boolean>;
          if (!conditions.motionOk) return;
          const sign = dirX(locale);

          // On desktop the grid cards arrive through the hero handoff instead.
          const selector = conditions.desktop
            ? '[data-reveal]'
            : '[data-reveal], [data-reveal-mobile]';
          const targets = gsap.utils.toArray<HTMLElement>(selector);
          const reveal = (batch: Element[]) =>
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: readSeconds('--motion-600'),
              ease: ease('outCubic'),
              stagger: REVEAL_STAGGER_S,
              overwrite: true,
            });
          gsap.set(targets, { y: REVEAL_Y, opacity: 0 });
          ScrollTrigger.batch(targets, {
            start: 'top 88%',
            once: true,
            onEnter: reveal,
            // A reload mid-page leaves elements above the viewport un-entered.
            onEnterBack: reveal,
          });

          gsap.utils.toArray<HTMLElement>('[data-parallax="brands-row"]').forEach((row) => {
            gsap.fromTo(
              row,
              { x: -BRAND_PARALLAX_PX * sign },
              {
                x: BRAND_PARALLAX_PX * sign,
                ease: 'none',
                scrollTrigger: {
                  trigger: row.closest('section') ?? row,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              },
            );
          });

          gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((card) => {
            gsap.from(card, {
              rotation: PRICING_TILT_DEG * sign,
              transformOrigin: '50% 100%',
              duration: readSeconds('--motion-800'),
              ease: ease('spring'),
              scrollTrigger: { trigger: card, start: 'top 80%', once: true },
            });
          });
        },
      );
      return () => mm.revert();
    },
    { dependencies: [locale, viewportKey], revertOnUpdate: true },
  );

  return null;
}
