// Pure locale helpers. This module deliberately imports no content: it is used
// by client components, and pulling both locale trees into every client bundle
// would double the JS shipped to the purchase flow.

export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ar';
export const LOCALE_STORAGE_KEY = 'walaone.locale';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const dirFor = (locale: Locale): 'rtl' | 'ltr' => (locale === 'ar' ? 'rtl' : 'ltr');

// The single source of the x-mirroring sign for authored horizontal motion.
export const dirX = (locale: Locale): 1 | -1 => (locale === 'ar' ? -1 : 1);

export type FmtVars = Record<string, string | number>;

// Unknown keys are left visible on purpose: a leaked "{email}" on screen is a
// louder bug than a silently blank sentence.
export function fmt(template: string, vars: FmtVars): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export type TemplatePart = { text: string } | { key: string };

export function splitTemplate(template: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  const re = /\{(\w+)\}/g;
  let last = 0;
  for (const match of template.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: template.slice(last, index) });
    parts.push({ key: match[1] ?? '' });
    last = index + match[0].length;
  }
  if (last < template.length) parts.push({ text: template.slice(last) });
  return parts;
}

// Prose numerals (step badges, term numbers) follow the script of the
// surrounding text; prices never come through here (see lib/pricing.ts).
const INT_LOCALE: Record<Locale, string> = { ar: 'ar-SA', en: 'en-US' };
const intFormatters = new Map<Locale, Intl.NumberFormat>();

export function formatInteger(value: number, locale: Locale): string {
  let formatter = intFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(INT_LOCALE[locale], { useGrouping: false });
    intFormatters.set(locale, formatter);
  }
  return formatter.format(value);
}
