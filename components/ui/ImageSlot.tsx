import Image from 'next/image';
import { cn } from '@/lib/cn';

export type ImageSlotProps = {
  title: string;
  description?: string;
  width: number;
  height: number;
  src?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

// A labelled dashed placeholder that becomes a real next/image the moment a
// `src` arrives. Both branches size the same box (width/height → aspect-ratio),
// so swapping the asset in changes no layout.
export function ImageSlot({
  title,
  description,
  width,
  height,
  src,
  alt,
  sizes,
  priority,
  className,
}: ImageSlotProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? title}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={cn('h-auto w-full object-cover', className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={title}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-[inherit] border border-dashed border-line bg-bg-surface p-3 text-center text-ink-muted',
        className,
      )}
    >
      <span className="type-small font-semibold">{title}</span>
      {description ? <span className="type-small opacity-80">{description}</span> : null}
    </div>
  );
}
