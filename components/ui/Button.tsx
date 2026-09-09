import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Variants only set the three --btn-* vars plus size; colours never appear
// on the base class, so a variant can never be half-overridden.
const button = cva(
  [
    'relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap select-none',
    'rounded-(--btn-radius) bg-(--btn-bg) text-(--btn-fg)',
    'transition-transform duration-(--btn-hover) ease-out-cubic hover:-translate-y-px',
    // Ring in the button's own colour, so it shows against the surrounding surface.
    'focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-(--btn-bg)',
    'disabled:pointer-events-none disabled:opacity-60 aria-busy:cursor-progress',
    // Radial glow on hover, painted behind the label.
    'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit]',
    'after:bg-[radial-gradient(120%_120%_at_50%_0%,var(--color-cta-glow),transparent_70%)]',
    'after:opacity-0 after:transition-opacity after:duration-(--btn-hover) hover:after:opacity-100',
  ],
  {
    variants: {
      variant: {
        'primary-on-dark':
          'type-btn-hero px-[51px] py-[19px] [--btn-bg:var(--color-cta-on-dark-bg)] [--btn-fg:var(--color-cta-on-dark-fg)] [--btn-radius:var(--radius-btn-hero)]',
        primary:
          'type-btn h-[54px] px-[26px] [--btn-bg:var(--color-cta-bg)] [--btn-fg:var(--color-cta-fg)] [--btn-radius:var(--radius-btn)]',
        ghost:
          'type-btn-hero border border-current/30 px-[28px] py-[18px] [--btn-bg:transparent] [--btn-fg:currentColor] [--btn-radius:var(--radius-btn-hero)] after:hidden focus-visible:outline-current',
        header:
          'type-toggle h-10 px-4 [--btn-bg:var(--color-cta-bg)] [--btn-fg:var(--color-cta-fg)] [--btn-radius:var(--radius-btn)]',
        'header-on-dark':
          'type-toggle h-10 px-4 [--btn-bg:var(--color-cta-on-dark-bg)] [--btn-fg:var(--color-cta-on-dark-fg)] [--btn-radius:var(--radius-btn)]',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary' },
  },
);

type Variants = VariantProps<typeof button>;

type ButtonOwnProps = Variants & {
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type AnchorProps = ButtonOwnProps & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;
type NativeProps = ButtonOwnProps & { href?: undefined } & ComponentPropsWithoutRef<'button'>;

export type ButtonProps = AnchorProps | NativeProps;

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { href, variant, fullWidth, loading, className, children, ...rest } = props;
    return (
      <Link
        href={href}
        className={cn(button({ variant, fullWidth }), className)}
        aria-busy={loading || undefined}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const {
    variant,
    fullWidth,
    loading = false,
    className,
    children,
    type,
    disabled,
    ...rest
  } = props;
  return (
    <button
      type={type ?? 'button'}
      className={cn(button({ variant, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
