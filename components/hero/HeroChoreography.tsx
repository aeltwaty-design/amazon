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
    art: [0, 0.1],
    /** all five tiles slide to the row centre, tile 1 on top, later tiles peeking */
    gather: [0.06, 0.36],
    /** the peeking edges slide fully under tile 1 */
    tuck: [0.36, 0.42],
    /** hero text block lifts and fades */
    text: [0.42, 0.58],
    /** purple surface fades to the page background */
    surface: [0.5, 0.72],
    /** the square (now the first card, clipped) stretches into a tall centred bar */
    bar: [0.42, 0.6],
    /** the bar contracts to pill 1; the other pills emerge from behind it into a stack */
    split: [0.6, 0.72],
    /** all pills expand into their grid slots */
    expand: [0.72, 0.86],
    /** card contents (titles, art) fade in */
    content: [0.86, 0.95],
    lock: 0.95,
    /** header and scroll hint switch to light-surface tones */
    tone: 0.62,
  },
  /** per-tile delay inside the gather window, in progress units (tile 1 first) */
  TILE_STAGGER_P: 0.02,
  /** how far each later tile peeks from under tile 1 during the gather (px; x mirrors via sign) */
  PILE: { fanX: 8, fanY: 0 },
  /** bar = the card scaled vertically; capped so the bar height ≤ 0.58 × viewport */
  BAR: { scaleY: 1.5, maxViewportFrac: 0.58 },
  /** pill height (px) and the stack gap; pill width = tile width */
  PILL: { h: 60, gap: 12 },
  LOAD: { headlineStartMs: 50, wordStaggerMs: 40, subMs: 280, subStartMs: 300, tileStaggerMs: 70 },
  TEXT_EXIT_Y: -40,
  /**
   * The no-pin exit (stacked and short layouts, MOTION.md M1–M6): fractions
   * of the hero's own height scrolled out — 0 with its top at the viewport
   * top, 1 with its bottom there.
   */
  M: {
    /** the illustration bobs down as the hero leaves */
    parallax: [0, 1],
    /** headline illustration collapses, the H1 halves close */
    art: [0.05, 0.22],
    /** the first stacked benefit card rises into place */
    lift: [0.1, 0.6],
    /** hero text block lifts and fades — early, since the header is transparent while the tone is dark */
    text: [0.18, 0.45],
    /** purple surface fades to the page background, once the text has gone */
    surface: [0.45, 0.85],
    /** header and scroll hint switch to light-surface tones */
    tone: 0.62,
  },
  MOBILE_ART_PARALLAX_PX: 12,
  /** where the first stacked card waits before M6 lifts it into place */
  LIFT_FROM: { y: 56, scale: 0.96 },
  /** the short layout's tile grid sits at the hero's bottom edge with no clip: a 300px rise would paint over Benefits */
  TILE_ENTER_PX_UNPINNED: 24,
  MQ: {
    // The 3-column landing grid only exists at ≥1024, and a short viewport
    // cannot fit headline, price, CTA and the tile row in one pinned screen.
    desktop: '(min-width: 1024px) and (min-height: 760px)',
    // Wide enough for the tile grid and the three-column cards even when too
    // short to pin — the "short" layout; below it the cards stack.
    lg: '(min-width: 1024px)',
    reduce: '(prefers-reduced-motion: reduce)',
    // gsap.matchMedia only invokes the callback while at least one condition
    // matches; without this always-true-unless-reduced query the mobile
    // branch would never run and the pre-hidden hero would stay empty.
    motionOk: '(prefers-reduced-motion: no-preference)',
  },
  RESIZE_DEBOUNCE_MS: 200,
} as const;

