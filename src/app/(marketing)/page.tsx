import { Hero } from '@/components/marketing/Hero';
import { LogoTicker } from '@/components/marketing/LogoTicker';
import { FeatureBento } from '@/components/marketing/FeatureBento';
import { AiDemo } from '@/components/marketing/AiDemo';
import { Stats } from '@/components/marketing/Stats';
import { Testimonials } from '@/components/marketing/Testimonials';
import { Pricing } from '@/components/marketing/Pricing';
import { Integrations } from '@/components/marketing/Integrations';
import { CtaBanner } from '@/components/marketing/CtaBanner';

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoTicker />
      <FeatureBento />
      <AiDemo />
      <Stats />
      <Testimonials />
      <Pricing />
      <Integrations />
      <CtaBanner />
    </>
  );
}
