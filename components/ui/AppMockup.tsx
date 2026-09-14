import Image from 'next/image';
import { ABOUT_MOCKUP, APP_SCREEN, type Art } from '@/lib/art';
import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  /** alt text for the capture (the slot title) */
  label: string;
  className?: string;
  /** the gradient block behind the phone; off leaves the phone on its own */
  glow?: boolean;
  /** the capture in the screen, when it is not this locale's home screen */
  screen?: Art;
};

// The UI8 "Aganta" mockup (see ABOUT_MOCKUP): the glow block, the screen and
// the iPhone 14 Pro frame are laid out at the node's proportions inside a box
// with its aspect ratio, so the whole composition scales with the column. The
// screen is the real home capture per locale (object-fit cover: the English
// capture is 10 px shorter), rounded in container units so its corners follow
// the frame's cutout at any size.
//
// Without the glow the box is the phone alone — the same drawing measured from
// the frame's own corner instead of the composition's — which is how the
// closing band stands one on a dark field, where a gradient block behind it
// would read as a stray light.
export function AppMockup({
  locale,
  label,
  className,
  glow = true,
  screen = APP_SCREEN[locale],
}: Props) {
  const { frame, glow: glowArt, layout } = ABOUT_MOCKUP;
  const box = glow
    ? { w: layout.w, h: layout.h, x: 0, y: 0 }
    : { w: layout.frame.w, h: layout.frame.h, x: layout.frame.x, y: layout.frame.y };
  /** a point in the node's units as a share of the box */
  const atX = (v: number) => `${(100 * (v - box.x)) / box.w}%`;
  const atY = (v: number) => `${(100 * (v - box.y)) / box.h}%`;
  /** a length in the node's units as a share of the box */
  const spanX = (v: number) => `${(100 * v) / box.w}%`;
  const spanY = (v: number) => `${(100 * v) / box.h}%`;
  return (
    <div
      className={cn('@container relative mx-auto w-full max-w-[480px]', className)}
      style={{ aspectRatio: `${box.w} / ${box.h}` }}
    >
      {glow ? (
        <Image
          src={glowArt.src}
          alt=""
          width={glowArt.width}
          height={glowArt.height}
          sizes="(min-width: 1024px) 362px, 66vw"
          className="absolute h-auto"
          style={{ left: atX(layout.glow.x), top: atY(layout.glow.y), width: spanX(layout.glow.w) }}
        />
      ) : null}
      <div
        className="absolute overflow-hidden"
        style={{
          left: atX(layout.screen.x),
          top: atY(layout.screen.y),
          width: spanX(layout.screen.w),
          height: spanY(layout.screen.h),
          borderRadius: `${(100 * layout.screen.rx) / box.w}cqw`,
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
          left: atX(layout.frame.x),
          top: atY(layout.frame.y),
          width: spanX(layout.frame.w),
        }}
      />
    </div>
  );
}
