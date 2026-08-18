'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    ArrowRight, 
    ArrowLeft, 
    Loader2, 
    Home, 
    User, 
    Briefcase, 
    FileSignature, 
    CheckCircle2, 
    Globe, 
    Phone, 
    Building, 
    ShieldCheck, 
    Sparkles 
} from 'lucide-react';
import { submitPublicLead } from '../actions';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { GLOBAL_COUNTRIES } from '@/lib/constants/locations';

interface PublicFormWizardProps {
    formId: string;
    title: string;
    description: string;
    welcomeMessage: string;
    successMessage: string;
    customFieldsJson: string;
    currencySymbol: string;
    locationGroups: any[];
    agentProfile?: any;
}

export function PublicFormWizard({
    formId,
    title,
    description,
    welcomeMessage,
    successMessage,
    customFieldsJson,
    currencySymbol,
    locationGroups,
    agentProfile
}: PublicFormWizardProps) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Agent / Agency Branding Data
    const agentName = agentProfile?.name || 'Real Estate Advisory';
    const agentCompany = agentProfile?.company || 'Formative Luxury Properties';
    const agentPhone = agentProfile?.phone || '';
    const agentImageUrl = agentProfile?.imageUrl || '';

    // Parse dynamic custom fields
    const customFields = (() => {
        try {
            return JSON.parse(customFieldsJson);
        } catch {
            return [];
        }
    })();

    const isNaira = currencySymbol === '₦';
    const defaultBudgetMin = isNaira ? '50000000' : '250000';
    const defaultBudgetMax = isNaira ? '250000000' : '750000';
    const budgetStep = isNaira ? 5000000 : 25000;
    const minSliderBound = isNaira ? 10000000 : 50000;
    const maxSliderBound = isNaira ? 2500000000 : 5000000;

    // Form State
    const [formData, setFormData] = useState<Record<string, any>>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        budgetMin: defaultBudgetMin,
        budgetMax: defaultBudgetMax,
        moveTimeline: '',
        financing: '',
        propertyInterest: '',
        country: 'Nigeria',
        participants: '1',
        preferredLocationIds: [],
        customLocation: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'budgetMin' && Number(value) >= Number(next.budgetMax)) {
                next.budgetMax = String(Number(value) + budgetStep);
            }
            return next;
        });
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitPublicLead(formId, formData);
            setIsSuccess(true);
        } catch (error) {
            console.error("Submission failed", error);
            alert("There was an error submitting the form. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Progression Steps
    const steps = [
        { id: 'welcome', title: 'Welcome', icon: <Home className="w-4 h-4" />, requiredFields: [] },
        { id: 'personal', title: 'Personal Info', icon: <User className="w-4 h-4" />, requiredFields: ['firstName', 'lastName', 'email', 'phone'] },
        { id: 'property', title: 'Property & Budget', icon: <Building className="w-4 h-4" />, requiredFields: ['propertyInterest'] },
        { id: 'financing', title: 'Timeline & Readiness', icon: <Briefcase className="w-4 h-4" />, requiredFields: ['financing', 'moveTimeline'] },
        ...(customFields.length > 0 ? [{ id: 'custom', title: 'Specifics', icon: <FileSignature className="w-4 h-4" />, requiredFields: [] }] : []),
        { id: 'review', title: 'Review & Submit', icon: <CheckCircle2 className="w-4 h-4" />, requiredFields: [] }
    ];

    // Enable / Disable Continue button based on validation
    const isCurrentStepValid = () => {
        const currentChecks = steps[step].requiredFields;
        if (currentChecks.length === 0) return true;

        if (steps[step].id === 'personal') {
            return !!(formData.firstName && formData.lastName && formData.email && formData.phone && isValidPhoneNumber(formData.phone));
        }

        return currentChecks.every(field => {
            const val = formData[field];
            return val && String(val).trim() !== '';
        });
    };

    // Animation Variants
    const fadeVariants = {
        enter: { opacity: 0, y: 8 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 }
    };

    // Format numbers safely for display
    const formatCurrencyDisplay = (numStr: string) => {
        const num = Number(numStr) || 0;
        return `${currencySymbol}${num.toLocaleString()}`;
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#F3F4F4] via-white to-[#F3F4F4]">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 sm:p-12 max-w-lg w-full text-center rounded-3xl border border-black/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-3xl font-black text-[#2C1E26] tracking-tight mb-2">Inquiry Received!</h2>
                    <p className="text-sm font-bold text-[#853953] mb-4">
                        {agentName} {agentCompany && `• ${agentCompany}`}
                    </p>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 mb-6">
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>AI Property Evaluation in Progress</span>
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Thank you, <strong className="text-slate-900">{formData.firstName || 'Client'}</strong>. Our AI matching engine is currently analyzing available and off-market properties tailored to your criteria.
                        </p>
                        <p className="text-xs text-[#853953] font-bold">
                            ✉️ You will receive a personalized follow-up in your inbox ({formData.email}) in 2–3 minutes.
                        </p>
                    </div>
                    {agentPhone && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4 text-[#853953]" />
                            <span>Direct Agent Inquiries: {agentPhone}</span>
                        </div>
                    )}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                        ⚡ powered by formative CRM
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-[#F8F9F9] font-sans text-slate-900 overflow-x-hidden selection:bg-[#853953]/20 selection:text-[#853953]">
            {/* Main Content Area */}
            <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
                {/* Top Agency Branding Bar */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 mb-8 border border-black/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Agent Avatar / Headshot */}
                        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] text-white flex items-center justify-center font-black text-lg overflow-hidden shrink-0 shadow-sm border-2 border-white">
                            {agentImageUrl ? (
                                <img src={agentImageUrl} alt={agentName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{agentName.slice(0, 2).toUpperCase()}</span>
                            )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-black text-[#2C1E26] truncate">
                                    {agentName}
                                </h2>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Verified Advisor</span>
                                </span>
                            </div>
                            <p className="text-xs font-bold text-[#853953] truncate">
                                {agentCompany}
                            </p>
                        </div>
                    </div>

                    {/* Contact & Form Title Snippet */}
                    <div className="flex items-center gap-3 sm:text-right shrink-0">
                        {agentPhone && (
                            <a 
                                href={`tel:${agentPhone}`} 
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#853953] transition-colors"
                            >
                                <Phone className="w-3.5 h-3.5 text-[#853953]" />
                                <span className="hidden sm:inline">{agentPhone}</span>
                                <span className="sm:hidden">Call</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Split Wizard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar: Step Tracker (Hidden on small mobile) */}
                    <div className="hidden lg:block lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-black/5 shadow-sm space-y-6">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#853953] block mb-1">
                                Client Questionnaire
                            </span>
                            <h1 className="text-xl font-black text-[#2C1E26] leading-snug break-words">
                                {title}
                            </h1>
                        </div>

                        {/* Step Navigation Dots & Labels */}
                        <div className="space-y-4 pt-2">
                            {steps.map((s: any, idx: number) => {
                                const isActive = idx === step;
                                const isCompleted = idx < step;

                                return (
                                    <div 
                                        key={s.id} 
                                        className={`flex items-center gap-3.5 p-2.5 rounded-2xl transition-all ${
                                            isActive 
                                                ? 'bg-[#853953]/5 border border-[#853953]/20 shadow-2xs' 
                                                : isCompleted 
                                                    ? 'text-slate-600' 
                                                    : 'opacity-40 text-slate-400'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                                            isCompleted 
                                                ? 'bg-[#853953] text-white shadow-xs' 
                                                : isActive 
                                                    ? 'bg-white text-[#853953] ring-2 ring-[#853953] shadow-xs' 
                                                    : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black truncate">{s.title}</p>
                                            <p className="text-[10px] text-slate-400 truncate">Step {idx + 1} of {steps.length}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Wizard Content Box */}
                    <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-sm min-h-[520px] flex flex-col justify-between">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={fadeVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="w-full"
                            >
                                {/* STEP 0: Welcome Screen */}
                                {steps[step].id === 'welcome' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#853953]/10 text-[#853953] text-xs font-black uppercase tracking-wider">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>Personalized Real Estate Matching</span>
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-black text-[#2C1E26] tracking-tight leading-tight break-words">
                                            {welcomeMessage || "Find Your Ideal Property"}
                                        </h2>
                                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                                            {description || "Tell us what you're looking for in your next home or investment. Our team will review matched off-market and active listings."}
                                        </p>
                                        <div className="pt-6">
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="btn-primary py-4 px-9 text-sm font-black flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                <span>Begin Questionnaire</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 1: Personal Info */}
                                {steps[step].id === 'personal' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="border-b border-slate-100 pb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-[#853953]">Step 1 of {steps.length}</span>
                                            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E26] mt-1">Who is inquiring?</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                        First Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.firstName}
                                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                        className="input-field py-3 text-sm font-semibold"
                                                        placeholder="Sarah"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Last Name <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.lastName}
                                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                        className="input-field py-3 text-sm font-semibold"
                                                        placeholder="Adeyemi"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Email Address <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="input-field py-3 text-sm font-semibold"
                                                    placeholder="sarah@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Phone Number / WhatsApp <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="rounded-xl border border-slate-200 p-1 bg-white focus-within:ring-2 focus-within:ring-[#853953]/20 focus-within:border-[#853953]">
                                                    <PhoneInput
                                                        international
                                                        defaultCountry="NG"
                                                        value={formData.phone}
                                                        onChange={(val) => handleInputChange('phone', val || '')}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <WizardFooter onNext={nextStep} onPrev={prevStep} canNext={isCurrentStepValid()} />
                                    </div>
                                )}

                                {/* STEP 2: Property & Budget */}
                                {steps[step].id === 'property' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="border-b border-slate-100 pb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-[#853953]">Step 2 of {steps.length}</span>
                                            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E26] mt-1">What are you looking for?</h2>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Property Type Grid */}
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                                                    Property Category <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['Single Family Villa', 'Luxury Apartment', 'Terrace / Townhouse', 'Commercial / Land'].map((type: string) => (
                                                        <div
                                                            key={type}
                                                            onClick={() => handleInputChange('propertyInterest', type)}
                                                            className={`cursor-pointer rounded-2xl border-2 p-3.5 text-center text-xs font-black transition-all ${
                                                                formData.propertyInterest === type
                                                                    ? 'border-[#853953] bg-[#853953]/5 text-[#853953] shadow-xs'
                                                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            {type}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Country & Preferred Neighborhood */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Country / Region
                                                    </label>
                                                    <select
                                                        value={formData.country || 'Nigeria'}
                                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                                        className="input-field py-2.5 text-xs font-bold bg-white"
                                                    >
                                                        {GLOBAL_COUNTRIES.map((c: string) => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                        Preferred Neighborhood
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Ikoyi, Victoria Island, Maitama"
                                                        value={formData.customLocation || ''}
                                                        onChange={(e) => handleInputChange('customLocation', e.target.value)}
                                                        className="input-field py-2.5 text-xs font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Budget Range Box */}
                                            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                                                        Estimated Budget Range
                                                    </label>
                                                    <span className="text-xs sm:text-sm font-black text-[#853953] bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs break-words">
                                                        {formatCurrencyDisplay(formData.budgetMin)} – {formatCurrencyDisplay(formData.budgetMax)}
                                                    </span>
                                                </div>

                                                <div className="space-y-4 pt-1">
                                                    <div>
                                                        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                                                            <span>Minimum: {formatCurrencyDisplay(formData.budgetMin)}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={minSliderBound}
                                                            max={maxSliderBound / 2}
                                                            step={budgetStep}
                                                            value={formData.budgetMin}
                                                            onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#853953]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                                                            <span>Maximum: {formatCurrencyDisplay(formData.budgetMax)}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={Math.max(Number(formData.budgetMin) + budgetStep, minSliderBound + budgetStep)}
                                                            max={maxSliderBound}
                                                            step={budgetStep}
                                                            value={formData.budgetMax}
                                                            onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#853953]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <WizardFooter onNext={nextStep} onPrev={prevStep} canNext={isCurrentStepValid()} />
                                    </div>
                                )}

                                {/* STEP 3: Timeline & Financing */}
                                {steps[step].id === 'financing' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="border-b border-slate-100 pb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-[#853953]">Step 3 of {steps.length}</span>
                                            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E26] mt-1">Timeline & Readiness</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                                                    Purchasing Readiness <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-1 gap-2.5">
                                                    {[
                                                        { label: 'Cash Buyer', desc: 'Liquid funds ready for immediate purchase.' },
                                                        { label: 'Mortgage Pre-Approved', desc: 'Pre-approval letter in place with financial institution.' },
                                                        { label: 'Financing in Progress', desc: 'Working on financing or mortgage options.' },
                                                        { label: 'Exploring Options', desc: 'Early market research and comparison.' }
                                                    ].map((opt: any) => (
                                                        <div
                                                            key={opt.label}
                                                            onClick={() => handleInputChange('financing', opt.label)}
                                                            className={`cursor-pointer rounded-2xl border-2 p-3.5 flex items-center justify-between transition-all ${
                                                                formData.financing === opt.label
                                                                    ? 'border-[#853953] bg-[#853953]/5 text-[#2C1E26] shadow-xs'
                                                                    : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="min-w-0 pr-2">
                                                                <span className="font-black block text-xs sm:text-sm text-[#2C1E26]">{opt.label}</span>
                                                                <span className="text-[11px] text-slate-500 block leading-snug">{opt.desc}</span>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                                formData.financing === opt.label ? 'border-[#853953] bg-[#853953] text-white' : 'border-slate-300'
                                                            }`}>
                                                                {formData.financing === opt.label && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Estimated Move / Purchase Timeline <span className="text-rose-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.moveTimeline}
                                                    onChange={(e) => handleInputChange('moveTimeline', e.target.value)}
                                                    className="input-field py-3 text-xs sm:text-sm font-bold bg-white"
                                                >
                                                    <option value="">Select your timeframe...</option>
                                                    <option value="ASAP">Immediate / Within 30 Days (ASAP)</option>
                                                    <option value="Within 3 Months">1 to 3 Months</option>
                                                    <option value="Within 6 Months">3 to 6 Months</option>
                                                    <option value="Exploring">6+ Months / Casual Exploration</option>
                                                </select>
                                            </div>
                                        </div>

                                        <WizardFooter onNext={nextStep} onPrev={prevStep} canNext={isCurrentStepValid()} />
                                    </div>
                                )}

                                {/* STEP 4: Dynamic Custom Questions (if any) */}
                                {steps[step].id === 'custom' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="border-b border-slate-100 pb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-[#853953]">Additional Specifics</span>
                                            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E26] mt-1">A few final details</h2>
                                        </div>

                                        <div className="space-y-4">
                                            {customFields.map((field: any) => (
                                                <div key={field.id}>
                                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                                                    </label>

                                                    {field.type === 'short_text' && (
                                                        <input
                                                            type="text"
                                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                            className="input-field py-2.5 text-sm font-semibold"
                                                        />
                                                    )}

                                                    {field.type === 'paragraph' && (
                                                        <textarea
                                                            rows={3}
                                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                            className="input-field py-2.5 text-sm font-semibold"
                                                        />
                                                    )}

                                                    {field.type === 'dropdown' && (
                                                        <select
                                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                            className="input-field py-2.5 text-sm font-bold bg-white"
                                                        >
                                                            <option value="">Select an option...</option>
                                                            {field.options?.map((opt: string) => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <WizardFooter
                                            onNext={nextStep}
                                            onPrev={prevStep}
                                            canNext={customFields.every((f: any) => {
                                                if (!f.required) return true;
                                                const val = formData[f.id];
                                                return val && String(val).trim() !== '';
                                            })}
                                        />
                                    </div>
                                )}

                                {/* STEP 5: Review & Submit */}
                                {steps[step].id === 'review' && (
                                    <div className="space-y-6 max-w-xl">
                                        <div className="border-b border-slate-100 pb-4">
                                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Final Verification</span>
                                            <h2 className="text-2xl sm:text-3xl font-black text-[#2C1E26] mt-1">Review & Submit Inquiry</h2>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Client Name</span>
                                                    <span className="text-sm font-black text-[#2C1E26]">{formData.firstName} {formData.lastName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Contact Info</span>
                                                    <span className="text-xs font-semibold text-slate-600 truncate block">{formData.email}</span>
                                                    <span className="text-xs font-semibold text-slate-600 block">{formData.phone}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Property Interest</span>
                                                    <span className="text-sm font-black text-[#2C1E26]">{formData.propertyInterest || 'Residential'}</span>
                                                    {formData.customLocation && (
                                                        <span className="text-xs text-slate-500 block">{formData.customLocation}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 block">Budget Range</span>
                                                    <span className="text-xs sm:text-sm font-black text-[#853953]">
                                                        {formatCurrencyDisplay(formData.budgetMin)} – {formatCurrencyDisplay(formData.budgetMax)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-black uppercase text-slate-400 block">Readiness & Timeline</span>
                                                <span className="text-xs font-bold text-slate-700 block">{formData.financing} • {formData.moveTimeline}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between gap-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="text-xs font-black text-slate-500 hover:text-slate-900 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                className="btn-primary py-3.5 px-8 text-xs font-black flex items-center gap-2 shadow-lg disabled:opacity-50 min-w-[160px] justify-center"
                                            >
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                                ) : (
                                                    <><span>Submit to {agentName}</span><ArrowRight className="w-4 h-4" /></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Subtle Soft Footer Watermark */}
            <footer className="w-full py-6 text-center border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                    Direct Inquiry for <span className="font-bold text-slate-600">{agentName}</span> {agentCompany && `(${agentCompany})`}
                    <span className="mx-2 opacity-40">•</span>
                    <span className="text-slate-400/80">⚡ powered by formative CRM</span>
                </p>
            </footer>
        </div>
    );
}

// Reusable Footer Component for Wizard Steps
function WizardFooter({ onNext, onPrev, canNext }: { onNext: () => void, onPrev: () => void, canNext: boolean }) {
    return (
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
            <button
                type="button"
                onClick={onPrev}
                className="text-xs font-black text-slate-400 hover:text-slate-800 transition-colors"
            >
                Back
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                className="btn-primary py-3 px-7 text-xs font-black flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
