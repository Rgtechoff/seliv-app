import type { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { StatsSection } from '@/components/landing/stats-section';
import { CtaSection } from '@/components/landing/cta-section';

export const metadata: Metadata = {
  title: 'SELIV — Boostez vos ventes avec un vendeur Live professionnel',
  description:
    'SELIV connecte les marques avec les meilleurs vendeurs live shopping. Réservez votre session en quelques clics. 500+ lives réalisés.',
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <StatsSection />
      <CtaSection />
    </>
  );
}
