'use client';

import Link from 'next/link';
import type { CSSProperties, KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export type PillOption<V extends string> = {
  value: V;
  label: string;
  /** When set, the option is a real link (crawlable, keyboard-native). */
  href?: string;
  hrefLang?: string;
  lang?: string;
};

type Props<V extends string> = {
  options: readonly PillOption<V>[];
  value: V;
  onChange?: (value: V) => void;
  label: string;
  tone?: 'on-light' | 'on-dark';
  className?: string;
};

const TONE = {
  'on-light': {
    track: 'bg-bg-surface',
    thumb: 'bg-ink',
    active: 'text-ink-on-dark',
    inactive: 'text-ink-muted hover:text-ink',
  },
  'on-dark': {
    track: 'bg-cta-glow',
    thumb: 'bg-ink-on-dark',
    active: 'text-ink',
    // Full ink at 85%: the muted token on the glow track fails 4.5:1.
    inactive: 'text-ink-on-dark/85 hover:text-ink-on-dark',
  },
} as const;

// Segmented control. The thumb slides with a CSS transform multiplied by
// --dir (±1 from <html lang>), so it mirrors in RTL with no JavaScript.
export function PillToggle<V extends string>({
  options,
  value,
  onChange,
  label,
  tone = 'on-light',
  className,
}: Props<V>) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const t = TONE[tone];
  const style = { '--n': options.length, '--i': index } as CSSProperties;
  const isLinks = options.every((o) => o.href);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isLinks || !onChange) return;
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!delta) return;
    event.preventDefault();
    const next = options[(index + delta + options.length) % options.length];
    if (next) onChange(next.value);
  };

  return (
    <div
      role={isLinks ? 'group' : 'radiogroup'}
      aria-label={label}
      style={style}
      onKeyDown={onKeyDown}
      className={cn(
        'relative isolate inline-grid auto-cols-fr grid-flow-col rounded-pill p-[3px]',
        t.track,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-[3px] start-[3px] -z-10 w-[calc((100%-6px)/var(--n))] rounded-pill',
          'transition-transform duration-(--plans-switch) ease-out-cubic',
          'translate-x-[calc(var(--i)*100%*var(--dir))] motion-reduce:transition-none',
          t.thumb,
        )}
      />
      {options.map((option) => {
        const active = option.value === value;
        const classes = cn(
          'type-toggle relative inline-flex min-h-8 items-center justify-center rounded-pill px-4 transition-colors duration-(--plans-switch)',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
          active ? t.active : t.inactive,
        );
        if (option.href) {
          return (
            <Link
              key={option.value}
              href={option.href}
              hrefLang={option.hrefLang}
              lang={option.lang}
              aria-current={active ? 'true' : undefined}
              onClick={() => onChange?.(option.value)}
              className={classes}
            >
              {option.label}
            </Link>
          );
        }
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange?.(option.value)}
            className={classes}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
