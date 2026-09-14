import type { SlotCopy } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { Art } from '@/lib/art';

type Mark = { id: string; slot: SlotCopy; mark?: Art };

type Props = {
  label: string;
  marks: readonly Mark[];
};

// The schemes the gateway takes, shown rather than chosen. The card itself is
// entered on the gateway's own page, which is where the scheme is decided, so
// there is nothing here to pick: this is a list of marks, not a control, and
// it carries no state, no focus stop and no server-rendered selection.
export function PaymentMethods({ label, marks }: Props) {
  return (
    <div>
      <p className="type-body font-bold">{label}</p>
      <ul className="mt-3 flex flex-wrap items-center gap-5">
        {marks.map((entry) => (
          // Fixed-height row: the scheme marks have very different aspect
          // ratios, so each image scales to the height and keeps its own width.
          <li key={entry.id} className="flex h-6 items-center">
            <ImageSlot
              title={entry.slot.title}
              width={entry.mark?.width ?? 96}
              height={entry.mark?.height ?? 24}
              src={entry.mark?.src}
              sizes="96px"
              className={entry.mark ? 'h-6 w-auto max-w-[72px] object-contain' : 'rounded-btn'}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
