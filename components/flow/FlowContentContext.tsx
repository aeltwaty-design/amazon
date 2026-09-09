'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { FlowContent } from '@/content/types';
import type { Locale } from '@/lib/i18n';
import { APPROVED_DOMAINS, errorText, type FlowErrorCode } from '@/lib/validation';
import { fmt } from '@/lib/i18n';

type Value = { content: FlowContent; locale: Locale };

const FlowContentContext = createContext<Value | null>(null);

// The page's only context: the flow is one client island five components
// deep, and prop-drilling copy through Field / OtpInput / Summary would be
// noise. Sections outside the island stay server components with props.
export function FlowContentProvider({ value, children }: { value: Value; children: ReactNode }) {
  return <FlowContentContext.Provider value={value}>{children}</FlowContentContext.Provider>;
}

export function useFlowContent(): Value {
  const value = useContext(FlowContentContext);
  if (!value) throw new Error('useFlowContent must be used inside <FlowContentProvider>');
  return value;
}

// Every error message may carry {domains}; unknown codes fall back to "invalid".
export function useErrorMessage(): (code: string | undefined) => string | undefined {
  const { content } = useFlowContent();
  return (code) => {
    const text = errorText(code as FlowErrorCode | undefined, content.errors);
    return text ? fmt(text, { domains: APPROVED_DOMAINS.join(', ') }) : undefined;
  };
}
