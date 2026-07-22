'use client';

import { motion } from 'framer-motion';
import { Zap, Users, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function EmptyStatePipeline() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#853953] to-[#612D53] p-10 text-white"
        >
            {/* Decorative background orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {/* Animated icon cluster */}
                <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center shadow-xl"
                        >
                            <Users className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg"
                        >
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black mb-3 tracking-tight">Your pipeline is empty.</h3>
                    <p className="text-white/70 font-medium text-sm leading-relaxed max-w-xs mx-auto">
                        Share your Formative capture form and watch AI-scored leads appear here automatically — in seconds.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/lead-capture"
                        className="flex items-center justify-center gap-2 py-3.5 bg-white text-[#853953] rounded-2xl font-black text-sm hover:bg-white/90 transition-all shadow-xl active:scale-95"
                    >
                        <Share2 className="w-4 h-4" />
                        Share Your Capture Form
                    </Link>
                    <Link
                        href="/leads"
                        className="flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all active:scale-95"
                    >
                        Add a Lead Manually
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
