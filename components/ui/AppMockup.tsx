import Image from 'next/image';
import { APP_SCREEN } from '@/lib/art';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  /** alt text for the capture (the slot title) */
  label: string;
  className?: string;
};

// The real WalaOne home screen, one capture per locale, inside a CSS phone
// frame. The captures start at the greeting row (no status bar), so the
// frame's notch pill overlaps only the header's purple.
export function AppMockup({ locale, label, className }: Props) {
  const screen = APP_SCREEN[locale];
  return (
    <div className={cn('mx-auto w-full max-w-[300px]', className)}>
      <div className="rounded-[44px] bg-ink p-2.5 shadow-2xl shadow-ink/25">
        <div className="relative overflow-hidden rounded-[34px] bg-bg-surface">
          <span
            aria-hidden
            className="absolute inset-x-0 top-2.5 z-10 mx-auto block h-6 w-24 rounded-pill bg-ink"
          />
          <Image
            src={screen.src}
            alt={label}
            width={screen.width}
            height={screen.height}
            sizes="(min-width: 1024px) 300px, 80vw"
            className="block h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
