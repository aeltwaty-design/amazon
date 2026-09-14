import { cn } from '@/lib/cn';
import { SAR_SYMBOL_PATH, SAR_SYMBOL_VIEWBOX, SAR_TEXT } from '@/lib/currency';
import type { Locale } from '@/lib/i18n';

type Props = { locale: Locale; className?: string };

// The riyal symbol, sized to the text it sits in and painted in its colour.
// The glyph is taller than it is wide, so it is sized by height and lets its
// width follow; `align` drops it onto the baseline of the digits beside it.
// Its accessible name is the locale's own abbreviation, because the drawing
// itself announces nothing.
export function Currency({ locale, className }: Props) {
  return (
    <svg
      role="img"
      aria-label={SAR_TEXT[locale]}
      focusable="false"
      viewBox={SAR_SYMBOL_VIEWBOX}
      className={cn('inline-block h-[0.78em] w-auto fill-current align-[-0.04em]', className)}
    >
      <path d={SAR_SYMBOL_PATH} />
    </svg>
  );
}
