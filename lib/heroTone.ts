import 'client-only';
import { useEffect, useState } from 'react';

export const HERO_TONE_ATTR = 'data-hero-tone';
export type HeroTone = 'dark' | 'light';

// The pinned hero owns this attribute on <html>: "dark" while its purple
// surface is up, "light" once the surface has faded (S6 in MOTION.md). The
// header and the scroll hint read it so their tone follows the surface rather
// than scrollY, which keeps growing while the hero is pinned. Absent (mobile,
// reduced motion, no pin) means "decide from scroll position", i.e. the
// behaviour the page had before the tiles existed.
export function setHeroTone(tone: HeroTone | null) {
  const root = document.documentElement;
  if (tone === null) {
    root.removeAttribute(HERO_TONE_ATTR);
    return;
  }
  if (root.getAttribute(HERO_TONE_ATTR) !== tone) root.setAttribute(HERO_TONE_ATTR, tone);
}

export function readHeroTone(): HeroTone | null {
  const value = document.documentElement.getAttribute(HERO_TONE_ATTR);
  return value === 'dark' || value === 'light' ? value : null;
}

export function useHeroTone(): HeroTone | null {
  const [tone, setTone] = useState<HeroTone | null>(null);
  useEffect(() => {
    const sync = () => setTone(readHeroTone());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [HERO_TONE_ATTR],
    });
    return () => observer.disconnect();
  }, []);
  return tone;
}
