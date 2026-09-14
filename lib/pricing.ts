export const PAYMENT_METHODS = ['mada', 'visa', 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Inputs only. Every figure on the page (hero lead, plan card, summary, and
// the discount in the ribbon) is derived from these three numbers, so 444 /
// 222 / 28.96 cannot drift apart.
//
// Both prices are quoted VAT-inclusive: SAR 222 VAT included, instead of SAR
// 444 VAT included, half off. That is the offer as it is sold, so the tax is a
// fraction *of* the price here, never an addition to it.
export const PRICING = {
  listHalalas: 44400,
  discountPct: 50,
  vatPct: 15,
} as const;

const discount = (PRICING.listHalalas * PRICING.discountPct) / 100;
const total = PRICING.listHalalas - discount;
// Integer halalas: 222 × 15/115 is 28.956…, and the net is what is left after
// it, so the two always add back to the price exactly.
const vat = Math.round((total * PRICING.vatPct) / (100 + PRICING.vatPct));

export const PRICE = {
  list: PRICING.listHalalas,
  discount,
  /** the price without the tax it contains — the summary's line, not a price anyone pays */
  net: total - vat,
  vat,
  total,
} as const;

// Always en-US: prices use Western digits in both locales (brief §3).
const MONEY = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (halalas: number): string => MONEY.format(halalas / 100);

// Whole-riyal figures for prose ("save 148 SAR").
export const formatRiyals = (halalas: number): string => String(Math.round(halalas / 100));
