import { getAgentForm } from './actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Link as LinkIcon, Users, CheckCircle2, QrCode, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { LeadCaptureTabs } from './components/LeadCaptureTabs';
import { ShareLinkBox } from './components/ShareLinkBox';

export default async function LeadCapturePage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session || !user) {
        redirect('/sign-in');
    }

    const formConfig = await getAgentForm();
    const totalSubmissions = formConfig?.leads?.length || 0;

    const agentProfile = await prisma.agentProfile.findUnique({
        where: { agentId: user.id }
    });

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 py-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#853953]/10 text-[#853953] text-xs font-black uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Public Intake & AI Scoring</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Lead Capture Form Configuration
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Customize your public client questionnaire, automated email sequences, and currency settings.
                    </p>
                </div>

                {/* Header Metrics & Actions */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Submission Count Stat Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Total Submissions</span>
                            <span className="text-base font-black text-slate-900">{totalSubmissions} Leads</span>
                        </div>
                    </div>

                    {/* Preview Button */}
                    <Link
                        href={`/f/${formConfig.publicId}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#853953] hover:bg-[#612D53] px-5 py-3 text-xs font-black text-white shadow-sm transition-all"
                    >
                        <span>Open Live Form</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Area (Col 8): Tabs Configuration */}
                <div className="lg:col-span-8 space-y-6">
                    <LeadCaptureTabs formConfig={formConfig} agentProfile={agentProfile} />
                </div>

                {/* Right Sidebar (Col 4): Quick Link, QR Code & Integration */}
                <div className="lg:col-span-4 space-y-6">
                    <ShareLinkBox publicId={formConfig.publicId} />

                    {/* Quick Guidance Box */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#853953]/20 rounded-full blur-2xl pointer-events-none" />
                        <h4 className="text-sm font-black mb-2 text-pink-200 flex items-center gap-2">
                            <span>⚡ How AI Evaluates Form Submissions</span>
                        </h4>
                        <p className="text-xs text-white/70 leading-relaxed font-medium mb-4">
                            When a client completes your form, Formative's dual-engine runs instantly:
                        </p>
                        <ul className="space-y-2 text-xs text-white/80 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="text-rose-400 font-bold">•</span>
                                <span><strong>Hot (Score ≥ 80):</strong> Cash buyer or immediate 30-day timeline.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold">•</span>
                                <span><strong>Warm (50-79):</strong> Active search within 90-180 days with mortgage pre-approval.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span><strong>Cold (&lt; 50):</strong> Exploratory browsing without pre-approval.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
