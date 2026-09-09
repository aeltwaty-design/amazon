'use client';

import { useViewportKey } from '@/hooks/useViewportKey';
import { FONTS_ATTR } from '@/lib/boot';
import { dirX, type Locale } from '@/lib/i18n';
import {
  Flip,
  ScrollTrigger,
  ease,
  gsap,
  msToSeconds,
  readPx,
  readSeconds,
  useGSAP,
} from '@/lib/motion';

// Initial spec (brief §5). Durations, distances and easings are NOT here: they
// are read from styles/tokens.css at init so design can tune without code.
export const HERO = {
  PIN_END: '+=100%',
  SCRUB: 0.6,
  ANTICIPATE_PIN: 1,
  /** timeline progress windows, 0–1 */
  P: { art: [0, 0.3], cards: [0.15, 0.9], text: [0.7, 1], lock: 0.95 },
  /** per-card delay inside the cards window, in progress units */
  CARD_STAGGER_P: 0.03,
  STACK: { peekPx: 140, fanX: 24, fanY: 10, scale: 0.94 },
  LOAD: { headlineStartMs: 50, wordStaggerMs: 40, subMs: 280, subStartMs: 300, cardStaggerMs: 60 },
  TEXT_EXIT_Y: -40,
  /** [start, end] progress window that cross-fades the dark surface; null = hard cut at unpin (brief) */
  HERO_SURFACE_FADE: null as null | readonly [number, number],
  MOBILE_ART_PARALLAX_PX: 12,
  MQ: {
    // The 3-column landing grid only exists at ≥1024, and a short viewport
    // cannot show the peeking stack under the headline.
    desktop: '(min-width: 1024px) and (min-height: 700px)',
    reduce: '(prefers-reduced-motion: reduce)',
    // gsap.matchMedia only invokes the callback while at least one condition
    // matches; without this always-true-unless-reduced query the mobile
    // branch would never run and the pre-hidden hero would stay empty.
    motionOk: '(prefers-reduced-motion: no-preference)',
  },
  RESIZE_DEBOUNCE_MS: 200,
} as const;

type Point = { x: number; y: number };
type Geometry = {
  stack: Point[];
  end: Point[];
  pinDistance: number;
  /** signed x each headline word travels as the illustration closes (0 off its line) */
  wordShift: Map<HTMLElement, number>;
};

const all = <T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

// Measures with every transform cleared, so the numbers describe natural
// layout regardless of where the scrub currently is.
function measure(
  hero: HTMLElement,
  heroCards: HTMLElement[],
  gridCards: HTMLElement[],
  art: HTMLElement | null,
  sign: 1 | -1,
  pinDistance: number,
): Geometry {
  gsap.set(heroCards, { clearProps: 'transform' });
  const heroRect = hero.getBoundingClientRect();
  const heroHeight = heroRect.height;

  const stack = heroCards.map((card, i) => {
    const rect = card.getBoundingClientRect();
    const cardTop = rect.top - heroRect.top;
    const wide = card.dataset.wide === 'true';
    return {
      // Only the fan is authored horizontal motion, so only it carries the sign.
      x: wide ? 0 : (i - 2) * HERO.STACK.fanX * sign,
      y: heroHeight - HERO.STACK.peekPx - cardTop + i * HERO.STACK.fanY,
    };
  });

  // Flip.fit gives the transform that makes the hero card's box coincide with
  // its grid twin at natural positions. At unpin the Benefits section has
  // travelled up by exactly the pin distance, hence the subtraction.
  const end = heroCards.map((card, i) => {
    const target = gridCards[i];
    if (!target) return { x: 0, y: 0 };
    const vars = Flip.fit(card, target, { getVars: true, scale: true }) as {
      x?: number;
      y?: number;
    } | null;
    return { x: vars?.x ?? 0, y: (vars?.y ?? 0) - pinDistance };
  });

  // The illustration exit must not reflow the headline (a scroll-driven
  // reflow is a layout shift), so it is scaleX on the art plus translateX on
  // the words that share its line. offsetTop ignores transforms, which is
  // what makes this measurement stable mid-animation.
  const wordShift = new Map<HTMLElement, number>();
  if (art) {
    const h1 = art.parentElement;
    const words = h1 ? all(h1, '[data-hero-word]') : [];
    const gap = h1 ? parseFloat(getComputedStyle(h1).columnGap) || 0 : 0;
    const shift = (art.offsetWidth + gap) / 2;
    const artMid = art.offsetTop + art.offsetHeight / 2;
    for (const word of words) {
      const mid = word.offsetTop + word.offsetHeight / 2;
      if (Math.abs(mid - artMid) >= word.offsetHeight * 0.5) continue;
      // Words on the inline-start side close toward the inline-end and vice
      // versa; the sign keeps "toward the art" correct in RTL.
      const before = Boolean(word.compareDocumentPosition(art) & Node.DOCUMENT_POSITION_FOLLOWING);
      wordShift.set(word, (before ? shift : -shift) * sign);
    }
  }

  return { stack, end, pinDistance, wordShift };
}

