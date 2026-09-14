'use client';

import Image from 'next/image';
import type { ComponentType, HTMLInputAutoCompleteAttribute, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useErrorMessage, useFlowContent } from '@/components/flow/FlowContentContext';
import { CheckIcon } from '@/components/ui/Icon';
import { DIAL_FLAG } from '@/lib/art';
import { cn } from '@/lib/cn';
import { dirFor } from '@/lib/i18n';

type BaseProps = {
  id: string;
  /** error code from the schema or the server; rendered through content.errors */
  error?: string;
  registration: UseFormRegisterReturn;
  className?: string;
};

type TextProps = BaseProps & {
  label: string;
  /** an Iconsax glyph from components/ui/Icon, shown inside the field before the input */
  icon?: ComponentType<{ className?: string }>;
  /** a dial code, e.g. +966: turns the field into the phone-number variant */
  dialCode?: string;
  hint?: string;
  placeholder?: string;
  /** caps what can be typed or pasted, in characters */
  maxLength?: number;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  autoComplete?: HTMLInputAutoCompleteAttribute;
  /** ltr for data that is inherently LTR (email, phone) whatever the page direction */
  dir?: 'ltr' | 'rtl';
  required?: boolean;
};

// The Singular V1.0.0 input: a 48px box that owns the border, radius and
// padding, with the glyph inside it leading the text. The box carries the
// states because the input it wraps cannot style its own container — the ring
// through `has-focus-visible`, the error border through the input's own
// `aria-invalid`, which is what the server errors set. `items-stretch` and the
// clipping let the phone variant's country block fill the height and take the
// box's own corners.
const BOX =
  'mt-2 flex h-12 items-stretch overflow-hidden rounded-field border border-field-border bg-bg-elevated transition-colors duration-(--motion-300) has-focus-visible:outline-[2.5px] has-focus-visible:outline-offset-2 has-focus-visible:outline-brand has-[[aria-invalid="true"]]:border-err';

const INPUT =
  'type-body w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-field-placeholder';

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
  icon: LeadingIcon,
  dialCode,
  hint,
  placeholder,
  maxLength,
  error,
  registration,
  type = 'text',
  inputMode,
  autoComplete,
  dir,
  required,
  className,
}: TextProps) {
  const { locale } = useFlowContent();
  const message = useErrorMessage()(error);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = message ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="type-body block font-bold">
        {label}
      </label>
      {/* A phone number is left-to-right data. The box is LTR so the country
          block sits on the physical left in both locales, the way the design
          draws it, and so the block's divider falls on its trailing edge. What
          follows the block goes back into the page direction, so its glyph
          leads the text on the same side as every other field's. */}
      <div className={BOX} dir={dialCode ? 'ltr' : undefined}>
        {dialCode ? (
          <span className="flex items-center gap-2 border-e border-field-border bg-field-prefix px-4">
            <Image
              src={DIAL_FLAG.sa.src}
              alt=""
              width={DIAL_FLAG.sa.width}
              height={DIAL_FLAG.sa.height}
              className="h-auto w-6"
            />
            <span className="type-small num text-ink-muted">{dialCode}</span>
          </span>
        ) : null}
        <span
          className="flex min-w-0 flex-1 items-center gap-3 px-4"
          dir={dialCode ? dirFor(locale) : undefined}
        >
          {LeadingIcon ? <LeadingIcon className="size-5 text-ink" /> : null}
          <input
            id={id}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            placeholder={placeholder}
            maxLength={maxLength}
            dir={dir}
            required={required}
            aria-required={required || undefined}
            aria-invalid={message ? true : undefined}
            aria-describedby={describedBy}
            className={cn(INPUT, dir === 'ltr' && 'text-start')}
            {...registration}
          />
        </span>
      </div>
      {/* the rule and the error both sit under the field, so the label and the
          box read as one unit; `aria-describedby` still names them both */}
      {hint ? (
        <p id={hintId} className="type-small mt-2 text-ink-muted">
          {hint}
        </p>
      ) : null}
      {message && errorId ? <ErrorText id={errorId} message={message} /> : null}
    </div>
  );
}

type CheckboxProps = BaseProps & { children: ReactNode };

// Singular's list control: the native box is replaced by a drawn one, so the
// input stays the real control (label, focus and keyboard all native) while
// the square next to it carries the brand fill and the check.
export function CheckboxField({ id, error, registration, children, className }: CheckboxProps) {
  const message = useErrorMessage()(error);
  const errorId = message ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="group type-body flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={message ? true : undefined}
          aria-describedby={errorId}
          className="peer sr-only"
          {...registration}
        />
        <span
          aria-hidden
          className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] border border-field-border bg-bg-elevated text-ink-on-dark transition-colors duration-(--motion-300) peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
        >
          <CheckIcon className="size-full opacity-0 transition-opacity duration-(--motion-300) group-has-checked:opacity-100" />
        </span>
        <span>{children}</span>
      </label>
      {message && errorId ? <ErrorText id={errorId} message={message} /> : null}
    </div>
  );
}
