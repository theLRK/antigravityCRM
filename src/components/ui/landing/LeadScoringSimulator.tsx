'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Flame, CheckCircle, ArrowRight, RefreshCw, Send, ShieldCheck } from 'lucide-react';

interface Scenario {
    id: string;
    title: string;
    description: string;
    tag: string;
    score: number;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    intentLabel: string;
    rationale: string;
    actionPlan: string;
}

const PRESET_SCENARIOS: Scenario[] = [
    {
        id: '1',
        title: '🌟 High-Net-Worth Cash Buyer',
        description: 'Looking for a 4-Bedroom Waterfront Villa in Marina. Budget $2.5M - $3.2M. All cash purchase, wants to view properties this Saturday and close in 30 days.',
        tag: 'Ultra-Hot Buyer',
        score: 96,
        urgency: 'HIGH',
        intentLabel: 'CRITICAL PRIORITY • IMMEDIATE CLOSE',
        rationale: 'All-cash financing confirmed, exact geographic preference, immediate 30-day timeline, active viewing availability.',
        actionPlan: 'Auto-dispatched VIP Marina listing brochure with 3 private viewings booked for Saturday.'
    },
    {
        id: '2',
        title: '🏠 First-Time Suburban Family',
        description: 'Looking for 3-bed townhouse near top elementary schools. Budget $600k. Pre-approved for mortgage with Wells Fargo. Looking to relocate in 60-90 days before new school term.',
        tag: 'Warm Buyer',
        score: 84,
        urgency: 'MEDIUM',
        intentLabel: 'HIGH INTENT • PRE-QUALIFIED',
        rationale: 'Lender pre-approval verified, definite school timeline, realistic budget alignment.',
        actionPlan: 'Enrolled in 4-step School District Nurture Sequence + sent 2 matched off-market townhouses.'
    },
    {
        id: '3',
        title: '❄️ Casual Passive Browser',
        description: 'Just curious about market trends in downtown. No immediate moving plan, no budget set, looking at property photos for interior design ideas.',
        tag: 'Cold Inquirer',
        score: 28,
        urgency: 'LOW',
        intentLabel: 'LOW PRIORITY • PASSIVE LEAD',
        rationale: 'No financing pre-qualification, indefinite horizon (12+ months), exploratory motivation.',
        actionPlan: 'Added to Monthly Market Report newsletter. Agent time saved: 45 minutes of manual follow-up calls avoided.'
    }
];

