import { Currency } from '@/components/ui/Currency';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';
import { formatMoney } from '@/lib/pricing';

type Props = {
  halalas: number;
  locale: Locale;
  size?: 'plan' | 'lead' | 'inline';
  strike?: boolean;
  className?: string;
};

const SIZE = {
  plan: 'type-price',
  lead: 'type-h3',
  inline: '',
} as const;

// Always LTR: "255.30" must never reorder inside an Arabic sentence.
export function Price({ halalas, locale, size = 'inline', strike = false, className }: Props) {
  return (
    <span
      dir="ltr"
      className={cn(
        'num inline-flex items-baseline gap-[0.25em]',
        SIZE[size],
        strike && 'text-ink-muted line-through decoration-2',
        className,
      )}
    >
      <span>{formatMoney(halalas)}</span>
      <Currency locale={locale} />
    </span>
  );
}
