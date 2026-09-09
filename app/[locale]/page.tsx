import { notFound } from 'next/navigation';
import { Hero } from '@/components/hero/Hero';
import { PageMotion } from '@/components/motion/PageMotion';
import { About } from '@/components/sections/About';
import { Benefits } from '@/components/sections/Benefits';
import { Brands } from '@/components/sections/Brands';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Flow } from '@/components/sections/Flow';
import { Footer } from '@/components/sections/Footer';
import { HowTo } from '@/components/sections/HowTo';
import { Pricing } from '@/components/sections/Pricing';
import { Terms } from '@/components/sections/Terms';
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
        <About content={content.about} />
        <Brands content={content.brands} />
        <HowTo content={content.howTo} locale={locale} />
        <Pricing content={content.pricing} locale={locale} />
        <Flow content={content.flow} locale={locale} />
        <Faq content={content.faq} />
        <FinalCta content={content.finalCta} />
        <Terms content={content.terms} locale={locale} />
      </main>
      <Footer content={content.footer} wordmark={content.header.wordmark} locale={locale} />
      <PageMotion locale={locale} />
    </>
  );
}
