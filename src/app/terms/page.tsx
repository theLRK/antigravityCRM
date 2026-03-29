import { Logo } from '@/components/ui/Logo';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#F3F4F4]">
            {/* Header */}
            <header className="bg-white border-b border-black/5 py-6">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group text-gray-500 hover:text-[#853953] transition-colors">
                        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Hub</span>
                    </Link>
                    <Logo className="scale-90" />
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="bg-white rounded-[24px] p-12 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-black/5">
                    <div className="mb-12 border-b border-black/5 pb-12">
                        <p className="text-[#853953] font-black text-xs uppercase tracking-[0.2em] mb-4">Legal Agreement</p>
                        <h1 className="text-5xl font-black text-[#2C2C2C] mb-6 tracking-tight">Terms of Service</h1>
                        <p className="text-gray-500 text-lg">Last Updated: March 2026</p>
                    </div>

                    <div className="prose prose-slate max-w-none text-[#2C2C2C]">
                        <h2 className="text-2xl font-black mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-8 leading-relaxed">By accessing or using Formative CRM ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.</p>

                        <h2 className="text-2xl font-black mb-4">2. Description of Service</h2>
                        <p className="mb-8 leading-relaxed">Formative provides an AI-powered lead management CRM tailored for real estate professionals. Features include lead capturing, agent dashboards, email outreach via third-party APIs (such as Gmail and Resend), and property matching algorithms.</p>

                        <h2 className="text-2xl font-black mb-4">3. User Accounts & Security</h2>
                        <ul className="list-disc pl-6 mb-8 space-y-2">
                            <li>You must provide accurate information when creating an account.</li>
                            <li>You are responsible for safeguarding your login credentials.</li>
                            <li>You agree not to use automated scripts (bots) to scrape or flood the Service infrastructure.</li>
                        </ul>

                        <h2 className="text-2xl font-black mb-4">4. Third-Party Integrations</h2>
                        <p className="mb-8 leading-relaxed">Our Service interfaces with third-party providers (e.g., Google/Gmail API, OpenAI, Resend, Supabase). You agree to comply with their respective Terms of Service and Privacy Policies when enabling these integrations within Formative CRM.</p>

                        <h2 className="text-2xl font-black mb-4">5. Intellectual Property</h2>
                        <p className="mb-8 leading-relaxed">The Service and its original content, features, functionalities, algorithms, and designs are and will remain the exclusive property of Formative Inc. and its licensors.</p>

                        <h2 className="text-2xl font-black mb-4">6. Limitation of Liability</h2>
                        <p className="leading-relaxed">In no event shall Formative CRM, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the Service.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
