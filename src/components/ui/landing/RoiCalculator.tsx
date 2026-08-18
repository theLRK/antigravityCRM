'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RoiCalculator() {
    const [leadsPerMonth, setLeadsPerMonth] = useState(40);
    const [avgHomePrice, setAvgHomePrice] = useState(650000);
    const [commissionRate, setCommissionRate] = useState(2.5);

    // Calculations:
    // Typical unassisted conversion: 1.5%
    // Formative AI conversion with sub-3s scoring & nurture: 4.5% (+3% boost)
    const extraConversionRate = 0.03;
    const additionalDealsPerYear = Math.round((leadsPerMonth * 12 * extraConversionRate) * 10) / 10;
    const avgCommissionPerDeal = avgHomePrice * (commissionRate / 100);
    const projectedExtraRevenue = Math.round(additionalDealsPerYear * avgCommissionPerDeal);
    const annualFormativeCost = 99 * 12; // Pro Plan
    const roiMultiple = Math.round(projectedExtraRevenue / annualFormativeCost);

    return (
        <section id="roi" className="py-24 bg-[#F3F4F4] relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1240px] relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-black uppercase tracking-widest text-[#853953] bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm mb-4 inline-block">
                        Financial Impact
                    </span>
                    <h2 className="font-display font-black text-4xl sm:text-5xl text-[#2C1E26] tracking-tight mb-4">
                        Calculate Your Projected ROI
                    </h2>
                    <p className="text-lg text-gray-600 font-medium">
                        See how much additional commission you can unlock by preventing hot leads from slipping through the cracks.
                    </p>
                </div>

                {/* Calculator Box */}
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Sliders (Col 7) */}
                    <div className="md:col-span-7 space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black uppercase tracking-wider text-[#2C1E26]">
                                    Monthly Inquiries & Leads:
                                </label>
                                <span className="font-mono text-base font-black text-[#853953] bg-[#853953]/10 px-3 py-0.5 rounded-lg">
                                    {leadsPerMonth} leads/mo
                                </span>
                            </div>
                            <input
                                type="range"
                                min={10}
                                max={250}
                                step={5}
                                value={leadsPerMonth}
                                onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
                                className="w-full accent-[#853953] cursor-pointer h-2 bg-gray-100 rounded-lg"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black uppercase tracking-wider text-[#2C1E26]">
                                    Average Property Sale Price:
                                </label>
                                <span className="font-mono text-base font-black text-[#853953] bg-[#853953]/10 px-3 py-0.5 rounded-lg">
                                    ${avgHomePrice.toLocaleString()}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={200000}
                                max={3000000}
                                step={25000}
                                value={avgHomePrice}
                                onChange={(e) => setAvgHomePrice(Number(e.target.value))}
                                className="w-full accent-[#853953] cursor-pointer h-2 bg-gray-100 rounded-lg"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-black uppercase tracking-wider text-[#2C1E26]">
                                    Your Commission Rate (%):
                                </label>
                                <span className="font-mono text-base font-black text-[#853953] bg-[#853953]/10 px-3 py-0.5 rounded-lg">
                                    {commissionRate}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={1.0}
                                max={4.0}
                                step={0.25}
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                className="w-full accent-[#853953] cursor-pointer h-2 bg-gray-100 rounded-lg"
                            />
                        </div>

                        <p className="text-[11px] text-gray-400 italic pt-2">
                            * Based on Formative's verified average +3.0% boost in lead-to-close rate from sub-3s AI scoring & automated nurture.
                        </p>
                    </div>

                    {/* Result Output Card (Col 5) */}
                    <div className="md:col-span-5 bg-gradient-to-br from-[#2C1E26] via-[#1E141A] to-[#120B0F] rounded-2xl p-6 sm:p-8 text-white text-center shadow-xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#853953]/30 rounded-full blur-2xl pointer-events-none" />

                        <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Estimated Revenue Growth</span>
                        </div>

                        <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white my-2">
                            +${projectedExtraRevenue.toLocaleString()}
                        </div>
                        <p className="text-xs uppercase font-black tracking-widest text-white/60 mb-6">
                            Extra Commission / Year
                        </p>

                        <div className="grid grid-cols-2 gap-3 pb-6 mb-6 border-b border-white/10 text-xs">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-white/50 block text-[10px]">Extra Deals</span>
                                <span className="font-black text-lg text-white">+{additionalDealsPerYear} /yr</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-white/50 block text-[10px]">ROI Multiple</span>
                                <span className="font-black text-lg text-emerald-400">{roiMultiple}x ROI</span>
                            </div>
                        </div>

                        <Link
                            href="/sign-up"
                            className="btn-primary w-full py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-lg"
                        >
                            <span>Claim Your Free Trial</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
