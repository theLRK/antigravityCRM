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
    const defaultSuccess = "Thank you, {{first_name}}! Our AI matching engine is reviewing available properties matching your criteria.\n\n✉️ You will receive a personalized follow-up in your inbox ({{email}}) in 2–3 minutes.";
    const [customSuccessMessage, setCustomSuccessMessage] = useState(successMessage || defaultSuccess);

    const presets = [
        {
            label: "AI 2-Minute Follow-up (Recommended)",
            text: "Thank you, {{first_name}}! Our AI matching engine is reviewing available properties matching your criteria.\n\n✉️ You will receive a personalized follow-up in your inbox ({{email}}) in 2–3 minutes."
        },
        {
            label: "Standard Inquiry Confirmation",
            text: "Thank you, {{first_name}}! We have received your property inquiry. {{agent_name}} will review your criteria and contact you shortly."
        },
        {
            label: "Direct Showing & Tour Notice",
            text: "Thank you, {{first_name}}! Your request has been received by {{agent_name}} at {{agent_company}}. We are preparing recommendations and will be in touch today."
        }
    ];

    const insertTag = (tag: string) => {
        setCustomSuccessMessage(prev => prev + ' ' + tag);
    };

    // Live preview formatting
    const previewRender = customSuccessMessage
        .replace(/\{\{first_name\}\}/g, 'Samuel')
        .replace(/\{\{email\}\}/g, 'buyer@gmail.com')
        .replace(/\{\{agent_name\}\}/g, 'Alex Rivera')
        .replace(/\{\{agent_company\}\}/g, 'Lekki Luxury Realty');

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

            {/* Title & Currency Format */}
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

            {/* Intake Description */}
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

            {/* Welcome Screen Heading */}
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

            {/* Post-Submission Customization Section */}
            <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <label htmlFor="successMessage" className="block text-xs font-black uppercase tracking-wider text-slate-700">
                            Post-Submission Confirmation Card
                        </label>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Customize the confirmation message displayed to clients immediately after submitting the form.
                        </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400">Presets:</span>
                        {presets.map((preset, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCustomSuccessMessage(preset.text)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#853953]/10 hover:text-[#853953] text-slate-600 transition-colors"
                            >
                                {preset.label.split(' ')[0]} {preset.label.split(' ')[1]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Variable Inserter Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500">Insert tag:</span>
                    {[
                        { label: 'Client Name', tag: '{{first_name}}' },
                        { label: 'Client Email', tag: '{{email}}' },
                        { label: 'Agent Name', tag: '{{agent_name}}' },
                        { label: 'Agency / Firm', tag: '{{agent_company}}' }
                    ].map(v => (
                        <button
                            key={v.tag}
                            type="button"
                            onClick={() => insertTag(v.tag)}
                            className="inline-flex items-center gap-1 text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-[#853953]/10 text-[#853953] hover:bg-[#853953]/20 transition-colors"
                        >
                            + {v.tag}
                        </button>
                    ))}
                </div>

                <textarea
                    id="successMessage"
                    name="successMessage"
                    rows={4}
                    value={customSuccessMessage}
                    onChange={e => setCustomSuccessMessage(e.target.value)}
                    placeholder="Enter your custom thank you and follow-up message..."
                    className="block w-full rounded-xl border border-slate-200 py-3 px-3.5 text-slate-900 shadow-sm focus:border-[#853953] focus:ring-2 focus:ring-[#853953]/20 sm:text-sm font-medium leading-relaxed font-sans"
                />

                {/* Live Client Preview Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Live Client Success Screen Preview
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">Sample Render</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium shadow-2xs">
                        {previewRender}
                    </div>
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
