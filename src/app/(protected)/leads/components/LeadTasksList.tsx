'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';

export default function LeadTasksList({ leadId }: { leadId: string }) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, [leadId]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/tasks`);
            if (res.ok) {
                const data = await res.json();
                // We map through tasks to find those matching leadId, or the backend might allow ?leadId= Filter.
                // Assuming `/api/tasks` returns all tasks for the signed in user, we filter them locally for safety.
                const leadTasks = data.filter((t: any) => t.leadId === leadId);
                // sort by due date, incomplete first
                leadTasks.sort((a: any, b: any) => {
                    const statusA = a.status || 'Pending';
                    const statusB = b.status || 'Pending';
                    if (statusA === 'Completed' && statusB !== 'Completed') return 1;
                    if (statusA !== 'Completed' && statusB === 'Completed') return -1;
                    
                    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    return dateA - dateB;
                });
                setTasks(leadTasks);
            }
        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error('Failed to update task', error);
            // Revert on failure
            fetchTasks();
        }
    };

    if (loading) {
        return <div className="text-sm text-slate-500 py-4 font-medium animate-pulse flex items-center gap-2"><Calendar className="w-4 h-4"/> Loading Tasks...</div>;
    }

    if (tasks.length === 0) {
        return (
            <div className="py-8 text-center bg-slate-50 border border-slate-100 border-dashed rounded-xl mt-6">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium tracking-wide">No active tasks for this lead.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Upcoming & Past Tasks</h4>
            {tasks.map(task => {
                const isOverdue = new Date(`${task.dueDate}T${task.dueTime || '00:00'}`) < new Date() && task.status !== 'Completed';
                return (
                    <div key={task.id} className={`flex items-start gap-4 p-4 border rounded-xl transition-all ${task.status === 'Completed' ? 'bg-slate-50/50 border-slate-100 opacity-60' : isOverdue ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200'}`}>
                        <button onClick={() => handleToggleTaskStatus(task.id, task.status)} className={`mt-0.5 shrink-0 transition-colors ${task.status === 'Completed' ? 'text-emerald-500' : 'text-slate-300 hover:text-purple-500'}`}>
                            {task.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h5 className={`font-bold text-sm truncate ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h5>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${task.taskType === 'Call' ? 'bg-emerald-100 text-emerald-700' : task.taskType === 'Email' ? 'bg-blue-100 text-blue-700' : task.taskType === 'Meeting' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {task.taskType}
                                </span>
                            </div>
                            {task.notes && (
                                <p className={`text-xs mt-1 mb-2 line-clamp-2 ${task.status === 'Completed' ? 'text-slate-400' : 'text-slate-600'}`}>{task.notes}</p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] font-bold">
                                <span className={`flex items-center gap-1 ${task.status === 'Completed' ? 'text-slate-400' : isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(task.dueDate).toLocaleDateString()} {task.dueTime && `at ${task.dueTime}`}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
