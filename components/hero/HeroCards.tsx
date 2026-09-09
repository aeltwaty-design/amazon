import type { SiteContent } from '@/content/types';
import { BenefitGrid } from '@/components/sections/Benefits';

// The mirror grid: identical markup and classes to the Benefits grid, placed
// just below the hero's bottom edge and pulled up into the peeking stack by
// the choreography. Hidden from assistive tech — the in-flow grid is the real one.
export function HeroCards({ content }: { content: SiteContent['benefits'] }) {
  return (
    <div
      data-hero-mirror
      aria-hidden
      inert
      className="pointer-events-none absolute inset-x-0 top-full hidden lg:block"
    >
      <div className="gutter mx-auto max-w-content">
        <BenefitGrid content={content} mode="mirror" />
      </div>
    </div>
  );
}
