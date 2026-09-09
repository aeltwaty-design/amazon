'use client';

import type { MouseEvent } from 'react';
import type { FaqItem } from '@/content/types';
import { ease, gsap, prefersReducedMotion, readSeconds } from '@/lib/motion';

type Props = { items: readonly FaqItem[]; name?: string };

// Native <details>/<summary> for keyboard and screen-reader behaviour; GSAP
// only animates the panel height. Under reduced motion the click is left to
// the browser entirely.
export function FaqAccordion({ items, name = 'faq' }: Props) {
  const onSummaryClick = (event: MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion()) return;
    const details = event.currentTarget.parentElement as HTMLDetailsElement | null;
    const panel = details?.querySelector<HTMLElement>('[data-panel]');
    if (!details || !panel) return;
    event.preventDefault();
    const duration = readSeconds('--motion-300');
    const curve = ease('outCubic');
    if (details.open) {
      gsap.to(panel, {
        height: 0,
        opacity: 0,
        duration,
        ease: curve,
        onComplete: () => {
          details.open = false;
          gsap.set(panel, { clearProps: 'height,opacity' });
        },
      });
    } else {
      // Setting `open` on a named group closes its siblings natively.
      details.open = true;
      gsap.from(panel, {
        height: 0,
        opacity: 0,
        duration,
        ease: curve,
        clearProps: 'height,opacity',
      });
    }
  };

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} name={name} className="group">
          <summary
            onClick={onSummaryClick}
            className="type-faq-q flex min-h-[51px] cursor-pointer list-none items-center justify-between gap-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current [&::-webkit-details-marker]:hidden"
          >
            <span>{item.q}</span>
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 transition-transform duration-(--motion-300) ease-out-cubic group-open:rotate-180 motion-reduce:transition-none"
            >
              <path d="M5 8l5 5 5-5" />
            </svg>
          </summary>
          <div data-panel className="overflow-hidden">
            <p className="type-body pb-5 text-ink-muted">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
