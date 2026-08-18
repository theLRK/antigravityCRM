'use client';

import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ComparisonSection() {
    const comparisons = [
        {
            feature: 'Lead Qualification & Scoring',
            traditional: 'Manual inspection, guesswork, or zero intent evaluation.',
            formative: 'Sub-3s automated AI intent score (0-100) with confidence rationale.',
        },
        {
            feature: 'Multi-Channel Ingestion',
            traditional: 'Copy-pasting WhatsApp numbers & DMs into spreadsheet cells.',
            formative: 'Instant 1-click QR, Instagram webhook, and embed wizard intake.',
        },
        {
            feature: 'Follow-Up & Nurturing',
            traditional: 'Manual email writing that gets forgotten after 2 days.',
            formative: 'Autonomous multi-touch drips via Gmail & Resend customized by buying stage.',
        },
        {
            feature: 'Property Matching',
            traditional: 'Browsing through hundreds of MLS pages manually while client waits.',
            formative: 'Instant AI matching against inventory with 1-click tailored pitch decks.',
        },
        {
            feature: 'Client Presentation Privacy',
            traditional: 'Accidentally showing private commission notes on Zoom screen shares.',
            formative: '1-Click 🛡️ Presenter Mode masks sensitive scores & internal notes immediately.',
        },
        {
            feature: 'Team Routing & Workflows',
            traditional: 'Chaotic group chats fighting over newly arrived buyer leads.',
            formative: 'Automated round-robin distribution based on location expertise & capacity.',
        },
    ];

    return (
        <section id="solutions" className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-black uppercase tracking-widest text-[#853953] bg-[#853953]/10 px-3.5 py-1.5 rounded-full border border-[#853953]/20 mb-4 inline-block">
                        The Formative Advantage
                    </span>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-4">
                        Why Traditional CRMs Fall Short for Modern Real Estate
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        Generic sales CRMs were built for desktop software reps, not fast-moving luxury real estate agents in the field.
                    </p>
                </div>

                {/* Comparison Table / Cards */}
                <div className="max-w-4xl mx-auto bg-[#F8F9F9] rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xl overflow-hidden">
                    <div className="grid grid-cols-12 pb-6 border-b border-gray-200 text-xs font-black uppercase tracking-wider text-gray-400">
                        <div className="col-span-4 sm:col-span-4">Workflow Area</div>
                        <div className="col-span-4 sm:col-span-4 text-red-500">Traditional CRMs</div>
                        <div className="col-span-4 sm:col-span-4 text-[#853953]">Formative AI CRM</div>
                    </div>

                    <div className="divide-y divide-gray-200/80">
                        {comparisons.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-12 py-5 items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                                <div className="col-span-4 font-black text-[#2C1E26]">
                                    {row.feature}
                                </div>
                                <div className="col-span-4 text-gray-500 flex items-start gap-2">
                                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{row.traditional}</span>
                                </div>
                                <div className="col-span-4 text-[#2C1E26] font-bold flex items-start gap-2 bg-[#853953]/5 p-2.5 rounded-xl border border-[#853953]/15">
                                    <Check className="w-4 h-4 text-[#853953] shrink-0 mt-0.5" />
                                    <span className="leading-snug text-[#2C1E26]">{row.formative}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="font-black text-[#2C1E26] text-base">Ready to upgrade your real estate operations?</p>
                            <p className="text-xs text-gray-500">Migrate your contacts in under 5 minutes with CSV import.</p>
                        </div>
                        <Link
                            href="/sign-up"
                            className="btn-primary py-3.5 px-7 text-xs font-black flex items-center gap-2 whitespace-nowrap"
                        >
                            <span>Start 14-Day Free Trial</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
