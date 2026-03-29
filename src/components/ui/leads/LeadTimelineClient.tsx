'use client';

import { useState, useEffect } from 'react';
import { FileText, Mail, Phone, Star, Calendar, Home, ArrowRight, PenLine, Send, Loader2 } from 'lucide-react';

interface TimelineEvent {
    id: string;
    type: string;
    timestamp: string;
    actor: string;
    summary: string;
    metadata?: Record<string, any>;
}

function formatTime(ts: string) {
    return new Date(ts).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

const eventConfig: Record<string, { icon: string; label: string; color: string }> = {
    lead_created:       { icon: '⭐', label: 'Lead Created',       color: 'bg-indigo-100 text-indigo-700' },
    email_sent:         { icon: '📧', label: 'Email Sent',         color: 'bg-purple-100 text-purple-700' },
    email_sent_manual:  { icon: '📨', label: 'Manual Email',       color: 'bg-violet-100 text-violet-700' },
    call_logged:        { icon: '📞', label: 'Call Logged',        color: 'bg-blue-100 text-blue-700' },
    note_added:         { icon: '📝', label: 'Note Added',         color: 'bg-slate-100 text-slate-700' },
    task_created:       { icon: '📋', label: 'Task Created',       color: 'bg-amber-100 text-amber-700' },
    status_changed:     { icon: '🔄', label: 'Status Changed',     color: 'bg-teal-100 text-teal-700' },
    lead_assigned:      { icon: '👤', label: 'Lead Assigned',      color: 'bg-green-100 text-green-700' },
    score_updated:      { icon: '🎯', label: 'Score Updated',      color: 'bg-rose-100 text-rose-700' },
    property_pitched:   { icon: '🏠', label: 'Property Pitch Sent', color: 'bg-amber-100 text-amber-700' },
};

export default function LeadTimelineClient({ leadId }: { leadId: string }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [noteText, setNoteText] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    const fetchTimeline = async () => {
        const res = await fetch(`/api/leads/${leadId}/timeline`);
        if (res.ok) {
            const data = await res.json();
            setEvents(data.events || []);
        }
        setLoading(false);
    };

    useEffect(() => { fetchTimeline(); }, [leadId]);

    const addNote = async () => {
        if (!noteText.trim()) return;
        setSavingNote(true);
        await fetch(`/api/leads/${leadId}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: noteText.trim() })
        });
        setNoteText('');
        setSavingNote(false);
        fetchTimeline();
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Note Composer */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <PenLine className="w-3.5 h-3.5" /> Add Note
                </p>
                <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    placeholder="Write a note about this lead..."
                    rows={3}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400 resize-none text-slate-700 placeholder-slate-400"
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={addNote}
                        disabled={!noteText.trim() || savingNote}
                        className="flex items-center gap-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Save Note
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />

                <div className="space-y-4">
                    {events.length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-sm">
                            No activity yet. Interactions will appear here as they happen.
                        </div>
                    )}
                    {[...events].reverse().map(event => {
                        const config = eventConfig[event.type] || { icon: '•', label: event.type, color: 'bg-slate-100 text-slate-600' };
                        return (
                            <div key={event.id} className="flex items-start gap-4 pl-0">
                                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${config.color} border border-white shadow-sm`}>
                                    {config.icon}
                                </div>
                                <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{config.label}</p>
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{event.summary}</p>
                                            {event.metadata?.outcome && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Outcome: <span className="font-bold capitalize">{event.metadata.outcome.replace(/_/g, ' ')}</span>
                                                    {event.metadata.nextStep && ` • Next: ${event.metadata.nextStep.replace(/_/g, ' ')}`}
                                                </p>
                                            )}
                                            {event.metadata?.opened !== undefined && event.type === 'email_sent' && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${event.metadata.opened ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {event.metadata.opened ? '✓ Opened' : 'Not opened'}
                                                    </span>
                                                    {event.metadata.replied && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">✓ Replied</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-[10px] text-slate-400 whitespace-nowrap">{formatTime(event.timestamp)}</p>
                                            <p className="text-[10px] text-slate-300 mt-0.5 capitalize">{event.actor}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
