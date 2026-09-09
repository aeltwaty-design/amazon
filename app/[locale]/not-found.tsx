import Link from 'next/link';
import { SECTION_IDS } from '@/lib/anchors';

// Rendered inside the locale layout, so lang/dir/fonts are already correct.
// Copy is bilingual on purpose: this page can be reached with an unknown locale.
export default function NotFound() {
  return (
    <main id={SECTION_IDS.main} className="gutter mx-auto max-w-content pt-header pb-24">
      <h1 className="type-h2 pt-24">الصفحة غير موجودة · Page not found</h1>
      <p className="type-body mt-4 text-ink-muted">
        <Link href="/ar" lang="ar" className="underline">
          العربية
        </Link>
        {' · '}
        <Link href="/en" lang="en" className="underline">
          English
        </Link>
      </p>
    </main>
  );
}