type Revertable = { revert: (revert: boolean, temp: boolean) => void };
/** the hero a viewport gets: the pin, the short desktop, or a stacked phone */
type HeroLayout = 'pinned' | 'short' | 'stacked';
type Point = { x: number; y: number };
type CardGeo = {
  /** Flip.fit x/y − pinDistance: the transform that puts the mirror on its grid twin */
  end: Point;
  /** x that puts the card's centre on the tile row's centre */
  centreX: number;
  /** (card.w − tile.w) / 2: clip inset that leaves a tile-wide strip */
  pillInsetX: number;
  /** (card.h − pillH) / 2: clip inset that leaves a pill-tall strip */
  pillInsetY: number;
  /** y that puts the card's centre on the pinned viewport's vertical centre (= bar centre) */
  pillFromY: number;
  /** y that puts the pill at its stacked position */
  pillToY: number;
};
/** transform + clip insets that make the first card's visible square coincide with tile 1 */
type Square = { x: number; y: number; insetX: number; insetY: number };
type Geometry = {
  /** per tile: to the row centre (+ fan for i ≥ 1) */
  gather: Point[];
  /** per tile: to the row centre, no fan */
  tucked: Point[];
  /** first card clipped to tile 1's square at the row centre */
  square: Square | null;
  /** first card y that centres it on the pinned viewport's vertical centre */
  barY: number;
  /** scaleY for the bar */
  barScale: number;
  cards: CardGeo[];
  /** signed x each headline word travels as the illustration closes (0 off its line) */
  wordShift: Map<HTMLElement, number>;
};
/** all the no-pin exit needs to measure */
type WordGeometry = Pick<Geometry, 'wordShift'>;

const all = <T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] =>
  Array.from(root.querySelectorAll<T>(selector));

const px = (value: number) => `${value}px`;

const midX = (rect: DOMRect) => rect.left + rect.width / 2;
const midY = (rect: DOMRect) => rect.top + rect.height / 2;

// Measures with every transform cleared, so the numbers describe natural
// layout regardless of where the scrub currently is. Every value is a
// difference of two rects read in the same frame, so it is scroll-independent
// and direction-correct in RTL without sign logic; only the authored fan
// carries the sign.
function measure(
  hero: HTMLElement,
  tiles: HTMLElement[],
  heroCards: HTMLElement[],
  gridCards: HTMLElement[],
  art: HTMLElement | null,
  sign: 1 | -1,
  pinDistance: number,
): Geometry {
  gsap.set([...tiles, ...heroCards], { clearProps: 'transform' });

  const heroRect = hero.getBoundingClientRect();
  const rects = tiles.map((tile) => tile.getBoundingClientRect());
  const t = rects[0];
  const last = rects[rects.length - 1];

  // The row centre. The first tile is at the inline-start and the last at the
  // inline-end, and every tile has the same width, so the average is the same
  // number in LTR and RTL.
  const centreX = t && last ? (t.left + last.right) / 2 : 0;
  const gather = rects.map((rect, i) => ({
    x: centreX - midX(rect) + i * HERO.PILE.fanX * sign,
    y: i * HERO.PILE.fanY,
  }));
  const tucked = rects.map((rect) => ({ x: centreX - midX(rect), y: 0 }));

  // While pinned the hero's top is the viewport's top, so the pinned
  // viewport's centre sits pinDistance / 2 below the hero's top wherever the
  // hero currently is on screen.
  const viewportMidY = heroRect.top + pinDistance / 2;

  // The pill stack: one pill per card, centred as a block on the viewport.
  const heights = heroCards.map(() => HERO.PILL.h);
  const total =
    heights.reduce((sum, h) => sum + h, 0) + HERO.PILL.gap * Math.max(0, heights.length - 1);
  let pillTop = viewportMidY - total / 2;

  const cardRects = heroCards.map((card) => card.getBoundingClientRect());
  const cards = heroCards.map((card, i): CardGeo => {
    // Flip.fit gives the transform that makes the hero card's box coincide
    // with its grid twin at natural positions. At unpin the Benefits section
    // has travelled up by exactly the pin distance, hence the subtraction.
    const target = gridCards[i];
    const vars = target
      ? (Flip.fit(card, target, { getVars: true, scale: true }) as {
          x?: number;
          y?: number;
        } | null)
      : null;
    const end = { x: vars?.x ?? 0, y: (vars?.y ?? 0) - pinDistance };

    const c = cardRects[i];
    const h = heights[i] ?? HERO.PILL.h;
    const pillMid = pillTop + h / 2;
    pillTop += h + HERO.PILL.gap;
    if (!c) {
      return { end, centreX: 0, pillInsetX: 0, pillInsetY: 0, pillFromY: 0, pillToY: 0 };
    }
    // Every inset is symmetric, so a clipped rect stays centred in its card:
    // moving the card's centre moves the pill's centre by the same amount.
    return {
      end,
      centreX: centreX - midX(c),
      pillInsetX: t ? (c.width - t.width) / 2 : 0,
      pillInsetY: (c.height - h) / 2,
      pillFromY: viewportMidY - midY(c),
      pillToY: pillMid - midY(c),
    };
  });

  // The first card starts clipped to a tile-sized square centred in its box,
  // translated so that square sits exactly over tile 1 after the gather
  // (tile 1 carries no fan, so it is centred on the row).
  const c0 = cardRects[0];
  let square: Square | null = null;
  let barScale = 1;
  let barY = 0;
  if (t && c0) {
    const insetX = (c0.width - t.width) / 2;
    const insetY = (c0.height - t.height) / 2;
    square = {
      insetX,
      insetY,
      x: centreX - t.width / 2 - (c0.left + insetX),
      y: t.top - (c0.top + insetY),
    };
    barScale = Math.min(HERO.BAR.scaleY, (HERO.BAR.maxViewportFrac * pinDistance) / c0.height);
    barY = viewportMidY - midY(c0);
  }

  return { gather, tucked, square, barY, barScale, cards, wordShift: measureWordShift(art, sign) };
}

