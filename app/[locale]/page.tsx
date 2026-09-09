import { notFound } from 'next/navigation';
import { Hero } from '@/components/hero/Hero';
import { PageMotion } from '@/components/motion/PageMotion';
import { Benefits } from '@/components/sections/Benefits';
import { getContent } from '@/content';
import { SECTION_IDS } from '@/lib/anchors';
import { isLocale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

// Benefits must directly follow the hero: the card handoff lands on the grid at
// the exact scroll where the 100vh pin releases.
export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getContent(locale);

  return (
    <>
      <main id={SECTION_IDS.main}>
        <Hero
          locale={locale}
          content={content.hero}
          benefits={content.benefits}
          lockupLabel={content.a11y.lockup}
        />
        <Benefits content={content.benefits} />
      </main>
      <PageMotion locale={locale} />
    </>
  );
}
