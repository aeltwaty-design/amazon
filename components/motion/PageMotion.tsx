'use client';

import { useViewportKey } from '@/hooks/useViewportKey';
import { dirX, type Locale } from '@/lib/i18n';
import { ScrollTrigger, ease, gsap, readPx, readSeconds, useGSAP } from '@/lib/motion';

const REVEAL_STAGGER_S = 0.06;
const REVEAL_Y = 24;
const PRICING_TILT_DEG = 4;

// Owns every ScrollTrigger outside the hero: section reveals, the brand-row
// marquee and the pricing-card tilt. Rebuilt on locale change and resize.
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

          // Brand rows: a scroll-scrubbed marquee, alternate rows in opposite
          // directions, mirrored in Arabic. x is 0 at the section's midpoint, so
          // the un-built and reduced-motion states show the same centred rows.
          const travel = readPx('--brands-marquee-travel');
          gsap.utils.toArray<HTMLElement>('[data-marquee]').forEach((row) => {
            const dir = (row.dataset.marquee === 'reverse' ? -1 : 1) * sign;
            gsap.fromTo(
              row,
              { x: (-travel / 2) * dir },
              {
                x: (travel / 2) * dir,
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
