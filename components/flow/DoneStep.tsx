'use client';

import { useFlowContent } from '@/components/flow/FlowContentContext';
import type { FlowState } from '@/lib/flow';
import { formatInteger } from '@/lib/i18n';
import { formatMobileForDisplay } from '@/lib/validation';

type Props = { state: Extract<FlowState, { step: 'done' }> };

export function DoneStep({ state }: Props) {
  const { content, locale } = useFlowContent();
  const copy = content.done;

  return (
    <div className="grid gap-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-ok-wash text-ok"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10.5l4 4L16 6" />
          </svg>
        </span>
        <div>
          <h3
            id="flow-step-heading"
            tabIndex={-1}
            role="status"
            className="type-h3 focus-visible:outline-none"
          >
            {copy.heading}
          </h3>
          <p className="type-body mt-2 text-ink-muted">{copy.body}</p>
        </div>
      </div>

      <div className="rounded-btn bg-bg-surface p-5 text-center">
        <p className="type-small text-ink-muted">{copy.openWith}</p>
        <p className="type-price mt-2 text-[clamp(28px,7.5vw,48px)]">
          <bdi dir="ltr">{formatMobileForDisplay(state.details.mobile)}</bdi>
        </p>
      </div>

      <div>
        <p className="type-small text-ink-muted">{copy.orderRefLabel}</p>
        <p className="type-h3 num mt-1">
          <bdi dir="ltr">{state.orderRef}</bdi>
        </p>
        <p className="type-small mt-1 text-ink-muted">{copy.orderRefNote}</p>
      </div>

      <div>
        <p className="type-body font-bold">{copy.nextStepsTitle}</p>
        <ol className="mt-3 grid gap-3">
          {copy.nextSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span
                aria-hidden
                className="type-toggle num flex size-7 shrink-0 items-center justify-center rounded-pill bg-ink text-ink-on-dark"
              >
                {formatInteger(i + 1, locale)}
              </span>
              <span className="type-body">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
