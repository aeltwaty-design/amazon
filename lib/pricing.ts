export const PAYMENT_METHODS = ['mada', 'visa', 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Inputs only. Every figure on the page (hero lead, plan card, summary) is
// derived from these three numbers so 222 / 33.30 / 255.30 cannot drift apart.
export const PRICING = {
  listHalalas: 37000,
  discountPct: 40,
  vatPct: 15,
} as const;

// Integer halalas: 222 * 0.15 in floating point is 33.300000000000004.
const discount = (PRICING.listHalalas * PRICING.discountPct) / 100;
const subtotal = PRICING.listHalalas - discount;
const vat = Math.round((subtotal * PRICING.vatPct) / 100);

export const PRICE = {
  list: PRICING.listHalalas,
  discount,
  subtotal,
  vat,
  total: subtotal + vat,
} as const;

// Always en-US: prices use Western digits in both locales (brief §3).
const MONEY = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (halalas: number): string => MONEY.format(halalas / 100);

// Whole-riyal figures for prose ("save 148 SAR").
export const formatRiyals = (halalas: number): string => String(Math.round(halalas / 100));
