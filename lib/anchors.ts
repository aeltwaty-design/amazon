export const SECTION_IDS = {
  main: 'main',
  benefits: 'benefits',
  about: 'about',
  brands: 'brands',
  howTo: 'how-to',
  pricing: 'pricing',
  flow: 'flow',
  faq: 'faq',
  terms: 'terms',
} as const;

export type FooterLinkId =
  'offer' | 'subscribe' | 'about' | 'faq' | 'support' | 'terms' | 'privacy';

export const FOOTER_HREFS: Record<FooterLinkId, string> = {
  offer: `#${SECTION_IDS.pricing}`,
  subscribe: `#${SECTION_IDS.flow}`,
  about: `#${SECTION_IDS.about}`,
  faq: `#${SECTION_IDS.faq}`,
  support: 'mailto:support@walaplus.com',
  terms: `#${SECTION_IDS.terms}`,
  // TODO: no privacy policy page exists yet; the brief gives no destination.
  privacy: '#',
};
