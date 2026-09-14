'use client';

import { useState } from 'react';
import type { SiteContent } from '@/content/types';
import { Button } from '@/components/ui/Button';
import { Interpolate } from '@/components/ui/Interpolate';
import { PillToggle } from '@/components/ui/PillToggle';
import { Price } from '@/components/ui/Price';
import { SECTION_IDS } from '@/lib/anchors';
import { cn } from '@/lib/cn';
import { dirFor, type Locale } from '@/lib/i18n';
import { PRICE } from '@/lib/pricing';

type Props = { locale: Locale; content: SiteContent['pricing'] };
type View = 'beforeVat' | 'total';

const AMOUNT: Record<View, number> = { beforeVat: PRICE.subtotal, total: PRICE.total };

function Check() {
  return (
    <svg
      aria-hidden
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 rounded-pill bg-ok-wash p-1 text-ok"
    >
      <path d="M5 12l5 5L19 7" />
    </svg>
  );
}

/**
 * The reference puts a chevron at the end of its plan button. It has to point
 * the way the page reads, and Tailwind's `rtl:` variant does not resolve in
 * this build, so the direction comes from `dirFor` the way the rest of the
 * codebase passes it.
 */
function Chevron({ locale }: { locale: Locale }) {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', dirFor(locale) === 'rtl' && '-scale-x-100')}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// The plan card follows the Vanguard kit's pricing card: flat on the section's
// grey rather than lifted on a shadow, everything above the feature list
// centred, the price a large numeral with its qualifiers as a small muted
// stack beside it, a rule before the list, and a full-width pill button that
// ends in a chevron. The discount, which used to be a full-bleed bar across
// the card's head, keeps its words but becomes the badge the reference's calm
// front would allow. The toggle stays a segmented radiogroup — the reference
// draws a switch, but that is a control, not a look, and this one is already
// keyboard- and screen-reader-correct.
export function PlanCard({ locale, content }: Props) {
  const [view, setView] = useState<View>('beforeVat');
  return (
    <article
      data-tilt
      className="w-full max-w-plan rounded-plan border border-line bg-bg-elevated p-6 text-center lg:p-8"
    >
      <p className="type-toggle inline-flex rounded-pill bg-brand-wash px-4 py-2 text-brand">
        {content.ribbon}
      </p>
      <h3 className="type-h3 mt-4">{content.planTitle}</h3>
      <div className="mt-4 flex justify-center">
        <PillToggle
          label={content.toggle.label}
          value={view}
          onChange={setView}
          options={[
            { value: 'beforeVat', label: content.toggle.beforeVat },
            { value: 'total', label: content.toggle.total },
          ]}
        />
      </div>
      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3">
        {/* Remounting on view change replays the switch animation. */}
        <span
          key={view}
          className="animate-[fade-up_var(--plans-switch)_var(--ease-out-cubic)] motion-reduce:animate-none"
        >
          <Price halalas={AMOUNT[view]} locale={locale} size="plan" />
        </span>
        <span className="type-small max-w-[12ch] text-start text-ink-muted">
          {content.perYear}
          <br />
          {content.wasLabel} <Price halalas={PRICE.list} locale={locale} strike />
        </span>
      </p>
      {/* Always visible, whichever view is selected. */}
      <p className="type-small mt-3 text-ink-muted">
        <Interpolate
          template={content.vatLine}
          vars={{
            vat: <Price halalas={PRICE.vat} locale={locale} />,
            total: <Price halalas={PRICE.total} locale={locale} />,
          }}
        />
      </p>
      <hr className="mt-6 border-line" />
      <p className="type-body mt-6 text-start font-bold">{content.includesLabel}</p>
      <ul className="mt-4 grid gap-3 text-start">
        {content.features.map((feature) => (
          <li key={feature} className="type-body flex items-start gap-3">
            <Check />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button href={`#${SECTION_IDS.flow}`} fullWidth className="mt-8 rounded-pill">
        {content.cta}
        <Chevron locale={locale} />
      </Button>
      <p className="type-small mt-4 text-ink-muted">{content.finePrint}</p>
    </article>
  );
}
