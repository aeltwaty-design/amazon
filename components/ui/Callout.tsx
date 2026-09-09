import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  tone: 'info' | 'error' | 'success';
  role?: 'alert' | 'status';
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  id?: string;
  ref?: Ref<HTMLDivElement>;
};

const TONE = {
  info: 'border-line bg-bg-surface text-ink',
  error: 'border-err bg-err-wash text-err',
  success: 'border-ok bg-ok-wash text-ok',
} as const;

export function Callout({ tone, role, title, children, action, className, id, ref }: Props) {
  return (
    <div
      ref={ref}
      id={id}
      role={role}
      tabIndex={-1}
      className={cn(
        'rounded-btn border p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
        TONE[tone],
        className,
      )}
    >
      {title ? <p className="type-body font-bold">{title}</p> : null}
      <div className={cn('type-body', title && 'mt-1')}>{children}</div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
