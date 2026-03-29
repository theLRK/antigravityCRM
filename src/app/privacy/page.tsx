import { Logo } from '@/components/ui/Logo';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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
                        <p className="text-[#853953] font-black text-xs uppercase tracking-[0.2em] mb-4">Data Processing Addendum</p>
                        <h1 className="text-5xl font-black text-[#2C2C2C] mb-6 tracking-tight">Privacy Policy</h1>
                        <p className="text-gray-500 text-lg">Last Updated: March 2026</p>
                    </div>

                    <div className="prose prose-slate max-w-none text-[#2C2C2C]">
                        <h2 className="text-2xl font-black mb-4">1. Introduction</h2>
                        <p className="mb-8 leading-relaxed">Formative ("we", "us", or "our") operates the Formative CRM web application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

                        <h2 className="text-2xl font-black mb-4">2. Information Collection And Use</h2>
                        <ul className="list-disc pl-6 mb-8 space-y-2">
                            <li><strong>Personal Data:</strong> We may ask you to provide certain personally identifiable information (e.g., Email address, First name and last name, Phone number).</li>
                            <li><strong>Lead Data:</strong> The data of the leads traversing through the pipeline (names, preferences, contact numbers) are securely stored and encrypted at rest by our database providers.</li>
                            <li><strong>Usage Data:</strong> We collect information on how the Service is accessed and used.</li>
                        </ul>

                        <h2 className="text-2xl font-black mb-4">3. Data Usage & AI Operations</h2>
                        <p className="mb-8 leading-relaxed">We utilize third-party AI services, including OpenAI endpoints, to classify and score lead data based on user-provided rulesets. Your CRM data, however, is not utilized to train third-party foundation models without your explicit opt-in consent.</p>

                        <h2 className="text-2xl font-black mb-4">4. Integrations & Third-Party Sharing</h2>
                        <p className="mb-8 leading-relaxed">To provide email syncing capabilities, users may optionally authenticate via the Google Identity Provider to access Gmail APIs. Any data retrieved via the Gmail API is strictly utilized to render the inbox capabilities of the CRM dashboard and never sold to third-parties. Your use of Google APIs complies strictly with Google's Limited Use Requirements.</p>

                        <h2 className="text-2xl font-black mb-4">5. Data Deletion & Security</h2>
                        <p className="leading-relaxed">You have the right to request full erasure of your account and associated lead records by contacting support at <code>privacy@formativecrm.com</code>. We use standard industry encryptions (AES-256) for data safety and transit (TLS 1.2+).</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
