import { Currency } from '@/components/ui/Currency';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';
import { formatMoney, formatRiyals } from '@/lib/pricing';

type Props = {
  halalas: number;
  locale: Locale;
  size?: 'plan' | 'lead' | 'inline';
  strike?: boolean;
  className?: string;
  /** whole riyals, the way prose says them ("save 148"); the default is two decimals */
  format?: 'money' | 'riyals';
};

const SIZE = {
  plan: 'type-price',
  lead: 'type-h3',
  inline: '',
} as const;

// Always LTR: "255.30" must never reorder inside an Arabic sentence, and the
// riyal symbol leads the figure in both locales, which only holds if the pair
// is isolated — in an RTL sentence a symbol written first would otherwise be
// laid out to the right of the digits.
export function Price({
  halalas,
  locale,
  size = 'inline',
  strike = false,
  className,
  format = 'money',
}: Props) {
  return (
    <span
      dir="ltr"
      className={cn(
        'num inline-flex items-baseline gap-[0.25em]',
        SIZE[size],
        // Colour is inherited (no opacity): the caller's muted token already
        // meets 4.5:1 on its surface, and dimming it further would not.
        strike && 'line-through decoration-2',
        className,
      )}
    >
      <Currency locale={locale} />
      <span>{format === 'riyals' ? formatRiyals(halalas) : formatMoney(halalas)}</span>
    </span>
  );
}
