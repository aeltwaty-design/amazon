'use client';

import type { SlotCopy } from '@/content/types';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { cn } from '@/lib/cn';
import type { PaymentMethod } from '@/lib/pricing';

type Option = { value: PaymentMethod; label: string; slot: SlotCopy };

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
                'has-focus-visible:outline-[2.5px] has-focus-visible:outline-offset-2 has-focus-visible:outline-ink',
                checked ? 'border-ink bg-bg-surface' : 'border-line bg-bg-elevated',
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
              <div className="w-full">
                <ImageSlot
                  title={option.slot.title}
                  width={96}
                  height={40}
                  className="rounded-btn"
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
