import type { Locale } from '@/lib/i18n';
import { ar } from './ar';
import { en } from './en';
import type { SiteContent } from './types';

// The only module that imports both locale trees. It is consumed from server
// files alone (layout/page), which keeps the trees out of client bundles.
const CONTENT: Record<Locale, SiteContent> = { ar, en };

export const getContent = (locale: Locale): SiteContent => CONTENT[locale];

export type * from './types';
