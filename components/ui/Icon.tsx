import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Iconsax (iconsax.io), Outline set, taken from the MIT-licensed
// `iconsax-react` package and inlined so nothing is fetched at runtime and
// the glyphs take their colour from the text around them. The Outline paths
// are closed shapes with their counters cut out, so they fill rather than
// stroke; the 24 × 24 viewBox is Iconsax's own.

type IconProps = { className?: string };

function Icon({
  className,
  children,
  viewBox = '0 0 24 24',
}: IconProps & { children: ReactNode; viewBox?: string }) {
  return (
    <svg aria-hidden viewBox={viewBox} fill="currentColor" className={cn('shrink-0', className)}>
      {children}
    </svg>
  );
}

/**
 * Iconsax Linear glyphs stroke rather than fill: the badge icons on the first
 * benefit card come from the mockup file's own instances ("discount-shape",
 * "ticket"), on their 64-unit box with the 4-unit stroke as drawn there.
 */
function StrokeIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64.18 64.18"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
    >
      {children}
    </svg>
  );
}

/** Iconsax `discount-shape` (Linear): a scalloped badge with a percent sign. */
export function DiscountShapeIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M10.6669 39.2041L6.60222 35.1394C4.94425 33.4814 4.94425 30.7538 6.60222 29.0958L10.6669 25.031C11.3622 24.3358 11.9237 22.9719 11.9237 22.0092V16.2598C11.9237 13.9065 13.8491 11.9812 16.2024 11.9812H21.9518C22.9145 11.9812 24.2783 11.4197 24.9736 10.7244L29.0383 6.65967C30.6962 5.0017 33.4239 5.0017 35.0819 6.65967L39.1466 10.7244C39.8419 11.4197 41.2056 11.9812 42.1683 11.9812H47.9178C50.2711 11.9812 52.1964 13.9065 52.1964 16.2598V22.0092C52.1964 22.9719 52.7579 24.3358 53.4532 25.031L57.518 29.0958C59.1759 30.7538 59.1759 33.4814 57.518 35.1394L53.4532 39.2041C52.7579 39.8994 52.1964 41.2632 52.1964 42.2259V47.9751C52.1964 50.3283 50.2711 52.254 47.9178 52.254H42.1683C41.2056 52.254 39.8419 52.8155 39.1466 53.5108L35.0819 57.5755C33.4239 59.2335 30.6962 59.2335 29.0383 57.5755L24.9736 53.5108C24.2783 52.8155 22.9145 52.254 21.9518 52.254H16.2024C13.8491 52.254 11.9237 50.3283 11.9237 47.9751V42.2259C11.9237 41.2365 11.3622 39.8727 10.6669 39.2041Z" />
      <path d="M24.0673 40.1122L40.1122 24.0673" />
      <path d="M38.7604 38.7751H38.7844" strokeWidth="5" />
      <path d="M25.3897 25.4044H25.4137" strokeWidth="5" />
    </StrokeIcon>
  );
}

/** Iconsax `ticket` (Linear): a voucher with a perforated fold. */
export function TicketIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M50.7565 32.5362C50.7565 28.9442 53.6717 26.029 57.2637 26.029V23.4261C57.2637 13.0145 54.6608 10.4116 44.2492 10.4116H18.2203C7.80869 10.4116 5.20579 13.0145 5.20579 23.4261V24.7275C8.79779 24.7275 11.713 27.6427 11.713 31.2347C11.713 34.8267 8.79779 37.742 5.20579 37.742V39.0434C5.20579 49.455 7.80869 52.0579 18.2203 52.0579H44.2492C54.6608 52.0579 57.2637 49.455 57.2637 39.0434C53.6717 39.0434 50.7565 36.1282 50.7565 32.5362Z" />
      <path d="M26.0289 10.4116L26.029 52.0579" strokeDasharray="13.01 13.01" />
    </StrokeIcon>
  );
}

/** Iconsax `User` (Outline): a head and shoulders. */
export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 12.75c-3.17 0-5.75-2.58-5.75-5.75S8.83 1.25 12 1.25 17.75 3.83 17.75 7s-2.58 5.75-5.75 5.75Zm0-10A4.26 4.26 0 0 0 7.75 7 4.26 4.26 0 0 0 12 11.25 4.26 4.26 0 0 0 16.25 7 4.26 4.26 0 0 0 12 2.75ZM20.59 22.75c-.41 0-.75-.34-.75-.75 0-3.45-3.52-6.25-7.84-6.25S4.16 18.55 4.16 22c0 .41-.34.75-.75.75s-.75-.34-.75-.75c0-4.27 4.19-7.75 9.34-7.75 5.15 0 9.34 3.48 9.34 7.75 0 .41-.34.75-.75.75Z" />
    </Icon>
  );
}

/** Iconsax `Mobile` (Outline): a phone handset. */
export function MobileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 22.75H9c-4.41 0-5.75-1.34-5.75-5.75V7c0-4.41 1.34-5.75 5.75-5.75h6c4.41 0 5.75 1.34 5.75 5.75v10c0 4.41-1.34 5.75-5.75 5.75Zm-6-20c-3.58 0-4.25.68-4.25 4.25v10c0 3.57.67 4.25 4.25 4.25h6c3.58 0 4.25-.68 4.25-4.25V7c0-3.57-.67-4.25-4.25-4.25H9Z" />
      <path d="M14 6.25h-4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4c.41 0 .75.34.75.75s-.34.75-.75.75ZM12 19.862a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Zm0-3.11c-.44 0-.8.36-.8.8 0 .44.36.8.8.8.44 0 .8-.36.8-.8 0-.44-.36-.8-.8-.8Z" />
    </Icon>
  );
}

/** Iconsax `Sms` (Outline): an envelope. */
export function SmsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17 21.25H7c-3.65 0-5.75-2.1-5.75-5.75v-7c0-3.65 2.1-5.75 5.75-5.75h10c3.65 0 5.75 2.1 5.75 5.75v7c0 3.65-2.1 5.75-5.75 5.75Zm-10-17c-2.86 0-4.25 1.39-4.25 4.25v7c0 2.86 1.39 4.25 4.25 4.25h10c2.86 0 4.25-1.39 4.25-4.25v-7c0-2.86-1.39-4.25-4.25-4.25H7Z" />
      <path d="M11.999 12.868c-.84 0-1.69-.26-2.34-.79l-3.13-2.5a.748.748 0 0 1 .93-1.17l3.13 2.5c.76.61 2.05.61 2.81 0l3.13-2.5c.32-.26.8-.21 1.05.12.26.32.21.8-.12 1.05l-3.13 2.5c-.64.53-1.49.79-2.33.79Z" />
    </Icon>
  );
}

/**
 * Iconsax `TickSquare` (Outline) with its box dropped: the bare check the
 * checkbox draws inside its own box. The viewBox crops to the glyph, so the
 * check fills the box the way Singular's does instead of sitting in 24 units
 * of empty space.
 */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props} viewBox="4 4 16 16">
      <path d="M10.58 15.582a.75.75 0 0 1-.53-.22l-2.83-2.83a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l2.3 2.3 5.14-5.14c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06l-5.67 5.67a.75.75 0 0 1-.53.22Z" />
    </Icon>
  );
}
