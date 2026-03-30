'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Phone, Mail, ArrowRight, RotateCcw, Calendar, Plus, X } from 'lucide-react';
import TaskSnoozeMenu from './TaskSnoozeMenu';

interface Task {
    id: string;
    title: string;
    taskType: string;
    dueDate: string;
    status: string;
    notes: string | null;
    lead: { id: string; firstName: string; lastName: string; phone: string; email: string } | null;
}

interface TaskGroups {
    overdue: Task[];
    today: Task[];
    upcoming: Task[];
    completed: Task[];
}

function formatDue(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)}d overdue`;
    return `In ${days} days`;
}

const typeIcon: Record<string, string> = {
    'Call': '📞',
    'Email': '📧',
    'Follow Up': '🔁',
    'Meeting': '🗓️',
    'Viewing': '🏠',
    'Reminder': '🔔',
};

export default function TaskBoard() {
    const [tasks, setTasks] = useState<TaskGroups>({ overdue: [], today: [], upcoming: [], completed: [] });
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [newTask, setNewTask] = useState({ title: '', taskType: 'Call', dueDate: '', dueTime: '', notes: '', leadId: '' });
    const [submitting, setSubmitting] = useState(false);
    const [searchLead, setSearchLead] = useState('');
    const [showLeadDropdown, setShowLeadDropdown] = useState(false);
    const [creationSuccess, setCreationSuccess] = useState(false);

    const fetchTasks = async () => {
        const res = await fetch('/api/tasks');
        if (res.ok) setTasks(await res.json());
        setLoading(false);
    };

    const fetchLeads = async () => {
        const res = await fetch('/api/leads');
        if (res.ok) setLeads(await res.json());
    };

    useEffect(() => { 
        fetchTasks(); 
        fetchLeads();
    }, []);

    const complete = async (id: string) => {
        await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) });
        fetchTasks();
    };

    const reschedule = async (id: string) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dueDate: tomorrow.toISOString(), status: 'pending' }) });
        fetchTasks();
    };

    const createTask = async () => {
        if (!newTask.title || !newTask.taskType || !newTask.dueDate) return;
        setSubmitting(true);
        await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...newTask, dueDate: new Date(newTask.dueDate).toISOString()}) });
        setNewTask({ title: '', taskType: 'Call', dueDate: '', dueTime: '', notes: '', leadId: '' });
        setSearchLead('');
        setShowLeadDropdown(false);
        setSubmitting(false);
        setCreationSuccess(true);
        setTimeout(() => { setCreationSuccess(false); setShowNew(false); }, 1500);
        fetchTasks();
    };

    if (loading) return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Loading tasks...</div>;

    const allTotal = tasks.overdue.length + tasks.today.length + tasks.upcoming.length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {tasks.overdue.length > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> {tasks.overdue.length} Overdue
                        </span>
                    )}
                    {tasks.today.length > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> {tasks.today.length} Today
                        </span>
                    )}
                    {tasks.upcoming.length > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                            <Calendar className="w-3 h-3" /> {tasks.upcoming.length} Upcoming
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowNew(v => !v)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#853953] bg-[#853953]/10 hover:bg-[#853953]/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> New Task
                </button>
            </div>

            {/* New Task Form */}
            {showNew && (
                <div className="bg-white border border-[#853953]/30 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-slate-900 text-sm">Create Task</p>
                        <button onClick={() => setShowNew(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    {creationSuccess && (
                        <div className="p-3 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200 flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                            <CheckCircle className="w-4 h-4" /> Task Scheduled Successfully
                        </div>
                    )}
                    <input
                        type="text"
                        placeholder="Task title (e.g., Call Sarah Johnson)"
                        value={newTask.title}
                        onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#853953]/20"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={newTask.taskType}
                            onChange={e => setNewTask(p => ({ ...p, taskType: e.target.value }))}
                            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#853953]/20 bg-white"
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
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#853953]/20"
                            />
                            <input
                                type="time"
                                value={newTask.dueTime}
                                onChange={e => setNewTask(p => ({ ...p, dueTime: e.target.value }))}
                                className="border border-slate-200 rounded-xl px-2 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#853953]/20"
                            />
                        </div>
                    </div>
                    {/* Lead Selector */}
                    <div className="space-y-1 relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Assign to Lead (Optional)</label>
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or phone..."
                            value={searchLead}
                            onChange={e => { setSearchLead(e.target.value); setShowLeadDropdown(true); setNewTask(p => ({...p, leadId: ''})); }}
                            onFocus={() => setShowLeadDropdown(true)}
                            onBlur={() => setTimeout(() => setShowLeadDropdown(false), 200)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#853953]/20 bg-white"
                        />
                        {showLeadDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                <div 
                                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-500 italic"
                                    onClick={() => { setNewTask(p => ({...p, leadId: ''})); setSearchLead(''); setShowLeadDropdown(false); }}
                                >
                                    No Lead Assignment
                                </div>
                                {leads.filter(l => 
                                    `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchLead.toLowerCase()) ||
                                    l.email.toLowerCase().includes(searchLead.toLowerCase()) ||
                                    (l.phone && l.phone.includes(searchLead))
                                ).map(l => (
                                    <div 
                                        key={l.id} 
                                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-t border-slate-50 flex flex-col"
                                        onClick={() => { setNewTask(p => ({...p, leadId: l.id})); setSearchLead(`${l.firstName} ${l.lastName}`); setShowLeadDropdown(false); }}
                                    >
                                        <span className="font-bold text-sm text-slate-800">{l.firstName} {l.lastName}</span>
                                        <span className="text-xs text-slate-500">{l.email} {l.phone ? `• ${l.phone}` : ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <textarea
                        placeholder="Notes (optional)"
                        value={newTask.notes}
                        onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#853953]/20 resize-none"
                    />
                    <button
                        onClick={createTask}
                        disabled={submitting || !newTask.title || !newTask.dueDate}
                        className="w-full bg-[#853953] hover:bg-[#853953]/90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                    >
                        {submitting ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            )}

            {allTotal === 0 && (
                <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
                    <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">All clear! No pending tasks.</p>
                    <p className="text-slate-400 text-sm mt-1">Create a task or tasks will be auto-generated from lead activity.</p>
                </div>
            )}

            {/* Overdue */}
            {tasks.overdue.map(task => <TaskCard key={task.id} task={task} variant="overdue" onComplete={complete} onSnoozed={fetchTasks} />)}
            {/* Today */}
            {tasks.today.map(task => <TaskCard key={task.id} task={task} variant="today" onComplete={complete} onSnoozed={fetchTasks} />)}
            {/* Upcoming */}
            {tasks.upcoming.slice(0, 5).map(task => <TaskCard key={task.id} task={task} variant="upcoming" onComplete={complete} onSnoozed={fetchTasks} />)}
        </div>
    );
}

