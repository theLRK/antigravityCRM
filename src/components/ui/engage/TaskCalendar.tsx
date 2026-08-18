'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Phone, Mail, Calendar as CalIcon, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

type Task = { id: string; title: string; taskType: string; dueDate: string; dueTime?: string; status: string; leadId?: string; notes?: string; lead?: { firstName: string; lastName: string } };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TYPE_ICON: Record<string, any> = { Call: Phone, Email: Mail, Follow_Up: CalIcon, Meeting: CalIcon, Viewing: CalIcon, Reminder: Clock };
const TYPE_COLOR: Record<string, string> = { Call: 'bg-green-100 text-green-700', Email: 'bg-blue-100 text-blue-700', 'Follow Up': 'bg-orange-100 text-orange-700', Meeting: 'bg-[#853953]/10 text-[#853953]', Viewing: 'bg-slate-800 text-white', Reminder: 'bg-slate-100 text-slate-600' };
const TYPE_DOT_COLOR: Record<string, string> = { Call: 'bg-green-500', Email: 'bg-blue-500', 'Follow Up': 'bg-orange-500', Meeting: 'bg-[#853953]', Viewing: 'bg-slate-800', Reminder: 'bg-slate-400' };

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function TaskCalendar() {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | null>(today);
    const [loading, setLoading] = useState(true);
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', taskType: 'Call', dueDate: today.toISOString().split('T')[0], dueTime: '', leadId: '' });
    const [leads, setLeads] = useState<any[]>([]);
    const [searchLead, setSearchLead] = useState('');
    const [showLeadDropdown, setShowLeadDropdown] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        const r = await fetch('/api/tasks?all=true');
        const d = await r.json();
        const allTasks = [...(d.overdue || []), ...(d.today || []), ...(d.upcoming || []), ...(d.completed || [])];
        setTasks(allTasks);
        setLoading(false);
    };

    const fetchLeads = async () => {
        const res = await fetch('/api/leads');
        if (res.ok) setLeads(await res.json());
    };

    useEffect(() => { fetchTasks(); fetchLeads(); }, []);

    // Calendar grid
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const cells: Array<{ date: Date; current: boolean }> = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevDays - i), current: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), current: true });
    while (cells.length % 7 !== 0) cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), current: false });

    const tasksForDay = (d: Date) => tasks.filter(t => isSameDay(new Date(t.dueDate), d));
    const selectedTasks = selectedDay ? tasksForDay(selectedDay) : [];

    const completeTask = async (id: string) => {
        await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) });
        fetchTasks();
    };

    const createTask = async () => {
        if (!newTask.title.trim() || !newTask.leadId) return;
        try {
            const dueDateTimeString = newTask.dueTime ? `${newTask.dueDate}T${newTask.dueTime}:00` : `${newTask.dueDate}T09:00:00`;
            const validDate = new Date(dueDateTimeString);
            const isoDueDate = isNaN(validDate.getTime()) ? new Date(newTask.dueDate).toISOString() : validDate.toISOString();

            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTask, dueDate: isoDueDate })
            });
            setShowNewTask(false);
            setNewTask({ title: '', taskType: 'Call', dueDate: today.toISOString().split('T')[0], dueTime: '', leadId: '' });
            setSearchLead('');
            fetchTasks();
        } catch (err) {
            console.error('Failed to create calendar task:', err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar grid */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <h3 className="font-extrabold text-slate-900">{MONTHS[month]} {year}</h3>
                    <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
                <div className="grid grid-cols-7 border-b border-slate-100">
                    {DAYS.map(d => <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">{d}</div>)}
                </div>
                <div className="grid grid-cols-7">
                    {cells.map(({ date, current }, idx) => {
                        const dayTasks = tasksForDay(date);
                        const isToday = isSameDay(date, today);
                        const isSelected = selectedDay && isSameDay(date, selectedDay);
                        const hasOverdue = dayTasks.some(t => t.status === 'overdue');
                        return (
                            <button key={idx} onClick={() => setSelectedDay(date)}
                                className={`min-h-[60px] p-2 border-b border-r border-slate-100 text-left transition-colors hover:bg-slate-50 relative
                                    ${!current ? 'opacity-30' : ''}
                                    ${isSelected ? 'bg-[#853953]/5' : ''}
                                `}>
                                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#853953] text-white' : 'text-slate-700'}`}>
                                    {date.getDate()}
                                </span>
                                {dayTasks.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-1">
                                        {dayTasks.slice(0, 3).map(t => (
                                            <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${hasOverdue ? 'bg-red-500' : (TYPE_DOT_COLOR[t.taskType] || 'bg-slate-400')}`} />
                                        ))}
                                        {dayTasks.length > 3 && <span className="text-[9px] text-slate-400 font-bold">+{dayTasks.length - 3}</span>}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Day tasks panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {selectedDay ? selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a day'}
                        </p>
                        <p className="font-extrabold text-slate-900 mt-0.5">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setShowNewTask(!showNewTask)}
                        className="flex items-center gap-1.5 bg-[#853953] hover:bg-[#853953]/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                        <Plus className="w-3.5 h-3.5" /> New
                    </button>
                </div>

                {showNewTask && (
                    <div className="p-4 border-b border-slate-100 space-y-2 bg-[#853953]/5">
                        <input placeholder="Task title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#853953]/20" />
                        
                        {/* Searchable Lead Select */}
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search & select lead (Required)..."
                                value={searchLead}
                                onChange={e => { setSearchLead(e.target.value); setShowLeadDropdown(true); setNewTask(p => ({...p, leadId: ''})); }}
                                onFocus={() => setShowLeadDropdown(true)}
                                onBlur={() => setTimeout(() => setShowLeadDropdown(false), 200)}
                                className={`w-full bg-white border ${!newTask.leadId ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'} rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#853953]/20`}
                            />
                            {showLeadDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                    {leads.filter(l => {
                                        const name = (l.lead_name || `${l.firstName || ''} ${l.lastName || ''}`).toLowerCase();
                                        const email = (l.email || l.lead_email || '').toLowerCase();
                                        const phone = String(l.phone || '');
                                        const query = searchLead.toLowerCase();
                                        return name.includes(query) || email.includes(query) || phone.includes(query);
                                    }).map(l => {
                                        const displayName = l.lead_name || `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Lead';
                                        const displayEmail = l.email || l.lead_email || '';
                                        const leadId = l.id || l.lead_id;
                                        return (
                                            <div 
                                                key={leadId} 
                                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-t border-slate-50 flex flex-col"
                                                onClick={() => { 
                                                    setNewTask(p => ({...p, leadId})); 
                                                    setSearchLead(displayName); 
                                                    setShowLeadDropdown(false); 
                                                }}
                                            >
                                                <span className="font-bold text-sm text-slate-800">{displayName}</span>
                                                <span className="text-xs text-slate-500">{displayEmail} {l.phone ? `• ${l.phone}` : ''}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <select value={newTask.taskType} onChange={e => setNewTask({ ...newTask, taskType: e.target.value })}
                                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                                {['Call', 'Email', 'Follow Up', 'Meeting', 'Viewing', 'Reminder'].map(t => <option key={t}>{t}</option>)}
                            </select>
                            <input type="time" value={newTask.dueTime} onChange={e => setNewTask({ ...newTask, dueTime: e.target.value })}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                        </div>
                        <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" />
                        <div className="flex gap-2">
                            <button onClick={() => setShowNewTask(false)} className="flex-1 text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={createTask} disabled={!newTask.title || !newTask.leadId} className="flex-1 text-xs font-bold bg-[#853953] hover:bg-[#853953]/90 disabled:opacity-50 text-white py-1.5 rounded-lg transition-colors">Create</button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {selectedTasks.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            <CalIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            No tasks on this day
                        </div>
                    ) : (
                        selectedTasks.map(task => {
                            const Icon = TYPE_ICON[task.taskType] || CalIcon;
                            const colorClass = TYPE_COLOR[task.taskType] || 'bg-slate-100 text-slate-600';
                            const isOverdue = task.status === 'overdue';
                            const isDone = task.status === 'completed';
                            return (
                                <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${isDone ? 'opacity-50 bg-slate-50' : isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                                    <div className={`p-1.5 rounded-lg ${colorClass} shrink-0`}><Icon className="w-3.5 h-3.5" /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                                        {task.lead && <p className={`text-xs font-semibold ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>{task.lead.firstName} {task.lead.lastName}</p>}
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{task.taskType}</span>
                                            {task.dueTime && <span className="text-[10px] text-slate-400">{task.dueTime}</span>}
                                            {isOverdue && <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600"><AlertTriangle className="w-3 h-3" />Overdue</span>}
                                        </div>
                                    </div>
                                    {!isDone && (
                                        <button onClick={() => completeTask(task.id)} className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
