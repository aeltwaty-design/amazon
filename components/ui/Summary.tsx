import { Currency } from '@/components/ui/Currency';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';
import { formatMoney } from '@/lib/pricing';

export type SummaryRow = {
  id: string;
  label: string;
  halalas: number;
  kind?: 'discount' | 'total';
};

type Props = { rows: readonly SummaryRow[]; locale: Locale; className?: string };

export function Summary({ rows, locale, className }: Props) {
  return (
    <dl className={cn('grid gap-3', className)}>
      {rows.map((row) => {
        const negative = row.halalas < 0;
        return (
          <div
            key={row.id}
            className={cn(
              'flex items-baseline justify-between gap-4',
              row.kind === 'total' && 'border-t border-line pt-3',
            )}
          >
            <dt className={cn('type-body', row.kind === 'total' ? 'font-bold' : 'text-ink-muted')}>
              {row.label}
            </dt>
            {/* The whole amount is an LTR isolate: in an RTL paragraph a leading
                minus would otherwise render on the wrong side of the digits. */}
            <dd
              className={cn(
                'type-body num',
                row.kind === 'total' && 'type-h3',
                row.kind === 'discount' && 'text-ok',
              )}
            >
              <bdi dir="ltr" className="inline-flex items-baseline gap-1">
                <span>
                  {negative ? '−' : ''}
                  {formatMoney(Math.abs(row.halalas))}
                </span>
                <Currency locale={locale} />
              </bdi>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
