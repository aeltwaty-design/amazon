'use client';

import { useViewportKey } from '@/hooks/useViewportKey';
import { FONTS_ATTR } from '@/lib/boot';
import { setHeroTone, type HeroTone } from '@/lib/heroTone';
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

// noon One's hero sequence, measured (see MOTION.md). Durations, distances and
// easings are NOT here: they are read from styles/tokens.css at init so design
// can tune without code. Progress windows are fractions of the 100vh pin.
export const HERO = {
  PIN_END: '+=100%',
  SCRUB: 0.6,
  ANTICIPATE_PIN: 1,
  /** timeline progress windows, 0–1 */
  P: {
    /** headline illustration collapses, the H1 halves close */
    art: [0, 0.3],
    /** tiles 2–5 slide under tile 1 into a pile */
    gather: [0.12, 0.42],
    /** hero text block lifts and fades */
    text: [0.35, 0.6],
    /** purple surface fades to the page background */
    surface: [0.45, 0.75],
    /** the pile becomes the wide benefit card: the clip fully opens by the end of this window */
    morph: [0.42, 0.85],
    /** …its x reaches the slot early (pile slides to the centre first) */
    morphX: [0.42, 0.62],
    /** …and its y soon after, so the tall shape sits mid-viewport while it widens */
    morphY: [0.42, 0.72],
    /** …it grows tall first (noon's intermediate shape) */
    clipY: [0.42, 0.65],
    /** …then widens */
    clipX: [0.62, 0.85],
    /** the other four cards appear in their slots */
    reveal: [0.72, 0.88],
    /** card contents (titles, art) fade in */
    content: [0.85, 0.95],
    lock: 0.95,
    /** header and scroll hint switch to light-surface tones */
    tone: 0.6,
  },
  /** per-tile delay inside the gather window, in progress units */
  TILE_STAGGER_P: 0.03,
  REVEAL_STAGGER_P: 0.02,
  /** how far each later tile peeks from under tile 1 in the pile (px; x mirrors) */
  PILE: { fanX: 6, fanY: 0 },
  LOAD: { headlineStartMs: 50, wordStaggerMs: 40, subMs: 280, subStartMs: 300, tileStaggerMs: 70 },
  TEXT_EXIT_Y: -40,
  REVEAL_SCALE: 0.96,
  MOBILE_ART_PARALLAX_PX: 12,
  /** the tile strip is a scroll container below 1024: a 300px rise would overflow it */
  MOBILE_TILE_ENTER_PX: 24,
  MQ: {
    // The 3-column landing grid only exists at ≥1024, and a short viewport
    // cannot fit headline, price, CTA and the tile row in one pinned screen.
    desktop: '(min-width: 1024px) and (min-height: 760px)',
    reduce: '(prefers-reduced-motion: reduce)',
    // gsap.matchMedia only invokes the callback while at least one condition
    // matches; without this always-true-unless-reduced query the mobile
    // branch would never run and the pre-hidden hero would stay empty.
    motionOk: '(prefers-reduced-motion: no-preference)',
  },
  RESIZE_DEBOUNCE_MS: 200,
} as const;

type Point = { x: number; y: number };
/** transform + clip insets that make the wide card's visible square coincide with tile 1 */
type Morph = { x: number; y: number; insetX: number; insetY: number };
type Geometry = {
  gather: Point[];
  end: Point[];
  morph: Morph | null;
  /** signed x each headline word travels as the illustration closes (0 off its line) */
  wordShift: Map<HTMLElement, number>;
};

const all = <T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

const px = (value: number) => `${value}px`;

// Measures with every transform cleared, so the numbers describe natural
// layout regardless of where the scrub currently is. Every value is a
// difference of two rects read in the same frame, so it is scroll-independent
// and direction-correct in RTL without sign logic; only the authored fan
// carries the sign.
function measure(
  tiles: HTMLElement[],
  heroCards: HTMLElement[],
  gridCards: HTMLElement[],
  art: HTMLElement | null,
  sign: 1 | -1,
  pinDistance: number,
): Geometry {
  gsap.set([...tiles, ...heroCards], { clearProps: 'transform' });

  const rects = tiles.map((tile) => tile.getBoundingClientRect());
  const pile = rects[0];
  const gather = rects.map((rect, i) =>
    pile
      ? { x: pile.left - rect.left + i * HERO.PILE.fanX * sign, y: i * HERO.PILE.fanY }
      : { x: 0, y: 0 },
  );

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

  // The wide card starts clipped to a tile-sized square centred in its box,
  // translated so that square sits exactly over tile 1.
  const card = heroCards[0]?.getBoundingClientRect();
  let morph: Morph | null = null;
  if (pile && card) {
    const insetX = (card.width - pile.width) / 2;
    const insetY = (card.height - pile.height) / 2;
    morph = {
      insetX,
      insetY,
      x: pile.left - (card.left + insetX),
      y: pile.top - (card.top + insetY),
    };
  }

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

  return { gather, end, morph, wordShift };
}

