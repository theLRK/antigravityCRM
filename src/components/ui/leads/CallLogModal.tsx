'use client';

import { useState } from 'react';
import { X, PhoneCall, CheckCircle, Loader2, PhoneMissed, PhoneForwarded } from 'lucide-react';

interface CallLogModalProps {
    leadId: string;
    leadName: string;
    leadPhone?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const OUTCOMES = [
    { id: 'spoke_to_lead', label: 'Spoke to Lead', icon: <CheckCircle className="w-4 h-4" />, color: 'border-green-400 bg-green-50 text-green-700' },
    { id: 'no_answer', label: 'No Answer', icon: <PhoneMissed className="w-4 h-4" />, color: 'border-amber-400 bg-amber-50 text-amber-700' },
    { id: 'left_voicemail', label: 'Left Voicemail', icon: <PhoneForwarded className="w-4 h-4" />, color: 'border-blue-400 bg-blue-50 text-blue-700' },
];

const NEXT_STEPS = [
    { id: 'follow_up', label: 'Follow Up' },
    { id: 'send_email', label: 'Send Email' },
    { id: 'schedule_viewing', label: 'Schedule Viewing' },
    { id: 'mark_closed', label: 'Mark as Closed' },
];

export default function CallLogModal({ leadId, leadName, leadPhone, onClose, onSuccess }: CallLogModalProps) {
    const [outcome, setOutcome] = useState('');
    const [notes, setNotes] = useState('');
    const [nextStep, setNextStep] = useState('follow_up');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        if (!outcome) return;
        setLoading(true);
        try {
            const res = await fetch('/api/call-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, outcome, notes, nextStep })
            });
            
            if (res.ok) {
                setSaved(true);
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 1200);
            }
        } catch (e) {
            console.error('Failed to save call log', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <PhoneCall className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold tracking-tight">Log Call</h2>
                                <p className="text-green-100 text-sm">{leadName}{leadPhone ? ` · ${leadPhone}` : ''}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Outcome */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                            Call Outcome <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {OUTCOMES.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setOutcome(opt.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                        outcome === opt.id ? opt.color + ' shadow-sm scale-[1.01]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {opt.icon} {opt.label}
                                    {outcome === opt.id && <span className="ml-auto text-xs">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Next Step */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                            Next Step
                        </label>
                        <select
                            value={nextStep}
                            onChange={e => setNextStep(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            {NEXT_STEPS.map(step => (
                                <option key={step.id} value={step.id}>{step.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                            Notes <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="What did you discuss? Any key details..."
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!outcome || loading || saved}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold transition-all
                                ${saved ? 'bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {saved ? (
                                <><CheckCircle className="w-4 h-4" /> Saved!</>
                            ) : loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                'Save Call Log'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
