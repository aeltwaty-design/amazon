'use client';

import { useMemo } from 'react';
import { LottieInteractions, LottieLight, lottieInView, type LottieLightProps } from 'lottie-react';

type Props = Pick<
  LottieLightProps,
  'src' | 'loop' | 'className' | 'rendererSettings' | 'lottieRef' | 'subscriptions'
> & {
  /**
   * `in-view`: play while on screen and pause off it, starting 200px early;
   * `off`: hold the first frame, or drive the playhead through `lottieRef`.
   */
  playback: 'in-view' | 'off';
};

/** how far outside the viewport counts as "in view" — the file has time to start before the box scrolls in */
const IN_VIEW_MARGIN = '200px';

// The one player behind every Lottie on the page. Its callers load it through
// next/dynamic, so this module — and lottie-web with it — stays in a single
// async chunk off the critical path. It is the light engine: SVG only and no
// expression evaluator, 168 kB minified against the full build's 306, which is
// safe because `npm run render:steps` strips the step files' rig and the other
// two sources carry no expressions (grep '"x":"' over public/lottie is empty).
// Playback is the library's own in-view interaction — play on entry, pause on
// exit, resume mid-motion — so the three step players and the headline stop
// animating the moment they leave the screen, which on a phone is most of the
// time.
export default function LottiePlayer({ playback, ...props }: Props) {
  const interactions = useMemo(() => [lottieInView({ margin: IN_VIEW_MARGIN })], []);
  const player = <LottieLight autoplay={false} {...props} />;
  if (playback === 'off') return player;
  return <LottieInteractions interactions={interactions}>{player}</LottieInteractions>;
}
