import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { HeroSection } from '@/components/ui/landing/HeroSection';
import { LeadScoringSimulator } from '@/components/ui/landing/LeadScoringSimulator';
import { ProductFeaturesBentoGrid } from '@/components/ui/landing/ProductFeaturesBentoGrid';
import { ComparisonSection } from '@/components/ui/landing/ComparisonSection';
import { RoiCalculator } from '@/components/ui/landing/RoiCalculator';
import { TestimonialsSection } from '@/components/ui/landing/TestimonialsSection';
import { PricingSection } from '@/components/ui/landing/PricingSection';
import { FaqSection } from '@/components/ui/landing/FaqSection';
import { FinalCtaBanner } from '@/components/ui/landing/FinalCtaBanner';

export const metadata = {
  title: 'Formative CRM | Autonomous AI CRM for Real Estate Producers & Teams',
  description: 'Unify WhatsApp, Instagram, and web inquiries into an intelligent CRM pipeline. Score buyer intent in 3 seconds, automate outreach, and match luxury listings instantly.',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#F3F4F4] text-[#2C2C2C] selection:bg-[#853953]/20 selection:text-[#853953]">
      <Navbar />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Interactive Lead Scoring Simulator */}
      <LeadScoringSimulator />

      {/* 3. Core Features Bento Grid */}
      <ProductFeaturesBentoGrid />

      {/* 4. Real Estate Workflow Comparison */}
      <ComparisonSection />

      {/* 5. Financial ROI Calculator */}
      <RoiCalculator />

      {/* 6. Testimonials & Social Proof */}
      <TestimonialsSection />

      {/* 7. Transparent Pricing Tiers */}
      <PricingSection />

      {/* 8. FAQ Accordion */}
      <FaqSection />

      {/* 9. Final High-Impact CTA Banner */}
      <FinalCtaBanner />

      {/* 10. Footer */}
      <Footer />
    </main>
  );
}
