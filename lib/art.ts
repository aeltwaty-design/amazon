// Every rendered asset the page shows, with its intrinsic size so next/image
// can reserve the box. Illustrations are the 3D stills produced by
// `scripts/render/render.mjs` (see that file for the scene definitions);
// merchant logos are public-domain SVGs from Wikimedia Commons.
//
// The alt text lives in `content/*.ts` (each slot's `title`), not here.

import type { PaymentMethod } from '@/lib/pricing';

export type Art = { src: string; width: number; height: number };

const ill = (name: string, width: number, height: number): Art => ({
  src: `/illustrations/${name}.webp`,
  width,
  height,
});

/** the five hero sector tiles, in row order (tile 1 becomes the tone-1 wide card) */
export type HeroTileId = 'restaurants' | 'shopping' | 'travel' | 'entertainment' | 'health';

export const ART = {
  tiles: {
    restaurants: ill('tile-restaurants', 432, 432),
    shopping: ill('tile-shopping', 432, 432),
    travel: ill('tile-travel', 432, 432),
    entertainment: ill('tile-entertainment', 432, 432),
    health: ill('tile-health', 432, 432),
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
