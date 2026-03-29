'use client'

import React, { useState } from 'react';
import type { EmailLog, Lead } from '@prisma/client';
import { 
    Search, 
    Calendar, 
    User, 
    Mail, 
    CheckCircle2, 
    AlertCircle,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(date: Date, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) {
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

type LogWithLead = EmailLog & { lead: Lead };

interface Props {
    logs: LogWithLead[];
}

export function EmailHistoryTab({ logs }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<LogWithLead | null>(null);

    const filteredLogs = logs.filter(log => 
        log.lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subjectLine?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by lead or subject..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {formatDate(new Date(log.sentAt))}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{log.lead.firstName} {log.lead.lastName}</div>
                                    <div className="text-xs text-slate-500">{log.recipientEmail}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                    {log.subjectLine}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                        log.status === 'sent' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                    )}>
                                        {log.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {log.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedLog(log)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Log Detail Modal (Simplified Overlay) */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Email Details</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">To:</p>
                                    <p className="font-medium text-slate-900">{selectedLog.lead.firstName} {selectedLog.lead.lastName} ({selectedLog.recipientEmail})</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Sent At:</p>
                                    <p className="font-medium text-slate-900">{formatDate(new Date(selectedLog.sentAt), { dateStyle: 'long', timeStyle: 'short' })}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Subject:</p>
                                <p className="font-bold text-slate-900">{selectedLog.subjectLine}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                {selectedLog.bodyFull || selectedLog.bodyTextPreview || "No content preview available."}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
