import { cn } from '@/lib/cn';
import { SAR_SYMBOL_PATH, SAR_TEXT } from '@/lib/currency';
import type { Locale } from '@/lib/i18n';

type Props = { locale: Locale; className?: string };

// Riyal symbol sized to the surrounding text; text fallback while the SVG
// artwork is missing (noon ships theirs as an icon font — same job, no font).
export function Currency({ locale, className }: Props) {
  if (SAR_SYMBOL_PATH) {
    return (
      <svg
        role="img"
        aria-label="SAR"
        focusable="false"
        viewBox="0 0 1024 1024"
        className={cn('inline-block h-[0.8em] w-auto fill-current align-[-0.05em]', className)}
      >
        <path d={SAR_SYMBOL_PATH} />
      </svg>
    );
  }
  return (
    <span aria-label="SAR" className={cn('text-[0.8em] font-semibold', className)}>
      {SAR_TEXT[locale]}
    </span>
  );
}
