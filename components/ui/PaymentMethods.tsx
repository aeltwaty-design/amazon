'use client';

import type { SlotCopy } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { Art } from '@/lib/art';
import { cn } from '@/lib/cn';
import type { PaymentMethod } from '@/lib/pricing';

type Option = { value: PaymentMethod; label: string; slot: SlotCopy; mark?: Art };

type Props = {
  label: string;
  options: readonly Option[];
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  disabled?: boolean;
};

// Native radios: arrow-key roving and the checked state come for free.
export function PaymentMethods({ label, options, value, onChange, disabled }: Props) {
  return (
    <fieldset disabled={disabled}>
      <legend className="type-body font-bold">{label}</legend>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-btn border p-3 transition-colors duration-(--motion-300)',
                'has-focus-visible:outline-[2.5px] has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
                checked ? 'border-brand bg-brand-wash' : 'border-line bg-bg-elevated',
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {/* Fixed-height box: the scheme marks have very different aspect
                  ratios, so the image scales to height and centres. */}
              <div className="flex h-10 w-full items-center justify-center">
                <ImageSlot
                  title={option.slot.title}
                  width={option.mark?.width ?? 96}
                  height={option.mark?.height ?? 40}
                  src={option.mark?.src}
                  sizes="96px"
                  className={cn(
                    'rounded-btn',
                    option.mark && 'h-7 w-auto max-w-[96px] object-contain',
                  )}
                />
              </div>
              <span className="type-small font-bold">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
