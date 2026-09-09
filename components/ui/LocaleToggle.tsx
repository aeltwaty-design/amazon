'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PillToggle } from '@/components/ui/PillToggle';
import { LOCALE_STORAGE_KEY, LOCALES, isLocale, type Locale } from '@/lib/i18n';

type Props = {
  locale: Locale;
  labels: Record<Locale, string>;
  ariaLabel: string;
  tone?: 'on-light' | 'on-dark';
};

const APPLIED_FLAG = 'walaone.locale-applied';

function readStored(): Locale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function LocaleToggle({ locale, labels, ariaLabel, tone }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Honour a stored preference once per tab on a cold visit to the default
  // locale. The session flag stops it fighting a deliberate toggle back to
  // Arabic; the referrer check stops it overriding a shared /ar link.
  useEffect(() => {
    if (pathname !== '/ar') return;
    try {
      if (sessionStorage.getItem(APPLIED_FLAG)) return;
      sessionStorage.setItem(APPLIED_FLAG, '1');
      if (readStored() === 'en' && document.referrer === '') router.replace('/en');
    } catch {
      /* storage unavailable: nothing to restore */
    }
  }, [pathname, router]);

  const remember = (next: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
      sessionStorage.setItem(APPLIED_FLAG, '1');
    } catch {
      /* storage unavailable: navigation still happens through the link */
    }
  };

  return (
    <PillToggle
      label={ariaLabel}
      value={locale}
      tone={tone}
      onChange={remember}
      options={LOCALES.map((l) => ({
        value: l,
        label: labels[l],
        href: `/${l}`,
        hrefLang: l,
        lang: l,
      }))}
    />
  );
}
