import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WaitlistSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#F3F4F4]">
      <Navbar />

      <section className="flex-1 flex items-center justify-center py-32 px-6 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#853953]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="bg-white rounded-[24px] p-12 md:p-16 max-w-xl w-full text-center shadow-sm border border-black/5 relative z-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="font-display font-bold text-4xl text-[#2c2c2c] mb-4">
            You're on the waitlist!
          </h1>
          <p className="text-[#2c2c2c]/70 text-lg font-medium mb-10">
            Thank you for requesting early access. We will notify you at your email address as soon as we open up more spots for Formative.
          </p>
          
          <Link href="/" className="inline-flex items-center gap-2 text-[#853953] font-bold hover:text-[#612d53] transition-colors group">
            Return to Homepage
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
