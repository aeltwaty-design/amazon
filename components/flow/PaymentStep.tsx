'use client';

import { useErrorMessage, useFlowContent } from '@/components/flow/FlowContentContext';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { PaymentMethods } from '@/components/ui/PaymentMethods';
import { PAYMENT_MARKS } from '@/lib/art';
import { Summary, type SummaryRow } from '@/components/ui/Summary';
import type { FlowState } from '@/lib/flow';
import { fmt } from '@/lib/i18n';
import { PAYMENT_METHODS, PRICE, formatMoney } from '@/lib/pricing';

type Props = {
  state: Extract<FlowState, { step: 'payment' }>;
  onPay: () => void;
};

export function PaymentStep({ state, onPay }: Props) {
  const { content, locale } = useFlowContent();
  const copy = content.payment;
  const message = useErrorMessage();
  const loading = state.status === 'loading';

  // Labels come from content, amounts from PRICE: neither is retyped here.
  const rows: SummaryRow[] = [
    { id: 'annual', label: copy.rows.annual, halalas: PRICE.list },
    { id: 'discount', label: copy.rows.discount, halalas: -PRICE.discount, kind: 'discount' },
    { id: 'subtotal', label: copy.rows.subtotal, halalas: PRICE.subtotal },
    { id: 'vat', label: copy.rows.vat, halalas: PRICE.vat },
    { id: 'total', label: copy.rows.total, halalas: PRICE.total, kind: 'total' },
  ];

  return (
    <div className="grid gap-6">
      <h3 id="flow-step-heading" tabIndex={-1} className="type-h3 focus-visible:outline-none">
        {copy.heading}
      </h3>

      <Summary rows={rows} locale={locale} className="rounded-btn bg-bg-surface p-4" />

      <PaymentMethods
        label={copy.methodsLabel}
        marks={PAYMENT_METHODS.map((method) => ({
          id: method,
          slot: copy.methodSlot[method],
          mark: PAYMENT_MARKS[method],
        }))}
      />

      {state.status === 'failed' ? (
        <Callout
          tone="error"
          role="alert"
          action={
            <Button variant="primary" onClick={onPay}>
              {copy.retry}
            </Button>
          }
        >
          {message('payment.failed')}
        </Callout>
      ) : null}

      <Button type="button" fullWidth loading={loading} onClick={onPay}>
        {loading ? copy.paying : fmt(copy.payCta, { amount: formatMoney(PRICE.total) })}
      </Button>
      <p className="type-small flex items-start justify-center gap-2 text-center text-ink-muted">
        <svg
          aria-hidden
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <rect x="3" y="7" width="10" height="7" rx="1.5" />
          <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
        </svg>
        <span>{copy.secureNote}</span>
      </p>
    </div>
  );
}
