'use client'

import React from 'react';
import type { Task, Lead, PropertyMatch, Property } from '@prisma/client';
import { 
    Mail, 
    CheckCircle2, 
    ChevronRight, 
    Calendar as CalendarIcon,
    Clock,
    AlertCircle,
    Eye,
    Send,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ExtendedTask = Task & {
    lead: (Lead & { 
        propertyMatches: (PropertyMatch & { property: Property })[] 
    }) | null;
};

interface Props {
    tasks: ExtendedTask[];
    onSendNow: (leadId: string) => void;
    onMarkDone: (taskId: string) => void;
    onReschedule?: (taskId: string) => void;
    onViewLead?: (leadId: string) => void;
}

function getPriority(task: ExtendedTask) {
    const leadScore = task.lead?.confidenceScore || 0;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (leadScore >= 80 || dueDate <= today) return 'High';
    if (leadScore >= 50) return 'Medium';
    return 'Low';
}

function getStatusLabel(task: ExtendedTask) {
    if (task.status === 'completed') return 'Done';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) return 'Due Today';
    if (dueDate < today) return 'Overdue';
    return 'Pending';
}

import { Loader2 } from 'lucide-react';

export function FollowUpsTab({ tasks, onSendNow, onMarkDone, onReschedule, onViewLead }: Props) {
    const [visibleTasks, setVisibleTasks] = React.useState(tasks);
    const [pendingTaskId, setPendingTaskId] = React.useState<string | null>(null);

    React.useEffect(() => {
        setVisibleTasks(tasks);
    }, [tasks]);

    const handleDoneClick = async (taskId: string) => {
        setPendingTaskId(taskId);
        // Optimistic removal
        setVisibleTasks(prev => prev.filter(t => t.id !== taskId));
        try {
            await onMarkDone(taskId);
        } finally {
            setPendingTaskId(null);
        }
    };

    const handleRescheduleClick = async (taskId: string) => {
        setPendingTaskId(taskId);
        // Optimistic removal
        setVisibleTasks(prev => prev.filter(t => t.id !== taskId));
        try {
            await onReschedule?.(taskId);
        } finally {
            setPendingTaskId(null);
        }
    };

    if (visibleTasks.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center shadow-2xs">
                <div className="w-12 h-12 bg-[#853953]/5 text-[#853953] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">All caught up!</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">No follow-up tasks currently pending.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Lead Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Task Title</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Property</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Due Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Priority</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 italic font-medium">
                        {visibleTasks.map((task) => {
                            const lead = task.lead;
                            const topMatch = lead?.propertyMatches[0];
                            const priority = getPriority(task);
                            const statusLabel = getStatusLabel(task);
                            const isPending = pendingTaskId === task.id;

                            return (
                                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {lead ? (
                                            <>
                                                <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{lead.firstName} {lead.lastName}</div>
                                                <div className="text-[10px] text-slate-400">{lead.email}</div>
                                            </>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-700">{task.title}</div>
                                        {task.taskType && (
                                            <div className="text-[10px] text-[#612D53] font-bold uppercase">{task.taskType}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {topMatch ? (
                                            <div className="text-xs text-slate-600 font-bold flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#612D53]" />
                                                {topMatch.property.title}
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(task.dueDate))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase border",
                                            priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                            priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={cn(
                                            "text-[10px] font-black uppercase flex items-center gap-1",
                                            statusLabel === 'Overdue' ? "text-rose-600" :
                                            statusLabel === 'Due Today' ? "text-amber-600" :
                                            statusLabel === 'Done' ? "text-emerald-600" :
                                            "text-slate-400"
                                        )}>
                                            {statusLabel === 'Overdue' && <AlertCircle className="w-3 h-3" />}
                                            {statusLabel === 'Due Today' && <Clock className="w-3 h-3" />}
                                            {statusLabel === 'Done' && <CheckCircle2 className="w-3 h-3" />}
                                            {statusLabel}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {lead && (
                                                <>
                                                    <button 
                                                        onClick={() => onViewLead?.(lead.id)}
                                                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="View Lead"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => onSendNow(lead.id)}
                                                        className="p-1.5 text-[#853953] hover:bg-[#853953]/5 rounded-lg transition-colors"
                                                        title="Send Email Now"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDoneClick(task.id)}
                                                disabled={isPending}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Mark as Done"
                                            >
                                                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </button>
                                            <button 
                                                onClick={() => handleRescheduleClick(task.id)}
                                                disabled={isPending}
                                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                                title="Reschedule Task"
                                            >
                                                <History className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
