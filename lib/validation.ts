import { z } from 'zod';

export const APPROVED_DOMAINS = ['amazon.com', 'amazon.sa'] as const;

// Every rule reports a code, never prose, so both locales can render the same
// failure from content.flow.errors.
export const FLOW_ERROR_CODES = [
  'required',
  'invalid',
  'name.full',
  'mobile.invalid',
  'email.invalid',
  'email.domain',
  'email.pending',
  'consent.required',
  'otp.incomplete',
  'otp.wrong',
  'otp.expired',
  'payment.failed',
] as const;
export type FlowErrorCode = (typeof FLOW_ERROR_CODES)[number];

export const isFlowErrorCode = (value: unknown): value is FlowErrorCode =>
  typeof value === 'string' && (FLOW_ERROR_CODES as readonly string[]).includes(value);

// Arabic keyboards emit ٠-٩ (and Persian ۰-۹); a Saudi user typing their own
// number must not be told it is invalid.
export const toWesternDigits = (input: string): string =>
  input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

// The field holds the national number only: the country block beside it shows
// +966 and the input is capped at nine characters, so a subscriber number is
// nine digits opening with 5, and the prefixes a user could once type no
// longer fit. Spaces, dashes and parens stay formatting noise.
const KSA_MOBILE = /^5\d{8}$/;

/** how many characters the mobile field accepts, and so how long a number is */
export const MOBILE_DIGITS = 9;

export function normaliseKsaMobile(raw: string): string | null {
  const compact = toWesternDigits(raw).replace(/[\s\-().]/g, '');
  return KSA_MOBILE.test(compact) ? `+966${compact}` : null;
}

export const formatMobileForDisplay = (e164: string): string =>
  e164.replace(/^\+966(\d{2})(\d{3})(\d{4})$/, '+966 $1 $2 $3');

// Exact domain or a label-bounded subdomain: only Amazon can mint *.amazon.com,
// so eu.amazon.com is as trustworthy as amazon.com. The leading dot is what
// stops "notamazon.com" from passing an endsWith check.
export function isApprovedDomain(email: string): boolean {
  const domain = email.slice(email.lastIndexOf('@') + 1);
  return APPROVED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}

export const detailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'required')
    // A single token is almost always a first name only; the record is matched
    // against an employee, so demand two words.
    .refine((v) => v.split(/\s+/).length >= 2, 'name.full'),
  mobile: z
    .string()
    .trim()
    .min(1, 'required')
    .transform((v, ctx) => {
      const normalised = normaliseKsaMobile(v);
      if (!normalised) {
        ctx.addIssue({ code: 'custom', message: 'mobile.invalid' });
        return z.NEVER;
      }
      return normalised;
    }),
  email: z
    .string()
    .trim()
    .min(1, 'required')
    .toLowerCase()
    .pipe(z.email('email.invalid'))
    .refine(isApprovedDomain, 'email.domain'),
  // boolean().refine rather than literal(true): the checkbox's initial value is
  // false and must be a legal *input* for react-hook-form's defaultValues.
  consent: z.boolean().refine((v) => v, 'consent.required'),
});

export type DetailsInput = z.input<typeof detailsSchema>;
export type Details = z.output<typeof detailsSchema>;

export const otpSchema = z.string().regex(/^\d{6}$/, 'otp.incomplete');

export function errorText(
  code: string | undefined,
  errors: Record<FlowErrorCode, string>,
): string | undefined {
  if (!code) return undefined;
  // Never let a zod default English message reach the screen.
  return isFlowErrorCode(code) ? errors[code] : errors.invalid;
}