function buildLoadSequence(hero: HTMLElement, desktop: boolean) {
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

  const tiles = all(hero, '[data-hero-tile]');
  if (tiles.length) {
    tl.fromTo(
      tiles,
      {
        y: desktop ? readPx('--hero-tile-enter-distance') : HERO.MOBILE_TILE_ENTER_PX,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: readSeconds('--hero-tile-enter'),
        stagger: msToSeconds(HERO.LOAD.tileStaggerMs),
      },
      readSeconds('--hero-tile-enter-start'),
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
  const tiles = all(hero, '[data-hero-tile]');
  const tilesRow = hero.querySelector<HTMLElement>('[data-hero-tiles]');
  const surface = hero.querySelector<HTMLElement>('[data-hero-surface]');
  const heroCards = all(hero, '[data-hero-card]');
  const gridCards = all(benefits, '[data-grid-card]');
  const inner = all(hero, '[data-hero-card] [data-card-inner]');
  const art = hero.querySelector<HTMLElement>('[data-hero-art]');
  const text = hero.querySelector<HTMLElement>('[data-hero-text]');
  const [wide, ...rest] = heroCards;

  // The mirror cards exist only for the scrub: hidden until it shows them,
  // their contents hidden separately so a revealed box is empty at first
  // (noon shows the pastel boxes, then their contents).
  gsap.set(heroCards, { opacity: 0 });
  gsap.set(inner, { opacity: 0 });
  gsap.set(gridCards, { visibility: 'hidden' });

  // With pinSpacing off, ScrollTrigger leaves the released hero overlapping the
  // section beneath for one more viewport of scroll. Hiding it at the unpin
  // edge is what makes Benefits "already in place underneath" visible.
  const swap = (to: 'grid' | 'hero') => {
    gsap.set(hero, { visibility: to === 'grid' ? 'hidden' : 'visible' });
    gsap.set(heroCards, { visibility: to === 'grid' ? 'hidden' : 'visible' });
    gsap.set(gridCards, { visibility: to === 'grid' ? 'visible' : 'hidden' });
  };

  // Published for the header and the scroll hint; written once per flip.
  let tone: HeroTone | null = null;
  const applyTone = (progress: number) => {
    const next: HeroTone = progress >= HERO.P.tone ? 'light' : 'dark';
    if (next === tone) return;
    tone = next;
    setHeroTone(next);
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
        Object.assign(
          geometry,
          measure(tiles, heroCards, gridCards, art, sign, window.innerHeight),
        );
        load.invalidate();
      },
      onRefresh: (self) => applyTone(self.progress),
      onUpdate: (self) => {
        // Scrolling before the load sequence ends: hand control to the scrub.
        if (load.isActive()) load.progress(1);
        applyTone(self.progress);
      },
      onLeave: () => {
        // Scrub lag could leave the morph mid-flight at the unpin edge.
        tl.progress(1);
        swap('grid');
        applyTone(1);
      },
      onEnterBack: (self) => {
        swap('hero');
        applyTone(self.progress);
      },
    },
  });

  // ScrollTrigger maps the pin onto the timeline's full duration, so the
  // timeline must span exactly 1 for the P windows to mean scroll fractions
  // (the last tween ends at P.content[1] < 1).
  tl.set({}, {}, 1);

  if (art) addArtExit(tl, art, geometry, P.art[0], P.art[1] - P.art[0]);

  // S2a — tiles 2–5 slide under tile 1 (DOM z-order already stacks them).
  // pointer-events is inherited, so one property on the row ends hover for
  // every tile; a `set` reverses cleanly when the scrub runs backwards.
  if (tilesRow) tl.set(tilesRow, { pointerEvents: 'none' }, P.gather[0]);
  const gatherDuration =
    P.gather[1] - P.gather[0] - HERO.TILE_STAGGER_P * Math.max(0, tiles.length - 2);
  tiles.slice(1).forEach((tile, j) => {
    const i = j + 1;
    tl.fromTo(
      tile,
      { x: 0, y: 0 },
      {
        x: () => geometry.gather[i]?.x ?? 0,
        y: () => geometry.gather[i]?.y ?? 0,
        duration: gatherDuration,
        immediateRender: false,
      },
      P.gather[0] + HERO.TILE_STAGGER_P * j,
    );
  });

  // S3 — text lifts out.
  if (text) {
    tl.fromTo(
      text,
      { y: 0, opacity: 1 },
      { y: HERO.TEXT_EXIT_Y, opacity: 0, duration: P.text[1] - P.text[0] },
      P.text[0],
    );
  }

  // S6 — the purple surface fades to the page background.
  if (surface) {
    tl.fromTo(
      surface,
      { opacity: 1 },
      { opacity: 0, duration: P.surface[1] - P.surface[0] },
      P.surface[0],
    );
  }

  // S2b — handover: in one tick the pile vanishes and the wide card appears
  // clipped to the identical square, then the box travels to its slot while
  // the clip opens (tall first, then wide). Four properties, four tweens: two
  // tweens on one property would overwrite each other per tick.
  if (tilesRow) tl.set(tilesRow, { autoAlpha: 0 }, P.morph[0]);
  if (wide) {
    tl.set(
      wide,
      {
        autoAlpha: 1,
        x: () => geometry.morph?.x ?? 0,
        y: () => geometry.morph?.y ?? 0,
        '--clip-x': () => px(geometry.morph?.insetX ?? 0),
        '--clip-y': () => px(geometry.morph?.insetY ?? 0),
        '--clip-r': () => px(readPx('--radius-tile')),
      },
      P.morph[0],
    );
    tl.to(
      wide,
      { x: () => geometry.end[0]?.x ?? 0, duration: P.morphX[1] - P.morphX[0] },
      P.morphX[0],
    );
    tl.to(
      wide,
      { y: () => geometry.end[0]?.y ?? 0, duration: P.morphY[1] - P.morphY[0] },
      P.morphY[0],
    );
    tl.to(
      wide,
      {
        '--clip-y': '0px',
        '--clip-r': () => px(readPx('--radius-card')),
        duration: P.clipY[1] - P.clipY[0],
      },
      P.clipY[0],
    );
    tl.to(wide, { '--clip-x': '0px', duration: P.clipX[1] - P.clipX[0] }, P.clipX[0]);
  }

  // S2c — the other cards appear in their slots (parked there from the start).
  const revealDuration =
    P.reveal[1] - P.reveal[0] - HERO.REVEAL_STAGGER_P * Math.max(0, rest.length - 1);
  rest.forEach((card, j) => {
    const i = j + 1;
    const x = () => geometry.end[i]?.x ?? 0;
    const y = () => geometry.end[i]?.y ?? 0;
    tl.fromTo(
      card,
      { opacity: 0, scale: HERO.REVEAL_SCALE, x, y },
      { opacity: 1, scale: 1, x, y, duration: revealDuration, immediateRender: false },
      P.reveal[0] + HERO.REVEAL_STAGGER_P * j,
    );
  });

  // S2d — contents fade in once the boxes have arrived.
  if (inner.length) {
    tl.fromTo(
      inner,
      { opacity: 0 },
      { opacity: 1, duration: P.content[1] - P.content[0], immediateRender: false },
      P.content[0],
    );
  }

  // S4 — hard-set the end state so the pin can never release on a stale frame.
  tl.add(() => {
    heroCards.forEach((card, i) =>
      gsap.set(card, {
        x: geometry.end[i]?.x ?? 0,
        y: geometry.end[i]?.y ?? 0,
        scale: 1,
        opacity: 1,
        '--clip-x': '0px',
        '--clip-y': '0px',
        '--clip-r': px(readPx('--radius-card')),
      }),
    );
    gsap.set(inner, { opacity: 1 });
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
            const tiles = all(hero, '[data-hero-tile]');
            const heroCards = all(hero, '[data-hero-card]');
            const gridCards = benefits ? all(benefits, '[data-grid-card]') : [];
            const art = hero.querySelector<HTMLElement>('[data-hero-art]');
            const geometry = measure(tiles, heroCards, gridCards, art, sign, window.innerHeight);
            const load = buildLoadSequence(hero, desktop);
            if (desktop && benefits) {
              setHeroTone('dark');
              buildPinnedScrub(hero, benefits, geometry, load, sign);
              // The attribute lives outside GSAP, so revert() cannot clear it.
              return () => setHeroTone(null);
            }
            buildMobile(hero, geometry);
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
