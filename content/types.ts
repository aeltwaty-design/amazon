import type { FooterLinkId } from '@/lib/anchors';
import type { PaymentMethod } from '@/lib/pricing';
import type { FlowErrorCode } from '@/lib/validation';

export type SlotCopy = { title: string; description: string };
export type FieldCopy = { label: string; hint?: string };
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
    lockup: string;
  };
  header: {
    wordmark: string;
    partnerSlot: SlotCopy;
    toggle: { ar: string; en: string };
    cta: string;
  };
  hero: {
    eyebrow: string;
    h1Lead: string;
    h1Tail: string;
    sub: string;
    /** {total} {saving} {discountPct} */
    priceLead: string;
    perYear: string;
    wasLabel: string;
    cta: string;
    ghostCta: string;
    trust: readonly [string, string, string];
    illustrationSlot: SlotCopy;
  };
  benefits: {
    title: string;
    cards: readonly [BenefitCopy, BenefitCopy, BenefitCopy, BenefitCopy];
    illustrationSlot: SlotCopy;
  };
  about: {
    title: string;
    body: string;
    stats: readonly [Stat, Stat, Stat];
    screenshotSlot: SlotCopy;
    /** UI copy inside the DOM phone mockup that stands in for the screenshot */
    mockup: {
      time: string;
      greeting: string;
      pointsLabel: string;
      points: string;
      pointsWorth: string;
      membership: string;
      membershipSub: string;
      categories: readonly string[];
      offersTitle: string;
      seeAll: string;
      /** `brand` is a `BRANDS` id from `lib/art.ts` */
      offers: readonly { brand: string; deal: string }[];
      nav: readonly [string, string, string, string];
    };
  };
  brands: {
    title: string;
    subtitle: string;
  };
  howTo: { title: string; steps: readonly [Step, Step, Step] };
  pricing: {
    title: string;
    ribbon: string;
    planTitle: string;
    toggle: { label: string; beforeVat: string; total: string };
    perYear: string;
    wasLabel: string;
    /** {vat} {total} */
    vatLine: string;
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
    draftNote: string;
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
    rows: { annual: string; discount: string; subtotal: string; vat: string; total: string };
    methodsLabel: string;
    methods: Record<PaymentMethod, string>;
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
