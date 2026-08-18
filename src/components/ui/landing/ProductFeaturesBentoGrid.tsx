'use client';

import React from 'react';
import { 
    Zap, 
    BrainCircuit, 
    Send, 
    Home, 
    EyeOff, 
    MapPin, 
    ShieldCheck, 
    Sparkles, 
    Users, 
    MessageSquare, 
    ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

export function ProductFeaturesBentoGrid() {
    return (
        <section id="features" className="py-24 bg-[#F3F4F4] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-[#853953]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-[#853953] font-bold text-xs uppercase tracking-wider mb-4 shadow-sm">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Core Capabilities</span>
                    </div>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-5">
                        Everything You Need to Dominate Your Local Market
                    </h2>
                    <p className="text-lg text-gray-600 font-medium leading-relaxed">
                        Built specifically for high-performing real estate agents and brokerages who want an unfair advantage in conversion, speed, and client intelligence.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Feature 1: Omni-Channel Intake (Col 8) */}
                    <div className="md:col-span-8 bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#853953]/10 border border-[#853953]/20 flex items-center justify-center text-[#853953]">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-[#853953] bg-[#853953]/5 px-3 py-1 rounded-full border border-[#853953]/10">
                                    Instant Capture
                                </span>
                            </div>
                            <h3 className="font-display font-black text-2xl text-[#2C1E26] mb-3">
                                Unified Omni-Channel Ingestion
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                                Capture leads from WhatsApp QR codes, Instagram direct messages, custom website embed wizards, and Zillow webhooks without ever losing contact data or copying and pasting manually.
                            </p>
                        </div>
                        {/* Interactive UI snippet */}
                        <div className="bg-[#F8F9F9] rounded-2xl p-4 border border-gray-100 grid grid-cols-3 gap-3 text-center text-xs font-bold text-gray-700">
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center gap-1.5">
                                <span className="text-emerald-500 font-black">WhatsApp</span>
                                <span className="text-[10px] text-gray-400">1-Click QR</span>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center gap-1.5">
                                <span className="text-pink-500 font-black">Instagram DM</span>
                                <span className="text-[10px] text-gray-400">Webhook Sync</span>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center gap-1.5">
                                <span className="text-blue-500 font-black">Public Form</span>
                                <span className="text-[10px] text-gray-400">Embedded Wizard</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature 2: Predictive Sub-3s Scoring (Col 4) */}
                    <div className="md:col-span-4 bg-gradient-to-br from-[#853953] to-[#5C2337] rounded-3xl p-8 text-white shadow-lg flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-pink-200 mb-6">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-black text-2xl mb-3 text-white">
                                Sub-3s Predictive AI Intent Scoring
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-6">
                                Dual-layer deterministic engine + LLM reasoning scores lead readiness (0-100) instantly based on budget, timeline, and financing status.
                            </p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                            <span className="text-3xl font-black text-emerald-300">96/100</span>
                            <p className="text-[10px] uppercase font-bold text-white/70 mt-1">Ready to close in &lt;30 days</p>
                        </div>
                    </div>

                    {/* Feature 3: Smart Property Matchmaker (Col 4) */}
                    <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 mb-6">
                                <Home className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-black text-2xl text-[#2C1E26] mb-3">
                                Smart Property Matchmaker
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Match verified buyers against your active and off-market inventory by price bands, neighborhood tags, and layout criteria in 1 click.
                            </p>
                        </div>
                        <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-900 font-bold flex items-center justify-between">
                            <span>Matched 3 Listings</span>
                            <span className="text-blue-600 font-black">98% Fit</span>
                        </div>
                    </div>

                    {/* Feature 4: Autonomous Outreach Engine (Col 4) */}
                    <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 mb-6">
                                <Send className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-black text-2xl text-[#2C1E26] mb-3">
                                Autonomous Multi-Touch Drip
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Smart follow-up sequences customized for hot vs warm vs cold leads through connected Gmail and Resend with zero manual effort.
                            </p>
                        </div>
                        <div className="p-3.5 bg-purple-50 border border-purple-100 rounded-2xl text-xs text-purple-900 font-bold flex items-center justify-between">
                            <span>Open Rate Average</span>
                            <span className="text-purple-700 font-black">94.2%</span>
                        </div>
                    </div>

                    {/* Feature 5: Presenter Privacy Mode (Col 4) */}
                    <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-6">
                                <EyeOff className="w-6 h-6" />
                            </div>
                            <h3 className="font-display font-black text-2xl text-[#2C1E26] mb-3">
                                🛡️ 1-Click Presenter Privacy Mode
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Mask confidential lead scoring rationales, budget numbers, and agent notes during live client screen shares with a single toggle.
                            </p>
                        </div>
                        <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-900 font-bold flex items-center justify-between">
                            <span>Score Display</span>
                            <span className="font-mono text-amber-700 font-black tracking-widest">••••••••</span>
                        </div>
                    </div>

                    {/* Feature 6: Location Intelligence & Team Routing (Col 12) */}
                    <div className="md:col-span-12 bg-white rounded-3xl p-8 sm:p-10 border border-black/5 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Neighborhood & Team Intelligence</span>
                            </div>
                            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#2C1E26] mb-3">
                                Round-Robin Routing & Hyper-Local Price Trends
                            </h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Distribute high-intent leads automatically to specialized neighborhood agents and view real-time location metrics and historical property valuations across your territory.
                            </p>
                        </div>
                        <Link
                            href="/sign-up"
                            className="btn-primary py-4 px-8 text-sm font-black whitespace-nowrap flex items-center gap-2.5 shrink-0"
                        >
                            <span>Explore All Features</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
