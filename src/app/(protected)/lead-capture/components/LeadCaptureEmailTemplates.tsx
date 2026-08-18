'use client';

import { useState } from 'react';
import { Flame, Thermometer, Snowflake, Save, ChevronDown, ChevronUp, CheckCircle2, Eye, EyeOff, Loader2, Zap, Send, ShieldCheck } from 'lucide-react';
import { saveEmailTemplates } from '@/app/(protected)/settings/actions';
import { updateFormSettings } from '../actions';

const VARIABLES = [
    { tag: '{{first_name}}', label: 'First Name' },
    { tag: '{{agent_name}}', label: 'Agent Name' },
    { tag: '{{timeline}}', label: 'Move Timeline' },
    { tag: '{{budget_range}}', label: 'Budget' },
    { tag: '{{financing_status}}', label: 'Financing' },
    { tag: '{{preferred_location}}', label: 'Location' },
    { tag: '{{agent_phone}}', label: 'Your Phone' },
    { tag: '{{agent_company}}', label: 'Brokerage' }
];

const DEFAULT_HOT = {
    subject: "Let's schedule your home tour, {{first_name}}",
    body: `Hi {{first_name}},

I saw that you're planning to move soon — that's exciting! I'd love to help you find a property that fits your budget and timeline.

Would you be open to a quick call today or tomorrow to schedule a private tour?

Best,
{{agent_name}}`
};

const DEFAULT_WARM = {
    subject: "Helping you plan your property search, {{first_name}}",
    body: `Hi {{first_name}},

Thanks for sharing your property search details. I'd be happy to walk you through some great available options and answer any questions.

What matters most to you in your next property?

Best,
{{agent_name}}`
};

const DEFAULT_COLD = {
    subject: "Helpful resources for your property search, {{first_name}}",
    body: `Hi {{first_name}},

Thanks for reaching out. Finding the right property can take time, and I'm here whenever you're ready.

If you'd like, I can send some helpful local market resources to guide your search.

Best,
{{agent_name}}`
};

interface TemplateCardProps {
    tier: 'hot' | 'warm' | 'cold';
    subject: string;
    body: string;
    onSubjectChange: (v: string) => void;
    onBodyChange: (v: string) => void;
}