function TaskCard({ task, variant, onComplete, onSnoozed }: {
    task: Task;
    variant: 'overdue' | 'today' | 'upcoming';
    onComplete: (id: string) => void;
    onSnoozed: () => void;
}) {
    const borderColor = { overdue: 'border-l-rose-500', today: 'border-l-amber-400', upcoming: 'border-l-blue-400' }[variant];
    const bgColor = { overdue: 'bg-rose-50/50', today: 'bg-amber-50/30', upcoming: 'bg-white' }[variant];

    return (
        <div className={`${bgColor} border border-slate-100 border-l-4 ${borderColor} rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow`}>
            <span className="text-xl mt-0.5">{typeIcon[task.taskType] || '📋'}</span>

            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{task.title}</p>
                {task.lead && (
                    <p className="text-xs text-slate-500 mt-0.5">{task.lead.firstName} {task.lead.lastName}</p>
                )}
                <p className={`text-[11px] font-bold mt-1 ${variant === 'overdue' ? 'text-rose-600' : 'text-slate-500'}`}>
                    {formatDue(task.dueDate)}
                </p>
                {task.notes && <p className="text-xs text-slate-400 mt-1 italic truncate">{task.notes}</p>}
            </div>

            <div className="flex flex-col gap-1.5 shrink-0">
                <button
                    onClick={() => onComplete(task.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                    <CheckCircle className="w-3 h-3" /> Done
                </button>
                {variant !== 'upcoming' && (
                    <div className="bg-slate-100 rounded-lg">
                        <TaskSnoozeMenu taskId={task.id} onSnoozed={onSnoozed} />
                    </div>
                )}
                {task.lead && (
                    <a
                        href={`/leads?id=${task.lead.id}`}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#853953] bg-[#853953]/10 hover:bg-[#853953]/20 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-3 h-3" /> Lead
                    </a>
                )}
            </div>
        </div>
    );
}
