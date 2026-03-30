'use client'

import React from 'react';
import { 
    Clock, 
    Calendar, 
    User, 
    Trash2, 
    Mail,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledEmail {
    id: string;
    leadId: string;
    subject: string;
    body: string;
    scheduledAt: string;
    status: string;
    lead: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface Props {
    emails: ScheduledEmail[];
    onCancel: (id: string) => Promise<void>;
}

export function ScheduledEmailsTab({ emails, onCancel }: Props) {
    if (emails.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500 animate-in fade-in duration-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold text-slate-900">No Scheduled Emails</h3>
                <p>You haven't scheduled any emails for later delivery yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#853953]" />
                    Pending Schedule ({emails.length})
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    Emails will be sent automatically at the scheduled time.
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                            <th className="px-6 py-4">Lead</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Scheduled For</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {emails.map((email) => (
                            <tr key={email.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#853953]/10 flex items-center justify-center text-[#853953] font-bold text-xs border border-[#853953]/20">
                                            {email.lead.firstName[0]}{email.lead.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">
                                                {email.lead.firstName} {email.lead.lastName}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{email.lead.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col max-w-xs">
                                        <div className="font-medium text-slate-700 truncate">{email.subject}</div>
                                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{email.body.substring(0, 60)}...</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-[#853953] font-medium whitespace-nowrap">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(email.scheduledAt).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => {
                                            if (confirm('Are you sure you want to cancel this scheduled email?')) {
                                                onCancel(email.id);
                                            }
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
