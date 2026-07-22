import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { HeroSectionWaitlist } from '@/components/ui/waitlist/HeroSection';
import { ProblemSection } from '@/components/ui/waitlist/ProblemSection';
import { ResearchSection } from '@/components/ui/waitlist/ResearchSection';
import { ValueSection } from '@/components/ui/waitlist/ValueSection';
import { CredibilitySection } from '@/components/ui/waitlist/CredibilitySection';
import { CTASection } from '@/components/ui/waitlist/CTASection';
import { FeaturesSection } from '@/components/ui/waitlist/FeaturesSection';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#F3F4F4] text-[#2c2c2c] selection:bg-[#853953]/20 selection:text-[#853953]">
      <Navbar />

      {/* Main Waitlist Flow */}
      <HeroSectionWaitlist />
      
      <CredibilitySection />
      
      <FeaturesSection />

      <ProblemSection />
      
      <ResearchSection />
      
      <ValueSection />
      
      <CTASection />

      <Footer />
    </main>
  );
}
