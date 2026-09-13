# WalaOne × Amazon landing page

Bilingual (Arabic-first RTL, English) landing page for the WalaOne × Amazon employee membership. Next.js 15 App Router, Tailwind v4, GSAP scroll choreography, mocked purchase flow.

## Scripts

| Script                | What it does                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `npm run dev`         | Dev server. `/` redirects to `/ar`; `/en` is the English page.     |
| `npm run build`       | Production build.                                                  |
| `npm run check`       | typecheck + eslint + lint:colors + build — the definition of done. |
| `npm run lint:colors` | Fails if any colour is written outside `styles/tokens.css`.        |
| `npm run format`      | Prettier over the tree.                                            |

## Demo triggers (mocked purchase flow)

There is no backend. `lib/mockApi.ts` simulates it with ~700 ms latency. Any six digits pass the identity step and any approved-domain email subscribes, except these deterministic switches:

| Input                               | Where    | Result                                                  |
| ----------------------------------- | -------- | ------------------------------------------------------- |
| `test.pending@amazon.com`           | Details  | "already an active or pending subscription" under email |
| `test.payfail@amazon.com`           | Payment  | first attempt fails (nothing charged), retry succeeds   |
| code `999999`                       | Identity | wrong code                                              |
| code `000000`                       | Identity | expired code (also reachable by waiting 60 s)           |
| any other `@amazon.com`/`amazon.sa` | —        | happy path → order reference `WO-AMZ-XXXXXX`            |

Accepted email domains live in `APPROVED_DOMAINS` in `lib/validation.ts`; subdomains such as `eu.amazon.com` are accepted. Saudi mobiles are accepted as `05…`, `+9665…`, `009665…` or `5…`, with spaces, dashes or Arabic-Indic digits, and stored as E.164.

## What was verified

On the production build (`next build && next start`) with headless Chromium, in `/ar` and `/en` at 1440×900 and 390×844:

- Hero pin lasts exactly one viewport; at the unpin scroll the three hero cards and their grid twins report identical rectangles in Arabic and rectangles within 0.5 px in English, where Figtree’s fractional line heights put the grid on a half pixel (see `MOTION.md` for the mechanism); at the 0.42 handover the first card's clipped square reports tile 1's rectangle in both locales, including after a resize mid-pin; at p 0.72 the three mirror cards report equal-width clipped rectangles stacked and centred on the viewport.
- Benefits is one viewport tall on desktop with the section rhythm as its padding: three cards side by side whose height is the section's content box (647 px at 1440 × 900, 507 px at 1024 × 760, 347 px wide from the 1116 px content container), the mirror cards the same size as their twins, the heading present for assistive tech at 1 × 1 px; below 1024 the three cards stack at their 300 px minimum and the section is sized by its content.
- Tile hover: the inner surface reports `translate: 0px -18px`, illustration opacity 0, label opacity 1 and z-index 10 after 500 ms; from p 0.06 the tiles report `pointer-events: none`. Every sector name sits on one line inside its tile in both locales at 1440 × 900, 1920 × 1080 and 390 × 844 (the label is 12 % of the tile width, container-query units). Tile 1 cross-fades to the WO coin Lottie instead of its label: on hover the motion box reports opacity 1 with the label and the still at 0 and the SVG frames advance; on leave the still is back and the playhead stops; the file is fetched once per page. With reduced motion emulated the tile shows its label and the file is never requested; on an iPhone 13 profile (no hover) the label sits under the still and the file is never requested.
- Header and scroll hint keep their on-dark tones through the pinned purple surface and switch at p 0.62 (`data-hero-tone`), switching back when scrolling up.
- Layout Shift API total **0.0000** in all four configurations, including through the pin. The two shifts that existed and were removed: the Arabic font swap (page is now visibility-gated until fonts arrive, 1 s timeout) and the illustration collapse (now transform-only).
- Reduced motion renders a static page with the same content, no pin, no reveals.
- The locale toggle switches route, `lang`, `dir` and content, rebuilds the choreography, persists to `localStorage`, and a cold visit to `/ar` with a stored `en` preference redirects.
- Every validation and error state of the purchase flow (47 assertions), including the RTL specifics: the OTP boxes stay left-to-right in Arabic, and the minus sign, phone number and order reference stay LTR isolates.
- `npm run check` (typecheck, ESLint, `lint:colors`, build) green at every commit; `lint:colors` was watched to fail on a planted `bg-red-500` and `#hex`.

Lighthouse desktop scores are recorded in the final commit message.

## Brand and re-skinning

Every colour, radius and motion timing lives in `styles/tokens.css`. Change values there and nothing else; components only ever reference token utilities (`bg-bg-hero`, `text-ink-muted`, `rounded-card`, …). `npm run lint:colors` keeps it that way.

