import { notFound } from 'next/navigation';

// Any sub-path under a locale is a 404 rendered through the locale layout.
export default function CatchAll() {
  notFound();
}
