import HeroSection from '@/components/ui/HeroSection';
import { Navbar } from '@/components/ui/Navbar';
import { ProblemSection } from '@/components/ui/ProblemSection';
import { FeaturesGrid } from '@/components/ui/FeaturesGrid';
import { HowItWorks } from '@/components/ui/HowItWorksSection';
import { ProductPreview } from '@/components/ui/ProductPreview';
import PricingSection from '@/components/ui/PricingSection';
import { Footer } from '@/components/ui/Footer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#F3F4F4] text-[#2C2C2C]">
      <Navbar />

      <HeroSection />
      
      {/* Trust Section */}
      <div className="py-24 bg-white border-y border-black/5 overflow-hidden">
          <div className="container mx-auto px-6">
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12">Trusted by modern real estate teams worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                  <div className="text-2xl font-black italic">RE/MAX</div>
                  <div className="text-2xl font-black italic">Compass</div>
                  <div className="text-2xl font-black italic">Zillow</div>
                  <div className="text-2xl font-black italic">Sotheby's</div>
                  <div className="text-2xl font-black italic">Redfin</div>
              </div>
          </div>
      </div>

      <ProblemSection />

      <div id="features">
        <FeaturesGrid />
      </div>

      <HowItWorks />

      <ProductPreview />

      <PricingSection />

      {/* Final CTA Section */}
      <section className="py-32 container mx-auto px-6">
          <div className="bg-gradient-to-br from-[#853953] to-[#612D53] rounded-[40px] p-12 md:p-32 text-center relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(133,57,83,0.4)]">
              {/* Abstract Patterns */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black opacity-[0.03] rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />
              
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-none">
                Start closing <br /> smarter today.
              </h2>
              <p className="text-white/70 text-lg md:text-xl mb-16 max-w-2xl mx-auto font-medium">
                Join high-performance agents using Formative AI to automate their growth and dominate their local market.
              </p>
              <a href="/sign-up" className="inline-block px-12 py-6 bg-white text-[#853953] font-black rounded-2xl shadow-2xl hover:scale-105 transition-all active:scale-95 text-lg">
                Create Free Account
              </a>
          </div>
      </section>

      <Footer />
    </main>
  );
}
