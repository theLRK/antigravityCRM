'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, PhoneCall, Mail, Settings, RefreshCw, Flame, ThermometerSun, Snowflake, Zap } from 'lucide-react';
import Link from 'next/link';
import CallLogModal from '@/components/ui/leads/CallLogModal';

export default function NextBestActionsClient() {
    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [callLeadId, setCallLeadId] = useState<string | null>(null);
    const [callLeadName, setCallLeadName] = useState('');
    const [callLeadPhone, setCallLeadPhone] = useState('');

    const fetchActions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dashboard/actions');
            const data = await res.json();
            if (data.actions) setActions(data.actions);
        } catch (error) {
            console.error("Failed to fetch next best actions", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchActions(); }, [fetchActions]);

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'HOT':  return { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    cardBorder: 'border-red-100',    icon: <Flame className="w-3 h-3" /> };
            case 'WARM': return { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  cardBorder: 'border-amber-100',  icon: <ThermometerSun className="w-3 h-3" /> };
            case 'COLD': return { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   cardBorder: 'border-slate-200',  icon: <Snowflake className="w-3 h-3" /> };
            default:     return { bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200',  cardBorder: 'border-slate-200',  icon: null };
        }
    };

    const getActionSetup = (actionId: string, leadId: string, lead: any) => {
        const openCall = () => {
            setCallLeadId(leadId);
            setCallLeadName(`${lead.firstName} ${lead.lastName}`);
            setCallLeadPhone(lead.phone || '');
        };

        switch (actionId) {
            case 'CALL_NOW':
                return {
                    label: 'Call Now',
                    icon: <PhoneCall className="w-4 h-4 mr-2" />,
                    color: 'bg-green-600 hover:bg-green-700 text-white',
                    onClick: openCall,
                };
            case 'SEND_PROPERTY_MATCH':
                return {
                    label: 'Send Properties',
                    icon: <Mail className="w-4 h-4 mr-2" />,
                    color: 'bg-[#853953] hover:bg-[#853953]/90 text-white',
                    href: `/leads?drawer=${leadId}`,
                };
            case 'SEND_REENGAGEMENT_EMAIL':
                return {
                    label: 'Re-engage',
                    icon: <Zap className="w-4 h-4 mr-2" />,
                    color: 'bg-[#853953]/80 hover:bg-[#853953]/90 text-white',
                    href: `/leads?drawer=${leadId}`,
                };
            case 'SEND_FOLLOW_UP_EMAIL':
            case 'START_SEQUENCE':
                return {
                    label: 'Start Sequence',
                    icon: <Mail className="w-4 h-4 mr-2" />,
                    color: 'bg-[#853953] hover:bg-[#853953]/90 text-white',
                    href: `/leads?drawer=${leadId}`,
                };
            default:
                return {
                    label: 'Review Lead',
                    icon: <Settings className="w-4 h-4 mr-2" />,
                    color: 'bg-slate-700 hover:bg-slate-800 text-white',
                    href: `/leads?drawer=${leadId}`,
                };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 border border-slate-200 rounded-2xl bg-white shadow-sm">
                <RefreshCw className="w-8 h-8 text-[#853953] animate-spin" />
            </div>
        );
    }

    if (actions.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-green-200 rounded-2xl bg-green-50/50 flex flex-col items-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">Inbox Zero!</h3>
                <p className="text-slate-500 text-sm font-medium">No urgent actions pending. You're on top of it!</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-3 relative">
                <button
                    onClick={fetchActions}
                    className="absolute -top-10 right-0 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="Refresh Actions"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>

                {actions.map((item, idx) => {
                    const pStyles = getPriorityStyles(item.actionData.priority);
                    const btnSetup = getActionSetup(item.actionData.action, item.lead.id, item.lead);

                    return (
                        <div key={idx} className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition-all hover:shadow-md ${pStyles.cardBorder}`}>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                {/* Lead Info & Reason */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <h4 className="text-base font-extrabold text-slate-900 truncate">
                                            {item.lead.firstName} {item.lead.lastName}
                                        </h4>
                                        <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${pStyles.bg} ${pStyles.text}`}>
                                            {pStyles.icon} {item.actionData.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                        <Sparkles className="w-3.5 h-3.5 text-[#853953] shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-700 font-medium leading-snug">{item.actionData.reason}</p>
                                    </div>
                                    {/* AI Hint — shown for cold leads */}
                                    {item.actionData.aiHint && (
                                        <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                                            <p className="text-xs text-blue-700 italic leading-relaxed">💬 Suggested: "{item.actionData.aiHint}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="shrink-0 w-full sm:w-auto">
                                    {btnSetup.onClick ? (
                                        <button
                                            onClick={btnSetup.onClick}
                                            className={`flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${btnSetup.color} w-full`}
                                        >
                                            {btnSetup.icon}
                                            {btnSetup.label}
                                        </button>
                                    ) : (
                                        <Link
                                            href={(btnSetup as any).href}
                                            className={`flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${btnSetup.color} w-full`}
                                        >
                                            {btnSetup.icon}
                                            {btnSetup.label}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Call Log Modal */}
            {callLeadId && (
                <CallLogModal
                    leadId={callLeadId}
                    leadName={callLeadName}
                    leadPhone={callLeadPhone}
                    onClose={() => setCallLeadId(null)}
                    onSuccess={() => { setCallLeadId(null); fetchActions(); }}
                />
            )}
        </>
    );
}
