import type { OtpSession } from '@/lib/mockApi';
import type { Details, DetailsInput, FlowErrorCode } from '@/lib/validation';

export type IdentityStatus = 'idle' | 'verifying' | 'wrong' | 'expired' | 'resending';
export type PaymentStatus = 'idle' | 'loading' | 'failed';

// Step-discriminated so illegal states (payment without details) cannot be
// represented, and "Edit details" has a home for the preserved draft.
export type FlowState =
  | {
      step: 'details';
      draft: DetailsInput | null;
      serverError: FlowErrorCode | null;
      submitting: boolean;
    }
  | {
      step: 'identity';
      draft: DetailsInput;
      details: Details;
      session: OtpSession;
      code: string;
      status: IdentityStatus;
    }
  | {
      step: 'payment';
      draft: DetailsInput;
      details: Details;
      status: PaymentStatus;
      attempts: number;
    }
  | { step: 'done'; details: Details; orderRef: string };

export type FlowAction =
  | { type: 'DETAILS_SUBMIT'; draft: DetailsInput }
  | { type: 'DETAILS_REJECTED'; error: FlowErrorCode }
  | { type: 'DETAILS_ACCEPTED'; draft: DetailsInput; details: Details; session: OtpSession }
  | { type: 'OTP_CHANGED'; code: string }
  | { type: 'OTP_SUBMIT' }
  | { type: 'OTP_REJECTED'; error: 'otp.wrong' | 'otp.expired' }
  | { type: 'OTP_ACCEPTED' }
  | { type: 'OTP_RESEND' }
  | { type: 'OTP_RESENT'; session: OtpSession }
  | { type: 'EDIT_DETAILS' }
  | { type: 'PAY' }
  | { type: 'PAY_FAILED' }
  | { type: 'PAY_SUCCEEDED'; orderRef: string }
  | { type: 'RESET' };

export const STEP_ORDER = ['details', 'identity', 'payment', 'done'] as const;
export type FlowStep = (typeof STEP_ORDER)[number];

export const INITIAL_FLOW: FlowState = {
  step: 'details',
  draft: null,
  serverError: null,
  submitting: false,
};

// An action that does not belong to the current step returns the state
// unchanged: a verifyOtp promise that resolves after the user clicked
// "Edit details" must not teleport them to Payment.
export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'DETAILS_SUBMIT':
      if (state.step !== 'details') return state;
      return { ...state, draft: action.draft, submitting: true, serverError: null };
    case 'DETAILS_REJECTED':
      if (state.step !== 'details') return state;
      return { ...state, submitting: false, serverError: action.error };
    case 'DETAILS_ACCEPTED':
      if (state.step !== 'details') return state;
      return {
        step: 'identity',
        draft: action.draft,
        details: action.details,
        session: action.session,
        code: '',
        status: 'idle',
      };
    case 'OTP_CHANGED':
      if (state.step !== 'identity') return state;
      return {
        ...state,
        code: action.code,
        status: state.status === 'wrong' || state.status === 'expired' ? 'idle' : state.status,
      };
    case 'OTP_SUBMIT':
      if (state.step !== 'identity') return state;
      return { ...state, status: 'verifying' };
    case 'OTP_REJECTED':
      if (state.step !== 'identity') return state;
      return { ...state, status: action.error === 'otp.wrong' ? 'wrong' : 'expired' };
    case 'OTP_ACCEPTED':
      if (state.step !== 'identity') return state;
      return {
        step: 'payment',
        draft: state.draft,
        details: state.details,
        status: 'idle',
        attempts: 0,
      };
    case 'OTP_RESEND':
      if (state.step !== 'identity') return state;
      return { ...state, status: 'resending' };
    case 'OTP_RESENT':
      if (state.step !== 'identity') return state;
      return { ...state, session: action.session, code: '', status: 'idle' };
    case 'EDIT_DETAILS':
      if (state.step !== 'identity' && state.step !== 'payment') return state;
      return { step: 'details', draft: state.draft, serverError: null, submitting: false };
    case 'PAY':
      if (state.step !== 'payment') return state;
      return { ...state, status: 'loading', attempts: state.attempts + 1 };
    case 'PAY_FAILED':
      if (state.step !== 'payment') return state;
      return { ...state, status: 'failed' };
    case 'PAY_SUCCEEDED':
      if (state.step !== 'payment') return state;
      return { step: 'done', details: state.details, orderRef: action.orderRef };
    case 'RESET':
      return INITIAL_FLOW;
  }
}