export function LeadScoringSimulator() {
    const [selectedScenario, setSelectedScenario] = useState<Scenario>(PRESET_SCENARIOS[0]);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedResult, setSimulatedResult] = useState<Scenario | null>(null);

    const activeData = simulatedResult || selectedScenario;

    const handleCustomSimulate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customPrompt.trim()) return;

        setIsSimulating(true);
        setTimeout(() => {
            // Smart deterministic mockup based on keyword presence
            const text = customPrompt.toLowerCase();
            let score = 50;
            let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
            let label = 'MODERATE INTENT';

            if (text.includes('cash') || text.includes('immediate') || text.includes('asap') || text.includes('approved') || text.includes('million')) {
                score = Math.floor(Math.random() * 8) + 91;
                urgency = 'HIGH';
                label = 'HOT BUYER • IMMEDIATE ACTION';
            } else if (text.includes('next year') || text.includes('curious') || text.includes('just looking') || text.includes('not sure')) {
                score = Math.floor(Math.random() * 15) + 20;
                urgency = 'LOW';
                label = 'COLD LEAD • NURTURE SEQUENCE';
            } else {
                score = Math.floor(Math.random() * 15) + 72;
                urgency = 'MEDIUM';
                label = 'WARM LEAD • SCHEDULE DISCOVERY CALL';
            }

            setSimulatedResult({
                id: 'custom',
                title: '✨ Custom Client Inquiry',
                description: customPrompt,
                tag: 'Custom Lead',
                score,
                urgency,
                intentLabel: label,
                rationale: `AI analyzed keywords: Budget clarity, purchase urgency, and financing readiness parsed accurately.`,
                actionPlan: score > 85 ? 'Dispatched instant VIP deck & assigned senior closing agent.' : 'Enrolled in intelligent multi-touch drip sequence.'
            });
            setIsSimulating(false);
        }, 600);
    };

    return (
        <section id="simulator" className="py-24 bg-white border-y border-black/5 relative overflow-hidden">
            {/* Glows */}
            <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-[#853953]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#853953]/10 border border-[#853953]/20 text-[#853953] font-bold text-xs uppercase tracking-wider mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Experience</span>
                    </div>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-5">
                        Test the Real Estate AI Scoring Engine Live
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        See how Formative classifies incoming inquiries into accurate buying stages, assigns confidence scores, and creates instant action plans.
                    </p>
                </div>

                {/* Interactive Simulator Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Scenarios Picker */}
                    <div className="lg:col-span-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1 mb-2">
                            Select a sample lead inquiry or type your own:
                        </h3>

                        {PRESET_SCENARIOS.map((scenario) => {
                            const isSelected = activeData.id === scenario.id;
                            return (
                                <div
                                    key={scenario.id}
                                    onClick={() => {
                                        setSimulatedResult(null);
                                        setSelectedScenario(scenario);
                                    }}
                                    className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-[#853953]/10 via-white to-white border-[#853953] shadow-md scale-[1.01]'
                                            : 'bg-[#F9FAFA] border-gray-200 hover:border-gray-300 hover:bg-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-black text-[#2C1E26] text-base">{scenario.title}</h4>
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                            scenario.urgency === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                                            scenario.urgency === 'MEDIUM' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            Score: {scenario.score}/100
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                        "{scenario.description}"
                                    </p>
                                </div>
                            );
                        })}

                        {/* Custom Input Form */}
                        <form onSubmit={handleCustomSimulate} className="mt-6 pt-6 border-t border-gray-100">
                            <label className="text-xs font-black uppercase tracking-wider text-gray-500 block mb-2">
                                Or Test Your Own Custom Lead Inquiry:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g. Relocating from NYC with $1.5M cash, need 3-bed condo in 3 weeks..."
                                    className="input-field py-3 text-sm flex-1"
                                />
                                <button
                                    type="submit"
                                    disabled={isSimulating || !customPrompt.trim()}
                                    className="btn-primary px-5 py-3 text-xs font-black flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isSimulating ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Score Lead</span>
                                            <Send className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Real-Time AI Scoring Card */}
                    <div className="lg:col-span-6 bg-gradient-to-br from-[#2C1E26] via-[#1E141A] to-[#120B0F] rounded-3xl p-6 sm:p-8 text-white border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#853953]/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Top Indicator */}
                        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#853953]/30 border border-[#853953]/40 text-pink-300">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white">AI Evaluation Result</h4>
                                    <p className="text-[10px] text-white/50">Evaluated in 2.3 seconds</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/15">
                                Sub-3s Guarantee
                            </span>
                        </div>

                        {/* Score Display Box */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-center backdrop-blur-md">
                            <span className="text-xs uppercase font-black tracking-widest text-white/50 block mb-1">
                                Intent Confidence Rating
                            </span>
                            <div className="flex items-center justify-center gap-3 my-2">
                                <span className={`text-6xl font-black ${
                                    activeData.score >= 80 ? 'text-emerald-400' :
                                    activeData.score >= 60 ? 'text-amber-400' : 'text-slate-400'
                                }`}>
                                    {activeData.score}
                                </span>
                                <span className="text-2xl text-white/40 font-bold">/100</span>
                                {activeData.score >= 80 && <Flame className="w-8 h-8 text-amber-400 animate-pulse" />}
                            </div>
                            <span className={`inline-block text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border ${
                                activeData.urgency === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                                activeData.urgency === 'MEDIUM' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-gray-500/20 text-gray-300 border-gray-500/40'
                            }`}>
                                {activeData.intentLabel}
                            </span>
                        </div>

                        {/* Rationale & Action Plan */}
                        <div className="space-y-4 text-xs">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-wider text-pink-300 mb-1">
                                    🧠 AI Reasoning Breakdown
                                </p>
                                <p className="text-white/80 leading-relaxed font-medium">
                                    {activeData.rationale}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300 mb-1">
                                    ⚡ Automated Next Best Action
                                </p>
                                <p className="text-emerald-100 leading-relaxed font-medium">
                                    {activeData.actionPlan}
                                </p>
                            </div>
                        </div>

                        {/* Conversion Footer */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-[11px] text-white/60">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Presenter privacy mode supported</span>
                            </div>
                            <Link
                                href="/sign-up"
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#2C1E26] font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                            >
                                <span>Get AI Scoring on Your Leads</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
