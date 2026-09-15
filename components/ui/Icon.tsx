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

/** Iconsax `coin` (Linear): a coin with a second behind it. */
export function CoinIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path
        strokeWidth="5"
        d="M26.7147 48.0811C38.5151 48.0811 48.0811 38.5151 48.0811 26.7147C48.0811 14.9144 38.5151 5.34829 26.7147 5.34829C14.9144 5.34829 5.34829 14.9144 5.34829 26.7147C5.34829 38.5151 14.9144 48.0811 26.7147 48.0811Z"
      />
      <path
        strokeWidth="5"
        d="M34.7104 53.162C37.1171 56.5582 41.0481 58.7777 45.5407 58.7777C52.8411 58.7777 58.7777 52.8411 58.7777 45.5407C58.7777 41.1016 56.5849 37.1706 53.2422 34.7639"
      />
    </StrokeIcon>
  );
}

/** Heroicons `arrows-right-left` (mini), as the mockup file carries it: a filled glyph, so it fills. */
export function ArrowsRightLeftIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 51.277 51.277"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M35.6349 1.39931C34.7545 2.34739 34.8094 3.82963 35.7575 4.70999L42.3182 10.802L15.4872 10.802C14.1934 10.802 13.1446 11.8508 13.1446 13.1446C13.1446 14.4384 14.1934 15.4872 15.4872 15.4872L42.3182 15.4872L35.7575 21.5793C34.8094 22.4596 34.7545 23.9419 35.6349 24.89C36.5153 25.838 37.9975 25.8929 38.9456 25.0126L49.8777 14.8613C50.3551 14.418 50.6263 13.796 50.6263 13.1446C50.6263 12.4932 50.3551 11.8712 49.8777 11.428L38.9456 1.2767C37.9975 0.396338 36.5153 0.451236 35.6349 1.39931ZM15.6421 26.3871C14.7618 25.439 13.2795 25.3841 12.3315 26.2645L1.3993 36.4158C0.921956 36.859 0.650724 37.481 0.650724 38.1324C0.650724 38.7838 0.921956 39.4058 1.3993 39.8491L12.3315 50.0004C13.2795 50.8807 14.7618 50.8258 15.6421 49.8777C16.5225 48.9297 16.4676 47.4474 15.5195 46.5671L8.95886 40.475H35.7898C37.0836 40.475 38.1324 39.4262 38.1324 38.1324C38.1324 36.8386 37.0836 35.7898 35.7898 35.7898H8.95886L15.5195 29.6978C16.4676 28.8174 16.5225 27.3352 15.6421 26.3871Z"
      />
    </svg>
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
