'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Shield, Rocket } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        price: 'Free',
        description: 'Perfect for agents just starting out.',
        features: [
            '25 leads per month',
            'Deterministic scoring',
            'Public capture form',
            'Basic lead dashboard',
            'Email support'
        ],
        cta: 'Get Started',
        highlight: false,
        icon: <Shield className="w-6 h-6" />
    },
    {
        name: 'Pro',
        price: '$49',
        priceSuffix: '/mo',
        description: 'Advanced AI tools for top producers.',
        features: [
            'Unlimited leads',
            'AI-powered scoring',
            'Automated email outreach',
            'AI suggested actions',
            'Gmail integration',
            'Priority support'
        ],
        cta: 'Start Pro Free',
        highlight: true,
        icon: <Zap className="w-6 h-6" />
    },
    {
        name: 'Growth',
        price: '$99',
        priceSuffix: '/mo',
        description: 'For growing real estate teams.',
        features: [
            'Everything in Pro',
            'Behavioral tracking',
            'Performance coaching',
            'Similar lead insights',
            'Advanced analytics',
            'Dedicated success manager'
        ],
        cta: 'Contact Sales',
        highlight: false,
        icon: <Rocket className="w-6 h-6" />
    }
];

export default function PricingSection() {
    return (
        <section id="pricing" className="py-32 bg-[#F3F4F4]">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold text-[#2C2C2C] mb-6 tracking-tight"
                    >
                        Simple, <span className="text-[#853953]">Transparent</span> Pricing
                    </motion.h2>
                    <p className="text-xl text-[#2C2C2C]/60">Choose the plan that fits your business stage. No hidden fees, cancel anytime.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className={`card-modern p-10 relative flex flex-col ${
                                tier.highlight 
                                    ? 'ring-2 ring-[#853953] scale-105 z-10 shadow-2xl' 
                                    : 'opacity-90 grayscale-[0.2]'
                            }`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#853953] to-[#612D53] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-10 text-center">
                                <div className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                                    tier.highlight ? 'bg-[#853953]/10 text-[#853953]' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {tier.icon}
                                </div>
                                <h3 className="text-2xl font-black text-[#2C2C2C] mb-2">{tier.name}</h3>
                                <p className="text-[#2C2C2C]/50 text-base">{tier.description}</p>
                            </div>

                            <div className="mb-10 text-center flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-black text-[#2C2C2C] tracking-tight">{tier.price}</span>
                                {tier.priceSuffix && <span className="text-xl font-bold text-gray-400">{tier.priceSuffix}</span>}
                            </div>

                            <ul className="space-y-5 mb-12 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-4 text-base text-[#2C2C2C]/70">
                                        <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-[#853953]/10 text-[#853953]">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-black text-base transition-all active:scale-[0.98] ${
                                tier.highlight
                                    ? 'bg-gradient-to-r from-[#853953] to-[#612D53] text-white shadow-xl shadow-[#853953]/20 hover:shadow-2xl hover:brightness-110'
                                    : 'bg-[#F3F4F4] text-[#2C2C2C] hover:bg-gray-200 border border-black/5'
                            }`}>
                                {tier.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
