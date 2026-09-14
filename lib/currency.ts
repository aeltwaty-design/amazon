// The Saudi riyal symbol the central bank published in 2025: Wikimedia
// Commons "Saudi_Riyal_Symbol.svg", from SAMA's own file, public domain. The
// artwork is two subpaths with one fill, concatenated here into a single `d`
// so <Currency /> can paint it with `fill: currentColor` and inherit the
// colour of the text it sits in. It is inlined rather than fetched because a
// price appears a dozen times on the page and the glyph must not arrive after
// the number it belongs to.
//
// Unicode gave the symbol U+20C0 in 2025, but almost no shipping font draws
// it yet, so a text character is not an option.
export const SAR_SYMBOL_VIEWBOX = '0 0 1124.14 1256.39';

export const SAR_SYMBOL_PATH =
  'M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z ' +
  'M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z';

/** the symbol's accessible name, since a drawn glyph announces nothing */
export const SAR_TEXT = { ar: 'ر.س', en: 'SAR' } as const;
