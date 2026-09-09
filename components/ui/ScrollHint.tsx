'use client';

import { useState } from 'react';
import { SECTION_IDS } from '@/lib/anchors';
import { cn } from '@/lib/cn';
import { useHeroTone } from '@/lib/heroTone';
import { ScrollTrigger, prefersReducedMotion, useGSAP } from '@/lib/motion';

type Props = { labels: { down: string; up: string } };

// Fixed round button. Its own ScrollTriggers decide direction (flips after the
// hero pin) and which dark surfaces are under it; the hero's published tone
// (lib/heroTone.ts) overrides the hero's entry once its surface has faded.
export function ScrollHint({ labels }: Props) {
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  // null until the first toggle: the page loads over the hero, so start dark.
  const [activeSurfaces, setActiveSurfaces] = useState<readonly HTMLElement[] | null>(null);
  const heroTone = useHeroTone();
  const onDark =
    activeSurfaces === null
      ? true
      : activeSurfaces.some((el) => !(el.hasAttribute('data-hero') && heroTone === 'light'));

  useGSAP(() => {
    const hero = document.querySelector<HTMLElement>('[data-hero]');
    if (hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: '+=100%',
        onLeave: () => setDirection('up'),
        onEnterBack: () => setDirection('down'),
      });
    }
    // 54px = the button's vertical centre from the bottom edge (24 + 60/2).
    document.querySelectorAll<HTMLElement>('[data-surface="dark"]').forEach((surface) => {
      ScrollTrigger.create({
        trigger: surface,
        start: 'top bottom-=54px',
        end: 'bottom bottom-=54px',
        onToggle: (self) =>
          setActiveSurfaces((prev) => {
            const rest = (prev ?? []).filter((el) => el !== surface);
            return self.isActive ? [...rest, surface] : rest;
          }),
      });
    });
  }, []);

  const onClick = () => {
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (direction === 'up') {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    document.getElementById(SECTION_IDS.benefits)?.scrollIntoView({ behavior, block: 'start' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'down' ? labels.down : labels.up}
      className={cn(
        'fixed end-6 bottom-6 z-40 flex size-[60px] items-center justify-center rounded-pill shadow-lg',
        'transition-colors duration-(--motion-300) ease-out-cubic',
        'focus-visible:outline-[2.5px] focus-visible:outline-offset-2',
        onDark
          ? 'bg-cta-on-dark-bg text-cta-on-dark-fg focus-visible:outline-ink-on-dark'
          : 'bg-cta-bg text-cta-fg focus-visible:outline-brand',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block transition-transform duration-(--motion-300) ease-out-cubic',
          'animate-[hint-bounce_var(--scroll-arrow-bounce)_var(--scroll-arrow-bounce-delay)_infinite] motion-reduce:animate-none',
          direction === 'up' && 'rotate-180',
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 3v14M4 11l6 6 6-6" />
        </svg>
      </span>
    </button>
  );
}
