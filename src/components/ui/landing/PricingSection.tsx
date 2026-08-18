'use client';

import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: 'Solo Agent',
            description: 'Perfect for individual realtors and luxury agents starting their AI workflow.',
            monthlyPrice: 49,
            annualPrice: 39,
            popular: false,
            features: [
                'Up to 250 active leads',
                'Sub-3s Predictive AI Intent Scoring',
                '3 Custom Web Intake Form Wizards',
                'WhatsApp & Instagram Lead Ingest',
                'Automated Email Follow-Up Sequences',
                '🛡️ 1-Click Presenter Privacy Mode',
                'Standard Email Support',
            ],
            cta: 'Start 14-Day Free Trial',
            planKey: 'starter'
        },
        {
            name: 'Pro Producer',
            description: 'For high-volume producers & luxury brokers closing multiple deals monthly.',
            monthlyPrice: 99,
            annualPrice: 79,
            popular: true,
            features: [
                'Unlimited active leads',
                'Advanced Dual-Layer AI Engine (OpenAI + Rules)',
                'Unlimited Custom Field Form Builders',
                'Instant Smart Property Matchmaker',
                'Gmail + Resend High-Deliverability Drips',
                'Location Insights & Neighborhood Trends',
                'On-Demand Lead Re-Scoring',
                '🛡️ 1-Click Presenter Privacy Mode',
                'Priority 24/7 Agent Support',
            ],
            cta: 'Start 14-Day Free Trial',
            planKey: 'pro'
        },
        {
            name: 'Brokerage & Team',
            description: 'For real estate teams & brokerages managing multi-agent round-robin routing.',
            monthlyPrice: 249,
            annualPrice: 199,
            popular: false,
            features: [
                'Everything in Pro Producer',
                'Up to 10 Agent Seats included',
                'Automated Team Round-Robin Lead Routing',
                'Team Pipeline & Activity Analytics',
                'Custom White-Label Branding',
                'Custom Lead Intake Webhooks & API Access',
                'Dedicated Account Manager & Onboarding',
            ],
            cta: 'Start 14-Day Free Trial',
            planKey: 'team'
        },
    ];

    return (
        <section id="pricing" className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-black uppercase tracking-widest text-[#853953] bg-[#853953]/10 px-3.5 py-1.5 rounded-full border border-[#853953]/20 mb-4 inline-block">
                        Simple & Transparent Pricing
                    </span>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-4">
                        Invest in Closed Deals, Not Overhead
                    </h2>
                    <p className="text-lg text-gray-600 font-medium mb-8">
                        14-day free trial on all plans. No credit card required. Cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-gray-100 border border-gray-200">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-5 py-2 rounded-full text-xs font-black transition-all ${
                                !isAnnual ? 'bg-white text-[#2C1E26] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            Monthly Billing
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-5 py-2 rounded-full text-xs font-black flex items-center gap-1.5 transition-all ${
                                isAnnual ? 'bg-[#853953] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <span>Annual Billing</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-bold">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, idx) => {
                        const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                        return (
                            <div
                                key={idx}
                                className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all relative ${
                                    plan.popular
                                        ? 'bg-gradient-to-b from-[#2C1E26] via-[#1E141A] to-[#120B0F] text-white shadow-2xl scale-[1.03] border-2 border-[#853953]'
                                        : 'bg-[#F8F9F9] border border-black/5 hover:border-gray-300 text-[#2C1E26] shadow-sm'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#853953] to-[#A34366] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Most Popular for Top Agents</span>
                                    </div>
                                )}

                                <div>
                                    <div className="mb-6">
                                        <h3 className="font-display font-black text-2xl mb-2">{plan.name}</h3>
                                        <p className={`text-xs leading-relaxed ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-5xl font-black font-display">${price}</span>
                                        <span className={`text-xs font-bold ${plan.popular ? 'text-white/60' : 'text-gray-400'}`}>
                                            / month {isAnnual && '(billed annually)'}
                                        </span>
                                    </div>

                                    <div className="space-y-3.5 mb-8">
                                        {plan.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-start gap-3 text-xs font-bold">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                                    plan.popular ? 'bg-emerald-400/20 text-emerald-300' : 'bg-[#853953]/10 text-[#853953]'
                                                }`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className={plan.popular ? 'text-white/90' : 'text-gray-700'}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Link
                                        href={`/sign-up?plan=${plan.planKey}`}
                                        className={`w-full py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all ${
                                            plan.popular
                                                ? 'btn-primary bg-gradient-to-r from-[#853953] to-[#A34366] text-white hover:opacity-90'
                                                : 'bg-white hover:bg-gray-100 text-[#2C1E26] border border-gray-200'
                                        }`}
                                    >
                                        <span>{plan.cta}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                    <p className={`text-center text-[10px] mt-3 font-semibold ${
                                        plan.popular ? 'text-white/50' : 'text-gray-400'
                                    }`}>
                                        Instant activation • 14 days free
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Guarantee Banner */}
                <div className="mt-16 max-w-2xl mx-auto p-6 rounded-2xl bg-[#F8F9F9] border border-gray-200 text-center flex items-center justify-center gap-3 text-xs font-bold text-gray-600">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>30-Day Money-Back Guarantee. If Formative doesn't save you 5+ hours in your first month, get a full refund no questions asked.</span>
                </div>
            </div>
        </section>
    );
}
