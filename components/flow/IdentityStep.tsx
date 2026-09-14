'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useErrorMessage, useFlowContent } from '@/components/flow/FlowContentContext';
import { Button } from '@/components/ui/Button';
import { Interpolate } from '@/components/ui/Interpolate';
import { OtpInput } from '@/components/ui/OtpInput';
import { useCountdown } from '@/hooks/useCountdown';
import type { FlowState } from '@/lib/flow';
import { fmt } from '@/lib/i18n';
import { RESEND_COOLDOWN_S } from '@/lib/mockApi';
import { otpSchema } from '@/lib/validation';

type Props = {
  state: Extract<FlowState, { step: 'identity' }>;
  onCodeChange: (code: string) => void;
  onVerify: (code: string) => void;
  onResend: () => void;
  onEdit: () => void;
};

export function IdentityStep({ state, onCodeChange, onVerify, onResend, onEdit }: Props) {
  const { content } = useFlowContent();
  const copy = content.identity;
  const message = useErrorMessage();
  const remaining = useCountdown(RESEND_COOLDOWN_S, state.session.issuedAt);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const firstIssue = useRef(state.session.issuedAt);

  // A new session after mount means a resend happened: announce it.
  useEffect(() => {
    if (state.session.issuedAt !== firstIssue.current) setResent(true);
  }, [state.session.issuedAt]);

  const busy = state.status === 'verifying' || state.status === 'resending';
  // The CTA is live only once all six digits are in. The guard in submit()
  // stays as a backstop rather than dead weight: it is the schema, not the
  // button, that decides what gets sent. It is no longer reachable through
  // the UI, though, because a disabled default button also blocks the form's
  // implicit submission, so 'otp.incomplete' now only guards a programmatic
  // submit.
  const complete = otpSchema.safeParse(state.code).success;
  const serverError =
    state.status === 'wrong' ? 'otp.wrong' : state.status === 'expired' ? 'otp.expired' : null;
  const errorCode = localError ?? serverError;
  const errorId = errorCode ? 'identity-error' : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = otpSchema.safeParse(state.code);
    if (!parsed.success) {
      setLocalError('otp.incomplete');
      return;
    }
    setLocalError(null);
    onVerify(parsed.data);
  };

  return (
    <form noValidate onSubmit={submit} className="grid gap-6">
      <h3 id="flow-step-heading" tabIndex={-1} className="type-h3 focus-visible:outline-none">
        {copy.heading}
      </h3>
      <p className="type-body text-ink-muted">
        <Interpolate
          template={copy.sentTo}
          vars={{
            email: (
              <bdi dir="ltr" className="font-bold text-ink">
                {state.details.email}
              </bdi>
            ),
          }}
        />
      </p>

      <OtpInput
        label={copy.otpLabel}
        digitLabel={copy.otpDigitLabel}
        value={state.code}
        onChange={(code) => {
          setLocalError(null);
          setResent(false);
          onCodeChange(code);
        }}
        disabled={busy}
        invalid={Boolean(errorCode)}
        describedBy={errorId}
      />
      {errorCode ? (
        <p id={errorId} role="alert" className="type-small -mt-3 text-center text-err">
          {message(errorCode)}
        </p>
      ) : null}
      <p aria-live="polite" className="type-small text-center text-ok">
        {resent ? copy.resent : ''}
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            setResent(false);
            onResend();
          }}
          disabled={remaining > 0 || busy}
          className="type-body num text-ink underline underline-offset-4 disabled:no-underline disabled:opacity-60"
        >
          {remaining > 0 ? fmt(copy.resendIn, { s: remaining }) : copy.resend}
        </button>
      </div>

      <div className="grid gap-3">
        <Button type="submit" fullWidth loading={state.status === 'verifying'} disabled={!complete}>
          {state.status === 'verifying' ? copy.verifying : copy.cta}
        </Button>
        <button
          type="button"
          onClick={onEdit}
          className="type-body py-2 text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          {copy.edit}
        </button>
      </div>
    </form>
  );
}
