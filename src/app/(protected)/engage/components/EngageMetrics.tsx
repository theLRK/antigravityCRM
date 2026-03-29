import React from 'react';
import { Mail, Send, BarChart3 } from 'lucide-react';

interface Props {
    emailsSentToday: number;
    openRate: number;
    replyRate: number;
}

export function EngageMetrics({ emailsSentToday, openRate, replyRate }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Send className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Emails Sent Today</p>
                    <p className="text-3xl font-extrabold text-slate-900">{emailsSentToday}</p>
                </div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Mail className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Open Rate</p>
                    <p className="text-3xl font-extrabold text-slate-900">{openRate}%</p>
                </div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Reply Rate</p>
                    <p className="text-3xl font-extrabold text-slate-900">{replyRate}%</p>
                </div>
            </div>
        </div>
    );
}
