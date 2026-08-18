'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const faqs = [
        {
            q: 'How does the AI intent scoring engine work?',
            a: 'Formative utilizes a dual-layer evaluation pipeline: First, deterministic real estate rules analyze factual indicators (cash vs mortgage pre-approval, timeline urgency, budget match). Second, an integrated LLM analyzes qualitative intent and nuanced buyer motivation to produce a calibrated score (0-100) with written rationale in under 3 seconds.'
        },
        {
            q: 'Can I connect my existing WhatsApp and Instagram accounts?',
            a: 'Yes! Formative allows you to generate dedicated QR codes for WhatsApp and webhooks for Instagram DMs. When prospective buyers message or submit forms, their contact details and preferences are instantly captured and scored in your CRM pipeline.'
        },
        {
            q: 'What is Presenter Privacy Mode and how does it protect my client meetings?',
            a: 'Presenter Mode is a 1-click toggle in your CRM sidebar. When activated during a client screen share, video meeting, or in-person consultation, all internal AI scores, estimated agent commissions, private notes, and raw phone numbers are dynamically masked with •••••• to maintain absolute confidentiality.'
        },
        {
            q: 'Can I import my existing contacts and properties from spreadsheets?',
            a: 'Yes. Formative provides a fast CSV/Excel import tool in your Settings. You can import thousands of past leads and property listings in under 60 seconds.'
        },
        {
            q: 'Do I need technical skills or a dedicated developer to set this up?',
            a: 'None at all. Formative is ready to use out of the box. You can configure your intake forms with our visual drag-and-drop builder, connect your email in 1 click, and start receiving scored leads immediately.'
        },
        {
            q: 'Is there a contract or commitment with the free trial?',
            a: 'No. You get full access to all features for 14 days without entering any credit card. If you choose not to subscribe, your account simply pauses with zero charges.'
        }
    ];

    return (
        <section id="faq" className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[900px] relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs font-black uppercase tracking-widest text-[#853953] bg-[#853953]/10 px-3.5 py-1.5 rounded-full border border-[#853953]/20 mb-4 inline-block">
                        Frequently Asked Questions
                    </span>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-4">
                        Got Questions? We’ve Got Answers.
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        Everything you need to know about setting up and scaling with Formative AI CRM.
                    </p>
                </div>

                {/* FAQ Accordions */}
                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIdx === idx;
                        return (
                            <div
                                key={idx}
                                className="rounded-2xl border border-gray-200 bg-[#F8F9F9] overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-black text-[#2C1E26] text-base hover:text-[#853953] transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180 text-[#853953]' : ''}`} />
                                </button>
                                {isOpen && (
                                    <div className="px-6 pb-6 pt-1 text-sm text-gray-600 font-medium leading-relaxed border-t border-gray-100">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
