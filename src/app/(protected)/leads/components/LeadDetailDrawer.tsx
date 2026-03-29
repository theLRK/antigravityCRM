'use client';

import { useState } from 'react';
import { X, Phone, Mail, Clock, ShieldCheck, Activity,
    BrainCircuit, Calculator, MessageSquare, Plus, CheckCircle2, Trash2, AlertTriangle, Send, MailOpen, Link as LinkIcon, ChevronDown, ChevronUp, Zap, Home, Calendar, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadTimelineClient from '@/components/ui/leads/LeadTimelineClient';
import RecommendedPropertiesTab from '@/components/ui/leads/RecommendedPropertiesTab';
import LeadTasksList from './LeadTasksList';

export function LeadDetailDrawer({ lead, onClose, onStatusChange, onDelete }: { lead: any, onClose: () => void, onStatusChange: (id: string, stage: string) => void, onDelete: (id: string) => void }) {
    const [noteText, setNoteText] = useState('');
    const [deleteStep, setDeleteStep] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tasks' | 'notes' | 'conversation' | 'properties'>('overview');
    const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
    const scoreObj = lead.scores?.[0];
    const reasoning = scoreObj?.reasoningBreakdowns?.[0];

    const [followUpDate, setFollowUpDate] = useState(lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : '');
    const [isSaving, setIsSaving] = useState(false);

    const [newTask, setNewTask] = useState({ taskType: 'Call', dueDate: '', dueTime: '', notes: '' });
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);

    console.log("Score object : ", scoreObj)
    console.log("Lead : ", lead)

    let detBreakdown = {};
    try {
        if (reasoning?.deterministicFactors) {
            detBreakdown = JSON.parse(reasoning.deterministicFactors);
        }
    } catch (e) { }

    // Calculate time to first contact
    const calculateTimeToContact = () => {
        const createEvent = lead.activityLogs.find((a: any) => a.eventType === 'lead.created');
        const contactEvent = lead.activityLogs.find((a: any) => a.eventType === 'status.changed' && a.metadata?.includes('contacted'));

        if (createEvent && contactEvent) {
            const diffMs = new Date(contactEvent.occurredAt).getTime() - new Date(createEvent.occurredAt).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${diffMins} minutes`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours`;
            return `${Math.floor(diffHours / 24)} days`;
        }
        return 'Not contacted yet';
    };

    const StatusBadgeComponent = () => (
        <select
            value={lead.pipelineStage}
            onChange={(e) => onStatusChange(lead.id, e.target.value)}
            className="text-sm font-bold bg-slate-100 border-none text-slate-800 py-1 pl-3 pr-8 rounded-full focus:ring-2 focus:ring-[#853953] appearance-none shadow-sm cursor-pointer"
        >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="booked_showing">Booked Showing</option>
            <option value="closed">Closed</option>
        </select>
    );

    const handleUpdateFollowUp = async (date: string) => {
        setFollowUpDate(date);
        setIsSaving(true);
        try {
            const { updateLead } = await import('../actions');
            await updateLead(lead.id, { followUpDate: date || null });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogCall = async (outcome: string) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/leads/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id, outcome, notes: noteText })
            });
            if (res.ok) {
                setNoteText('');
                // Refresh or handle update
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

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
                setTimeout(() => setCreationSuccess(false), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreatingTask(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-200">

                {/* Header: Name, Phone, Email, Status, Score, Temp */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-slate-200 z-20 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-[#853953]/10 flex items-center justify-center text-[#853953] font-extrabold text-lg">
                                {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                                    {lead.firstName} {lead.lastName}
                                    {scoreObj?.finalScore && (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="bg-[#853953]/10 text-[#853953] px-2 py-0.5 rounded-full border border-[#853953]/20">Score: {scoreObj.finalScore}</span>
                                            <span className={`px-2 py-0.5 rounded-full border text-[10px] tracking-wider uppercase font-black ${scoreObj.finalScore >= 80 ? 'bg-red-100 border-red-200 text-red-700' : scoreObj.finalScore >= 50 ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
                                                {scoreObj.finalScore >= 80 ? 'HOT' : scoreObj.finalScore >= 50 ? 'WARM' : 'COLD'}
                                            </span>
                                        </div>
                                    )}
                                </h2>
                                <div className="text-sm text-slate-500 flex items-center gap-3 mt-1 font-medium">
                                    <span className="flex items-center gap-1.5 hover:text-[#853953] cursor-pointer"><Phone className="w-3.5 h-3.5" /> {lead.phone}</span>
                                    <span className="flex items-center gap-1.5 hover:text-[#853953] cursor-pointer"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <StatusBadgeComponent />
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 pb-32 space-y-6 bg-slate-50/50 min-h-screen">
                    {/* Delete Controls (Hidden mostly) */}
                    <div className="flex justify-end mb-4">
                        {deleteStep === 0 && (
                            <button
                                onClick={() => setDeleteStep(1)}
                                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Lead
                            </button>
                        )}
                        {deleteStep === 1 && (
                            <div className="flex items-center gap-3 bg-red-50 pr-2 py-1 pl-4 rounded-lg border border-red-200 shadow-sm animate-in slide-in-from-right-2">
                                <span className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" /> Are you sure?
                                </span>
                                <button
                                    onClick={() => setDeleteStep(2)}
                                    className="bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold px-3 py-1.5 rounded transition-colors"
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setDeleteStep(0)}
                                    className="text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-1.5 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        {deleteStep === 2 && (
                            <div className="flex items-center gap-3 bg-red-100 pr-2 py-1 pl-4 rounded-lg border border-red-300 shadow-sm animate-in pulse">
                                <span className="text-sm font-black text-red-800 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" /> Click to permanently delete
                                </span>
                                <button
                                    onClick={() => onDelete(lead.id)}
                                    className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors"
                                >
                                    Confirm Delete
                                </button>
                                <button
                                    onClick={() => setDeleteStep(0)}
                                    className="text-red-700 hover:text-red-900 text-xs font-bold px-3 py-1.5 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* AI Insight Box (Dynamic based on conditions) */}
                    {(() => {
                        const score = scoreObj?.finalScore || 0;
                        const hasMatches = lead.propertyMatches?.length > 0;
                        const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();
                        const isCold = lead.pipelineStage !== 'new' && score < 50;
                        const isUncontacted = lead.pipelineStage === 'new' && !lead.lastContactedAt;

                        let insightMsg = 'Lead is active. Review timeline for next steps.';
                        let Icon = Search;
                        let colorClasses = 'bg-blue-50 border-blue-200 text-blue-800';

                        if (score >= 80 && isUncontacted) {
                            insightMsg = 'High-intent lead — not yet contacted. Reach out ASAP.';
                            Icon = Zap;
                            colorClasses = 'bg-red-50 border-red-200 text-red-800';
                        } else if (isOverdue) {
                            insightMsg = 'Follow up overdue. Don\'t let this lead go cold.';
                            Icon = AlertTriangle;
                            colorClasses = 'bg-orange-50 border-orange-200 text-orange-800';
                        } else if (isCold) {
                            insightMsg = 'Lead has gone cold. Recommend automated re-engagement.';
                            Icon = Clock;
                            colorClasses = 'bg-slate-100 border-slate-300 text-slate-700';
                        } else if (hasMatches && lead.pipelineStage === 'new') {
                            insightMsg = 'Matching property available. Send suggestions to spark interest.';
                            Icon = Home;
                            colorClasses = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        } else if (!lead.followUpDate) {
                            insightMsg = 'No follow up scheduled for this lead. Create a task.';
                            Icon = Calendar;
                            colorClasses = 'bg-[#853953]/5 border-[#853953]/20 text-[#853953]';
                        }

                        return (
                            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border-l-4 font-medium text-sm shadow-sm ${colorClasses} border-l-current`}>
                                <Icon className="w-5 h-5 shrink-0" />
                                <div>
                                    <strong className="block text-xs uppercase tracking-wider opacity-70 mb-0.5">AI Insight</strong>
                                    {insightMsg}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Quick Actions Component */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Quick Actions</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <button onClick={() => { setActiveTab('notes'); setNoteText('LOGGED CALL: '); }} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm">
                                <Phone className="w-5 h-5 mb-2 text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Log Call</span>
                            </button>
                            <button onClick={() => window.location.href = `mailto:${lead.email}`} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm">
                                <Mail className="w-5 h-5 mb-2 text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Send Email</span>
                            </button>
                            <button onClick={() => setActiveTab('tasks')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:bg-[#853953]/5 hover:border-[#853953]/20 hover:text-[#853953] transition-all shadow-sm">
                                <Calendar className="w-5 h-5 mb-2 text-[#853953]" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Create Task</span>
                            </button>
                            <button onClick={() => setActiveTab('notes')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all shadow-sm">
                                <MessageSquare className="w-5 h-5 mb-2 text-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Add Note</span>
                            </button>
                            <button onClick={() => setActiveTab('properties')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-white hover:bg-[#853953]/5 hover:border-[#853953]/20 hover:text-[#853953] transition-all shadow-sm">
                                <Home className="w-5 h-5 mb-2 text-[#853953]" />
                                <span className="text-[10px] font-black uppercase tracking-wider text-center">Matches</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LOG CALL ACTION SECTION */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-500" /> Quick Log Call
                            </h3>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <button 
                                    onClick={() => handleLogCall('no_answer')}
                                    disabled={isSaving}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-700 transition-all group"
                                >
                                    <X className="w-5 h-5 mb-1 text-slate-400 group-hover:text-rose-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">No Answer</span>
                                </button>
                                <button 
                                    onClick={() => handleLogCall('left_voicemail')}
                                    disabled={isSaving}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-amber-50 hover:border-amber-100 hover:text-amber-700 transition-all group"
                                >
                                    <Mail className="w-5 h-5 mb-1 text-slate-400 group-hover:text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Voicemail</span>
                                </button>
                                <button 
                                    onClick={() => handleLogCall('spoke_to_lead')}
                                    disabled={isSaving}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-all group"
                                >
                                    <Phone className="w-5 h-5 mb-1 text-slate-400 group-hover:text-emerald-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Spoke to Lead</span>
                                </button>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add call notes or general remarks..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#853953] outline-none min-h-[80px] transition-shadow"
                                />
                                {noteText && (
                                    <button 
                                        onClick={() => handleLogCall('note_only')}
                                        disabled={isSaving}
                                        className="absolute bottom-3 right-3 bg-[#853953] text-white p-1.5 rounded-lg shadow-md hover:bg-[#612D53] transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* CREATE TASK SECTION */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#853953]" /> Create Task
                            </h3>
                            <AnimatePresence>
                                {creationSuccess && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 12 }} 
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="p-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200 flex items-center gap-2 overflow-hidden"
                                    >
                                        <CheckCircle2 className="w-4 h-4 shrink-0" /> <span className="truncate">Task Scheduled Successfully</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <select
                                    value={newTask.taskType}
                                    onChange={e => setNewTask(p => ({ ...p, taskType: e.target.value }))}
                                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                >
                                    {['Call', 'Email', 'Follow Up', 'Meeting', 'Viewing', 'Reminder'].map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                    />
                                    <input
                                        type="time"
                                        value={newTask.dueTime}
                                        onChange={e => setNewTask(p => ({ ...p, dueTime: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-1 py-2 text-sm outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={newTask.notes}
                                    onChange={(e) => setNewTask(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Task notes (optional)"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#853953] outline-none min-h-[40px] transition-shadow resize-none"
                                    rows={2}
                                />
                            </div>
                            <button
                                onClick={handleCreateTask}
                                disabled={isCreatingTask || !newTask.dueDate}
                                className="w-full mt-3 bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors"
                            >
                                {isCreatingTask ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </div>

                    {/* URGENCY BANNER */}
                    {(() => {
                        const score = scoreObj?.finalScore || 0;
                        const isUrgentUncontacted = lead.pipelineStage === 'new' && score >= 80;
                        const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();
                        if (!isUrgentUncontacted && !isOverdue) return null;
                        return (
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-semibold text-sm ${
                                isUrgentUncontacted
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-orange-50 border-orange-200 text-orange-800'
                            }`}>
                                <Zap className="w-5 h-5 shrink-0" />
                                <div>
                                    {isUrgentUncontacted && <strong>High-intent lead — not yet contacted.</strong>}
                                    {isOverdue && !isUrgentUncontacted && <strong>Overdue follow-up.</strong>}
                                    <span className="font-normal ml-1">
                                        {isUrgentUncontacted
                                            ? 'This buyer has a high score and hasn\'t been contacted yet. Reach out immediately.'
                                            : `Follow-up was due ${new Date(lead.followUpDate).toLocaleDateString()}. Don't let this lead go cold.`}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* EMAIL STATUS STRIP (always visible) */}
                    {lead.emailLogs?.length > 0 && (() => {
                        const latest = lead.emailLogs[0];
                        return (
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-slate-500 font-medium">Last email:</span>
                                <span className="text-slate-900 font-bold truncate">{latest.subjectLine}</span>
                                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                                    {latest.clickedAt && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#853953] bg-[#853953]/10 px-2 py-0.5 rounded"><LinkIcon className="w-3 h-3" /> Clicked</span>}
                                    {latest.openedAt && !latest.clickedAt && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded"><MailOpen className="w-3 h-3" /> Opened</span>}
                                    {!latest.openedAt && latest.status === 'sent' && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3" /> Sent</span>}
                                    {latest.status === 'failed' && <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded"><AlertTriangle className="w-3 h-3" /> Failed</span>}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-6 border-b border-slate-200 mt-4 pt-4 px-2 overflow-x-auto hide-scrollbar">
                        {['overview', 'timeline', 'tasks', 'notes', 'conversation', 'properties'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-[#853953]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab === 'properties' ? 'Matches' : tab}
                                {tab === 'conversation' && lead.emailLogs?.length > 0 && <span className="bg-[#853953]/10 text-[#853953] py-0.5 px-2 rounded-full text-[10px] ml-2">{lead.emailLogs.length}</span>}
                                {tab === 'properties' && lead.propertyMatches?.length > 0 && <span className="bg-[#853953]/10 text-[#853953] py-0.5 px-2 rounded-full text-[10px] ml-2">{lead.propertyMatches.length}</span>}
                                {activeTab === tab && <motion.div layoutId="drawerTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#853953]" />}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Panels */}
                    <div className="pt-6 relative min-h-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-[#853953]" /> Pipeline Status</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Follow Up Date</span>
                                                    <input type="date" value={followUpDate} onChange={(e) => handleUpdateFollowUp(e.target.value)} disabled={isSaving} className={`block w-full mt-1 bg-transparent font-bold border-none p-0 focus:ring-0 text-sm ${followUpDate && new Date(followUpDate) < new Date() ? 'text-red-600' : 'text-slate-900'}`} />
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">First Contact</span>
                                                    <p className="font-bold text-slate-900 mt-1 text-sm">{calculateTimeToContact()}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Source</span>
                                                    <p className="font-bold text-slate-900 mt-1 text-sm">{lead.source || 'Direct'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Looking to Move</span>
                                                    <p className="font-bold text-slate-900 mt-1 text-sm">{lead.moveTimeline || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-[#853953]" /> AI Score & Details</h3>
                                            <p className="text-sm font-medium text-slate-700 bg-[#853953]/5 p-3 rounded-lg border border-[#853953]/10 mb-4">&ldquo;{reasoning?.reasoningSummary || 'Awaiting AI analysis...'}&rdquo;</p>
                                            
                                            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm border-t border-slate-100 pt-4">
                                                <div><dt className="text-slate-500 font-medium">Financing</dt><dd className="text-slate-900 font-bold capitalize mt-0.5">{lead.financing?.replace('_', ' ') || 'Unknown'}</dd></div>
                                                {lead.preApproval && <div><dt className="text-slate-500 font-medium">Pre-Approved</dt><dd className="text-green-600 font-bold flex items-center gap-1 mt-0.5"><ShieldCheck className="w-4 h-4" /> Verified</dd></div>}
                                                {(lead.budgetMin || lead.budgetMax) && <div><dt className="text-slate-500 font-medium">Budget</dt><dd className="text-slate-900 font-bold mt-0.5">{lead.currency}{lead.budgetMin?.toLocaleString() || '0'} - {lead.budgetMax?.toLocaleString() || '+'}</dd></div>}
                                            </dl>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'timeline' && (
                                    <div className="bg-transparent">
                                        <LeadTimelineClient leadId={lead.id} />
                                    </div>
                                )}

                                {activeTab === 'tasks' && (
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#853953]" /> Create Task
                                        </h3>
                                        <AnimatePresence>
                                            {creationSuccess && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                                    animate={{ opacity: 1, height: 'auto', marginBottom: 12 }} 
                                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    className="p-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200 flex items-center gap-2 overflow-hidden"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> <span className="truncate">Task Scheduled Successfully</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <select
                                                value={newTask.taskType}
                                                onChange={e => setNewTask(p => ({ ...p, taskType: e.target.value }))}
                                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                            >
                                                {['Call', 'Email', 'Follow up', 'Meeting', 'Viewing', 'Reminder'].map(t => (
                                                    <option key={t}>{t}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={newTask.dueDate}
                                                    onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                                />
                                                <input
                                                    type="time"
                                                    value={newTask.dueTime}
                                                    onChange={e => setNewTask(p => ({ ...p, dueTime: e.target.value }))}
                                                    className="w-full border border-slate-200 rounded-xl px-1 py-2 text-sm outline-none focus:ring-2 focus:ring-[#853953] bg-slate-50"
                                                />
                                            </div>
                                        </div>
                                        <textarea
                                            value={newTask.notes}
                                            onChange={(e) => setNewTask(p => ({ ...p, notes: e.target.value }))}
                                            placeholder="Task notes (optional)"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#853953] outline-none min-h-[40px] transition-shadow resize-none"
                                            rows={2}
                                        />
                                        <button
                                            onClick={handleCreateTask}
                                            disabled={isCreatingTask || !newTask.dueDate}
                                            className="w-full mt-3 bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors"
                                        >
                                            {isCreatingTask ? 'Creating...' : 'Create Task'}
                                        </button>
                                        <LeadTasksList leadId={lead.id} />
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-amber-500" /> Add Note
                                        </h3>
                                        <textarea
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Type note details or log a manual interaction here..."
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#853953] outline-none min-h-[120px] resize-none mb-3"
                                        />
                                        <div className="flex justify-end border-t border-slate-100 pt-3">
                                            <button
                                                onClick={() => handleLogCall('note_only')}
                                                disabled={isSaving || !noteText.trim()}
                                                className="bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Note'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'conversation' && (
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                                        {/* ACTIVE SEQUENCES BLOCK */}
                                        {lead.sequenceStates && lead.sequenceStates.length > 0 && (
                                            <div className="bg-gradient-to-br from-[#853953]/5 to-slate-50 border border-[#853953]/10 rounded-xl p-4 mb-6 shadow-sm">
                                                <h4 className="text-xs font-bold text-[#853953] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <BrainCircuit className="w-4 h-4" /> Active Sequences
                                                </h4>
                                                <div className="space-y-3">
                                                    {lead.sequenceStates.map((seq: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#853953]/10 shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{seq.sequence.name}</span>
                                                                <span className="text-xs font-semibold text-slate-500 mt-1">
                                                                    Step {seq.currentStep} • Next: {new Date(seq.nextRunAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded ${seq.status === 'active' ? 'bg-[#853953]/10 text-[#853953]' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {seq.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {(!lead.emailLogs || lead.emailLogs.length === 0) ? (
                                            <div className="text-center py-8">
                                                <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-500 font-medium text-sm">No emails have been sent to this lead yet.</p>
                                            </div>
                                        ) : (
                                            lead.emailLogs.map((log: any) => (
                                                <div key={log.id} className="flex flex-col gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white transition-colors relative">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-900">{log.subjectLine}</span>
                                                                {log.status === 'sent' && !log.openedAt && !log.clickedAt && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#853953] bg-[#853953]/10 px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3" /> Sent</span>
                                                                )}
                                                                {log.status === 'failed' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded"><AlertTriangle className="w-3 h-3" /> Failed</span>
                                                                )}
                                                                {log.status === 'draft' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded"><Clock className="w-3 h-3" /> Draft Pending</span>
                                                                )}
                                                                {log.status === 'pending' && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded"><Clock className="w-3 h-3" /> Pending</span>
                                                                )}
                                                                {log.opened && !log.replied && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded"><MailOpen className="w-3 h-3" /> Opened</span>
                                                                )}
                                                                {log.replied && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#853953] bg-[#853953]/10 px-2 py-0.5 rounded"><LinkIcon className="w-3 h-3" /> Replied</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                                                <span>{new Date(log.sentAt).toLocaleString()}</span>
                                                                {log.attemptCount > 1 && <span>Attempt {log.attemptCount}/3</span>}
                                                            </div>
                                                        </div>

                                                        {/* Resend button for failed or Warm/Cold pending logic (simulation) */}
                                                        {scoreObj?.finalScore < 80 && (
                                                            <button className="text-xs font-bold text-[#853953] bg-[#853953]/5 hover:bg-[#853953]/10 px-3 py-1.5 rounded transition-colors whitespace-nowrap">
                                                                Resend Email
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'properties' && (
                                    <RecommendedPropertiesTab leadId={lead.id} leadEmail={lead.email} leadFirstName={lead.firstName} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </>
    );
}
