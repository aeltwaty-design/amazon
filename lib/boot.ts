// Boot signals on <html>, shared by the inline first-paint script (layout)
// and the client component that re-applies them after a locale navigation:
// React 19 treats <html> as a singleton and strips every attribute when the
// root layout remounts, taking anything set from outside React with it.
export const JS_ATTR = 'data-js';
export const FONTS_ATTR = 'data-fonts';
export const FONT_GATE_TIMEOUT_MS = 1000;

// `data-js` scopes the hero's [data-enter] pre-hide to JS-capable browsers.
// `data-fonts` lifts the page's visibility gate once the fonts are in: a font
// swap reflows the Arabic headline, and a reflow on a visible element is a
// layout shift. Hidden elements are not counted, so the page paints once,
// with the right fonts. Font requests are only issued by the first layout,
// so `fonts.ready` is consulted two frames in (it would resolve immediately
// before that); the timeout guards against a font that never arrives.
export const BOOT_SCRIPT = `(function(){var h=document.documentElement;h.setAttribute('${JS_ATTR}','');var done=false;function ready(){if(done)return;done=true;h.setAttribute('${FONTS_ATTR}','')}if(!document.fonts){ready();return}requestAnimationFrame(function(){requestAnimationFrame(function(){document.fonts.ready.then(ready,ready)})});setTimeout(ready,${FONT_GATE_TIMEOUT_MS})})()`;
