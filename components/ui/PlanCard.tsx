'use client';

import { useState } from 'react';
import type { SiteContent } from '@/content/types';
import { Button } from '@/components/ui/Button';
import { Currency } from '@/components/ui/Currency';
import { Interpolate } from '@/components/ui/Interpolate';
import { PillToggle } from '@/components/ui/PillToggle';
import { Price } from '@/components/ui/Price';
import { SECTION_IDS } from '@/lib/anchors';
import { type Locale } from '@/lib/i18n';
import { PRICE, formatMoney } from '@/lib/pricing';

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

export function PlanCard({ locale, content }: Props) {
  const [view, setView] = useState<View>('beforeVat');
  return (
    <article
      data-tilt
      className="w-full max-w-plan overflow-hidden rounded-plan bg-bg-elevated shadow-[0_24px_60px_-30px_var(--color-ink)]"
    >
      <div className="type-ribbon flex h-[55px] items-center justify-center bg-brand px-6 text-center text-ink-on-dark">
        {content.ribbon}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h3 className="type-h3">{content.planTitle}</h3>
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
        <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
          {/* Remounting on view change replays the switch animation. */}
          <span
            key={view}
            className="animate-[fade-up_var(--plans-switch)_var(--ease-out-cubic)] motion-reduce:animate-none"
          >
            <Price halalas={AMOUNT[view]} locale={locale} size="plan" />
          </span>
          <span className="type-body text-ink-muted">{content.perYear}</span>
        </p>
        <p className="type-body mt-2 text-ink-muted">
          {content.wasLabel} <Price halalas={PRICE.list} locale={locale} strike />
        </p>
        {/* Always visible, whichever view is selected. */}
        <p className="type-small mt-3 text-ink-muted">
          <Interpolate
            template={content.vatLine}
            vars={{
              vat: formatMoney(PRICE.vat),
              total: formatMoney(PRICE.total),
              sar: <Currency locale={locale} />,
            }}
          />
        </p>
        <ul className="mt-6 grid gap-3">
          {content.features.map((feature) => (
            <li key={feature} className="type-body flex items-start gap-3">
              <Check />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button href={`#${SECTION_IDS.flow}`} fullWidth className="mt-8">
          {content.cta}
        </Button>
        <p className="type-small mt-4 text-center text-ink-muted">{content.finePrint}</p>
      </div>
    </article>
  );
}
