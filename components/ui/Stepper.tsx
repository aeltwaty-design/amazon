import { cn } from '@/lib/cn';
import { formatInteger, type Locale } from '@/lib/i18n';

type Props = { steps: readonly string[]; current: number; label: string; locale: Locale };

function Check() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export function Stepper({ steps, current, label, locale }: Props) {
  return (
    <nav aria-label={label}>
      <ol className="grid grid-cols-4">
        {steps.map((step, i) => {
          const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
          return (
            <li
              key={step}
              data-state={state}
              aria-current={state === 'current' ? 'step' : undefined}
              className="relative flex flex-col items-center gap-2 text-center"
            >
              {/* Connector to the next step; start- keeps it pointing forward in
                  RTL. The whole line is drawn whatever the step: it carries the
                  flowing primary → secondary band (`.stepper-flow` in
                  globals.css), which is why it clips, and only the gradient
                  inside it moves. */}
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute start-[calc(50%+20px)] top-4 h-px w-[calc(100%-40px)] overflow-hidden"
                >
                  <span className="stepper-flow block h-full w-[200%]" />
                </span>
              ) : null}
              <span
                className={cn(
                  'type-toggle num flex size-8 items-center justify-center rounded-pill border transition-colors duration-(--motion-300)',
                  // done turns the number into a check on the success green;
                  // the step you are on is the same filled shape in the brand purple
                  state === 'complete' && 'border-ok bg-ok text-ink-on-dark',
                  state === 'current' && 'border-brand bg-brand text-ink-on-dark',
                  state === 'upcoming' && 'border-line bg-bg-elevated text-ink-muted',
                )}
              >
                {state === 'complete' ? <Check /> : formatInteger(i + 1, locale)}
              </span>
              <span
                className={cn(
                  'type-small',
                  state === 'upcoming' ? 'text-ink-muted' : 'font-bold text-ink',
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
