'use client';

import { useState } from 'react';
import { Flame, Thermometer, Snowflake, Save, ChevronDown, ChevronUp, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { saveEmailTemplates } from '@/app/(protected)/settings/actions';

const VARIABLES = ['{{first_name}}', '{{agent_name}}', '{{timeline}}', '{{budget_range}}', '{{financing_status}}', '{{preferred_location}}'];

const DEFAULT_HOT = {
    subject: "Let's schedule your home tour, {{first_name}}",
    body: `Hi {{first_name}},

I saw that you're planning to move soon — that's exciting! I'd love to help you find a home that fits your budget and timeline.

Would you be open to a quick call today or tomorrow to schedule a showing?

Best,
{{agent_name}}`
};

const DEFAULT_WARM = {
    subject: "Helping you plan your next move, {{first_name}}",
    body: `Hi {{first_name}},

Thanks for sharing your home search details. I'd be happy to walk you through some great options and answer any questions.

What matters most to you when looking at homes?

Best,
{{agent_name}}`
};

const DEFAULT_COLD = {
    subject: "Helpful resources for your home search, {{first_name}}",
    body: `Hi {{first_name}},

Thanks for reaching out. Buying a home can take time, and I'm here whenever you're ready.

If you'd like, I can send some helpful resources to guide you through the process.

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
        hot: { icon: Flame, label: 'Hot Lead', score: '≥ 80', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200', border: 'border-l-red-500' },
        warm: { icon: Thermometer, label: 'Warm Lead', score: '50–79', color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200', border: 'border-l-orange-400' },
        cold: { icon: Snowflake, label: 'Cold Lead', score: '< 50', color: 'text-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-200', border: 'border-l-blue-400' },
    }[tier];

    const Icon = config.icon;

    const previewText = (text: string) => text
        .replace(/{{first_name}}/g, 'Sarah')
        .replace(/{{agent_name}}/g, 'John Smith')
        .replace(/{{timeline}}/g, '1-3 months')
        .replace(/{{budget_range}}/g, '$400k–$600k')
        .replace(/{{financing_status}}/g, 'Pre-approved')
        .replace(/{{preferred_location}}/g, 'Lekki');

    const insertVar = (area: 'subject' | 'body', variable: string) => {
        if (area === 'subject') onSubjectChange(subject + variable);
        else onBodyChange(body + variable);
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 border-l-4 ${config.border} overflow-hidden`}>
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${config.bg} ring-1 ${config.ring} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{config.label} Template</p>
                        <p className="text-xs text-slate-400">Score {config.score}</p>
                    </div>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {open && (
                <div className="px-5 pb-5 border-t border-slate-100">
                    {/* Variable chips */}
                    <div className="flex flex-wrap gap-1.5 mt-4 mb-3">
                        <span className="text-xs text-slate-500 font-medium self-center mr-1">Insert:</span>
                        {VARIABLES.map(v => (
                            <button
                                key={v}
                                onClick={() => insertVar('body', v)}
                                className="text-xs bg-[#853953]/10 text-[#853953] ring-1 ring-[#853953]/20 px-2 py-0.5 rounded-full font-mono hover:bg-[#853953]/20 transition-colors"
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Subject */}
                    <div className="mb-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={e => onSubjectChange(e.target.value)}
                            className="mt-1.5 w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953]/30 outline-none"
                            placeholder="Enter email subject..."
                        />
                    </div>

                    {/* Body */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Body</label>
                            <button
                                onClick={() => setPreview(!preview)}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {preview ? 'Edit' : 'Preview'}
                            </button>
                        </div>
                        {preview ? (
                            <div className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 whitespace-pre-wrap text-slate-700 min-h-[140px] font-sans leading-relaxed">
                                {previewText(body)}
                            </div>
                        ) : (
                            <textarea
                                value={body}
                                onChange={e => onBodyChange(e.target.value)}
                                rows={7}
                                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953]/30 outline-none resize-y font-mono leading-relaxed"
                                placeholder="Write your email..."
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EmailTemplatesEditor({ initialTemplates }: { initialTemplates: any }) {
    const [fromName, setFromName] = useState(initialTemplates?.emailFromName || '');
    const [hotSubject, setHotSubject] = useState(initialTemplates?.emailTemplateHotSubject || DEFAULT_HOT.subject);
    const [hotBody, setHotBody] = useState(initialTemplates?.emailTemplateHotBody || DEFAULT_HOT.body);
    const [warmSubject, setWarmSubject] = useState(initialTemplates?.emailTemplateWarmSubject || DEFAULT_WARM.subject);
    const [warmBody, setWarmBody] = useState(initialTemplates?.emailTemplateWarmBody || DEFAULT_WARM.body);
    const [coldSubject, setColdSubject] = useState(initialTemplates?.emailTemplateColdSubject || DEFAULT_COLD.subject);
    const [coldBody, setColdBody] = useState(initialTemplates?.emailTemplateColdBody || DEFAULT_COLD.body);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await saveEmailTemplates({
                fromName,
                hotSubject, hotBody,
                warmSubject, warmBody,
                coldSubject, coldBody
            });
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* From Name */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 px-5 py-4">
                <label className="block text-sm font-bold text-slate-900 mb-1">Sender Name</label>
                <p className="text-xs text-slate-500 mb-2">This appears as the "From" name in the recipient's inbox.</p>
                <input
                    type="text"
                    value={fromName}
                    onChange={e => setFromName(e.target.value)}
                    placeholder="e.g. John Smith — Formative Realty"
                    className="w-full max-w-md px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#853953]/20 focus:border-[#853953]/30 outline-none"
                />
            </div>

            {/* Template Cards */}
            <TemplateCard tier="hot" subject={hotSubject} body={hotBody} onSubjectChange={setHotSubject} onBodyChange={setHotBody} />
            <TemplateCard tier="warm" subject={warmSubject} body={warmBody} onSubjectChange={setWarmSubject} onBodyChange={setWarmBody} />
            <TemplateCard tier="cold" subject={coldSubject} body={coldBody} onSubjectChange={setColdSubject} onBodyChange={setColdBody} />

            {/* Save Button */}
            <div className="flex justify-end pt-2">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#853953] hover:bg-[#612D53] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-60"
                >
                    {isSaving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : saved ? (
                        <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                    ) : (
                        <><Save className="w-4 h-4" /> Save All Templates</>
                    )}
                </button>
            </div>
        </div>
    );
}