// The illustration exit must not reflow the headline (a scroll-driven reflow
// is a layout shift), so it is scaleX on the art plus translateX on the words
// that share its line. offsetTop ignores transforms, which is what makes this
// measurement stable mid-animation — and lets the no-pin exit measure it
// without clearing anything first.
function measureWordShift(art: HTMLElement | null, sign: 1 | -1): Map<HTMLElement, number> {
  const wordShift = new Map<HTMLElement, number>();
  if (!art) return wordShift;
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
  return wordShift;
}

function buildLoadSequence(hero: HTMLElement, layout: HeroLayout) {
  const out = ease('outCubic');
  const tl = gsap.timeline({ defaults: { ease: out } });

  tl.fromTo(
    all(hero, '[data-hero-word]'),
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
    all(hero, '[data-hero-ctas]'),
    { y: readPx('--hero-cta-enter-distance'), opacity: 0 },
    {
      keyframes: [
        { y: readPx('--hero-cta-settle'), opacity: 1, duration: ctaDuration * 0.7, ease: out },
        { y: 0, duration: ctaDuration * 0.3, ease: 'power2.out' },
      ],
    },
    readSeconds('--hero-cta-enter-start'),
  );

  // No tile row below 1024 (`.hero-tiles` is display: none), so nothing rises.
  const tiles = layout === 'stacked' ? [] : all(hero, '[data-hero-tile]');
  if (tiles.length) {
    tl.fromTo(
      tiles,
      {
        y: layout === 'pinned' ? readPx('--hero-tile-enter-distance') : HERO.TILE_ENTER_PX_UNPINNED,
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
  geometry: WordGeometry,
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

// Published for the header and the scroll hint; written once per flip. The
// pin (S7) and the no-pin exit (M5) both publish through this.
function toneWriter(threshold: number) {
  let tone: HeroTone | null = null;
  return (progress: number) => {
    const next: HeroTone = progress >= threshold ? 'light' : 'dark';
    if (next === tone) return;
    tone = next;
    setHeroTone(next);
  };
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
  const [lead, ...rest] = heroCards;

  // Radii are tokens; read at render time so a token edit survives a refresh.
  const rTile = () => readPx('--radius-tile');
  const rPill = () => readPx('--radius-plan');
  const rCard = () => readPx('--radius-card');

  // The mirror cards exist only for the scrub: hidden until it shows them,
  // their contents hidden separately so a revealed box is empty at first
  // (noon shows the pastel boxes, then their contents). The first card paints
  // above the others so the pills emerge from behind it.
  gsap.set(heroCards, { opacity: 0 });
  gsap.set(inner, { opacity: 0 });
  gsap.set(gridCards, { visibility: 'hidden' });
  if (lead) gsap.set(lead, { zIndex: 2 });

  // With pinSpacing off, ScrollTrigger leaves the released hero overlapping the
  // section beneath for one more viewport of scroll. Hiding it at the unpin
  // edge is what makes Benefits "already in place underneath" visible.
  const swap = (to: 'grid' | 'hero') => {
    gsap.set(hero, { visibility: to === 'grid' ? 'hidden' : 'visible' });
    gsap.set(heroCards, { visibility: to === 'grid' ? 'hidden' : 'visible' });
    gsap.set(gridCards, { visibility: to === 'grid' ? 'visible' : 'hidden' });
  };

  const applyTone = toneWriter(HERO.P.tone);

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
      onRefreshInit: (self) => {
        // ScrollTrigger dispatches refreshInit BEFORE it reverts pins, so a
        // refresh that lands mid-pin (window load, its own resize pass, the
        // scrollEnd soft refresh) would see the hero fixed at the top while
        // Benefits has scrolled by the in-pin offset, and Flip.fit would bake
        // that offset into every `end`. Reverting first (a no-op once
        // reverted: ScrollTrigger guards on `isReverted` and would do the
        // same a moment later) puts both grids at natural document positions.
        // `revert(revert, temp)` is what gsap.context() and matchMedia() call
        // to lift a pin; it is not in ScrollTrigger's public typings, and
        // `temp` must be true or the trigger is killed instead.
        (self as ScrollTrigger & Revertable).revert(true, true);
        Object.assign(
          geometry,
          measure(hero, tiles, heroCards, gridCards, art, sign, window.innerHeight),
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

  // S2a — every tile slides to the row centre, tile 1 first; the later tiles
  // arrive fanned out from under it (DOM z-order keeps tile 1 on top), then
  // tuck fully under. pointer-events is inherited, so one property on the row
  // ends hover for every tile; a `set` reverses cleanly when the scrub runs
  // backwards.
  if (tilesRow) tl.set(tilesRow, { pointerEvents: 'none' }, P.gather[0]);
  const gatherDuration =
    P.gather[1] - P.gather[0] - HERO.TILE_STAGGER_P * Math.max(0, tiles.length - 1);
  tiles.forEach((tile, i) => {
    tl.fromTo(
      tile,
      { x: 0, y: 0 },
      {
        x: () => geometry.gather[i]?.x ?? 0,
        y: () => geometry.gather[i]?.y ?? 0,
        duration: gatherDuration,
        immediateRender: false,
      },
      P.gather[0] + HERO.TILE_STAGGER_P * i,
    );
  });
  tiles.slice(1).forEach((tile, j) => {
    const i = j + 1;
    tl.to(
      tile,
      {
        x: () => geometry.tucked[i]?.x ?? 0,
        y: () => geometry.tucked[i]?.y ?? 0,
        duration: P.tuck[1] - P.tuck[0],
        immediateRender: false,
      },
      P.tuck[0],
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

  // S2b — handover: in one tick the tile row vanishes and the first card
  // appears clipped to the identical square at the row centre (tile 1 sits
  // there with x = gather[0].x). Then the square stretches into a tall bar
  // centred on the viewport: the card scales vertically while `--clip-y`
  // opens to 0; `--clip-x` stays at the square inset, so the bar is exactly
  // tile-wide, and ry is divided by the scale so the corners stay round.
  if (tilesRow) tl.set(tilesRow, { autoAlpha: 0 }, P.bar[0]);
  if (lead) {
    tl.set(
      lead,
      {
        autoAlpha: 1,
        x: () => geometry.square?.x ?? 0,
        y: () => geometry.square?.y ?? 0,
        scaleY: 1,
        '--clip-x': () => px(geometry.square?.insetX ?? 0),
        '--clip-y': () => px(geometry.square?.insetY ?? 0),
        '--clip-rx': () => px(rTile()),
        '--clip-ry': () => px(rTile()),
      },
      P.bar[0],
    );
    tl.to(
      lead,
      {
        y: () => geometry.barY,
        scaleY: () => geometry.barScale,
        '--clip-y': '0px',
        '--clip-ry': () => px(rTile() / geometry.barScale),
        duration: P.bar[1] - P.bar[0],
        immediateRender: false,
      },
      P.bar[0],
    );

    // S2c — the bar contracts into the first pill at the top of the stack…
    tl.to(
      lead,
      {
        y: () => geometry.cards[0]?.pillToY ?? 0,
        scaleY: 1,
        '--clip-y': () => px(geometry.cards[0]?.pillInsetY ?? 0),
        '--clip-rx': () => px(rPill()),
        '--clip-ry': () => px(rPill()),
        duration: P.split[1] - P.split[0],
        immediateRender: false,
      },
      P.split[0],
    );
  }

  // …while the other cards appear as pills behind the bar's centre (hidden by
  // it: the first card paints on top) and slide down to their stacked places.
  rest.forEach((card, j) => {
    const i = j + 1;
    tl.set(
      card,
      {
        autoAlpha: 1,
        x: () => geometry.cards[i]?.centreX ?? 0,
        y: () => geometry.cards[i]?.pillFromY ?? 0,
        scaleY: 1,
        '--clip-x': () => px(geometry.cards[i]?.pillInsetX ?? 0),
        '--clip-y': () => px(geometry.cards[i]?.pillInsetY ?? 0),
        '--clip-rx': () => px(rPill()),
        '--clip-ry': () => px(rPill()),
      },
      P.split[0],
    );
    tl.to(
      card,
      {
        y: () => geometry.cards[i]?.pillToY ?? 0,
        duration: P.split[1] - P.split[0],
        immediateRender: false,
      },
      P.split[0],
    );
  });

  // S2d — every pill expands into its grid slot at once: the box travels to
  // its Flip.fit position while the clip opens fully and the radius becomes
  // the card's.
  heroCards.forEach((card, i) => {
    tl.to(
      card,
      {
        x: () => geometry.cards[i]?.end.x ?? 0,
        y: () => geometry.cards[i]?.end.y ?? 0,
        '--clip-x': '0px',
        '--clip-y': '0px',
        '--clip-rx': () => px(rCard()),
        '--clip-ry': () => px(rCard()),
        duration: P.expand[1] - P.expand[0],
        immediateRender: false,
      },
      P.expand[0],
    );
  });

  // S2e — contents fade in once the boxes have arrived.
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
        x: geometry.cards[i]?.end.x ?? 0,
        y: geometry.cards[i]?.end.y ?? 0,
        scaleY: 1,
        opacity: 1,
        '--clip-x': '0px',
        '--clip-y': '0px',
        '--clip-rx': px(rCard()),
        '--clip-ry': px(rCard()),
      }),
    );
    gsap.set(inner, { opacity: 1 });
  }, P.lock);

  return tl;
}

// The no-pin exit (MOTION.md M1–M6): one timeline scrubbed by the hero's own
// height, so a phone scrolls straight through — the illustration bobs and
// closes, the text lifts and fades, the surface fades to the page, and on a
// stacked layout the first benefit card rises out of it. `end: 'bottom top'`
// depends on nothing but the hero's height, which is svh, so the address bar
// moves neither the mapping nor the trigger (GSAP already ignores height-only
// resizes on touch-only devices; see lib/motion.ts). `scrub: true`, not a
// number: the card is a real in-flow element, and smoothing would read as it
// detaching from the page.
function buildMobile(
  hero: HTMLElement,
  geometry: WordGeometry,
  load: gsap.core.Timeline,
  lift: HTMLElement | null,
  sign: 1 | -1,
) {
  const art = hero.querySelector<HTMLElement>('[data-hero-art]');
  const text = hero.querySelector<HTMLElement>('[data-hero-text]');
  const surface = hero.querySelector<HTMLElement>('[data-hero-surface]');
  const mirror = hero.querySelector<HTMLElement>('[data-hero-mirror]');
  // CSS hides the mirror below 1024; the short layout has it on and no pin to use it.
  if (mirror) gsap.set(mirror, { display: 'none' });

  const applyTone = toneWriter(HERO.M.tone);
  const { M } = HERO;
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        geometry.wordShift = measureWordShift(art, sign);
      },
      onRefresh: (self) => applyTone(self.progress),
      onUpdate: (self) => {
        // Scrolling before the load sequence ends hands control to the scrub.
        // A refresh also fires this: at the top it is 0 → 0 and the entrance
        // still plays; a reload mid-page lands at p > 0 and skips it instead
        // of playing it off-screen. Read progress, not isActive(): a timeline
        // that has not rendered a frame yet — the reload case — is not active.
        if (self.progress > 0 && load.progress() < 1) load.progress(1);
        applyTone(self.progress);
      },
      onLeave: () => applyTone(1),
      onEnterBack: (self) => applyTone(self.progress),
    },
  });
  // Span exactly 1 so the M windows read as scroll fractions (as the pin does).
  tl.set({}, {}, 1);

  if (art) {
    tl.fromTo(
      art,
      { y: 0 },
      { y: HERO.MOBILE_ART_PARALLAX_PX, duration: M.parallax[1] - M.parallax[0] },
      M.parallax[0],
    );
    addArtExit(tl, art, geometry, M.art[0], M.art[1] - M.art[0]);
  }
  // fromTo renders its start state at build, before first paint: that is what
  // hides the card until the scroll lifts it, with no CSS pre-hide to undo.
  if (lift) {
    tl.fromTo(
      lift,
      { y: HERO.LIFT_FROM.y, scale: HERO.LIFT_FROM.scale, opacity: 0, transformOrigin: '50% 50%' },
      { y: 0, scale: 1, opacity: 1, duration: M.lift[1] - M.lift[0] },
      M.lift[0],
    );
  }
  if (text) {
    tl.fromTo(
      text,
      { y: 0, opacity: 1 },
      { y: HERO.TEXT_EXIT_Y, opacity: 0, duration: M.text[1] - M.text[0] },
      M.text[0],
    );
  }
  if (surface) {
    tl.fromTo(
      surface,
      { opacity: 1 },
      { opacity: 0, duration: M.surface[1] - M.surface[0] },
      M.surface[0],
    );
  }
  return tl;
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
          {
            desktop: HERO.MQ.desktop,
            lg: HERO.MQ.lg,
            reduce: HERO.MQ.reduce,
            motionOk: HERO.MQ.motionOk,
          },
          (ctx) => {
            const conditions = (ctx.conditions ?? {}) as Record<string, boolean>;
            // CSS already shows everything and hides the mirror; nothing to animate.
            if (conditions.reduce) return;
            const layout: HeroLayout =
              conditions.desktop && benefits ? 'pinned' : conditions.lg ? 'short' : 'stacked';
            const art = hero.querySelector<HTMLElement>('[data-hero-art]');
            const load = buildLoadSequence(hero, layout);
            // Both exits publish the tone; set before any refresh so the
            // header never reads "absent" mid-build.
            setHeroTone('dark');
            if (layout === 'pinned' && benefits) {
              const geometry = measure(
                hero,
                all(hero, '[data-hero-tile]'),
                all(hero, '[data-hero-card]'),
                all(benefits, '[data-grid-card]'),
                art,
                sign,
                window.innerHeight,
              );
              buildPinnedScrub(hero, benefits, geometry, load, sign);
            } else {
              // Only a stacked layout hands its first card to the hero (M6);
              // the short desktop's three-column cards reveal in flow.
              const lift =
                layout === 'stacked' && benefits
                  ? benefits.querySelector<HTMLElement>('[data-hero-lift]')
                  : null;
              buildMobile(hero, { wordShift: measureWordShift(art, sign) }, load, lift, sign);
            }
            // The attribute lives outside GSAP, so revert() cannot clear it.
            return () => setHeroTone(null);
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
