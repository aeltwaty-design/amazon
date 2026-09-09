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

- Hero pin lasts exactly one viewport; at the unpin scroll the five hero cards and their grid twins report identical rectangles (see `MOTION.md` for the mechanism).
- Layout Shift API total **0.0000** in all four configurations, including through the pin. The two shifts that existed and were removed: the Arabic font swap (page is now visibility-gated until fonts arrive, 1 s timeout) and the illustration collapse (now transform-only).
- Reduced motion renders a static page with the same content, no pin, no reveals.
- The locale toggle switches route, `lang`, `dir` and content, rebuilds the choreography, persists to `localStorage`, and a cold visit to `/ar` with a stored `en` preference redirects.
- Every validation and error state of the purchase flow (47 assertions), including the RTL specifics: the OTP boxes stay left-to-right in Arabic, and the minus sign, phone number and order reference stay LTR isolates.
- `npm run check` (typecheck, ESLint, `lint:colors`, build) green at every commit; `lint:colors` was watched to fail on a planted `bg-red-500` and `#hex`.

Lighthouse desktop scores are recorded in the final commit message.

## Brand and re-skinning

Every colour, radius and motion timing lives in `styles/tokens.css`. Change values there and nothing else; components only ever reference token utilities (`bg-bg-hero`, `text-ink-muted`, `rounded-card`, …). `npm run lint:colors` keeps it that way.

The tokens carry the WalaOne brand from the Figma variables (Singular V1.0.0): Primary purple `#755BD8` scale and Secondary yellow `#FAC333` scale, Grey 900/100 for ink and surfaces. Two neutrals are derived and documented in the file: `--color-ink-muted` (`#555070`, because Grey 500 is 2.6:1 on white) and `--color-ink-on-dark-muted` (Primary 100). Yellow is used only on the purple bands (it is 1.6:1 against white); light sections use Primary 600 for buttons and brand UI.

Logos: `components/brand/WalaOneLockup.tsx` (bilingual lockup, mark-right for Arabic, mark-left for English, `tone="mono"` follows `currentColor`, `tone="color"` is purple + yellow) and `components/brand/AmazonLogo.tsx` (wordmark follows `currentColor`, smile stays `--color-partner`). The header recolours both through its existing colour tween, so the white reverse over the hero and the colour/black versions on the solid header need no asset swap. `public/brand/*.svg` are the canonical exports (Figma node 6174-1139; Amazon from Wikimedia Commons, public-domain geometry, trademark applies) and the only colour-bearing files outside `tokens.css`; `lint:colors` never scans `public/`.

Contrast (WCAG AA, computed): ink on white 16.5:1, ink-muted on white 7.6:1 and 4.7–7.2:1 on every pastel including hover, white on Primary 800/900 10.8/13.5:1, ink on yellow 10.2:1, white on Primary 600 5.7:1, ok/err text on their washes ≥ 5.2:1. Lighthouse accessibility is 100 in both locales.

See `MOTION.md` for every animation, its trigger, duration, easing and the token it reads.
