"use client";

import { useState } from 'react';
import { BillingRadio } from '@/components/ui/BillingRadio';
import { Check, Info } from 'lucide-react';

export default function BillingPage() {
    const [selectedPlan, setSelectedPlan] = useState('silver');

    const plans = {
        silver: {
            name: 'Silver',
            price: '$49',
            features: ['Basic Lead Scoring', 'Up to 500 Leads/mo', 'Email Support', 'Standard Analytics'],
            color: 'text-slate-600',
        },
        gold: {
            name: 'Gold',
            price: '$99',
            features: ['Advanced AI Scoring', 'Up to 2500 Leads/mo', 'Priority Support', 'Custom Email Templates', 'Workflow Automations'],
            color: 'text-yellow-600',
        },
        platinum: {
            name: 'Platinum',
            price: '$199',
            features: ['Enterprise AI Reasoning', 'Unlimited Leads', '24/7 Dedicated Support', 'White-labeled CRM', 'Custom Integrations', 'Dedicated Account Manager'],
            color: 'text-purple-600',
        }
    };

    const current = plans[selectedPlan as keyof typeof plans];

    return (
        <div className="p-8 max-w-5xl mx-auto w-full animation-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Billing & Plans</h1>
                <p className="text-slate-500">Manage your Formative CRM subscription and billing details.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">

                    {/* Left side: Selector */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                Select your tier
                                <Info className="w-4 h-4 text-slate-400" />
                            </h2>
                            <BillingRadio onChange={setSelectedPlan} />
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Payment Method</h3>
                            <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                                <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center font-bold text-xs text-slate-500">VISA</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-slate-500">Expires 12/28</p>
                                </div>
                                <button className="text-sm font-bold text-purple-600 hover:text-purple-700">Update</button>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Plan Details */}
                    <div className="w-full md:w-[400px] shrink-0 bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <span className="text-9xl font-black">{current.name[0]}</span>
                        </div>

                        <div className="relative z-10">
                            <div className="mb-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 ${selectedPlan === 'silver' ? 'text-slate-300' :
                                        selectedPlan === 'gold' ? 'text-yellow-300' : 'text-purple-300'
                                    }`}>
                                    {current.name} Plan
                                </span>
                            </div>

                            <div className="mb-8 border-b border-white/10 pb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black">{current.price}</span>
                                    <span className="text-slate-400 text-sm font-medium">/month</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-2">Billed monthly, cancel anytime.</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {current.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="mt-0.5 bg-white/10 rounded-full p-0.5">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm text-slate-300 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${selectedPlan === 'platinum' ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/25' :
                                    selectedPlan === 'gold' ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-950 shadow-yellow-500/25' :
                                        'bg-white hover:bg-slate-100 text-slate-900'
                                }`}>
                                Upgrade to {current.name}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
