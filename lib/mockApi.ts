import type { PaymentMethod } from '@/lib/pricing';
import type { Details, FlowErrorCode } from '@/lib/validation';

export type OtpSession = { issuedAt: number; expiresAt: number };

export type MockErrorCode = Extract<
  FlowErrorCode,
  'email.pending' | 'otp.wrong' | 'otp.expired' | 'payment.failed'
>;

export class MockApiError extends Error {
  readonly code: MockErrorCode;
  constructor(code: MockErrorCode) {
    super(code);
    this.name = 'MockApiError';
    this.code = code;
  }
}

export const isMockApiError = (error: unknown): error is MockApiError =>
  error instanceof MockApiError;

/** Code lifetime. */
export const OTP_TTL_MS = 60_000;
/** Separate from the TTL: product may later want a 5-minute code with a 60s cooldown. */
export const RESEND_COOLDOWN_S = 60;
export const MOCK_LATENCY_MS = 700;

// Deterministic demo switches (README "Demo triggers"). Any other six digits
// pass, as the brief asks; these exist because the wrong / expired / failed
// states must still be demonstrable without a mail server or gateway.
export const MOCK_TRIGGERS = {
  /** Details → "already subscribed / pending" */
  pendingEmail: 'test.pending@amazon.com',
  /** Payment → first attempt fails, retry succeeds */
  payFailEmail: 'test.payfail@amazon.com',
  /** Identity → wrong code */
  otpWrong: '999999',
  /** Identity → expired code without waiting for the TTL */
  otpExpired: '000000',
} as const;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const newSession = (): OtpSession => {
  const now = Date.now();
  return { issuedAt: now, expiresAt: now + OTP_TTL_MS };
};

export async function submitDetails(details: Details): Promise<OtpSession> {
  await wait(MOCK_LATENCY_MS);
  if (details.email === MOCK_TRIGGERS.pendingEmail) throw new MockApiError('email.pending');
  return newSession();
}

export async function resendOtp(): Promise<OtpSession> {
  await wait(MOCK_LATENCY_MS);
  return newSession();
}

export async function verifyOtp(code: string, session: OtpSession): Promise<void> {
  await wait(MOCK_LATENCY_MS);
  if (code === MOCK_TRIGGERS.otpWrong) throw new MockApiError('otp.wrong');
  if (code === MOCK_TRIGGERS.otpExpired || Date.now() > session.expiresAt) {
    throw new MockApiError('otp.expired');
  }
}

export async function pay(
  _method: PaymentMethod,
  details: Details,
  attempt: number,
): Promise<{ orderRef: string }> {
  await wait(MOCK_LATENCY_MS);
  if (details.email === MOCK_TRIGGERS.payFailEmail && attempt === 1) {
    throw new MockApiError('payment.failed');
  }
  return { orderRef: makeOrderRef() };
}

// 32 symbols: 256 % 32 === 0, so `byte % 32` has no modulo bias. I, L, O and U
// are excluded so a reference read aloud to support cannot be misheard.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function makeOrderRef(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `WO-AMZ-${Array.from(bytes, (b) => ALPHABET[b % 32]).join('')}`;
}