function buildLoadSequence(hero: HTMLElement, geometry: Geometry, desktop: boolean) {
  const out = ease('outCubic');
  const tl = gsap.timeline({ defaults: { ease: out } });

  tl.fromTo(
    all(hero, '[data-hero-lockup]'),
    { opacity: 0, scale: 0.92 },
    { opacity: 1, scale: 1, duration: readSeconds('--hero-logo-enter') },
    0,
  );
  tl.fromTo(
    all(hero, '[data-hero-eyebrow], [data-hero-word]'),
    { y: 24, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: readSeconds('--hero-headline-enter'),
      stagger: msToSeconds(HERO.LOAD.wordStaggerMs),
    },
    msToSeconds(HERO.LOAD.headlineStartMs),
  );
  tl.fromTo(
    all(hero, '[data-hero-sub], [data-hero-price]'),
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, duration: msToSeconds(HERO.LOAD.subMs) },
    msToSeconds(HERO.LOAD.subStartMs),
  );

  const ctaDuration = readSeconds('--hero-cta-enter');
  tl.fromTo(
    all(hero, '[data-hero-ctas], [data-hero-trust]'),
    { y: readPx('--hero-cta-enter-distance'), opacity: 0 },
    {
      keyframes: [
        { y: readPx('--hero-cta-settle'), opacity: 1, duration: ctaDuration * 0.7, ease: out },
        { y: 0, duration: ctaDuration * 0.3, ease: 'power2.out' },
      ],
    },
    readSeconds('--hero-cta-enter-start'),
  );

  if (desktop) {
    const cards = all(hero, '[data-hero-card]');
    const distance = readPx('--hero-card-enter-distance');
    tl.fromTo(
      cards,
      {
        x: (i: number) => geometry.stack[i]?.x ?? 0,
        y: (i: number) => (geometry.stack[i]?.y ?? 0) + distance,
        scale: HERO.STACK.scale,
        opacity: 0,
      },
      {
        y: (i: number) => geometry.stack[i]?.y ?? 0,
        opacity: 1,
        duration: readSeconds('--hero-card-enter'),
        stagger: msToSeconds(HERO.LOAD.cardStaggerMs),
      },
      '<',
    );
  }
  return tl;
}

// Adds the transform-only illustration exit to a timeline at `at` for `duration`.
// Every word is a target with a function-based value, so a refresh that
// re-measures which words share the art's line is honoured on invalidate.
function addArtExit(
  tl: gsap.core.Timeline,
  art: HTMLElement,
  geometry: Geometry,
  at: number,
  duration: number,
) {
  tl.fromTo(
    art,
    { scaleX: 1, opacity: 1, transformOrigin: '50% 50%' },
    { scaleX: 0, opacity: 0, duration },
    at,
  );
  const words = art.parentElement ? all(art.parentElement, '[data-hero-word]') : [];
  if (words.length === 0) return;
  tl.fromTo(
    words,
    { x: 0 },
    {
      x: (_i: number, word: Element) => geometry.wordShift.get(word as HTMLElement) ?? 0,
      duration,
    },
    at,
  );
}

