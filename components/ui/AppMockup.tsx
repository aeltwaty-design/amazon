import Image from 'next/image';
import { AmazonLogo } from '@/components/brand/AmazonLogo';
import type { SiteContent } from '@/content/types';
import { BRANDS } from '@/lib/art';
import { cn } from '@/lib/cn';

type Props = {
  copy: SiteContent['about']['mockup'];
  /** accessible name for the whole mockup (the slot title) */
  label: string;
  className?: string;
};

const brandById = (id: string) => BRANDS.find((brand) => brand.id === id);

// The WalaOne home screen as a DOM mockup inside a CSS phone frame: real
// type, real merchant logos, and it flips with the locale. The copy is
// invented UI, so the whole thing is exposed as a single image named after
// the slot rather than as readable text.
export function AppMockup({ copy, label, className }: Props) {
  return (
    <div role="img" aria-label={label} className={cn('mx-auto w-full max-w-[300px]', className)}>
      <div className="rounded-[44px] bg-ink p-2.5 shadow-2xl shadow-ink/25">
        <div className="relative overflow-hidden rounded-[34px] bg-bg-surface text-ink">
          <span
            aria-hidden
            className="absolute inset-x-0 top-2.5 mx-auto block h-6 w-24 rounded-pill bg-ink"
          />

          <div className="num flex items-center justify-between px-6 pt-4 text-[13px] font-bold">
            <span>{copy.time}</span>
            <span aria-hidden className="flex items-center gap-1.5">
              <span className="flex items-end gap-px">
                <span className="h-1.5 w-1 rounded-[1px] bg-ink" />
                <span className="h-2 w-1 rounded-[1px] bg-ink" />
                <span className="h-2.5 w-1 rounded-[1px] bg-ink" />
                <span className="h-3 w-1 rounded-[1px] bg-ink" />
              </span>
              <span className="flex h-3 w-6 items-center rounded-[3px] border border-ink p-px">
                <span className="h-full w-4/5 rounded-[1px] bg-ink" />
              </span>
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-brand-wash">
                <Image src="/brand/walaone-mark.svg" alt="" width={22} height={19} />
              </span>
              <span className="text-[13px] font-bold">{copy.greeting}</span>
            </div>
            <span aria-hidden className="size-8 rounded-pill bg-card-3" />
          </div>

          <div className="surface-hero mx-4 mt-4 rounded-plan p-4 text-ink-on-dark">
            <p className="text-[11px] text-ink-on-dark-muted">{copy.pointsLabel}</p>
            <p className="mt-1.5 flex flex-wrap items-baseline gap-2">
              <span className="num text-[28px] leading-none font-extrabold">{copy.points}</span>
              <span className="num rounded-pill bg-accent px-2 py-0.5 text-[11px] font-bold text-ink">
                {copy.pointsWorth}
              </span>
            </p>
          </div>

          <div className="mx-4 mt-3 flex items-center gap-3 rounded-btn bg-partner-wash px-3 py-2.5">
            <AmazonLogo title="Amazon" className="h-3.5 w-auto shrink-0 text-ink" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold">{copy.membership}</p>
              <p className="truncate text-[11px] text-ink-muted">{copy.membershipSub}</p>
            </div>
            <span
              aria-hidden
              className="flex size-5 shrink-0 items-center justify-center rounded-pill bg-ok text-ink-on-dark"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 5.2 4.2 7.4 8 3.2" />
              </svg>
            </span>
          </div>

          <ul className="mt-4 flex gap-2 overflow-hidden px-4">
            {copy.categories.map((category, i) => (
              <li
                key={category}
                className={cn(
                  'shrink-0 rounded-pill px-3 py-1.5 text-[11px] font-bold whitespace-nowrap',
                  i === 0 ? 'bg-brand text-ink-on-dark' : 'bg-bg-page text-ink-muted',
                )}
              >
                {category}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between px-5">
            <p className="text-[13px] font-bold">{copy.offersTitle}</p>
            <span className="text-[11px] font-bold text-brand">{copy.seeAll}</span>
          </div>
          <ul className="mt-2 grid gap-2 px-4">
            {copy.offers.map((offer) => {
              const brand = brandById(offer.brand);
              return (
                <li
                  key={offer.brand}
                  className="flex items-center gap-3 rounded-btn bg-bg-page p-2.5"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-bg-surface p-2">
                    {brand ? (
                      <Image
                        src={brand.src}
                        alt=""
                        width={brand.width}
                        height={brand.height}
                        className="h-auto max-h-6 w-auto max-w-full object-contain"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold">
                      <bdi>{brand?.name ?? offer.brand}</bdi>
                    </span>
                    <span className="block text-[11px] text-ink-muted">{offer.deal}</span>
                  </span>
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-brand-wash text-brand"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="rtl:-scale-x-100"
                    >
                      <path d="M6 3l5 5-5 5" />
                    </svg>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-line bg-bg-page px-3 pt-2.5 pb-2">
            <ul className="flex items-start justify-around">
              {copy.nav.map((item, i) => (
                <li
                  key={item}
                  className={cn(
                    'flex flex-col items-center gap-1 text-[10px] font-bold',
                    i === 0 ? 'text-brand' : 'text-ink-muted',
                  )}
                >
                  <NavIcon index={i} />
                  {item}
                </li>
              ))}
            </ul>
            <span aria-hidden className="mx-auto mt-3 block h-1 w-24 rounded-pill bg-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}

const NAV_PATHS = [
  'M3 8.5 10 3l7 5.5V17H3z M8 17v-5h4v5', // home
  'M3 3h6l8 8-6 6-8-8z M6.5 6.5h.01', // tag
  'M3 6a2 2 0 0 1 2-2h11v3H3z M3 7h14v9H3z M13 11.5h1.5', // wallet
  'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M4 17c0-3 2.7-5 6-5s6 2 6 5', // person
];

function NavIcon({ index }: { index: number }) {
  return (
    <svg
      aria-hidden
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={NAV_PATHS[index] ?? NAV_PATHS[0]} />
    </svg>
  );
}
