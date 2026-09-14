'use client';

import { useRef } from 'react';
import { ScrollTrigger, ease, gsap, readSeconds, useGSAP } from '@/lib/motion';

type Props = { value: string };

/** "4,000+" → the number, and whatever wraps it; null when there is no number to count */
function parse(value: string) {
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);
  if (!match) return null;
  const [, prefix = '', digits = '', suffix = ''] = match;
  return {
    prefix,
    suffix,
    target: Number(digits.replace(/,/g, '')),
    grouped: digits.includes(','),
  };
}

// Always en-US: the stats use Western digits in both locales, like every number on the page.
const GROUPED = new Intl.NumberFormat('en-US');

// A stat that counts up from 0 to its value the first time it scrolls into
// view (MOTION.md P15). The server renders the final string, so a reader
// without JavaScript or with reduced motion sees the number as written; with
// motion allowed the text is set to 0 in a layout effect, before the hydrated
// frame paints, and the tween starts on the same line the section's reveal
// uses. The text is written straight to the node rather than through state:
// three counters at sixty frames a second have no business re-rendering.
export function CountUp({ value }: Props) {
  const node = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = node.current;
      const parsed = parse(value);
      if (!el || !parsed) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const counter = { n: 0 };
        const write = () => {
          const n = Math.round(counter.n);
          el.textContent = `${parsed.prefix}${parsed.grouped ? GROUPED.format(n) : String(n)}${parsed.suffix}`;
        };
        write();
        const tween = gsap.to(counter, {
          n: parsed.target,
          duration: readSeconds('--stat-count'),
          ease: ease('outCubic'),
          onUpdate: write,
          paused: true,
        });
        // The same line as the reveal (PageMotion P1), so the digits start
        // moving as the block fades in; a reload mid-page enters from above.
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => tween.play(),
          onEnterBack: () => tween.play(),
        });
      });
      return () => mm.revert();
    },
    { dependencies: [value] },
  );

  return <bdi ref={node}>{value}</bdi>;
}
