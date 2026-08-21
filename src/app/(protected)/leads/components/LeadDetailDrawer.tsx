'use client';

import { useState, useEffect } from 'react';
import { 
    X, Phone, Mail, Clock, ShieldCheck, Activity,
    BrainCircuit, MessageSquare, Plus, CheckCircle2, Trash2, 
    AlertTriangle, Send, MailOpen, Link as LinkIcon, ChevronDown, 
    ChevronUp, Zap, Home, Calendar, Search, Sparkles, Loader2,
    PhoneCall, PhoneForwarded, PhoneMissed, PhoneOff, UserCheck, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadTimelineClient from '@/components/ui/leads/LeadTimelineClient';
import RecommendedPropertiesTab from '@/components/ui/leads/RecommendedPropertiesTab';
import LeadTasksList from './LeadTasksList';
import toast from 'react-hot-toast';
import { usePresenterMode } from '@/components/ui/PresenterModeContext';

interface NoteItem {
    id: string;
    content: string;
    createdAt: string;
    agentId?: string;
}

interface BriefingData {
    sentimentTag: string;
    keyPriorities: string[];
    lastInteractionHighlights: string[];
    recommendedNextStep: string;
}

export function LeadDetailDrawer({ 
    lead, 
    onClose, 
    onStatusChange, 
    onDelete 
}: { 
    lead: any, 
    onClose: () => void, 
    onStatusChange: (id: string, stage: string) => void, 
    onDelete: (id: string) => void 
}) {
    const { isPresenterMode } = usePresenterMode();
    const [noteText, setNoteText] = useState('');
    const [selectedCallOutcome, setSelectedCallOutcome] = useState<'spoke_to_lead' | 'not_interested' | 'left_voicemail' | 'no_answer' | 'callback_requested'>('spoke_to_lead');
    const [callbackDate, setCallbackDate] = useState('');
    const [callbackTime, setCallbackTime] = useState('');
    const [showStageSuggestion, setShowStageSuggestion] = useState(false);
    
    const [deleteStep, setDeleteStep] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'calls_notes' | 'tasks' | 'properties' | 'timeline' | 'conversation'>('overview');
    
    // Notes list state
    const [notesList, setNotesList] = useState<NoteItem[]>(lead.notes || []);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

    // AI Executive Briefing State
    const [briefing, setBriefing] = useState<BriefingData | null>(null);
    const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
    const [showBriefingModal, setShowBriefingModal] = useState(false);

    // Follow up & task state
    const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '');
    const [isSaving, setIsSaving] = useState(false);
    const [newTask, setNewTask] = useState({ taskType: 'Call', dueDate: '', dueTime: '', notes: '' });
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);

    const scoreObj = lead.scores?.[0];
    const reasoning = scoreObj?.reasoningBreakdowns?.[0];

    // Load fresh notes on mount / tab switch
    const fetchNotes = async () => {
        setIsLoadingNotes(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}/notes`);
            if (res.ok) {
                const data = await res.json();
                setNotesList(data);
            }
        } catch (err) {
            console.error('Error fetching notes:', err);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [lead.id]);

    // Fetch AI Executive Briefing
    const handleFetchBriefing = async () => {
        setShowBriefingModal(true);
        if (briefing) return; // already loaded
        setIsLoadingBriefing(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}/briefing`);
            if (res.ok) {
                const data = await res.json();
                setBriefing(data.briefing);
            } else {
                toast.error('Failed to generate AI briefing.');
            }
        } catch (err) {
            console.error('Briefing error:', err);
            toast.error('Error loading AI briefing.');
        } finally {
            setIsLoadingBriefing(false);
        }
    };

    // Calculate time to first contact
    const calculateTimeToContact = () => {
        const createEvent = lead.activityLogs?.find((a: any) => a.eventType === 'lead.created');
        const contactEvent = lead.activityLogs?.find((a: any) => a.eventType === 'status.changed' && a.metadata?.includes('contacted'));

        if (createEvent && contactEvent) {
            const diffMs = new Date(contactEvent.occurredAt).getTime() - new Date(createEvent.occurredAt).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${diffMins} mins`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hrs`;
            return `${Math.floor(diffHours / 24)} days`;
        }
        return 'Not contacted yet';
    };

    const handleUpdateFollowUp = async (date: string) => {
        setFollowUpDate(date);
        setIsSaving(true);
        try {
            const { updateLead } = await import('../actions');
            await updateLead(lead.id, { followUpDate: date || null });
            toast.success('Follow up date updated');
        } catch (e) {
            console.error(e);
            toast.error('Failed to update follow up');
        } finally {
            setIsSaving(false);
        }
    };

    // Smart Call Logger
    const handleLogCall = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/leads/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    leadId: lead.id, 
                    outcome: selectedCallOutcome, 
                    notes: noteText 
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success('Call interaction & note logged!');
                setNoteText('');
                
                // If callback scheduled with date/time, create task too
                if (selectedCallOutcome === 'callback_requested' && callbackDate) {
                    const dueCombined = callbackTime ? `${callbackDate}T${callbackTime}:00` : new Date(callbackDate).toISOString();
                    await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            leadId: lead.id,
                            title: `Callback with ${lead.firstName} ${lead.lastName}`,
                            taskType: 'Call',
                            dueDate: new Date(dueCombined).toISOString(),
                            notes: noteText || 'Scheduled callback requested by lead.'
                        })
                    });
                    toast.success('Callback task scheduled on calendar!');
                    setCallbackDate('');
                    setCallbackTime('');
                }

                // If marked as not interested, prompt stage suggestion
                if (selectedCallOutcome === 'not_interested') {
                    setShowStageSuggestion(true);
                }

                // Refresh notes and invalidate briefing cache
                setBriefing(null);
                fetchNotes();
            } else {
                toast.error('Failed to log call.');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred logging the call.');
        } finally {
            setIsSaving(false);
        }
    };

    // Add Standalone Note
    const handleAddStandaloneNote = async () => {
        if (!noteText.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: noteText.trim() })
            });

            if (res.ok) {
                toast.success('Note saved and AI Lead re-evaluated!');
                setNoteText('');
                setBriefing(null);
                fetchNotes();
            } else {
                toast.error('Failed to save note.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error saving note.');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete Note
    const handleDeleteNote = async (noteId: string) => {
        setDeletingNoteId(noteId);
        try {
            const res = await fetch(`/api/leads/${lead.id}/notes?noteId=${noteId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setNotesList(prev => prev.filter(n => n.id !== noteId));
                setBriefing(null);
                toast.success('Note deleted. AI score recalibrated.');
            } else {
                toast.error('Failed to delete note.');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error deleting note.');
        } finally {
            setDeletingNoteId(null);
        }
    };

    // Create Task
    const handleCreateTask = async () => {
        if (!newTask.taskType || !newTask.dueDate) return;
        setIsCreatingTask(true);
        try {
            const title = `${newTask.taskType} with ${lead.firstName}`;
            const dueCombined = newTask.dueTime ? `${newTask.dueDate}T${newTask.dueTime}:00` : new Date(newTask.dueDate).toISOString();
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: lead.id,
                    title,
                    taskType: newTask.taskType,
                    dueDate: new Date(dueCombined).toISOString(),
                    notes: newTask.notes
                })
            });
            if (res.ok) {
                setNewTask({ taskType: 'Call', dueDate: '', dueTime: '', notes: '' });
                setCreationSuccess(true);
                toast.success(`Task "${title}" created!`);
                setTimeout(() => setCreationSuccess(false), 3000);
            } else {
                toast.error('Failed to create task.');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred while creating the task.');
        } finally {
            setIsCreatingTask(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-200">

                {/* ── Top Header ────────────────────────────────────────────── */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-4 border-b border-slate-200 z-30 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-[#853953]/20">
                                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                                    {lead.firstName} {lead.lastName}
                                    {scoreObj?.finalScore !== undefined && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="bg-[#853953]/10 text-[#853953] font-black px-2.5 py-0.5 rounded-full border border-[#853953]/20">
                                                Score: {scoreObj.finalScore}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] tracking-wider uppercase font-black ${
                                                scoreObj.finalScore >= 80 ? 'bg-red-100 border-red-200 text-red-700' :
                                                scoreObj.finalScore >= 50 ? 'bg-orange-100 border-orange-200 text-orange-700' :
                                                'bg-slate-100 border-slate-200 text-slate-700'
                                            }`}>
                                                {scoreObj.finalScore >= 80 ? 'HOT' : scoreObj.finalScore >= 50 ? 'WARM' : 'COLD'}
                                            </span>
                                        </div>
                                    )}
                                </h2>
                                <div className="text-sm text-slate-500 flex items-center gap-4 mt-1 font-medium">
                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-[#853953] transition-colors">
                                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {lead.phone || 'No phone'}
                                    </a>
                                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-[#853953] transition-colors">
                                        <Mail className="w-3.5 h-3.5 text-blue-600" /> {lead.email}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={lead.pipelineStage}
                                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border-none text-slate-800 py-1.5 pl-3 pr-8 rounded-full focus:ring-2 focus:ring-[#853953] appearance-none shadow-sm cursor-pointer transition-all"
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="booked_showing">Booked Showing</option>
                                <option value="closed">Closed / Won</option>
                                <option value="lost">Closed / Lost</option>
                            </select>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 pb-32 space-y-6 bg-slate-50/50 min-h-screen">

                    {/* ── AI Insight Banner & Executive Briefing Button ─────── */}
                    <div className="bg-gradient-to-r from-[#853953]/10 via-[#853953]/5 to-transparent p-4 rounded-2xl border border-[#853953]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#853953] text-white shadow-md shadow-[#853953]/20 shrink-0">
                                <BrainCircuit className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-[#853953] uppercase tracking-widest">AI Intent Insight</span>
                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                    {scoreObj?.suggestedAction || 'Lead active. Log recent calls and review property matches.'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleFetchBriefing}
                            className="bg-white hover:bg-[#853953] hover:text-white text-[#853953] text-xs font-extrabold px-3.5 py-2 rounded-xl border border-[#853953]/30 shadow-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer group"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#853953] group-hover:text-white transition-colors" />
                            <span>AI Lead Briefing</span>
                        </button>
                    </div>

                    {/* ── AI Briefing Modal / Card ─────────────────────────── */}
                    <AnimatePresence>
                        {showBriefingModal && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white rounded-2xl p-6 border border-[#853953]/20 shadow-md space-y-4 overflow-hidden relative"
                            >
                                <button 
                                    onClick={() => setShowBriefingModal(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-2.5">
                                    <Sparkles className="w-5 h-5 text-[#853953]" />
                                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                        Executive AI Lead Briefing
                                    </h3>
                                    {briefing?.sentimentTag && (
                                        <span className="bg-[#853953]/10 text-[#853953] text-[10px] font-black uppercase px-2 py-0.5 rounded-full ml-auto mr-8">
                                            {briefing.sentimentTag}
                                        </span>
                                    )}
                                </div>

                                {isLoadingBriefing ? (
                                    <div className="flex items-center justify-center py-8 gap-2 text-sm text-[#853953] font-bold">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Synthesizing all call logs, notes, and preferences with Executive AI...
                                    </div>
                                ) : briefing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                                🎯 Key Priorities
                                            </span>
                                            <ul className="text-xs font-semibold text-slate-700 space-y-1">
                                                {briefing.keyPriorities.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-1.5">
                                                        <span className="text-[#853953] font-black">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                                                📞 Last Call Highlights
                                            </span>
                                            <ul className="text-xs font-semibold text-slate-700 space-y-1">
                                                {briefing.lastInteractionHighlights.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-1.5">
                                                        <span className="text-[#853953] font-black">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-[#853953]/5 p-3.5 rounded-xl border border-[#853953]/15">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-[#853953] block mb-1.5">
                                                💡 Recommended Next Move
                                            </span>
                                            <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                                {briefing.recommendedNextStep}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Smart Stage Suggestion Banner (When marked not interested) ── */}
                    <AnimatePresence>
                        {showStageSuggestion && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                            >
                                <div>
                                    <strong className="text-xs font-black text-rose-800 uppercase tracking-wider block">
                                        ⚠️ Call marked as "Not Interested / On Hold"
                                    </strong>
                                    <p className="text-xs font-medium text-rose-700 mt-0.5">
                                        Would you like to update the pipeline stage for this lead?
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => {
                                            onStatusChange(lead.id, 'lost');
                                            setShowStageSuggestion(false);
                                            toast.success('Stage updated to Closed / Lost');
                                        }}
                                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                                    >
                                        Move to Lost
                                    </button>
                                    <button
                                        onClick={() => {
                                            onStatusChange(lead.id, 'contacted');
                                            setShowStageSuggestion(false);
                                            toast.success('Stage set to Long-Term Nurture');
                                        }}
                                        className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                                    >
                                        Keep in Nurture
                                    </button>
                                    <button
                                        onClick={() => setShowStageSuggestion(false)}
                                        className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Quick Action Ribbon (Clean 5 Actions) ─────────────── */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            <button
                                onClick={() => setActiveTab('calls_notes')}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all shadow-sm cursor-pointer ${
                                    activeTab === 'calls_notes'
                                        ? 'bg-[#853953] text-white border-[#853953] shadow-[#853953]/20 shadow-md'
                                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700'
                                }`}
                            >
                                <Phone className={`w-5 h-5 mb-1.5 ${activeTab === 'calls_notes' ? 'text-white' : 'text-emerald-500'}`} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Log Call</span>
                            </button>

                            <button
                                onClick={() => window.location.href = `mailto:${lead.email}`}
                                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-slate-700 transition-all shadow-sm cursor-pointer"
                            >
                                <Mail className="w-5 h-5 mb-1.5 text-blue-500" />
                                <span className="text-[11px] font-black uppercase tracking-wider">Send Email</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all shadow-sm cursor-pointer ${
                                    activeTab === 'tasks'
                                        ? 'bg-[#853953] text-white border-[#853953] shadow-[#853953]/20 shadow-md'
                                        : 'bg-white border-slate-200 hover:border-[#853953]/30 hover:bg-[#853953]/5 text-slate-700'
                                }`}
                            >
                                <Calendar className={`w-5 h-5 mb-1.5 ${activeTab === 'tasks' ? 'text-white' : 'text-[#853953]'}`} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Create Task</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('calls_notes')}
                                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50/50 hover:border-amber-300 text-slate-700 transition-all shadow-sm cursor-pointer"
                            >
                                <MessageSquare className="w-5 h-5 mb-1.5 text-amber-500" />
                                <span className="text-[11px] font-black uppercase tracking-wider">Add Note</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('properties')}
                                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all shadow-sm cursor-pointer ${
                                    activeTab === 'properties'
                                        ? 'bg-[#853953] text-white border-[#853953] shadow-[#853953]/20 shadow-md'
                                        : 'bg-white border-slate-200 hover:border-[#853953]/30 hover:bg-[#853953]/5 text-slate-700'
                                }`}
                            >
                                <Home className={`w-5 h-5 mb-1.5 ${activeTab === 'properties' ? 'text-white' : 'text-[#853953]'}`} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Matches</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Main Tab Navigation Bar ──────────────────────────── */}
                    <div className="flex items-center gap-6 border-b border-slate-200 pt-2 px-2 overflow-x-auto hide-scrollbar">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'calls_notes', label: 'Call Log & Notes', count: notesList.length },
                            { id: 'properties', label: 'Property Matches', count: lead.propertyMatches?.length },
                            { id: 'tasks', label: 'Tasks' },
                            { id: 'timeline', label: 'Activity Feed' },
                            { id: 'conversation', label: 'Emails', count: lead.emailLogs?.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-3 text-xs font-extrabold uppercase tracking-wider transition-colors relative whitespace-nowrap flex items-center gap-1.5 ${
                                    activeTab === tab.id ? 'text-[#853953]' : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="bg-[#853953]/10 text-[#853953] py-0.5 px-2 rounded-full text-[10px] font-black">
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="drawerTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#853953]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content Panels ───────────────────────────────── */}
                    <div className="pt-2 min-h-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* ── TAB 1: OVERVIEW ─────────────────────────────── */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        {/* AI Score Card */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <BrainCircuit className="w-4 h-4 text-[#853953]" /> AI Intent & Buying Power Evaluation
                                                </h3>
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={async () => {
                                                        setIsSaving(true);
                                                        try {
                                                            const { rescoreLeadAction } = await import('../actions');
                                                            await rescoreLeadAction(lead.id);
                                                            toast.success('AI Lead Score recalculated with latest notes!');
                                                        } catch (e: any) {
                                                            toast.error(e?.message || 'Failed to rescore lead');
                                                        } finally {
                                                            setIsSaving(false);
                                                        }
                                                    }}
                                                    className="text-xs font-bold text-[#853953] bg-[#853953]/5 hover:bg-[#853953]/10 px-3 py-1.5 rounded-xl border border-[#853953]/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    <Zap className="w-3.5 h-3.5" /> Re-Score AI Lead
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                                <div className="text-center px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Score</span>
                                                    <span className="text-3xl font-black text-[#853953]">
                                                        {isPresenterMode ? '•••' : `${scoreObj?.finalScore ?? lead.confidenceScore ?? 50}%`}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                            (scoreObj?.likelihoodLabel || 'Warm') === 'Hot' ? 'bg-red-100 text-red-700' :
                                                            (scoreObj?.likelihoodLabel || 'Warm') === 'Warm' ? 'bg-amber-100 text-amber-800' : 
                                                            'bg-slate-200 text-slate-700'
                                                        }`}>
                                                            {scoreObj?.likelihoodLabel || 'Warm'} Intent
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-medium">
                                                            Confidence: {lead.confidenceLevel || scoreObj?.confidenceLevel || 'High'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium">
                                                        {scoreObj?.suggestedAction || 'Reach out to discuss requirements and preferred locations.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-[#853953]/5 p-3.5 rounded-xl border border-[#853953]/10 mb-4">
                                                <strong className="text-[11px] font-black text-[#853953] uppercase tracking-wider block mb-1">
                                                    Formative AI Analytical Rationale:
                                                </strong>
                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
                                                    &ldquo;{reasoning?.reasoningSummary || reasoning?.llmReasoning || 'Lead intent evaluated dynamically based on form data and logged interactions.'}&rdquo;
                                                </p>
                                            </div>
                                            
                                            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-t border-slate-100 pt-4">
                                                <div>
                                                    <dt className="text-slate-500 text-xs font-medium">Financing Readiness</dt>
                                                    <dd className="text-slate-900 font-bold capitalize mt-0.5">
                                                        {lead.financing?.replace('_', ' ') || 'Unknown'}
                                                    </dd>
                                                </div>
                                                {lead.preApproval && (
                                                    <div>
                                                        <dt className="text-slate-500 text-xs font-medium">Pre-Approval Letter</dt>
                                                        <dd className="text-green-600 font-bold flex items-center gap-1 mt-0.5">
                                                            <ShieldCheck className="w-4 h-4" /> Verified Pre-Approved
                                                        </dd>
                                                    </div>
                                                )}
                                                <div>
                                                    <dt className="text-slate-500 text-xs font-medium">Budget Parameters</dt>
                                                    <dd className="text-slate-900 font-bold mt-0.5">
                                                        {lead.currency || '$'}{lead.budgetMin?.toLocaleString() || '0'} – {lead.budgetMax ? `${lead.currency || '$'}${lead.budgetMax.toLocaleString()}` : 'Any'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500 text-xs font-medium">Move Timeline</dt>
                                                    <dd className="text-slate-900 font-bold mt-0.5">
                                                        {lead.moveTimeline || 'Standard'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500 text-xs font-medium">Target Locations</dt>
                                                    <dd className="text-slate-900 font-bold mt-0.5">
                                                        {lead.preferredAreas || lead.customLocation || 'Flexible / Broad'}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-500 text-xs font-medium">Property Size</dt>
                                                    <dd className="text-slate-900 font-bold mt-0.5">
                                                        {lead.bedroomsMin ? `${lead.bedroomsMin}+ Beds` : 'Any Bedrooms'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* Pipeline Details */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-[#853953]" /> Pipeline & Follow-Up
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 block">Follow Up Date</span>
                                                    <input 
                                                        type="date" 
                                                        value={followUpDate} 
                                                        onChange={(e) => handleUpdateFollowUp(e.target.value)} 
                                                        disabled={isSaving} 
                                                        className={`block w-full mt-1 bg-transparent font-bold border-none p-0 focus:ring-0 text-sm ${
                                                            followUpDate && new Date(followUpDate) < new Date() ? 'text-red-600' : 'text-slate-900'
                                                        }`} 
                                                    />
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 block">First Contact</span>
                                                    <p className="font-bold text-slate-900 mt-1 text-sm">{calculateTimeToContact()}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 block">Source</span>
                                                    <p className="font-bold text-slate-900 mt-1 text-sm">{lead.source || 'Direct'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] uppercase font-black text-slate-400 block">Lead Created</span>
                                                    <p className="font-bold text-slate-900 mt-1 text-sm">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── TAB 2: CALL LOG & NOTES ───────────────────────── */}
                                {activeTab === 'calls_notes' && (
                                    <div className="space-y-6">
                                        {/* Smart Call & Note Logger */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-emerald-500" /> Log Phone Call or Add Note
                                            </h3>

                                            {/* 5 Call Outcome Buttons */}
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
                                                {[
                                                    { id: 'spoke_to_lead', label: 'Spoke to Lead', icon: UserCheck, color: 'text-emerald-600', activeBg: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
                                                    { id: 'not_interested', label: 'Not Interested', icon: PhoneOff, color: 'text-rose-600', activeBg: 'bg-rose-50 border-rose-300 text-rose-800' },
                                                    { id: 'left_voicemail', label: 'Left Voicemail', icon: PhoneForwarded, color: 'text-amber-600', activeBg: 'bg-amber-50 border-amber-300 text-amber-800' },
                                                    { id: 'no_answer', label: 'No Answer', icon: PhoneMissed, color: 'text-slate-500', activeBg: 'bg-slate-100 border-slate-300 text-slate-800' },
                                                    { id: 'callback_requested', label: 'Callback Later', icon: Clock, color: 'text-blue-600', activeBg: 'bg-blue-50 border-blue-300 text-blue-800' },
                                                ].map(opt => {
                                                    const IconComponent = opt.icon;
                                                    const isSelected = selectedCallOutcome === opt.id;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setSelectedCallOutcome(opt.id as any)}
                                                            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                                isSelected 
                                                                    ? `${opt.activeBg} font-black shadow-sm ring-1 ring-current` 
                                                                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600 font-semibold'
                                                            }`}
                                                        >
                                                            <IconComponent className={`w-4 h-4 mb-1 ${opt.color}`} />
                                                            <span className="text-[10px] tracking-tight">{opt.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Extra fields for Callback Requested */}
                                            {selectedCallOutcome === 'callback_requested' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mb-4 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2"
                                                >
                                                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider block">
                                                        Schedule Callback Date & Time:
                                                    </span>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="date"
                                                            value={callbackDate}
                                                            onChange={e => setCallbackDate(e.target.value)}
                                                            className="border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#853953] bg-white"
                                                        />
                                                        <input
                                                            type="time"
                                                            value={callbackTime}
                                                            onChange={e => setCallbackTime(e.target.value)}
                                                            className="border border-blue-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#853953] bg-white"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="space-y-3">
                                                <textarea
                                                    value={noteText}
                                                    onChange={(e) => setNoteText(e.target.value)}
                                                    placeholder={
                                                        selectedCallOutcome === 'spoke_to_lead'
                                                            ? "What was discussed? (e.g. Needs 4-bed in Lekki under $800k, wants private pool, moving in 2 weeks...)"
                                                            : selectedCallOutcome === 'not_interested'
                                                            ? "Why are they not interested? (e.g. Bought elsewhere, lost mortgage, paused search for 6 months...)"
                                                            : "Enter call notes or general remarks..."
                                                    }
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none min-h-[90px] transition-all"
                                                />

                                                <div className="flex items-center justify-between pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddStandaloneNote}
                                                        disabled={isSaving || !noteText.trim()}
                                                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-40"
                                                    >
                                                        Save as Regular Note
                                                    </button>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={handleLogCall}
                                                        disabled={isSaving}
                                                        className="bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-[#853953]/20 flex items-center gap-2 transition-all cursor-pointer"
                                                    >
                                                        {isSaving ? (
                                                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                        ) : (
                                                            <><PhoneCall className="w-4 h-4" /> Save Call & Update AI</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes & Call Logs Timeline List */}
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4 text-amber-500" /> Interaction History & Notes ({notesList.length})
                                                </h3>
                                                {isLoadingNotes && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                            </div>

                                            {notesList.length === 0 ? (
                                                <div className="text-center py-10">
                                                    <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2.5" />
                                                    <p className="text-slate-500 font-semibold text-sm">No notes or call records yet.</p>
                                                    <p className="text-slate-400 text-xs mt-1">Log a call above to start building this lead's profile.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {notesList.map((note) => {
                                                        const isCallNote = note.content.includes('📞') || note.content.includes('[CALL:');
                                                        const isNotInterested = note.content.includes('Not Interested') || note.content.includes('On Hold');
                                                        const isSpoke = note.content.includes('Spoke with Lead') || note.content.includes('Spoke to Lead');
                                                        
                                                        return (
                                                            <div
                                                                key={note.id}
                                                                className={`p-4 rounded-xl border transition-all relative group ${
                                                                    isNotInterested
                                                                        ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                                                                        : isSpoke
                                                                        ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                                                                        : isCallNote
                                                                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                                                                        : 'bg-amber-50/30 border-amber-200/60 hover:border-amber-300'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {isCallNote ? (
                                                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                                                                                isNotInterested 
                                                                                    ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                                                                    : isSpoke 
                                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                            }`}>
                                                                                <Phone className="w-3 h-3" /> Phone Interaction
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                                                                                <MessageSquare className="w-3 h-3" /> Agent Note
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[11px] font-medium text-slate-400">
                                                                            {new Date(note.createdAt).toLocaleString()}
                                                                        </span>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteNote(note.id)}
                                                                        disabled={deletingNoteId === note.id}
                                                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded transition-opacity"
                                                                        title="Delete Note"
                                                                    >
                                                                        {deletingNoteId === note.id ? (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                <p className="text-xs font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                                                                    {note.content.replace(/^📞s*[CALL:s*[^]]+]s*/i, '')}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── TAB 3: PROPERTY MATCHES ───────────────────────── */}
                                {activeTab === 'properties' && (
                                    <RecommendedPropertiesTab 
                                        leadId={lead.id} 
                                        leadEmail={lead.email} 
                                        leadFirstName={lead.firstName} 
                                    />
                                )}

                                {/* ── TAB 4: TASKS ─────────────────────────────────── */}
                                {activeTab === 'tasks' && (
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#853953]" /> Schedule New Follow-up Task
                                            </h3>
                                            <AnimatePresence>
                                                {creationSuccess && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                                        animate={{ opacity: 1, height: 'auto', marginBottom: 12 }} 
                                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                        className="p-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200 flex items-center gap-2 overflow-hidden"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" /> 
                                                        <span className="truncate">Task Scheduled Successfully</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <select
                                                    value={newTask.taskType}
                                                    onChange={e => setNewTask(p => ({ ...p, taskType: e.target.value }))}
                                                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                                >
                                                    {['Call', 'Email', 'Follow up', 'Meeting', 'Viewing', 'Send Pitch'].map(t => (
                                                        <option key={t}>{t}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="date"
                                                        value={newTask.dueDate}
                                                        onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                                                        className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={newTask.dueTime}
                                                        onChange={e => setNewTask(p => ({ ...p, dueTime: e.target.value }))}
                                                        className="w-full border border-slate-200 rounded-xl px-1 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                value={newTask.notes}
                                                onChange={(e) => setNewTask(p => ({ ...p, notes: e.target.value }))}
                                                placeholder="Task objectives or notes (optional)"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#853953] outline-none min-h-[50px] resize-none"
                                                rows={2}
                                            />
                                            <button
                                                onClick={handleCreateTask}
                                                disabled={isCreatingTask || !newTask.dueDate}
                                                className="w-full mt-3 bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
                                            >
                                                {isCreatingTask ? 'Scheduling...' : 'Schedule Task'}
                                            </button>
                                        </div>

                                        <div className="border-t border-slate-100 pt-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                Active & Upcoming Tasks
                                            </h4>
                                            <LeadTasksList leadId={lead.id} />
                                        </div>
                                    </div>
                                )}

                                {/* ── TAB 5: TIMELINE ───────────────────────────────── */}
                                {activeTab === 'timeline' && (
                                    <div className="bg-transparent">
                                        <LeadTimelineClient leadId={lead.id} />
                                    </div>
                                )}

                                {/* ── TAB 6: CONVERSATION / EMAILS ──────────────────── */}
                                {activeTab === 'conversation' && (
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                                        {(!lead.emailLogs || lead.emailLogs.length === 0) ? (
                                            <div className="text-center py-10">
                                                <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-500 font-medium text-sm">No automated or outbound emails dispatched yet.</p>
                                            </div>
                                        ) : (
                                            lead.emailLogs.map((log: any) => (
                                                <div key={log.id} className="flex flex-col gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white transition-colors relative">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-900 text-sm">{log.subjectLine}</span>
                                                                {log.status === 'sent' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#853953] bg-[#853953]/10 px-2 py-0.5 rounded">
                                                                        <CheckCircle2 className="w-3 h-3" /> Sent
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                {new Date(log.sentAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Bottom Permanent Lead Deletion (Subtle) ──────────── */}
                    <div className="flex justify-end pt-8 border-t border-slate-200">
                        {deleteStep === 0 && (
                            <button
                                onClick={() => setDeleteStep(1)}
                                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete Lead
                            </button>
                        )}
                        {deleteStep === 1 && (
                            <div className="flex items-center gap-3 bg-red-50 pr-2 py-1 pl-4 rounded-lg border border-red-200 shadow-sm animate-in slide-in-from-right-2">
                                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Are you sure?
                                </span>
                                <button
                                    onClick={() => setDeleteStep(2)}
                                    className="bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold px-3 py-1 rounded transition-colors"
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setDeleteStep(0)}
                                    className="text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-1 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {deleteStep === 2 && (
                            <div className="flex items-center gap-3 bg-red-100 pr-2 py-1 pl-4 rounded-lg border border-red-300 shadow-sm animate-in pulse">
                                <span className="text-xs font-black text-red-800 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Click to permanently delete
                                </span>
                                <button
                                    onClick={() => onDelete(lead.id)}
                                    className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold px-3 py-1 rounded shadow-sm transition-colors"
                                >
                                    Confirm Delete
                                </button>
                                <button
                                    onClick={() => setDeleteStep(0)}
                                    className="text-red-700 hover:text-red-900 text-xs font-bold px-3 py-1 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