function TemplateCard({ tier, subject, body, onSubjectChange, onBodyChange }: TemplateCardProps) {
    const [open, setOpen] = useState(tier === 'hot');
    const [preview, setPreview] = useState(false);

    const config = {
        hot: { icon: Flame, label: 'Hot Lead Auto-Response', score: 'Score ≥ 80', color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', border: 'border-l-rose-500', desc: 'Dispatched immediately when AI detects cash buyer, pre-approved, or urgent timeline.' },
        warm: { icon: Thermometer, label: 'Warm Lead Auto-Response', score: 'Score 50–79', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', border: 'border-l-amber-400', desc: 'Dispatched for active buyers looking in 3-6 months needing discovery assistance.' },
        cold: { icon: Snowflake, label: 'Cold Lead Auto-Response', score: 'Score < 50', color: 'text-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-200', border: 'border-l-blue-400', desc: 'Nurture sequence with helpful resources for passive browsers.' },
    }[tier];

    const Icon = config.icon;

    const previewText = (text: string) => text
        .replace(/{{first_name}}/g, 'Sarah')
        .replace(/{{agent_name}}/g, 'Alex Rivera')
        .replace(/{{timeline}}/g, 'ASAP (30 days)')
        .replace(/{{budget_range}}/g, '₦150M – ₦300M')
        .replace(/{{financing_status}}/g, 'Cash Buyer')
        .replace(/{{preferred_location}}/g, 'Victoria Island / Lekki Phase 1')
        .replace(/{{agent_phone}}/g, '+234 800 123 4567')
        .replace(/{{agent_company}}/g, 'Formative Luxury Properties');

    const insertVar = (area: 'subject' | 'body', variable: string) => {
        if (area === 'subject') onSubjectChange(subject + variable);
        else onBodyChange(body + variable);
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 border-l-4 ${config.border} overflow-hidden`}>
            {/* Header */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/70 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${config.bg} ring-1 ${config.ring} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{config.label}</p>
                        <p className="text-xs text-slate-400">{config.score} • {config.desc}</p>
                    </div>
                </div>
                {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {open && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                    {/* Variable chips */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-xs text-slate-400 font-bold self-center mr-1">Insert Variable:</span>
                        {VARIABLES.map(v => (
                            <button
                                key={v.tag}
                                type="button"
                                onClick={() => insertVar('body', v.tag)}
                                className="text-xs bg-[#853953]/10 text-[#853953] ring-1 ring-[#853953]/20 px-2.5 py-1 rounded-lg font-mono hover:bg-[#853953]/20 transition-colors"
                            >
                                {v.label} ({v.tag})
                            </button>
                        ))}
                    </div>

                    {/* Subject Line */}
                    <div className="mb-4">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-1.5">Email Subject Line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => onSubjectChange(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953] outline-none font-semibold text-slate-900"
                            placeholder="Enter email subject..."
                        />
                    </div>

                    {/* Email Body */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Message Body</label>
                            <button
                                type="button"
                                onClick={() => setPreview(!preview)}
                                className="flex items-center gap-1.5 text-xs font-bold text-[#853953] hover:text-[#612D53] transition-colors"
                            >
                                {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {preview ? 'Edit Template' : 'Live Sample Preview'}
                            </button>
                        </div>
                        {preview ? (
                            <div className="w-full px-5 py-4 text-sm border border-slate-200 rounded-xl bg-slate-50 whitespace-pre-wrap text-slate-800 min-h-[160px] font-sans leading-relaxed shadow-inner">
                                {previewText(body)}
                            </div>
                        ) : (
                            <textarea
                                value={body}
                                onChange={e => onBodyChange(e.target.value)}
                                rows={7}
                                className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953] outline-none resize-y font-mono leading-relaxed text-slate-800"
                                placeholder="Write your personalized email template..."
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

interface LeadCaptureEmailTemplatesProps {
    formId: string;
    autoSendFirstMessage: boolean;
    initialAgentProfile: any;
}

export function LeadCaptureEmailTemplates({
    formId,
    autoSendFirstMessage: initialAutoSend,
    initialAgentProfile
}: LeadCaptureEmailTemplatesProps) {
    const [autoSend, setAutoSend] = useState(initialAutoSend);
    const [fromName, setFromName] = useState(initialAgentProfile?.emailFromName || '');
    const [hotSubject, setHotSubject] = useState(initialAgentProfile?.emailTemplateHotSubject || DEFAULT_HOT.subject);
    const [hotBody, setHotBody] = useState(initialAgentProfile?.emailTemplateHotBody || DEFAULT_HOT.body);
    const [warmSubject, setWarmSubject] = useState(initialAgentProfile?.emailTemplateWarmSubject || DEFAULT_WARM.subject);
    const [warmBody, setWarmBody] = useState(initialAgentProfile?.emailTemplateWarmBody || DEFAULT_WARM.body);
    const [coldSubject, setColdSubject] = useState(initialAgentProfile?.emailTemplateColdSubject || DEFAULT_COLD.subject);
    const [coldBody, setColdBody] = useState(initialAgentProfile?.emailTemplateColdBody || DEFAULT_COLD.body);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save templates on AgentProfile
            await saveEmailTemplates({
                fromName,
                hotSubject, hotBody,
                warmSubject, warmBody,
                coldSubject, coldBody
            });

            // 2. Save autoSendFirstMessage on Form
            const fd = new FormData();
            fd.append('formId', formId);
            if (autoSend) {
                fd.append('autoSendFirstMessage', 'on');
            }
            await updateFormSettings(fd);

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save email settings', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Auto-Send Master Toggle Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#853953]/10 via-white to-slate-50 p-6 rounded-2xl border border-[#853953]/20 shadow-xs gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#853953]" />
                        <h4 className="text-base font-black text-slate-900">
                            Automatic AI Response Dispatch
                        </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl font-medium">
                        When enabled, newly submitted form inquiries are scored immediately by AI (Hot, Warm, or Cold) and the corresponding customized email is automatically sent through your connected Gmail account.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAutoSend(!autoSend)}
                    className={`${autoSend ? 'bg-[#853953]' : 'bg-slate-300'} relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#853953] focus:ring-offset-2`}
                    role="switch"
                    aria-checked={autoSend}
                >
                    <span
                        aria-hidden="true"
                        className={`${autoSend ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>

            {/* Sender Name */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-6 py-5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Sender Name (Appears in Lead's Inbox)
                </label>
                <p className="text-xs text-slate-500 mb-3">This displays as the "From" sender name when emails are dispatched.</p>
                <input
                    type="text"
                    value={fromName}
                    onChange={e => setFromName(e.target.value)}
                    placeholder="e.g. John Doe — Formative Realty"
                    className="w-full max-w-lg px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953] outline-none font-semibold text-slate-900"
                />
            </div>

            {/* 3 Tier Template Cards */}
            <div className="space-y-4">
                <TemplateCard tier="hot" subject={hotSubject} body={hotBody} onSubjectChange={setHotSubject} onBodyChange={setHotBody} />
                <TemplateCard tier="warm" subject={warmSubject} body={warmBody} onSubjectChange={setWarmSubject} onBodyChange={setWarmBody} />
                <TemplateCard tier="cold" subject={coldSubject} body={coldBody} onSubjectChange={setColdSubject} onBodyChange={setColdBody} />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Templates are saved automatically to your agent profile</span>
                </p>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary py-3 px-8 text-xs font-black flex items-center gap-2 shadow-md disabled:opacity-60"
                >
                    {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving Templates...</>
                    ) : saved ? (
                        <><CheckCircle2 className="w-4 h-4" /> Templates & Auto-Send Saved!</>
                    ) : (
                        <><Save className="w-4 h-4" /> Save Email Templates & Settings</>
                    )}
                </button>
            </div>
        </div>
    );
}
