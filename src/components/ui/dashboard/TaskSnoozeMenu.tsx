'use client';
import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, Calendar } from 'lucide-react';

type SnoozeOption = { label: string; days?: number; custom?: boolean };
const SNOOZE_OPTIONS: SnoozeOption[] = [
    { label: 'Tomorrow', days: 1 },
    { label: 'In 3 Days', days: 3 },
    { label: 'Next Week', days: 7 },
    { label: 'Pick Date', custom: true },
];

export default function TaskSnoozeMenu({ taskId, onSnoozed }: { taskId: string; onSnoozed: () => void }) {
    const [open, setOpen] = useState(false);
    const [customDate, setCustomDate] = useState('');
    const [showCustom, setShowCustom] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const snooze = async (date: Date) => {
        await fetch(`/api/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dueDate: date.toISOString(), status: 'pending' })
        });
        setOpen(false);
        setShowCustom(false);
        onSnoozed();
    };

    const handleOption = (opt: SnoozeOption) => {
        if (opt.custom) { setShowCustom(true); return; }
        const d = new Date();
        d.setDate(d.getDate() + (opt.days || 1));
        snooze(d);
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#853953] hover:bg-[#853953]/5 px-2 py-1 rounded-lg transition-colors">
                <Clock className="w-3.5 h-3.5" /> Snooze <ChevronDown className="w-3 h-3" />
            </button>
            {open && (
                <div className="absolute bottom-full mb-1 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-44 overflow-hidden">
                    {!showCustom ? (
                        <>
                            <div className="px-3 py-2 border-b border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Snooze until...</p>
                            </div>
                            {SNOOZE_OPTIONS.map(opt => (
                                <button key={opt.label} onClick={() => handleOption(opt)}
                                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#853953] transition-colors flex items-center gap-2">
                                    {opt.custom ? <Calendar className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                    {opt.label}
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="p-3 space-y-2">
                            <p className="text-xs font-bold text-slate-600">Pick a date</p>
                            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#853953]/20" />
                            <div className="flex gap-2">
                                <button onClick={() => setShowCustom(false)} className="flex-1 text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">Back</button>
                                <button onClick={() => customDate && snooze(new Date(customDate))} disabled={!customDate}
                                    className="flex-1 text-xs font-bold bg-[#853953] hover:bg-[#853953]/90 text-white py-1.5 rounded-lg disabled:opacity-50 transition-colors">Set</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
