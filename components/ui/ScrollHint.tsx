'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useHeroTone } from '@/lib/heroTone';
import { ScrollTrigger, prefersReducedMotion, useGSAP } from '@/lib/motion';

type Props = { label: string };

// Fixed round back-to-top button. It appears only once the hero has scrolled
// out and takes the page back to it. Its own ScrollTriggers decide when it
// shows and which dark surfaces are under it; the hero's published tone
// (lib/heroTone.ts) overrides the hero's entry once its surface has faded.
export function ScrollHint({ label }: Props) {
  const [shown, setShown] = useState(false);
  // null until the first toggle: the page loads over the hero, so start dark.
  const [activeSurfaces, setActiveSurfaces] = useState<readonly HTMLElement[] | null>(null);
  const heroTone = useHeroTone();
  const onDark =
    activeSurfaces === null
      ? true
      : activeSurfaces.some((el) => !(el.hasAttribute('data-hero') && heroTone === 'light'));

  useGSAP(() => {
    // One viewport of scroll is the pin's length on desktop and the hero's own
    // height without it, so "past the hero" is the same line either way. An
    // absolute range, not the hero as trigger: positions measured on a pinned
    // element carry the pin distance, which would put this a viewport late.
    ScrollTrigger.create({
      start: 0,
      end: () => window.innerHeight,
      onLeave: () => setShown(true),
      onEnterBack: () => setShown(false),
    });
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
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        // Desktop only: on a phone it would sit on the corner every full-width
        // CTA lands in. Hidden, not just transparent, while the hero is on
        // screen, so it is out of the tab order too; visibility waits for the
        // fade on the way out.
        'fixed end-6 bottom-6 z-40 hidden size-[60px] items-center justify-center rounded-pill shadow-lg lg:flex',
        'transition-[opacity,visibility,background-color,color] duration-(--motion-300) ease-out-cubic',
        shown ? 'visible opacity-100' : 'invisible opacity-0',
        'focus-visible:outline-[2.5px] focus-visible:outline-offset-2',
        onDark
          ? 'bg-cta-on-dark-bg text-cta-on-dark-fg focus-visible:outline-ink-on-dark'
          : 'bg-cta-bg text-cta-fg focus-visible:outline-brand',
      )}
    >
      <span
        aria-hidden
        className="inline-block animate-[hint-bounce_var(--scroll-arrow-bounce)_var(--scroll-arrow-bounce-delay)_infinite] motion-reduce:animate-none"
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
          <path d="M10 17V3M4 9l6-6 6 6" />
        </svg>
      </span>
    </button>
  );
}
