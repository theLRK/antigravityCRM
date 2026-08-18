'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Loader2, Home, User, Briefcase, FileSignature, CheckCircle2, Globe } from 'lucide-react';
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
}

export function PublicFormWizard({
    formId,
    title,
    description,
    welcomeMessage,
    successMessage,
    customFieldsJson,
    currencySymbol,
    locationGroups
}: PublicFormWizardProps) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
        participants: '1', // Added specifically to match prototype feel
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

    // Progression Steps mapped roughly to the prototype flow + Formative requirements
    const steps = [
        { id: 'welcome', title: 'Welcome', icon: <Home className="w-5 h-5" />, requiredFields: [] },
        { id: 'personal', title: 'Personal Info', icon: <User className="w-5 h-5" />, requiredFields: ['firstName', 'lastName', 'email', 'phone'] },
        { id: 'property', title: 'Property Details', icon: <Home className="w-5 h-5" />, requiredFields: ['propertyInterest', 'preferredLocationIds'] },
        { id: 'financing', title: 'Buying Prep', icon: <Briefcase className="w-5 h-5" />, requiredFields: ['financing', 'moveTimeline'] },
        ...(customFields.length > 0 ? [{ id: 'custom', title: 'Additional Questions', icon: <FileSignature className="w-5 h-5" />, requiredFields: [] }] : []),
        { id: 'review', title: 'Review & Submit', icon: <CheckCircle2 className="w-5 h-5" />, requiredFields: [] }
    ];

    // Check if current step is fully filled required fields to enable "Continue" button
    const isCurrentStepValid = () => {
        const currentChecks = steps[step].requiredFields;
        if (currentChecks.length === 0) return true;

        if (steps[step].id === 'personal') {
            return !!(formData.firstName && formData.lastName && formData.email && formData.phone && isValidPhoneNumber(formData.phone));
        }

        return currentChecks.every(field => {
            const val = formData[field];
            if (field === 'preferredLocationIds') {
                return (Array.isArray(val) && val.length > 0) || Boolean(formData.customLocation?.trim());
            }
            return val && String(val).trim() !== '';
        });
    };

    // Animation Variants
    const fadeVariants = {
        enter: { opacity: 0, y: 10 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 max-w-md w-full text-center"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#853953]/10 text-[#853953] mb-6">
                        <CheckCircle2 className="h-10 w-10 text-[#853953]" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Received!</h2>
                    <p className="mt-4 text-slate-500 text-base leading-relaxed">
                        {successMessage}
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full bg-white font-sans text-slate-900 overflow-x-hidden">

            {/* Split Layout Container */}
            <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto py-8 md:py-16 px-4 sm:px-6 lg:px-8 gap-12">

                {/* Left Sidebar: Progress Tracking (Hidden on small mobile, shown on md+) */}
                <div className="hidden md:flex md:w-1/3 flex-col border-r border-slate-100 pr-8">
                    <div className="mb-12">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                        {/* Decorative logo/branding placeholder */}
                        <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-sky-500">
                            <div className="w-6 h-6 rounded bg-sky-500 text-white flex items-center justify-center text-xs">F</div>
                            <span>Formative CRM</span>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Vertical line connecting steps */}
                        <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-100 -z-10"></div>

                        <div className="space-y-8">
                            {steps.map((s: any, idx: number) => {
                                const isActive = idx === step;
                                const isCompleted = idx < step;

                                return (
                                    <div key={s.id} className="flex gap-4 relative">
                                        {/* Step Indicator Orbit */}
                                        <div className="relative mt-1 flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                                                ${isCompleted ? 'bg-[#853953] border-[#853953] text-white' :
                                                    isActive ? 'bg-white border-[#853953] text-[#853953]' :
                                                        'bg-white border-slate-200 text-slate-300'}`}
                                            >
                                                {isCompleted ? <Check className="w-4 h-4" /> : <span className="w-2.5 h-2.5 rounded-full bg-current opacity-0"></span>}
                                                {isActive && !isCompleted && <span className="w-2.5 h-2.5 rounded-full bg-[#853953]"></span>}
                                            </div>
                                        </div>

                                        {/* Step Text */}
                                        <div className={`transition-colors duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Step {idx + 1}</p>
                                            <p className={`text-base font-medium ${isActive ? 'text-[#853953]' : 'text-slate-900'}`}>{s.title}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Content Area: Active Form Step */}
                <div className="flex-1 max-w-2xl w-full flex flex-col justify-center min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            variants={fadeVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >

                            {/* STEP 0: Welcome Screen */}
                            {steps[step].id === 'welcome' && (
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{welcomeMessage}</h2>
                                    <p className="text-lg text-slate-500 max-w-xl">{description}</p>
                                    <div className="pt-10">
                                        <button
                                            onClick={nextStep}
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#853953]/10 text-[#853953] hover:bg-[#853953]/20 transition-colors"
                                        >
                                            Start Application
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: Personal Info */}
                            {steps[step].id === 'personal' && (
                                <div className="space-y-8 w-full max-w-lg">
                                    <div className="mb-6 border-b border-slate-100 pb-4 text-[#853953] font-medium">
                                        <span className="text-xl">Step 1</span>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">Who's inquiring?</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">First Name <span className="text-red-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                    className="block w-full rounded-md border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-sm"
                                                    placeholder="John"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name <span className="text-red-400">*</span></label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                    className="block w-full rounded-md border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-sm"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address <span className="text-red-400">*</span></label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="block w-full rounded-md border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-sm"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number <span className="text-red-400">*</span></label>
                                            <PhoneInput
                                                international
                                                defaultCountry="US"
                                                value={formData.phone}
                                                onChange={(val) => handleInputChange('phone', val || '')}
                                            />
                                        </div>
                                    </div>
                                    <WizardFooter onNext={nextStep} onPrev={prevStep} canNext={isCurrentStepValid()} />
                                </div>
                            )}

                            {/* STEP 2: Property & Budget with Prototype Sliders */}
                            {steps[step].id === 'property' && (
                                <div className="space-y-10 w-full max-w-lg">
                                    <div className="mb-6 border-b border-slate-100 pb-4 text-[#853953] font-medium">
                                        <span className="text-xl">Step 2</span>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">What are you looking for?</h2>
                                    </div>

                                    <div className="space-y-12">
                                        {/* Interactive Slider 1: Participants (from prototype) */}
                                        <div>
                                            <label className="block text-base font-semibold text-slate-900 mb-6 flex justify-between items-center">
                                                How many participants?
                                                <span className="text-[#853953] text-lg font-bold">{formData.participants}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="1" max="10" step="1"
                                                value={formData.participants}
                                                onChange={(e) => handleInputChange('participants', e.target.value)}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#853953]"
                                            />
                                            <div className="w-full flex justify-between text-xs text-slate-400 font-medium mt-2 px-1">
                                                <span>1</span>
                                                <span>10</span>
                                            </div>
                                        </div>

                                        {/* Property Type Custom Selection */}
                                        <div>
                                            <label className="block text-base font-semibold text-slate-900 mb-4">Property Type <span className="text-red-400">*</span></label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['Single Family', 'Condo/Townhouse', 'Multi-Family', 'Land/Lot'].map((type: string) => (
                                                    <div
                                                        key={type}
                                                        onClick={() => handleInputChange('propertyInterest', type)}
                                                        className={`cursor-pointer rounded-full border-2 py-3 px-4 text-center text-sm font-semibold transition-colors
                                                            ${formData.propertyInterest === type
                                                                ? 'border-[#853953]/30 bg-[#853953]/5 text-[#853953]'
                                                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}
                                                    >
                                                        {type}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                         {/* Preferred Locations */}
                                         <div>
                                             <label className="block text-base font-semibold text-slate-900 mb-2">Preferred Country / Region <span className="text-red-400">*</span></label>
                                             <select
                                                 value={formData.country || 'United States'}
                                                 onChange={(e) => handleInputChange('country', e.target.value)}
                                                 className="block w-full rounded-xl border border-slate-200 py-3.5 px-4 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#853953]/20 text-sm font-semibold bg-white mb-6"
                                             >
                                                 {GLOBAL_COUNTRIES.map((c: string) => (
                                                     <option key={c} value={c}>{c}</option>
                                                 ))}
                                             </select>

                                             <label className="block text-base font-semibold text-slate-900 mb-2">Preferred City, Town, or Neighborhood</label>
                                             <input
                                                 type="text"
                                                 placeholder="e.g. Miami Beach, FL or Kensington, London or Victoria Island"
                                                 value={formData.customLocation || ''}
                                                 onChange={(e) => handleInputChange('customLocation', e.target.value)}
                                                 className="block w-full rounded-xl border border-slate-200 py-3.5 px-4 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#853953]/20 text-sm font-medium mb-6"
                                             />
                                        </div>

                                        {/* Interactive Slider 2: Budget (Converting previous dropdowns to sliders) */}
                                        <div>
                                            <div className="flex justify-between items-end mb-6">
                                                <label className="block text-base font-semibold text-slate-900">Estimated Budget Range</label>
                                                <div className="text-right">
                                                    <span className="text-[#853953] font-bold text-lg">
                                                        {currencySymbol}{Number(formData.budgetMin).toLocaleString()} - {currencySymbol}{Number(formData.budgetMax).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Minimum</span>
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
                                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Maximum</span>
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

                            {/* STEP 3: Financing & Timeline */}
                            {steps[step].id === 'financing' && (
                                <div className="space-y-8 w-full max-w-lg">
                                    <div className="mb-6 border-b border-slate-100 pb-4 text-[#853953] font-medium">
                                        <span className="text-xl">Step 3</span>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">Readiness & Timeline</h2>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-base font-semibold text-slate-900 mb-4">Financing Status <span className="text-red-400">*</span></label>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { label: 'Pre-approved', desc: 'I have a letter from a lender.' },
                                                    { label: 'Cash Buyer', desc: 'No financing needed.' },
                                                    { label: 'Need a lender', desc: 'Looking for recommendations.' },
                                                    { label: 'Just browsing', desc: 'Not quite ready yet.' }
                                                ].map((opt: any) => (
                                                    <div
                                                        key={opt.label}
                                                        onClick={() => handleInputChange('financing', opt.label)}
                                                        className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-colors
                                                            ${formData.financing === opt.label
                                                                ? 'border-[#853953]/30 bg-[#853953]/5 text-slate-900'
                                                                : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'}`}
                                                    >
                                                        <div>
                                                            <span className="font-semibold block text-base">{opt.label}</span>
                                                            <span className="text-sm text-slate-500 mt-0.5 block">{opt.desc}</span>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                                                            ${formData.financing === opt.label ? 'border-[#853953] bg-[#853953]' : 'border-slate-300'}`}>
                                                            {formData.financing === opt.label && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-base font-semibold text-slate-900 mb-4">Move Timeline <span className="text-red-400">*</span></label>
                                            <select
                                                value={formData.moveTimeline}
                                                onChange={(e) => handleInputChange('moveTimeline', e.target.value)}
                                                className="block w-full rounded-md border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-base cursor-pointer"
                                            >
                                                <option value="">Select a timeline...</option>
                                                <option value="ASAP">ASAP (0-30 days)</option>
                                                <option value="Within 3 Months">Within 3 Months</option>
                                                <option value="Within 6 Months">Within 6 Months</option>
                                                <option value="Just looking around">Just exploring</option>
                                            </select>
                                        </div>
                                    </div>
                                    <WizardFooter onNext={nextStep} onPrev={prevStep} canNext={isCurrentStepValid()} />
                                </div>
                            )}

                            {/* STEP 4: Custom Fields (if any) */}
                            {steps[step].id === 'custom' && (
                                <div className="space-y-8 w-full max-w-lg">
                                    <div className="mb-6 border-b border-slate-100 pb-4 text-[#853953] font-medium">
                                        <span className="text-xl">Additional Info</span>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">Just a few more specifics</h2>
                                    </div>

                                    <div className="space-y-6">
                                        {customFields.map((field: any) => (
                                            <div key={field.id}>
                                                <label className="block text-base font-semibold text-slate-900 mb-2">
                                                    {field.label} {field.required && <span className="text-red-400">*</span>}
                                                </label>

                                                {field.type === 'short_text' && (
                                                    <input
                                                        type="text"
                                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                        className="block w-full rounded-md border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-sm"
                                                    />
                                                )}

                                                {field.type === 'paragraph' && (
                                                    <textarea
                                                        rows={4}
                                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                        className="block w-full rounded-md border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-sm"
                                                    />
                                                )}

                                                {field.type === 'dropdown' && (
                                                    <select
                                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                        className="block w-full rounded-md border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#853953] sm:text-base cursor-pointer"
                                                    >
                                                        <option value="">Select an option...</option>
                                                        {field.options?.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {field.type === 'checkbox' && (
                                                    <div className="space-y-3 mt-3">
                                                        {field.options?.map((opt: string) => (
                                                            <label key={opt} className="flex items-start gap-3 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    value={opt}
                                                                    checked={(formData[field.id] || []).includes(opt)}
                                                                    onChange={(e) => {
                                                                        const currentVal = formData[field.id] || [];
                                                                        if (e.target.checked) {
                                                                            handleInputChange(field.id, [...currentVal, opt]);
                                                                        } else {
                                                                            handleInputChange(field.id, currentVal.filter((v: string) => v !== opt));
                                                                        }
                                                                    }}
                                                                    className="mt-1 h-5 w-5 text-[#853953] rounded border-slate-300 focus:ring-[#853953]"
                                                                />
                                                                <span className="text-base font-medium text-slate-900 leading-snug">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}

                                                {field.type === 'yes_no' && (
                                                    <div className="flex gap-4 mt-2">
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={field.id}
                                                                value="yes"
                                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                className="h-5 w-5 text-[#853953] focus:ring-[#853953] border-slate-300"
                                                            />
                                                            <span className="text-base font-medium text-slate-900">Yes</span>
                                                        </label>
                                                        <label className="flex items-center gap-3 cursor-pointer ml-4">
                                                            <input
                                                                type="radio"
                                                                name={field.id}
                                                                value="no"
                                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                className="h-5 w-5 text-[#853953] focus:ring-[#853953] border-slate-300"
                                                            />
                                                            <span className="text-base font-medium text-slate-900">No</span>
                                                        </label>
                                                    </div>
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
                                            if (Array.isArray(val)) return val.length > 0;
                                            return val && String(val).trim() !== '';
                                        })}
                                    />
                                </div>
                            )}

                            {/* STEP 5: Review & Submit */}
                            {steps[step].id === 'review' && (
                                <div className="space-y-8 w-full max-w-lg">
                                    <div className="mb-6 border-b border-slate-100 pb-4 text-[#853953] font-medium">
                                        <span className="text-xl">Final Step</span>
                                        <h2 className="text-3xl font-bold text-slate-900 mt-2">Review & Submit</h2>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2 mb-3">Applicant Name</h3>
                                                <p className="text-lg font-medium text-slate-900">{formData.firstName} {formData.lastName}</p>
                                                <p className="text-sm text-slate-500 mt-1">{formData.email} • {formData.phone}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2 mb-3">Property Interest</h3>
                                                <p className="text-base font-medium text-slate-900">{formData.propertyInterest}</p>
                                                <p className="text-sm text-slate-500 mt-1">Budget: {currencySymbol}{Number(formData.budgetMin).toLocaleString()} - {currencySymbol}{Number(formData.budgetMax).toLocaleString()}</p>
                                                {formData.participants && <p className="text-sm text-slate-500 mt-1">Participants: {formData.participants}</p>}
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2 mb-3">Readiness</h3>
                                                <p className="text-base font-medium text-slate-900">{formData.financing}</p>
                                                <p className="text-sm text-slate-500 mt-1">Timeline: {formData.moveTimeline}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="text-base font-semibold text-slate-400 hover:text-slate-800 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#853953]/10 text-[#853953] hover:bg-[#853953]/20 px-8 py-3.5 text-base font-semibold transition-colors disabled:opacity-50 min-w-[180px]"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Now'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile-only Progress Indicator (Bottom) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                    <span>Step {step + 1} of {steps.length}</span>
                    <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-[#853953] h-1.5 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
                </div>
            </div>
        </div>
    );
}

// Reusable Footer Component
function WizardFooter({ onNext, onPrev, canNext }: { onNext: () => void, onPrev: () => void, canNext: boolean }) {
    return (
        <div className="pt-10 flex items-center justify-between mt-8">
            <button
                type="button"
                onClick={onPrev}
                className="text-base font-semibold text-slate-400 hover:text-slate-800 transition-colors"
            >
                Back
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                className="inline-flex items-center justify-center rounded-full bg-[#853953]/10 text-[#853953] hover:bg-[#853953]/20 px-8 py-3.5 text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
                Continue
            </button>
        </div>
    );
}

