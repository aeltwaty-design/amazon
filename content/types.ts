import type { FooterLinkId } from '@/lib/anchors';
import type { HeroTileId } from '@/lib/art';
import type { PaymentMethod } from '@/lib/pricing';
import type { FlowErrorCode } from '@/lib/validation';

export type SlotCopy = { title: string; description: string };
export type HeroTile = { id: HeroTileId; label: string };
export type FieldCopy = {
  label: string;
  hint?: string;
  placeholder?: string;
  /** a dial code turns the field into the phone-number variant */
  dialCode?: string;
};
export type Stat = { value: string; label: string };
export type Step = { title: string; body: string; slot: SlotCopy };
export type FaqItem = { q: string; a: string };
export type BenefitCopy = { title: string; body: string; slot: SlotCopy };
export type FooterColumn = {
  title: string;
  links: readonly { id: FooterLinkId; label: string }[];
};

// Tuples enforce the fixed counts the layout is built around; both locale
// files `satisfies` this type, so a missing key is a compile error.
export type SiteContent = {
  meta: { title: string; description: string };
  a11y: {
    skipToContent: string;
    scrollDown: string;
    scrollUp: string;
    localeSwitch: string;
  };
  header: {
    wordmark: string;
    partnerSlot: SlotCopy;
    toggle: { ar: string; en: string };
    cta: string;
  };
  hero: {
    h1Lead: string;
    h1Tail: string;
    sub: string;
    /** {saving} {discountPct} */
    priceLead: string;
    perYear: string;
    wasLabel: string;
    cta: string;
    ghostCta: string;
    illustrationSlot: SlotCopy;
    /** the five sector tiles under the CTA; tile 1 gathers the others and becomes the first benefit card */
    tiles: readonly [HeroTile, HeroTile, HeroTile, HeroTile, HeroTile];
  };
  benefits: {
    title: string;
    cards: readonly [BenefitCopy, BenefitCopy, BenefitCopy];
  };
  about: {
    title: string;
    body: string;
    stats: readonly [Stat, Stat, Stat];
    screenshotSlot: SlotCopy;
  };
  brands: {
    title: string;
    subtitle: string;
  };
  howTo: { title: string; steps: readonly [Step, Step, Step] };
  pricing: {
    title: string;
    /** {discountPct} */
    ribbon: string;
    planTitle: string;
    perYear: string;
    /** precedes the struck-through list price */
    wasLabel: string;
    /** {vat} — the tax the price already contains */
    vatLine: string;
    /** the label over the feature list */
    includesLabel: string;
    features: readonly [string, string, string, string];
    cta: string;
    finePrint: string;
  };
  flow: FlowContent;
  faq: { title: string; description: string; items: readonly FaqItem[] };
  finalCta: { title: string; body: string; cta: string };
  terms: { title: string; items: readonly string[] };
  footer: {
    blurb: string;
    columns: readonly [FooterColumn, FooterColumn, FooterColumn];
    partnership: string;
  };
};

export type FlowContent = {
  title: string;
  subtitle: string;
  stepper: {
    label: string;
    steps: readonly [string, string, string, string];
    /** {n} {total} {label} */
    announce: string;
  };
  details: {
    heading: string;
    name: FieldCopy;
    mobile: FieldCopy;
    /** hint carries {domains} */
    email: FieldCopy;
    /** {terms} {privacy} */
    consent: string;
    termsLabel: string;
    privacyLabel: string;
    cta: string;
    submitting: string;
    errorSummaryTitle: string;
  };
  identity: {
    heading: string;
    /** {email} */
    sentTo: string;
    otpLabel: string;
    /** {n} {total} */
    otpDigitLabel: string;
    /** {s} */
    resendIn: string;
    resend: string;
    resent: string;
    verifying: string;
    cta: string;
    edit: string;
  };
  payment: {
    heading: string;
    rows: { annual: string; discount: string; total: string; vat: string };
    methodsLabel: string;
    methodSlot: Record<PaymentMethod, SlotCopy>;
    /** {amount} */
    payCta: string;
    paying: string;
    secureNote: string;
    retry: string;
  };
  done: {
    heading: string;
    body: string;
    openWith: string;
    orderRefLabel: string;
    orderRefNote: string;
    nextStepsTitle: string;
    nextSteps: readonly [string, string, string];
  };
  /** {domains} is available to the email.domain message */
  errors: Record<FlowErrorCode, string>;
};
