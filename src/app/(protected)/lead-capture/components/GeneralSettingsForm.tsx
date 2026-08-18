'use client';

import { useState } from 'react';
import { updateFormSettings } from '../actions';
import { Check, Loader2, Coins, Globe, FileText, CheckCircle2 } from 'lucide-react';

interface GeneralSettingsFormProps {
    formId: string;
    title: string;
    description: string;
    welcomeMessage: string;
    successMessage: string;
    isActive: boolean;
    currencySymbol: string;
}

export function GeneralSettingsForm({
    formId,
    title,
    description,
    welcomeMessage,
    successMessage,
    isActive: initialIsActive,
    currencySymbol
}: GeneralSettingsFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isActive, setIsActive] = useState(initialIsActive);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        setIsSuccess(false);

        if (isActive) {
            formData.append('isActive', 'on');
        }

        try {
            await updateFormSettings(formData);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update form settings", error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="formId" value={formId} />

            {/* Form Active Status Card */}
            <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Form Live Status</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                            {isActive ? 'Live & Accepting Submissions' : 'Form Paused (Inactive)'}
                        </span>
                    </h4>
                    <p className="text-xs text-slate-500">Toggle whether this intake form is accessible by prospective clients.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`${isActive ? 'bg-[#853953]' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#853953] focus:ring-offset-2`}
                    role="switch"
                    aria-checked={isActive}
                >
                    <span
                        aria-hidden="true"
                        className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>

            {/* Title & Short Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        Form Title <span className="text-rose-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="title" 
                        id="title" 
                        defaultValue={title} 
                        required 
                        placeholder="e.g. VIP Real Estate Buyer Questionnaire"
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 shadow-sm focus:border-[#853953] focus:ring-2 focus:ring-[#853953]/20 sm:text-sm font-semibold" 
                    />
                </div>

                <div>
                    <label htmlFor="currencySymbol" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        Currency Format <span className="text-rose-500">*</span>
                    </label>
                    <select 
                        name="currencySymbol" 
                        id="currencySymbol" 
                        defaultValue={currencySymbol || '₦'} 
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 shadow-sm focus:border-[#853953] focus:ring-2 focus:ring-[#853953]/20 sm:text-sm font-bold bg-white cursor-pointer"
                    >
                        <option value="₦">Nigerian Naira (₦ / NGN)</option>
                        <option value="$">US Dollar ($ / USD)</option>
                        <option value="£">British Pound (£ / GBP)</option>
                        <option value="€">Euro (€ / EUR)</option>
                        <option value="AED">UAE Dirham (AED)</option>
                        <option value="C$">Canadian Dollar (C$ / CAD)</option>
                        <option value="A$">Australian Dollar (A$ / AUD)</option>
                        <option value="¥">Japanese Yen (¥ / JPY)</option>
                        <option value="₹">Indian Rupee (₹ / INR)</option>
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Intake Description / Subtitle
                </label>
                <textarea 
                    id="description" 
                    name="description" 
                    rows={2} 
                    defaultValue={description} 
                    placeholder="Tell prospective clients what this form is for..."
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 shadow-sm focus:border-[#853953] focus:ring-2 focus:ring-[#853953]/20 sm:text-sm font-medium leading-relaxed" 
                />
            </div>

            {/* Welcome & Success Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="welcomeMessage" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        Welcome Screen Heading
                    </label>
                    <input 
                        type="text" 
                        name="welcomeMessage" 
                        id="welcomeMessage" 
                        defaultValue={welcomeMessage} 
                        placeholder="e.g. Find Your Dream Property"
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 shadow-sm focus:border-[#853953] focus:ring-2 focus:ring-[#853953]/20 sm:text-sm font-medium" 
                    />
                </div>

                <div>
                    <label htmlFor="successMessage" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                        Post-Submission Thank You Message
                    </label>
                    <input 
                        type="text" 
                        name="successMessage" 
                        id="successMessage" 
                        defaultValue={successMessage} 
                        placeholder="e.g. Thank you! An agent will reach out shortly."
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-slate-900 shadow-sm focus:border-[#853953] focus:ring-2 focus:ring-[#853953]/20 sm:text-sm font-medium" 
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSuccess ? <Check className="w-4 h-4" /> : null}
                    {isSuccess ? 'Saved Changes!' : 'Save Form Settings'}
                </button>
            </div>
        </form>
    );
}
