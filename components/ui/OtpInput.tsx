'use client';

import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';
import { fmt } from '@/lib/i18n';
import { toWesternDigits } from '@/lib/validation';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  label: string;
  /** {n} {total} */
  digitLabel: string;
  className?: string;
};

// The root is dir="ltr" whatever the page direction: a code is read
// left-to-right in Arabic too, and flex-row alone would mirror the boxes.
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  invalid,
  describedBy,
  label,
  digitLabel,
  className,
}: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => inputs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const write = (start: number, digits: string) => {
    const next = (value.slice(0, start) + digits + value.slice(start + digits.length)).slice(
      0,
      length,
    );
    onChange(next);
    focus(Math.min(start + digits.length, length - 1));
    if (next.length === length) onComplete?.(next);
  };

  const onPaste = (i: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = toWesternDigits(event.clipboardData.getData('text'))
      .replace(/\D/g, '')
      .slice(0, length - i);
    if (digits) write(i, digits);
  };

  const onInput = (i: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const digits = toWesternDigits(event.target.value).replace(/\D/g, '');
    if (!digits) {
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }
    // iOS one-time-code autofill drops all six digits into one box: treat it as a paste.
    write(i, digits.length > 1 ? digits : digits.slice(-1));
  };

  const onKeyDown = (i: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !value[i] && i > 0) {
      event.preventDefault();
      onChange(value.slice(0, i - 1));
      focus(i - 1);
    }
    // The container is LTR, so Left is always "previous" regardless of page dir.
    if (event.key === 'ArrowLeft') focus(i - 1);
    if (event.key === 'ArrowRight') focus(i + 1);
  };

  return (
    <div
      role="group"
      aria-label={label}
      dir="ltr"
      className={cn('flex justify-center gap-2 sm:gap-3', className)}
    >
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={fmt(digitLabel, { n: i + 1, total: length })}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={onInput(i)}
          onPaste={onPaste(i)}
          onKeyDown={onKeyDown(i)}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            'type-h3 num h-14 w-11 rounded-field border bg-bg-elevated text-center text-ink transition-colors duration-(--motion-300) sm:h-16 sm:w-12',
            'focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60',
            invalid ? 'border-err' : 'border-field-border',
          )}
        />
      ))}
    </div>
  );
}
