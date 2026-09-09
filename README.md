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

| Input                              | Where    | Result                                                   |
| ---------------------------------- | -------- | -------------------------------------------------------- |
| `test.pending@amazon.com`          | Details  | "already an active or pending subscription" under email  |
| `test.payfail@amazon.com`          | Payment  | first attempt fails (nothing charged), retry succeeds    |
| code `999999`                      | Identity | wrong code                                               |
| code `000000`                      | Identity | expired code (also reachable by waiting 60 s)            |
| any other `@amazon.com`/`amazon.sa` | —       | happy path → order reference `WO-AMZ-XXXXXX`             |

Accepted email domains live in `APPROVED_DOMAINS` in `lib/validation.ts`; subdomains such as `eu.amazon.com` are accepted. Saudi mobiles are accepted as `05…`, `+9665…`, `009665…` or `5…`, with spaces, dashes or Arabic-Indic digits, and stored as E.164.

## Re-skinning

Every colour, radius and motion timing lives in `styles/tokens.css`. Change values there and nothing else; components only ever reference token utilities (`bg-bg-hero`, `text-ink-muted`, `rounded-card`, …). `npm run lint:colors` keeps it that way.

See `MOTION.md` for every animation, its trigger, duration, easing and the token it reads.
