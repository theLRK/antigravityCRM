'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, PhoneCall, Mail, Settings, RefreshCw, Flame, ThermometerSun, Snowflake, Zap, X, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import CallLogModal from '@/components/ui/leads/CallLogModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NextBestActionsClient() {
    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [callLeadId, setCallLeadId] = useState<string | null>(null);
    const [callLeadName, setCallLeadName] = useState('');
    const [callLeadPhone, setCallLeadPhone] = useState('');
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

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

    const handleDismiss = (leadId: string) => {
        setDismissedIds(prev => new Set(prev).add(leadId));
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'HOT':  
                return { 
                    badgeBg: 'bg-rose-50', 
                    badgeText: 'text-rose-700 border-rose-200', 
                    cardBorder: 'border-rose-200/80 hover:border-rose-300', 
                    icon: <Flame className="w-3.5 h-3.5 text-rose-600" /> 
                };
            case 'WARM': 
                return { 
                    badgeBg: 'bg-amber-50', 
                    badgeText: 'text-amber-700 border-amber-200', 
                    cardBorder: 'border-amber-200/80 hover:border-amber-300', 
                    icon: <ThermometerSun className="w-3.5 h-3.5 text-amber-600" /> 
                };
            case 'COLD': 
                return { 
                    badgeBg: 'bg-blue-50', 
                    badgeText: 'text-blue-700 border-blue-200', 
                    cardBorder: 'border-slate-200/80 hover:border-slate-300', 
                    icon: <Snowflake className="w-3.5 h-3.5 text-blue-600" /> 
                };
            default:     
                return { 
                    badgeBg: 'bg-slate-50', 
                    badgeText: 'text-slate-600 border-slate-200', 
                    cardBorder: 'border-slate-200/80 hover:border-slate-300', 
                    icon: null 
                };
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
                    icon: <PhoneCall className="w-3.5 h-3.5 mr-1.5" />,
                    color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
                    onClick: openCall,
                };
            case 'SEND_PROPERTY_MATCH':
                return {
                    label: 'Pitch Properties',
                    icon: <Mail className="w-3.5 h-3.5 mr-1.5" />,
                    color: 'bg-[#853953] hover:bg-[#612D53] text-white shadow-[#853953]/20',
                    href: `/leads`,
                };
            case 'SEND_REENGAGEMENT_EMAIL':
                return {
                    label: 'Re-engage',
                    icon: <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-300" />,
                    color: 'bg-[#853953] hover:bg-[#612D53] text-white shadow-[#853953]/20',
                    href: `/leads`,
                };
            case 'SEND_FOLLOW_UP_EMAIL':
            case 'START_SEQUENCE':
                return {
                    label: 'Start Sequence',
                    icon: <Mail className="w-3.5 h-3.5 mr-1.5" />,
                    color: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
                    href: `/leads`,
                };
            default:
                return {
                    label: 'View Lead',
                    icon: <Settings className="w-3.5 h-3.5 mr-1.5" />,
                    color: 'bg-slate-800 hover:bg-slate-700 text-white',
                    href: `/leads`,
                };
        }
    };

    const activeActions = actions.filter(item => !dismissedIds.has(item.lead.id));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs gap-3">
                <LoadingSpinner size={40} color="#853953" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluating Next Best Actions...</p>
            </div>
        );
    }

    if (activeActions.length === 0) {
        return (
            <div className="text-center py-10 px-6 border border-dashed border-emerald-200 rounded-3xl bg-emerald-50/40 flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3 text-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">Inbox Zero — All High Intent Leads Contacted!</h3>
                <p className="text-slate-500 text-xs font-medium max-w-sm leading-relaxed">
                    No urgent follow-up tasks currently pending. New opportunities will appear here as leads interact.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-3.5 relative">
                {activeActions.map((item, idx) => {
                    const pStyles = getPriorityStyles(item.actionData.priority);
                    const btnSetup = getActionSetup(item.actionData.action, item.lead.id, item.lead);

                    return (
                        <div 
                            key={item.lead.id || idx} 
                            className={`bg-white rounded-2xl p-5 border shadow-2xs transition-all hover:shadow-md ${pStyles.cardBorder} group relative`}
                        >
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                {/* Lead Details & Dynamic AI Reason */}
                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        <h4 className="text-sm font-black text-slate-900 truncate">
                                            {item.lead.firstName} {item.lead.lastName}
                                        </h4>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${pStyles.badgeBg} ${pStyles.badgeText}`}>
                                            {pStyles.icon} {item.actionData.priority} INTENT
                                        </span>
                                    </div>

                                    {/* Action Rationale Banner */}
                                    <div className="flex items-start gap-2 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100 mt-1">
                                        <Sparkles className="w-3.5 h-3.5 text-[#853953] shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                                            {item.actionData.reason}
                                        </p>
                                    </div>

                                    {/* AI Pitch Hook */}
                                    {item.actionData.aiHint && (
                                        <div className="mt-2 px-3 py-1.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                                            <p className="text-[11px] text-blue-800 font-medium italic">
                                                💬 Strategy: &ldquo;{item.actionData.aiHint}&rdquo;
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Action Trigger Buttons */}
                                <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
                                    {btnSetup.onClick ? (
                                        <button
                                            onClick={btnSetup.onClick}
                                            className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 ${btnSetup.color} w-full sm:w-auto`}
                                        >
                                            {btnSetup.icon}
                                            {btnSetup.label}
                                        </button>
                                    ) : (
                                        <Link
                                            href={(btnSetup as any).href}
                                            className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 ${btnSetup.color} w-full sm:w-auto`}
                                        >
                                            {btnSetup.icon}
                                            {btnSetup.label}
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => handleDismiss(item.lead.id)}
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-colors"
                                        title="Dismiss action"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
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
