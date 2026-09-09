'use client';

import type { HTMLInputAutoCompleteAttribute, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useErrorMessage } from '@/components/flow/FlowContentContext';
import { cn } from '@/lib/cn';

type BaseProps = {
  id: string;
  /** error code from the schema or the server; rendered through content.errors */
  error?: string;
  registration: UseFormRegisterReturn;
  className?: string;
};

type TextProps = BaseProps & {
  label: string;
  hint?: string;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  autoComplete?: HTMLInputAutoCompleteAttribute;
  /** ltr for data that is inherently LTR (email, phone) whatever the page direction */
  dir?: 'ltr' | 'rtl';
  required?: boolean;
};

const INPUT =
  'type-body w-full rounded-btn border border-line bg-bg-elevated px-4 py-3 text-ink transition-colors duration-(--motion-300) placeholder:text-ink-muted focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-brand aria-invalid:border-err';

function ErrorText({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="type-small mt-2 text-err">
      {message}
    </p>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  registration,
  type = 'text',
  inputMode,
  autoComplete,
  dir,
  required,
  className,
}: TextProps) {
  const message = useErrorMessage()(error);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = message ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="type-body block font-bold">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="type-small mt-1 text-ink-muted">
          {hint}
        </p>
      ) : null}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        dir={dir}
        required={required}
        aria-required={required || undefined}
        aria-invalid={message ? true : undefined}
        aria-describedby={describedBy}
        className={cn(INPUT, 'mt-2', dir === 'ltr' && 'text-start')}
        {...registration}
      />
      {message && errorId ? <ErrorText id={errorId} message={message} /> : null}
    </div>
  );
}

type CheckboxProps = BaseProps & { children: ReactNode };

export function CheckboxField({ id, error, registration, children, className }: CheckboxProps) {
  const message = useErrorMessage()(error);
  const errorId = message ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="type-body flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={message ? true : undefined}
          aria-describedby={errorId}
          className="mt-1 size-5 shrink-0 accent-brand"
          {...registration}
        />
        <span>{children}</span>
      </label>
      {message && errorId ? <ErrorText id={errorId} message={message} /> : null}
    </div>
  );
}
