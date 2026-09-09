import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { SECTION_IDS } from '@/lib/anchors';
import { isLocale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getContent(locale);

  return (
    <main id={SECTION_IDS.main}>
      <section className="mx-auto max-w-content px-6 py-24">
        <p className="type-body text-ink-muted">{content.hero.eyebrow}</p>
        <h1 className="type-display mt-4">
          {content.hero.h1Lead} {content.hero.h1Tail}
        </h1>
        <p className="type-body-lg mt-6 max-w-prose text-ink-muted">{content.hero.sub}</p>
      </section>
    </main>
  );
}
