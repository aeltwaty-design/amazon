import type { SiteContent } from './types';

// Copy is verbatim from the brief. Strings marked "authored" were not in the
// brief and were written to fill gaps in both locales.
export const en = {
  meta: {
    title: 'WalaOne × Amazon — An exclusive benefit for Amazon employees',
    description:
      'Enjoy a world of offers, discounts, and rewards with a WalaOne subscription at an exclusive price for Amazon employees.',
  },
  a11y: {
    skipToContent: 'Skip to content', // authored
    scrollDown: 'Scroll to the next section', // authored
    scrollUp: 'Back to top', // authored
    localeSwitch: 'Language', // authored
    lockup: 'WalaOne × Amazon', // authored
  },
  header: {
    wordmark: 'WalaOne',
    partnerSlot: { title: 'Amazon mark', description: 'pending brand approval' },
    toggle: { ar: 'العربية', en: 'EN' },
    cta: 'Subscribe Now',
  },
  hero: {
    eyebrow: 'Exclusive · For eligible Amazon employees',
    h1Lead: 'An Exclusive Benefit for Amazon Employees',
    h1Tail: 'with WalaOne',
    sub: 'Enjoy a world of offers, discounts, and rewards with a WalaOne subscription at an exclusive price for Amazon employees.',
    priceLead: '+ VAT · {total} SAR total · save {saving} SAR ({discountPct}% off)',
    perYear: '/ year',
    wasLabel: 'was', // authored
    cta: 'Subscribe Now',
    ghostCta: 'What is WalaOne?',
    illustrationSlot: {
      title: 'Megaphone announcing the offer', // authored: the headline animation's accessible name
      description: 'animated hand holding a megaphone',
    },
    tiles: [
      { id: 'restaurants', label: 'Restaurants' },
      { id: 'shopping', label: 'Shopping' },
      { id: 'travel', label: 'Travel' },
      { id: 'entertainment', label: 'Entertainment' },
      { id: 'health', label: 'Health & Hotels' },
    ], // authored: sector names, mirrored from the About copy
  },
  benefits: {
    title: 'Get More with WalaOne',
    cards: [
      {
        title: 'Redeem Your Points',
        body: 'Turn the points you earn from your purchases into vouchers and rewards from your favourite brands.',
        slot: { title: 'WalaOne map screen in a phone', description: 'phone mockup' }, // authored
      },
      {
        title: 'More Choices',
        body: 'Use your earned points across shopping, travel, restaurants, entertainment and more.',
        slot: { title: 'WalaOne points-transfer screen in a phone', description: 'phone mockup' }, // authored
      },
      {
        title: 'Exclusive Amazon employee rate',
        body: '40% off the annual subscription.',
        slot: { title: 'WalaOne marketplace screen in a phone', description: 'phone mockup' }, // authored
      },
    ],
  },
  about: {
    title: 'WalaOne… More Benefits in One Place',
    body: 'WalaOne is a loyalty app that brings together the best offers and discounts from leading local and international brands, with more than 4,000 offers and discounts across restaurants, shopping, travel, entertainment, health and hotels.',
    stats: [
      { value: '4,000+', label: 'offers & discounts' }, // authored labels
      { value: '6', label: 'sectors' },
      { value: '12', label: 'months' },
    ],
    screenshotSlot: { title: 'App screenshot', description: 'WalaOne home screen' },
  },
  brands: {
    title: 'Your Favourite Brands, Closer to You',
    subtitle:
      'Enjoy exclusive benefits and offers from a wide range of brands across different categories.',
  },
  howTo: {
    title: 'Subscribe in a Few Simple Steps',
    steps: [
      {
        title: 'Enter your details',
        body: 'Provide your information, then confirm your identity with a code sent instantly to your work email.',
        slot: { title: 'Step 1 illustration', description: 'details & work-email code' },
      },
      {
        title: 'Complete your payment',
        body: 'Pay at the exclusive Amazon employee rate, and you are enrolled in the Amazon programme for a year straight away.',
        slot: { title: 'Step 2 illustration', description: 'payment' },
      },
      {
        title: 'Open the app',
        body: 'Sign in to the WalaOne app with your mobile number and your Amazon membership offers are already waiting — no codes.',
        slot: { title: 'Step 3 illustration', description: 'open the app' },
      },
    ],
  },
  pricing: {
    title: 'Exclusive Offer for Amazon Employees',
    ribbon: '40% off for Amazon employees',
    planTitle: 'Annual WalaOne Subscription',
    toggle: { label: 'Price view', beforeVat: 'Before VAT', total: 'Total payable' }, // label authored
    perYear: '/ year',
    wasLabel: 'was', // authored
    vatLine: 'Price excludes VAT — {vat} SAR VAT is added, making the total due {total} SAR.',
    features: [
      'Enjoy WalaOne benefits for a full year',
      'More than 4,000 offers and discounts across 6 sectors',
      'Redeem the points you earn for vouchers and rewards',
      '12 months starting the moment you subscribe',
    ],
    cta: 'Subscribe Now',
    finePrint: 'This offer is exclusively available to eligible Amazon employees.',
  },
  flow: {
    title: 'Start Your Subscription Now',
    subtitle: 'Enter your details to complete your subscription and enjoy the exclusive offer.',
    stepper: {
      label: 'Subscription steps', // authored
      steps: ['Details', 'Identity', 'Payment', 'Done'],
      announce: '{label} — step {n} of {total}', // authored
    },
    details: {
      heading: 'Enter your details', // authored
      name: { label: 'Full name' },
      mobile: {
        label: 'Mobile number',
        hint: "You'll use this number to sign in to the WalaOne app after payment",
      },
      email: {
        label: 'Work email',
        hint: 'Must end in an approved Amazon domain — this is what proves your eligibility',
      },
      consent: 'I agree to the WalaOne {terms} and {privacy}.',
      termsLabel: 'Terms & Conditions',
      privacyLabel: 'Privacy Policy',
      cta: 'Proceed to Payment',
      submitting: 'Sending…', // authored
      errorSummaryTitle: 'Please fix the following:', // authored
    },
    identity: {
      heading: 'Confirm your identity', // authored
      sentTo:
        'We sent a six-digit code to your work email {email} to confirm you are an Amazon employee. This code only proves your identity — it is not used in the app.',
      otpLabel: 'Verification code', // authored
      otpDigitLabel: 'Digit {n} of {total}', // authored
      resendIn: 'Resend in {s}s',
      resend: 'Resend code',
      resent: 'A new code has been sent.', // authored
      verifying: 'Verifying…', // authored
      cta: 'Confirm and continue',
      edit: 'Edit details',
    },
    payment: {
      heading: 'Complete your payment',
      rows: {
        annual: 'Annual WalaOne subscription, 12 months',
        discount: 'Amazon employee discount',
        subtotal: 'Subtotal before VAT',
        vat: 'VAT 15%',
        total: 'Total due',
      },
      methodsLabel: 'Payment method', // authored
      methods: { mada: 'mada', visa: 'Visa', card: 'Credit card' },
      methodSlot: {
        mada: { title: 'mada logo', description: 'payment mark' },
        visa: { title: 'Visa logo', description: 'payment mark' },
        card: { title: 'Card icon', description: 'payment mark' },
      },
      payCta: 'Pay {amount} SAR',
      paying: 'Processing payment…', // authored
      secureNote:
        "Payment happens on the gateway's secured page — your card details never touch our servers.",
      retry: 'Try again', // authored
    },
    done: {
      heading: 'Your membership is active',
      body: 'Payment went through and you are enrolled in the Amazon programme for 12 months. There is no code to enter.',
      openWith: 'Open the app with this number',
      orderRefLabel: 'Your order reference',
      orderRefNote:
        'Keep this for any contact with support. It is not a code and does not go into the app.',
      nextStepsTitle: 'Next steps', // authored
      nextSteps: [
        'Download the WalaOne app from the App Store or Google Play',
        'Sign in with the same mobile number shown above',
        'Your Amazon membership offers are there immediately — no codes, no extra steps',
      ],
    },
    errors: {
      required: 'This field is required.', // authored
      invalid: 'This value is not valid.', // authored
      'name.full': 'Enter your full name (first and last name).', // authored
      'mobile.invalid': 'Enter a valid Saudi mobile number.',
      'email.invalid': 'Enter a valid email address.',
      'email.domain': 'This offer is for Amazon employees only. Accepted domains: {domains}',
      'email.pending': 'There is already an active or pending subscription for this email.',
      'consent.required': 'You need to accept the Terms & Conditions to continue.',
      'otp.incomplete': 'Enter all six digits of the code.', // authored
      'otp.wrong': 'That code is not correct.',
      'otp.expired': 'The code has expired — resend it.',
      'payment.failed': "Payment didn't go through. Nothing was charged — please try again.",
    },
  },
  faq: {
    title: 'Frequently asked questions', // authored
    description: 'Everything you need to know about the Amazon employee offer.', // authored
    items: [
      {
        q: 'Who is eligible for this offer?',
        a: 'This offer is exclusively available to eligible Amazon employees, and eligibility is verified through the work email address.',
      },
      {
        q: 'How long is the subscription valid for?',
        a: 'The subscription is valid for 12 months, starting the moment your payment completes.',
      },
      {
        q: 'How do I start using WalaOne?',
        a: 'After completing your subscription, download the WalaOne app and sign in with the same mobile number you entered. Your Amazon membership offers appear immediately — there is no code to enter.',
      },
      {
        q: 'What if I sign in to the app with a different mobile number?',
        a: 'Your membership is tied to the number you entered when subscribing, so sign in with that same number. If you mistyped it or need it changed, contact support with your order reference and we will re-link your membership.',
      },
      {
        q: 'Who pays for the subscription?',
        a: 'The WalaOne subscription is offered to Amazon employees at an exclusive discounted price, and the employee is responsible for paying the subscription fee.',
      },
    ],
  },
  finalCta: {
    title: 'More Benefits Are Waiting for You',
    body: 'Subscribe to WalaOne today and take advantage of the exclusive offer for Amazon employees.',
    cta: 'Subscribe Now',
  },
  terms: {
    title: 'Terms & Conditions',
    items: [
      'The subscription is valid for one year starting from the date the subscription and payment are completed.',
      'The subscription cannot be cancelled or refunded once completed.',
      'Offers and benefits can only be redeemed through the WalaOne app and are subject to the terms of each individual offer.',
      'Discount rates and benefits are subject to the policies of participating merchants and partners and may vary between merchants.',
      'WalaOne reserves the right to modify or update available offers and benefits from time to time.',
      'The subscription is subject to the applicable laws and regulations of the Kingdom of Saudi Arabia.',
      'WalaOne reserves the right to reject or cancel any request in cases of suspected misuse or submission of inaccurate information.',
      'Prices shown exclude VAT (15%), which is added at checkout.',
      'The offer is exclusively available to eligible Amazon employees at the special subscription rate.',
      'The membership is linked to the mobile number provided at subscription, and benefits become available on signing in to the WalaOne app with that same number.',
    ],
  },
  footer: {
    blurb:
      'A loyalty app gathering the best offers and discounts from local and international brands.',
    columns: [
      {
        title: 'Subscription',
        links: [
          { id: 'offer', label: 'Offer and pricing' },
          { id: 'subscribe', label: 'Subscribe Now' },
          { id: 'about', label: 'About WalaOne' },
        ],
      },
      {
        title: 'Help',
        links: [
          { id: 'faq', label: 'FAQ' },
          { id: 'support', label: 'Contact support' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { id: 'terms', label: 'Terms & Conditions' },
          { id: 'privacy', label: 'Privacy Policy' },
        ],
      },
    ],
    partnership: 'WalaOne · in partnership with Amazon',
    draftNote: 'Preview — merchant logos are samples pending partner confirmation.', // authored
  },
} satisfies SiteContent;
