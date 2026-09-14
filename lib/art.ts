// Every rendered asset the page shows, with its intrinsic size so next/image
// can reserve the box. Illustrations are the 3D stills produced by
// `scripts/render/render.mjs` (see that file for the scene definitions), the
// phone on the first Benefits card by `scripts/render/build-phone-mockup.mjs`
// from a Figma community mockup; merchant logos come from walaone.com
// through `scripts/render/build-brands.mjs`.
//
// The alt text lives in `content/*.ts` (each slot's `title`), not here.

import type { Locale } from '@/lib/i18n';
import type { PaymentMethod } from '@/lib/pricing';

export type Art = { src: string; width: number; height: number };

/** the real home-screen captures inside the About phone, one per locale (design: Home - WO - AR/EN) */
export const APP_SCREEN: Record<Locale, Art> = {
  ar: { src: '/app/home-ar.webp', width: 750, height: 1624 },
  en: { src: '/app/home-en.webp', width: 750, height: 1614 },
};

/**
 * The flag shown in the phone field's country block: the Twemoji Saudi Arabia
 * flag (SVG Repo 405595, the Twemoji set; graphics CC-BY 4.0 by Twitter),
 * cropped to the flag inside its 36 × 36 emoji canvas and rasterised at 3× the
 * size it is drawn at by scripts/render/build-flag.mjs. The rounded corners
 * are the emoji tile's own, baked into the image, so the page neither rounds
 * nor crops it — cropping to another ratio would cut the shahada. Decorative:
 * the dial code beside it carries the meaning, so it renders with an empty alt.
 */
export const DIAL_FLAG: Record<'sa', Art> = {
  sa: { src: '/flags/sa.webp', width: 72, height: 52 },
};

/**
 * The About phone: the UI8 kit "Aganta - Mobile App Landing Website UI Kit"
 * (Figma key 54gPLHdsJKLMMubB2NZjk7) node 8803:2881 "Mockup", an iPhone 14 Pro
 * "Silver" frame over a rounded block of a gradient photo with the home capture
 * inside, rebuilt in the DOM by AppMockup from the node's own two images
 * (prepared by `npm run render:about`). `layout` is the node's geometry in its
 * units: the composition, the glow block, the screen rect (rx = its corner
 * radius) and the frame image. A purchased UI8 asset: keep within its licence.
 */
export const ABOUT_MOCKUP = {
  frame: { src: '/about/iphone-14-pro-silver.webp', width: 904, height: 1837 },
  glow: { src: '/about/mockup-glow.webp', width: 725, height: 771 },
  layout: {
    w: 550.186,
    h: 738,
    glow: { x: 67.391, y: 295.819, w: 415.401, h: 441.916 },
    screen: { x: 120.081, y: 15.045, w: 310.458, h: 672.244, rx: 38.73 },
    frame: { x: 102.745, y: 0, w: 345.491, h: 701.587 },
  },
} as const;

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

/** the five hero sector tiles, in row order (tile 1 becomes the first benefit card, which shares its tone) */
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

/**
 * What a benefit card shows at its foot: a 3D still sitting at the inline end,
 * or a phone standing centred on the bottom edge with its top three quarters
 * in view (the asset is already cropped to that; BenefitCard fits it in a box).
 */
export type BenefitArt = Art & { kind: 'still' | 'phone' };

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
    // Same order as `content.benefits.cards`. All three are Figma community
    // mockups ("Matte iPhone Mockups - 2021 Updated", the matte iPhone 13
    // template: node 55977:6896 with the map screen, 55977:7434 with the
    // points-transfer screen, 55977:9066 with the marketplace screen), built by
    // `npm run render:phone`: page background and shadow cut away, the body
    // recoloured to the card's --color-phone-frame* token, top three quarters
    // kept. Attribute the community file per its licence before launch.
    cards: [
      { kind: 'phone', src: '/mockups/map-phone.webp', width: 848, height: 1283 },
      { kind: 'phone', src: '/mockups/transfer-phone.webp', width: 848, height: 1283 },
      { kind: 'phone', src: '/mockups/market-phone.webp', width: 846, height: 1283 },
    ] satisfies readonly BenefitArt[],
  },
} as const;

/**
 * The three "how to subscribe" step animations, in step order: the design's
 * Neo-Brutalism Lottie set, one file chosen per step (savings for the details,
 * a payment gateway for the payment, a device for opening the app), recoloured
 * into the Primary purple and Secondary yellow families and stripped of their
 * Duik expression rig by `npm run render:steps`. Square canvases, so the card
 * reserves a square box before the player arrives.
 */
export const HOWTO_MOTION: readonly Art[] = [
  { src: '/lottie/step1.json', width: 350, height: 350 },
  { src: '/lottie/step2.json', width: 256, height: 256 },
  { src: '/lottie/step3.json', width: 256, height: 256 },
];

// Scheme marks for the payment step (Wikimedia Commons, public-domain
// geometry). "card" shows the Mastercard circles as the generic credit card.
export const PAYMENT_MARKS: Record<PaymentMethod, Art> = {
  mada: { src: '/payment/mada.svg', width: 796, height: 266 },
  visa: { src: '/payment/visa.svg', width: 1000, height: 325 },
  card: { src: '/payment/mastercard.svg', width: 1000, height: 618 },
};

export type Brand = Art & { id: string; name: string };

/** every merchant logo is normalised onto this square canvas by `npm run render:brands`: each is scaled to the same ink area inside 85 % of it, so a wordmark and a square mark read alike */
export const BRAND_CANVAS = { width: 320, height: 320 } as const;

const brand = (id: string, name: string): Brand => ({
  id,
  name,
  src: `/brands/${id}.webp`,
  ...BRAND_CANVAS,
});

// The twelve merchants of walaone.com's "3,500+ service providers" block, in
// the site's DOM order (right to left on the Arabic page, which `dir` gives
// the rows here for free), in colour: scripts/render/build-brands.mjs.
export const BRAND_ROWS: readonly (readonly Brand[])[] = [
  [
    brand('baskin-robbins', 'Baskin Robbins'),
    brand('ninja', 'Ninja'),
    brand('noon', 'noon'),
    brand('toyou', 'ToYou'),
    brand('aliexpress', 'AliExpress'),
    brand('dr-cafe', 'dr.CAFE Coffee'),
  ],
  [
    brand('temu', 'TEMU'),
    brand('dominos', "Domino's Pizza"),
    brand('nana', 'nana'),
    brand('deraah', 'Deraah'),
    brand('amazon', 'Amazon'),
    brand('tiko', 'Tiko'),
  ],
];
