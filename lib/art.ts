// Every rendered asset the page shows, with its intrinsic size so next/image
// can reserve the box. Illustrations are the 3D stills produced by
// `scripts/render/render.mjs` (see that file for the scene definitions);
// merchant logos are public-domain SVGs from Wikimedia Commons.
//
// The alt text lives in `content/*.ts` (each slot's `title`), not here.

import type { Locale } from '@/lib/i18n';
import type { PaymentMethod } from '@/lib/pricing';

export type Art = { src: string; width: number; height: number };

const ill = (name: string, width: number, height: number): Art => ({
  src: `/illustrations/${name}.webp`,
  width,
  height,
});

/** the real home-screen captures shown in the About phone, one per locale (design: Home - WO - AR/EN) */
export const APP_SCREEN: Record<Locale, Art> = {
  ar: { src: '/app/home-ar.webp', width: 750, height: 1624 },
  en: { src: '/app/home-en.webp', width: 750, height: 1614 },
};

// The hero surface: the image fill of node 3:6 in the Figma community file
// "Spectral Gradient Vol 2.0", exported as-is (a near-black indigo field with
// one violet beam). It paints over --color-bg-hero-image until it loads and is
// faded out by the choreography mid-pin (S6). Community file: attribute per
// its licence before launch.
export const HERO_SURFACE: Art = { src: '/hero/spectral.jpg', width: 3840, height: 2160 };

// The headline animation: the design-supplied "Megaphone Loop" (a hand
// raising a megaphone, two floating discs, three sound waves), recoloured to
// the palette by `npm run render:headline` (scripts/render/recolor-lottie.mjs;
// the untouched source sits beside it). `crop` is the region of its 500 × 500
// canvas that is ever drawn on, measured over every frame including the discs'
// bob and the sound waves' travel, so the headline box hugs the artwork.
// The co-branded phone animation that `npm run render:lottie` assembles stays
// at /lottie/hero-cobrand.json as an alternative: swap `src` and drop `crop`.
export const HERO_LOTTIE = {
  src: '/lottie/hero-illustration.json',
  crop: { x: 0, y: 0, w: 482, h: 475 },
} as const;

/** the five hero sector tiles, in row order (tile 1 becomes the tone-1 wide card) */
export type HeroTileId = 'restaurants' | 'shopping' | 'travel' | 'entertainment' | 'health';

/** a Lottie a tile cross-fades to on hover in place of its label (components/hero/TileLottie.tsx) */
export type TileMotion = { src: string; crop: { x: number; y: number; w: number; h: number } };

// Only on a hover-capable desktop with motion allowed; touch and reduced
// motion keep the still and the label. `crop` is the region of the canvas the
// animation ever paints (measured over every frame, masks respected), so the
// coin fills the tile the way its still does.
export const TILE_MOTION: Partial<Record<HeroTileId, TileMotion>> = {
  // design-supplied "WO coin — spin, glint, float": 1080 × 1080, 30 fps,
  // 90 frames, a 3 s seamless loop on a transparent ground
  restaurants: { src: '/lottie/wo-coin.json', crop: { x: 230, y: 120, w: 620, h: 754 } },
};

export const ART = {
  tiles: {
    // all five are design-supplied illustrations (public/tiles), not renders
    restaurants: { src: '/tiles/wo-coin.webp', width: 693, height: 640 },
    shopping: { src: '/tiles/discount-gift.webp', width: 700, height: 423 },
    travel: { src: '/tiles/currency-exchange.webp', width: 700, height: 599 },
    entertainment: { src: '/tiles/shopping-gifts.webp', width: 700, height: 530 },
    health: { src: '/tiles/restaurant-delivery.webp', width: 569, height: 640 },
  } satisfies Record<HeroTileId, Art>,
  benefits: {
    // Same order as `content.benefits.cards`.
    cards: [
      ill('offers', 840, 400),
      ill('points', 420, 340),
      ill('choices', 420, 340),
      ill('rate', 420, 340),
    ],
    wide: ill('cobrand', 840, 400),
  },
  howTo: [ill('step1', 640, 400), ill('step2', 640, 400), ill('step3', 640, 400)],
} as const;

// Scheme marks for the payment step (Wikimedia Commons, public-domain
// geometry). "card" shows the Mastercard circles as the generic credit card.
export const PAYMENT_MARKS: Record<PaymentMethod, Art> = {
  mada: { src: '/payment/mada.svg', width: 796, height: 266 },
  visa: { src: '/payment/visa.svg', width: 1000, height: 325 },
  card: { src: '/payment/mastercard.svg', width: 1000, height: 618 },
};

export type Brand = Art & { id: string; name: string };

// Sample merchants across the six sectors. Public-domain geometry (simple
// wordmarks/shapes are not copyrightable) but trademarks still apply: swap in
// the confirmed WalaOne partner list before launch.
export const BRANDS: readonly Brand[] = [
  { id: 'mcdonalds', name: "McDonald's", src: '/brands/mcdonalds.svg', width: 273, height: 239 },
  { id: 'kfc', name: 'KFC', src: '/brands/kfc.svg', width: 221, height: 70 },
  { id: 'ikea', name: 'IKEA', src: '/brands/ikea.svg', width: 100, height: 40 },
  { id: 'nike', name: 'Nike', src: '/brands/nike.svg', width: 1000, height: 356 },
  { id: 'hm', name: 'H&M', src: '/brands/hm.svg', width: 709, height: 467 },
  { id: 'adidas', name: 'adidas', src: '/brands/adidas.svg', width: 725, height: 500 },
  { id: 'sephora', name: 'Sephora', src: '/brands/sephora.svg', width: 512, height: 66 },
  { id: 'booking', name: 'Booking.com', src: '/brands/booking.svg', width: 119, height: 20 },
  { id: 'marriott', name: 'Marriott', src: '/brands/marriott.svg', width: 744, height: 384 },
  { id: 'uber', name: 'Uber', src: '/brands/uber.svg', width: 927, height: 322 },
];