The tokens carry the WalaOne brand from the Figma variables (Singular V1.0.0): Primary purple `#755BD8` scale and Secondary yellow `#FAC333` scale, Grey 900/100 for ink and surfaces. Two neutrals are derived and documented in the file: `--color-ink-muted` (`#555070`, because Grey 500 is 2.6:1 on white) and `--color-ink-on-dark-muted` (Primary 100). Yellow is used only on the purple bands (it is 1.6:1 against white); light sections use Primary 600 for buttons and brand UI. The hero surface is an image, not the gradient: `public/hero/spectral.jpg` is the fill of node 3:6 in the Figma community file "Spectral Gradient Vol 2.0" (a near-black indigo field with one violet beam), painted over `--color-bg-hero-image` until it loads and preloaded as the first paint; the final CTA band keeps the Primary 800/900 recipe. Attribute the community file per its licence before launch. Measured on the rendered page at 1440 × 900, the brightest pixel behind any headline word is the beam core (about #2d1c7e), where white is 13.3:1 and the muted ink 9.2:1; everywhere else the field is darker.

Logos: `components/brand/WalaOneLockup.tsx` (bilingual lockup, mark-right for Arabic, mark-left for English, `tone="mono"` follows `currentColor`, `tone="color"` is purple + yellow) and `components/brand/AmazonLogo.tsx` (wordmark follows `currentColor`, smile stays `--color-partner`). The header recolours both through its existing colour tween, so the white reverse over the hero and the colour/black versions on the solid header need no asset swap. `public/brand/*.svg` are the canonical exports (Figma node 6174-1139; Amazon from Wikimedia Commons, public-domain geometry, trademark applies) and the only colour-bearing files outside `tokens.css`; `lint:colors` never scans `public/`.

Contrast (WCAG AA, computed): ink on white 16.5:1, ink-muted on white 7.6:1 and 4.7–7.2:1 on every pastel including hover, white on Primary 800/900 10.8/13.5:1, ink on yellow 10.2:1, white on Primary 600 5.7:1, ok/err text on their washes ≥ 5.2:1. Lighthouse accessibility is 100 in both locales.

## Artwork

Every former `ImageSlot` placeholder is filled; the component stays so a slot can be emptied again by passing no `src`. `lib/art.ts` is the single map from slot to file and intrinsic size.

**3D illustrations** (`public/illustrations/*.webp`) are rendered, not downloaded: `npm run render:art` opens headless Chromium (Playwright), builds each scene in Three.js with soft "clay" physical materials, a room environment and a tinted contact shadow on a transparent background, and writes a WebP per scene (9 files, 2–14 kB each). Scenes live in `scripts/render/scenes.js`: the three Benefits cards (coin stack, gift/ticket/cup, extruded "40%"), the three How-to steps (envelope with the six-digit code card, card + lock + green check, phone with a notification) and three hero sprites. The five hero sector tiles are design-supplied line illustrations in `public/tiles/` (the WalaOne coin, a gift box with a discount tag, two hands exchanging coins, a laptop with shopping bags, a hand holding a takeaway bag), converted from the PNGs to WebP with alpha; `ART.tiles` maps them and `HeroTiles` alternates the purple-50 and yellow-50 washes. On a hover-capable desktop with motion allowed, the first tile cross-fades to the design-supplied "WO coin" loop (`public/lottie/wo-coin.json`: 1080 × 1080, 3 s, spin → glint → float) instead of its label and plays it from frame 0 while hovered; `TILE_MOTION` in `lib/art.ts` maps tile to file and crop, and `TileLottie` mounts it only under that query, so touch devices and reduced motion keep the label. Screen textures are drawn on a canvas from the brand SVGs, so the phone screens show the real mark and the Amazon smile with no text, which is why one render serves both locales. Pass scene names to render a subset (`npm run render:art -- rate step2`); lossless PNG masters land in `.render/` (ignored). The camera fits the sampled vertices of each scene, so a scene can be edited without re-tuning framing.

**Hero Lottie** (`public/lottie/hero-illustration.json`) is the design-supplied "Megaphone Loop" (a hand raising a megaphone, two floating discs, three sound waves that draw on and fade), recoloured to the palette: `npm run render:headline` reads the untouched source in `scripts/render/src/hero-megaphone.json`, maps its three colours to tokens by name (ink outlines and the bell opening → `ink`, cyan rim/handle/discs → `accent`, near-white cone and hand → `ink-on-dark-muted`) with the sound-wave strokes overridden to `accent` because dark lines vanish on the dark hero, thickens the strokes ×1.2 for headline size and writes the file. `HERO_LOTTIE.crop` in `lib/art.ts` carries the drawn region and `HeroLottie` shows it through a custom `viewBox`; the headline box is 1.5 em tall and takes that region's aspect. The co-branded phone animation assembled by `npm run render:lottie` from the three hero sprites (base64 WebP layers, 5 s loop) is kept at `public/lottie/hero-cobrand.json` as an alternative: point `HERO_LOTTIE.src` at it and drop the crop. Either way it goes through `HeroLottie`, so reduced motion shows the first frame.

**App screenshot** (`components/ui/AppMockup.tsx`) is the real WalaOne home screen inside a CSS phone frame: the two captures supplied by design (`Home - WO - AR` and `Home - WO - EN`, 750 px wide) live as WebP in `public/app/` and `APP_SCREEN` in `lib/art.ts` picks one per locale; the alt is the slot title. The captures have no status bar, so the frame's notch pill overlaps only the purple header.

**Merchant and scheme logos** (`public/brands/`, `public/payment/`) are SVGs from Wikimedia Commons (public-domain geometry; trademarks apply). The ten merchants are a sample across the six sectors, not a confirmed partner list: replace the entries in `BRANDS` before launch and the footer's draft note goes with them. mada, Visa and the Mastercard circles (as the generic credit card) sit on the payment step.

See `MOTION.md` for every animation, its trigger, duration, easing and the token it reads.
