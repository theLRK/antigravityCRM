'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ArrowRight,
    Check,
    User,
    MapPin,
    Mail,
    Rocket,
    Building2,
    Phone,
    DollarSign,
    Home,
    ChevronRight,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingData {
    firstName: string;
    lastName: string;
    phone: string;
    brokerage: string;
    marketArea: string;
    propertyTypes: string[];
    avgDealSize: string;
}

const PROPERTY_TYPES = ['Residential', 'Luxury', 'Commercial', 'New Developments', 'Land', 'Rentals'];
const DEAL_SIZES = ['Under $200K', '$200K – $500K', '$500K – $1M', '$1M – $5M', '$5M+'];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -80 : 80,
        opacity: 0,
    }),
};

export default function OnboardingWizard({
    userName,
    userLastName,
    userAvatar,
}: {
    userName?: string;
    userLastName?: string;
    userAvatar?: string;
}) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        firstName: userName || '',
        lastName: userLastName || '',
        phone: '',
        brokerage: '',
        marketArea: '',
        propertyTypes: [],
        avgDealSize: '',
    });

    const totalSteps = 5;

    const goNext = () => {
        setDirection(1);
        setStep((s) => Math.min(s + 1, totalSteps - 1));
    };

    const goBack = () => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 0));
    };

    const togglePropertyType = (type: string) => {
        setData((d) => ({
            ...d,
            propertyTypes: d.propertyTypes.includes(type)
                ? d.propertyTypes.filter((t) => t !== type)
                : [...d.propertyTypes, type],
        }));
    };

    const handleComplete = async () => {
        setSaving(true);
        try {
            await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, avatarUrl: userAvatar || '' }),
            });
        } catch (e) {
            console.error('Onboarding save error:', e);
        }
        setSaving(false);
        window.location.href = '/dashboard';
    };

    const handleSetupGmail = async () => {
        setSaving(true);
        try {
            await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, avatarUrl: userAvatar || '' }),
            });
        } catch (e) {
            console.error('Onboarding save error:', e);
        }
        setSaving(false);
        window.location.href = '/settings/email';
    };

    const steps = [
        // Step 0: Welcome
        <div key="welcome" className="flex flex-col items-center justify-center text-center h-full py-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="mb-8"
            >
                {userAvatar ? (
                    <div className="relative inline-block">
                        <img
                            src={userAvatar}
                            alt="Your profile"
                            className="w-24 h-24 rounded-3xl object-cover shadow-2xl shadow-[#853953]/20 border-4 border-white"
                        />
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-gradient-to-br from-[#853953] to-[#612D53] rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                    </div>
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-[#853953] to-[#612D53] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#853953]/30">
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>
                )}
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-[#2C2C2C] tracking-tight mb-4"
            >
                Welcome to Formative
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 text-lg font-medium max-w-md mb-10 leading-relaxed"
            >
                Let's spend 60 seconds setting up your personal AI command center. The more we know about you, the smarter it gets.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 text-left bg-[#F3F4F4] rounded-2xl p-5 w-full max-w-sm"
            >
                {["AI learns your market preferences", "Automated follow-ups tailored to your style", "Priority scoring based on your deal profile"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#853953]/10 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-[#853953]" />
                        </div>
                        <span className="text-sm font-semibold text-[#2C2C2C]">{item}</span>
                    </div>
                ))}
            </motion.div>
        </div>,

        // Step 1: About You
        <div key="about" className="flex flex-col h-full py-4">
            <div className="mb-8">
                <div className="w-12 h-12 bg-[#853953]/10 rounded-2xl flex items-center justify-center mb-4">
                    <User className="w-6 h-6 text-[#853953]" />
                </div>
                <h2 className="text-2xl font-black text-[#2C2C2C] tracking-tight mb-2">Tell us about yourself</h2>
                <p className="text-gray-400 font-medium text-sm">This personalizes your dashboard and email signatures.</p>
            </div>
            <div className="space-y-5 flex-1">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-2 block">First Name</label>
                        <input
                            className="w-full px-4 py-3 bg-[#F3F4F4] border border-black/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#853953]/20 outline-none transition-all"
                            placeholder="Jordan"
                            value={data.firstName}
                            onChange={(e) => setData(d => ({ ...d, firstName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-2 block">Last Name</label>
                        <input
                            className="w-full px-4 py-3 bg-[#F3F4F4] border border-black/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#853953]/20 outline-none transition-all"
                            placeholder="Smith"
                            value={data.lastName}
                            onChange={(e) => setData(d => ({ ...d, lastName: e.target.value }))}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-2 block">Phone Number</label>
                    <div className="relative">
                        <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full pl-11 pr-4 py-3 bg-[#F3F4F4] border border-black/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#853953]/20 outline-none transition-all"
                            placeholder="+1 (555) 000-0000"
                            value={data.phone}
                            onChange={(e) => setData(d => ({ ...d, phone: e.target.value }))}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-2 block">Brokerage / Agency</label>
                    <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full pl-11 pr-4 py-3 bg-[#F3F4F4] border border-black/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#853953]/20 outline-none transition-all"
                            placeholder="RE/MAX, Compass, Independent..."
                            value={data.brokerage}
                            onChange={(e) => setData(d => ({ ...d, brokerage: e.target.value }))}
                        />
                    </div>
                </div>
            </div>
        </div>,

        // Step 2: Your Market
        <div key="market" className="flex flex-col h-full py-4">
            <div className="mb-8">
                <div className="w-12 h-12 bg-[#853953]/10 rounded-2xl flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-[#853953]" />
                </div>
                <h2 className="text-2xl font-black text-[#2C2C2C] tracking-tight mb-2">Your market</h2>
                <p className="text-gray-400 font-medium text-sm">This helps AI prioritize leads that match your territory and specialty.</p>
            </div>
            <div className="space-y-5 flex-1">
                <div>
                    <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-2 block">City / Market Area</label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full pl-11 pr-4 py-3 bg-[#F3F4F4] border border-black/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#853953]/20 outline-none transition-all"
                            placeholder="e.g. Miami, FL or Greater London"
                            value={data.marketArea}
                            onChange={(e) => setData(d => ({ ...d, marketArea: e.target.value }))}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-3 block">Property Types <span className="text-gray-400 font-semibold normal-case">(select all that apply)</span></label>
                    <div className="flex flex-wrap gap-2">
                        {PROPERTY_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => togglePropertyType(type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                    data.propertyTypes.includes(type)
                                        ? 'bg-[#853953] text-white border-[#853953] shadow-lg shadow-[#853953]/20'
                                        : 'bg-[#F3F4F4] text-gray-600 border-transparent hover:border-[#853953]/20'
                                }`}
                            >
                                {data.propertyTypes.includes(type) && <Check className="w-3 h-3" />}
                                <Home className="w-3 h-3 opacity-60" />
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest mb-3 block">Average Deal Size</label>
                    <div className="flex flex-wrap gap-2">
                        {DEAL_SIZES.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => setData(d => ({ ...d, avgDealSize: size }))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                    data.avgDealSize === size
                                        ? 'bg-[#853953] text-white border-[#853953] shadow-lg shadow-[#853953]/20'
                                        : 'bg-[#F3F4F4] text-gray-600 border-transparent hover:border-[#853953]/20'
                                }`}
                            >
                                <DollarSign className="w-3 h-3 opacity-60" />
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>,

        // Step 3: Email Setup
        <div key="email" className="flex flex-col h-full py-4">
            <div className="mb-8">
                <div className="w-12 h-12 bg-[#853953]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-[#853953]" />
                </div>
                <h2 className="text-2xl font-black text-[#2C2C2C] tracking-tight mb-2">Connect your email</h2>
                <p className="text-gray-400 font-medium text-sm">Formative sends automated follow-ups on your behalf. Connect your Gmail to unlock this.</p>
            </div>
            <div className="flex-1 space-y-4">
                <div className="bg-[#F3F4F4] rounded-2xl p-6 border border-black/5">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-black/5">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-black text-[#2C2C2C] text-sm">Connect Gmail</p>
                            <p className="text-xs text-gray-400 font-medium">Send automated emails from your own address</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSetupGmail}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#853953] to-[#612D53] text-white rounded-xl font-black text-sm shadow-lg shadow-[#853953]/20 hover:opacity-90 transition-all cursor-pointer disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : 'Set Up Gmail in Settings'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center text-xs text-gray-400 font-semibold">
                    You can also do this later from Settings
                </div>
                <div className="bg-[#853953]/5 border border-[#853953]/10 rounded-2xl p-4">
                    <p className="text-xs font-black text-[#853953] uppercase tracking-wider mb-2">Why connect email?</p>
                    <ul className="space-y-1.5">
                        {["Hot leads get an instant personalized email", "Follow-up sequences run on autopilot", "Email opens & clicks tracked in your dashboard"].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                <Check className="w-3 h-3 text-[#853953] shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>,

        // Step 4: Launch
        <div key="launch" className="flex flex-col items-center justify-center text-center h-full py-8">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30"
            >
                <Rocket className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-[#2C2C2C] tracking-tight mb-4"
            >
                Your command center is ready.
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 text-lg font-medium max-w-md mb-10 leading-relaxed"
            >
                {data.firstName ? `Great work, ${data.firstName}!` : 'Great work!'} Formative is configured and ready to start capturing and scoring leads for you.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 gap-3 w-full max-w-sm"
            >
                {[
                    { icon: Check, text: "Profile configured", color: "text-emerald-500", bg: "bg-emerald-50" },
                    { icon: Check, text: "AI engine initialized", color: "text-emerald-500", bg: "bg-emerald-50" },
                    { icon: Check, text: "Pipeline ready to receive leads", color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className={`flex items-center gap-3 ${item.bg} rounded-xl px-4 py-3`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                            </div>
                            <span className="text-sm font-bold text-[#2C2C2C]">{item.text}</span>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>,
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                style={{ maxHeight: '90vh' }}
            >
                {/* Top progress bar + step indicator */}
                <div className="px-8 pt-8 pb-0">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        width: i === step ? 24 : 8,
                                        backgroundColor: i <= step ? '#853953' : '#E5E7EB',
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="h-2 rounded-full"
                                />
                            ))}
                        </div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {step + 1} / {totalSteps}
                        </span>
                    </div>
                    {/* Full-width progress bar */}
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#853953] to-[#612D53] rounded-full"
                            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Step content */}
                <div className="px-8 py-6 overflow-y-auto" style={{ minHeight: 400, maxHeight: 'calc(90vh - 220px)' }}>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {steps[step]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer navigation */}
                <div className="px-8 pb-8 pt-2 border-t border-black/5 flex items-center justify-between">
                    {step > 0 ? (
                        <button
                            onClick={goBack}
                            className="px-5 py-2.5 text-sm font-black text-gray-400 hover:text-[#2C2C2C] transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < totalSteps - 1 ? (
                        <button
                            onClick={goNext}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#853953] to-[#612D53] text-white rounded-xl font-black text-sm shadow-lg shadow-[#853953]/20 hover:opacity-90 transition-all active:scale-95"
                        >
                            {step === 3 ? 'Skip for now' : 'Continue'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {saving ? 'Saving...' : 'Go to Dashboard'}
                            <Rocket className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