function buildPinnedScrub(
  hero: HTMLElement,
  benefits: HTMLElement,
  geometry: Geometry,
  load: gsap.core.Timeline,
  sign: 1 | -1,
) {
  const heroCards = all(hero, '[data-hero-card]');
  const gridCards = all(benefits, '[data-grid-card]');
  const art = hero.querySelector<HTMLElement>('[data-hero-art]');
  const text = hero.querySelector<HTMLElement>('[data-hero-text]');

  // The wide cards sit under the small ones in the pile; the trailing wide
  // card goes lowest so it cannot cover the first one's headline strip.
  heroCards.forEach((card, i) =>
    gsap.set(card, { zIndex: card.dataset.wide === 'true' ? (i === 0 ? 1 : 0) : 2 }),
  );
  gsap.set(gridCards, { visibility: 'hidden' });

  // With pinSpacing off, ScrollTrigger leaves the released hero overlapping the
  // section beneath for one more viewport of scroll. Hiding it at the unpin
  // edge is what makes Benefits "already in place underneath" visible.
  const swap = (to: 'grid' | 'hero') => {
    gsap.set(hero, { visibility: to === 'grid' ? 'hidden' : 'visible' });
    gsap.set(heroCards, { visibility: to === 'grid' ? 'hidden' : 'visible' });
    gsap.set(gridCards, { visibility: to === 'grid' ? 'visible' : 'hidden' });
  };

  const { P } = HERO;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: HERO.PIN_END,
      pin: true,
      // Benefits scrolls up beneath the fixed hero and is at the top of the
      // viewport at the exact scroll where the pin releases: nothing shifts.
      pinSpacing: false,
      scrub: HERO.SCRUB,
      anticipatePin: HERO.ANTICIPATE_PIN,
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        // Pins are reverted here, so both grids are at natural document positions.
        Object.assign(geometry, measure(hero, heroCards, gridCards, art, sign, window.innerHeight));
        load.invalidate();
      },
      onUpdate: () => {
        // Scrolling before the load sequence ends: hand control to the scrub.
        if (load.isActive()) load.progress(1);
      },
      onLeave: () => {
        // Scrub lag could leave a card mid-flight at the unpin edge.
        tl.progress(1);
        swap('grid');
      },
      onEnterBack: () => swap('hero'),
    },
  });

  if (art) addArtExit(tl, art, geometry, P.art[0], P.art[1] - P.art[0]);

  const flight = P.cards[1] - P.cards[0] - HERO.CARD_STAGGER_P * (heroCards.length - 1);
  heroCards.forEach((card, i) => {
    tl.fromTo(
      card,
      {
        x: () => geometry.stack[i]?.x ?? 0,
        y: () => geometry.stack[i]?.y ?? 0,
        scale: HERO.STACK.scale,
      },
      {
        x: () => geometry.end[i]?.x ?? 0,
        y: () => geometry.end[i]?.y ?? 0,
        scale: 1,
        duration: flight,
        immediateRender: false,
      },
      P.cards[0] + HERO.CARD_STAGGER_P * i,
    );
  });

  if (text) {
    tl.fromTo(
      text,
      { y: 0, opacity: 1 },
      { y: HERO.TEXT_EXIT_Y, opacity: 0, duration: P.text[1] - P.text[0] },
      P.text[0],
    );
  }

  if (HERO.HERO_SURFACE_FADE) {
    const [from, to] = HERO.HERO_SURFACE_FADE;
    tl.to(hero, { backgroundColor: 'transparent', duration: to - from }, from);
  }

  // Hard-set the end state so the pin can never release on a stale frame.
  tl.add(() => {
    heroCards.forEach((card, i) =>
      gsap.set(card, { x: geometry.end[i]?.x ?? 0, y: geometry.end[i]?.y ?? 0, scale: 1 }),
    );
  }, P.lock);

  return tl;
}

function buildMobile(hero: HTMLElement, geometry: Geometry) {
  const art = hero.querySelector<HTMLElement>('[data-hero-art]');
  const mirror = hero.querySelector<HTMLElement>('[data-hero-mirror]');
  if (mirror) gsap.set(mirror, { display: 'none' });
  if (!art) return;

  gsap.to(art, {
    y: HERO.MOBILE_ART_PARALLAX_PX,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });

  // Without a pin the illustration exits on a clock: the ms tokens apply here.
  const exit = gsap.timeline({
    paused: true,
    defaults: { ease: ease('outExpo') },
    delay: readSeconds('--hero-illustration-exit-start'),
  });
  addArtExit(exit, art, geometry, 0, readSeconds('--hero-illustration-exit'));
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 40%',
    onEnter: () => exit.play(),
    onLeaveBack: () => exit.reverse(),
  });
}

export function HeroChoreography({ locale }: { locale: Locale }) {
  const viewportKey = useViewportKey(HERO.RESIZE_DEBOUNCE_MS);

  useGSAP(
    (_context, contextSafe) => {
      const hero = document.querySelector<HTMLElement>('[data-hero]');
      const benefits = document.querySelector<HTMLElement>('[data-benefits]');
      if (!hero || !contextSafe) return;
      const sign = dirX(locale);
      const mm = gsap.matchMedia();

      // The layout's boot script hides the page until the fonts are in; the
      // load sequence must not spend its first frames behind that gate, and
      // every measurement below depends on the final headline wrap.
      const build = contextSafe(() => {
        mm.add(
          { desktop: HERO.MQ.desktop, reduce: HERO.MQ.reduce, motionOk: HERO.MQ.motionOk },
          (ctx) => {
            const conditions = (ctx.conditions ?? {}) as Record<string, boolean>;
            // CSS already shows everything and hides the mirror; nothing to animate.
            if (conditions.reduce) return;
            const desktop = Boolean(conditions.desktop) && Boolean(benefits);
            const heroCards = all(hero, '[data-hero-card]');
            const gridCards = benefits ? all(benefits, '[data-grid-card]') : [];
            const art = hero.querySelector<HTMLElement>('[data-hero-art]');
            const geometry = measure(hero, heroCards, gridCards, art, sign, window.innerHeight);
            const load = buildLoadSequence(hero, geometry, desktop);
            if (desktop && benefits) buildPinnedScrub(hero, benefits, geometry, load, sign);
            else buildMobile(hero, geometry);
          },
        );
        ScrollTrigger.refresh();
      });

      let cancelled = false;
      const fontsReady = () => document.documentElement.hasAttribute(FONTS_ATTR);
      if (fontsReady()) build();
      else {
        const observer = new MutationObserver(() => {
          if (!fontsReady()) return;
          observer.disconnect();
          if (!cancelled) build();
        });
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: [FONTS_ATTR],
        });
        return () => {
          cancelled = true;
          observer.disconnect();
          mm.revert();
        };
      }
      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { dependencies: [locale, viewportKey], revertOnUpdate: true },
  );

  return null;
}
