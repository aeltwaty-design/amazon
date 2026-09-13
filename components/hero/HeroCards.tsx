import type { SiteContent } from '@/content/types';
import { BenefitGrid } from '@/components/sections/Benefits';

// The mirror grid: identical markup and classes to the Benefits grid, inside
// a wrapper with the section's own box (one viewport tall, `.section`
// padding), placed just below the hero's bottom edge and pulled up into the
// pill stack by the choreography, so each mirror card is the size of its
// landing slot by construction. Hidden from assistive tech — the in-flow grid
// is the real one.
export function HeroCards({ content }: { content: SiteContent['benefits'] }) {
  return (
    <div
      data-hero-mirror
      aria-hidden
      inert
      className="section pointer-events-none absolute inset-x-0 top-full hidden min-h-svh flex-col lg:flex"
    >
      <div className="gutter mx-auto flex w-full max-w-content flex-1 flex-col">
        <BenefitGrid content={content} mode="mirror" />
      </div>
    </div>
  );
}
