import Image from 'next/image';
import { ABOUT_MOCKUP, APP_SCREEN } from '@/lib/art';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  /** alt text for the capture (the slot title) */
  label: string;
  className?: string;
};

/** a length in the node's units as a share of the composition's width / height */
const pctX = (v: number) => `${(100 * v) / ABOUT_MOCKUP.layout.w}%`;
const pctY = (v: number) => `${(100 * v) / ABOUT_MOCKUP.layout.h}%`;

// The UI8 "Aganta" mockup (see ABOUT_MOCKUP): the glow block, the screen and
// the iPhone 14 Pro frame are laid out at the node's proportions inside a box
// with its aspect ratio, so the whole composition scales with the column. The
// screen is the real home capture per locale (object-fit cover: the English
// capture is 10 px shorter), rounded in container units so its corners follow
// the frame's cutout at any size.
export function AppMockup({ locale, label, className }: Props) {
  const screen = APP_SCREEN[locale];
  const { frame, glow, layout } = ABOUT_MOCKUP;
  return (
    <div
      className={cn('@container relative mx-auto w-full max-w-[480px]', className)}
      style={{ aspectRatio: `${layout.w} / ${layout.h}` }}
    >
      <Image
        src={glow.src}
        alt=""
        width={glow.width}
        height={glow.height}
        sizes="(min-width: 1024px) 362px, 66vw"
        className="absolute h-auto"
        style={{ left: pctX(layout.glow.x), top: pctY(layout.glow.y), width: pctX(layout.glow.w) }}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          left: pctX(layout.screen.x),
          top: pctY(layout.screen.y),
          width: pctX(layout.screen.w),
          height: pctY(layout.screen.h),
          borderRadius: `${(100 * layout.screen.rx) / layout.w}cqw`,
        }}
      >
        <Image
          src={screen.src}
          alt={label}
          width={screen.width}
          height={screen.height}
          sizes="(min-width: 1024px) 271px, 50vw"
          className="size-full object-cover object-top"
        />
      </div>
      <Image
        src={frame.src}
        alt=""
        width={frame.width}
        height={frame.height}
        sizes="(min-width: 1024px) 302px, 56vw"
        className="absolute h-auto"
        style={{
          left: pctX(layout.frame.x),
          top: pctY(layout.frame.y),
          width: pctX(layout.frame.w),
        }}
      />
    </div>
  );
}
