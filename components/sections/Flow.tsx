'use client';

import { useEffect, useReducer, useRef } from 'react';
import type { FlowContent } from '@/content/types';
import { DetailsStep } from '@/components/flow/DetailsStep';
import { DoneStep } from '@/components/flow/DoneStep';
import { FlowContentProvider } from '@/components/flow/FlowContentContext';
import { IdentityStep } from '@/components/flow/IdentityStep';
import { PaymentStep } from '@/components/flow/PaymentStep';
import { Stepper } from '@/components/ui/Stepper';
import { SECTION_IDS } from '@/lib/anchors';
import { INITIAL_FLOW, STEP_ORDER, flowReducer } from '@/lib/flow';
import { fmt, type Locale } from '@/lib/i18n';
import * as api from '@/lib/mockApi';
import type { PaymentMethod } from '@/lib/pricing';
import type { Details, DetailsInput, FlowErrorCode } from '@/lib/validation';

type Props = { content: FlowContent; locale: Locale };

const codeOf = (error: unknown): FlowErrorCode =>
  api.isMockApiError(error) ? error.code : 'invalid';

export function Flow({ content, locale }: Props) {
  const [state, dispatch] = useReducer(flowReducer, INITIAL_FLOW);
  // Bumped on every step change so a response that lands after the user
  // moved on is dropped (the reducer's step guard is the second line).
  const seq = useRef(0);
  const mounted = useRef(false);

  const stepIndex = STEP_ORDER.indexOf(state.step);
  const stepLabel = content.stepper.steps[stepIndex] ?? '';

  // Screen-reader users would otherwise be left on a button that has just
  // been unmounted; the new step's heading takes focus instead.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    document.getElementById('flow-step-heading')?.focus();
  }, [state.step]);

  const submitDetails = async (draft: DetailsInput, details: Details) => {
    const mine = ++seq.current;
    dispatch({ type: 'DETAILS_SUBMIT', draft });
    try {
      const session = await api.submitDetails(details);
      if (mine !== seq.current) return;
      dispatch({ type: 'DETAILS_ACCEPTED', draft, details, session });
    } catch (error) {
      if (mine !== seq.current) return;
      dispatch({ type: 'DETAILS_REJECTED', error: codeOf(error) });
    }
  };

  const verify = async (code: string) => {
    if (state.step !== 'identity') return;
    const mine = ++seq.current;
    dispatch({ type: 'OTP_SUBMIT' });
    try {
      await api.verifyOtp(code, state.session);
      if (mine !== seq.current) return;
      dispatch({ type: 'OTP_ACCEPTED' });
    } catch (error) {
      if (mine !== seq.current) return;
      const failure = codeOf(error);
      dispatch({
        type: 'OTP_REJECTED',
        error: failure === 'otp.expired' ? 'otp.expired' : 'otp.wrong',
      });
    }
  };

  const resend = async () => {
    if (state.step !== 'identity') return;
    const mine = ++seq.current;
    dispatch({ type: 'OTP_RESEND' });
    const session = await api.resendOtp();
    if (mine !== seq.current) return;
    dispatch({ type: 'OTP_RESENT', session });
  };

  const editDetails = () => {
    seq.current += 1;
    dispatch({ type: 'EDIT_DETAILS' });
  };

  const payNow = async () => {
    if (state.step !== 'payment') return;
    const mine = ++seq.current;
    const attempt = state.attempts + 1;
    dispatch({ type: 'PAY' });
    try {
      const { orderRef } = await api.pay(state.method, state.details, attempt);
      if (mine !== seq.current) return;
      dispatch({ type: 'PAY_SUCCEEDED', orderRef });
    } catch {
      if (mine !== seq.current) return;
      dispatch({ type: 'PAY_FAILED' });
    }
  };

  return (
    <FlowContentProvider value={{ content, locale }}>
      <section id={SECTION_IDS.flow} className="section scroll-mt-header bg-bg-page">
        <div className="gutter mx-auto max-w-content">
          <div className="text-center">
            <h2 data-reveal className="type-h2">
              {content.title}
            </h2>
            <p data-reveal className="type-body-lg mx-auto mt-4 max-w-[56ch] text-ink-muted">
              {content.subtitle}
            </p>
          </div>
          <div
            data-reveal
            className="mx-auto mt-12 w-full max-w-[560px] rounded-plan border border-line bg-bg-elevated p-6 shadow-[0_24px_60px_-40px_var(--color-ink)] sm:p-8"
          >
            <Stepper
              steps={content.stepper.steps}
              current={stepIndex}
              label={content.stepper.label}
              locale={locale}
            />
            <p aria-live="polite" className="sr-only">
              {fmt(content.stepper.announce, {
                n: stepIndex + 1,
                total: STEP_ORDER.length,
                label: stepLabel,
              })}
            </p>
            <div className="mt-8">
              {state.step === 'details' ? (
                <DetailsStep state={state} onSubmit={submitDetails} />
              ) : state.step === 'identity' ? (
                <IdentityStep
                  state={state}
                  onCodeChange={(code) => dispatch({ type: 'OTP_CHANGED', code })}
                  onVerify={verify}
                  onResend={resend}
                  onEdit={editDetails}
                />
              ) : state.step === 'payment' ? (
                <PaymentStep
                  state={state}
                  onMethodChange={(method: PaymentMethod) =>
                    dispatch({ type: 'METHOD_CHANGED', method })
                  }
                  onPay={payNow}
                />
              ) : (
                <DoneStep state={state} />
              )}
            </div>
          </div>
        </div>
      </section>
    </FlowContentProvider>
  );
}
