'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useErrorMessage, useFlowContent } from '@/components/flow/FlowContentContext';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { CheckboxField, Field } from '@/components/ui/Field';
import { MobileIcon, SmsIcon, UserIcon } from '@/components/ui/Icon';
import { Interpolate } from '@/components/ui/Interpolate';
import { FOOTER_HREFS } from '@/lib/anchors';
import type { FlowState } from '@/lib/flow';
import { detailsSchema, type Details, type DetailsInput } from '@/lib/validation';

type Props = {
  state: Extract<FlowState, { step: 'details' }>;
  onSubmit: (draft: DetailsInput, details: Details) => void;
};

const EMPTY: DetailsInput = { fullName: '', mobile: '', email: '', consent: false };
const FIELD_ORDER = ['fullName', 'mobile', 'email', 'consent'] as const;

export function DetailsStep({ state, onSubmit }: Props) {
  const { content } = useFlowContent();
  const copy = content.details;
  const message = useErrorMessage();
  const summaryRef = useRef<HTMLDivElement>(null);

  // The third generic is the transformed output: the schema turns the raw
  // mobile into E.164, and handleSubmit receives that, not what was typed.
  const form = useForm<DetailsInput, unknown, Details>({
    resolver: zodResolver(detailsSchema),
    defaultValues: state.draft ?? EMPTY,
    mode: 'onTouched',
  });
  const { register, handleSubmit, setError, getValues, formState } = form;
  const { errors, submitCount } = formState;

  // A rejection from the (mock) server is not a schema error: it lands under
  // the email field like any other and clears on the next edit.
  useEffect(() => {
    if (state.serverError) {
      setError('email', { type: 'server', message: state.serverError });
      summaryRef.current?.focus();
    }
  }, [state.serverError, setError]);

  const onInvalid = () => {
    // A long form on a phone can put the failing field off-screen; the
    // summary is focused so the failure is announced and reachable.
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const failing = FIELD_ORDER.filter((name) => errors[name]);
  const showSummary = failing.length > 0 && (submitCount > 0 || state.serverError);

  return (
    <form
      noValidate
      onSubmit={handleSubmit((details) => onSubmit(getValues(), details), onInvalid)}
      className="grid gap-6"
    >
      <h3 id="flow-step-heading" tabIndex={-1} className="type-h3 focus-visible:outline-none">
        {copy.heading}
      </h3>

      {showSummary ? (
        <Callout ref={summaryRef} tone="error" role="alert" title={copy.errorSummaryTitle}>
          <ul className="grid list-disc gap-1 ps-5">
            {failing.map((name) => (
              <li key={name}>
                <a href={`#details-${name}`} className="underline underline-offset-4">
                  {message(errors[name]?.message)}
                </a>
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}

      <Field
        id="details-fullName"
        label={copy.name.label}
        icon={UserIcon}
        hint={copy.name.hint}
        autoComplete="name"
        required
        error={errors.fullName?.message}
        registration={register('fullName')}
      />
      <Field
        id="details-mobile"
        label={copy.mobile.label}
        icon={MobileIcon}
        hint={copy.mobile.hint}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        dir="ltr"
        required
        error={errors.mobile?.message}
        registration={register('mobile')}
      />
      <Field
        id="details-email"
        label={copy.email.label}
        icon={SmsIcon}
        hint={copy.email.hint}
        type="email"
        inputMode="email"
        autoComplete="email"
        dir="ltr"
        required
        error={errors.email?.message}
        registration={register('email')}
      />
      <CheckboxField
        id="details-consent"
        error={errors.consent?.message}
        registration={register('consent')}
      >
        <Interpolate
          template={copy.consent}
          vars={{
            terms: (
              <a href={FOOTER_HREFS.terms} className="underline underline-offset-4">
                {copy.termsLabel}
              </a>
            ),
            privacy: (
              <a href={FOOTER_HREFS.privacy} className="underline underline-offset-4">
                {copy.privacyLabel}
              </a>
            ),
          }}
        />
      </CheckboxField>

      <Button type="submit" fullWidth loading={state.submitting}>
        {state.submitting ? copy.submitting : copy.cta}
      </Button>
    </form>
  );
}
