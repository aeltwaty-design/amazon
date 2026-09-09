'use client';

import { useLayoutEffect } from 'react';
import { FONTS_ATTR, FONT_GATE_TIMEOUT_MS, JS_ATTR } from '@/lib/boot';

// Re-applies the boot signals after every mount of the locale layout. A
// layout effect runs before paint, so a soft locale switch never shows the
// un-gated hero for a frame. On the first load the inline script has already
// set both attributes and this is a no-op.
export function BootSignals() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.setAttribute(JS_ATTR, '');
    if (html.hasAttribute(FONTS_ATTR)) return;
    let done = false;
    const ready = () => {
      if (done) return;
      done = true;
      html.setAttribute(FONTS_ATTR, '');
    };
    if (!document.fonts || document.fonts.status === 'loaded') {
      ready();
      return;
    }
    document.fonts.ready.then(ready, ready);
    const timer = setTimeout(ready, FONT_GATE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
