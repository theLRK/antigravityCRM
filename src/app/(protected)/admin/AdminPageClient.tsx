'use client';

import { useState } from 'react';
import { Users, UserPlus, ArrowLeftRight, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Agent {
    id: string;
    supabaseId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
}

interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pipelineStage: string;
    assignedAgentId: string | null;
    isUnassigned: boolean;
    scores?: { finalScore: number; likelihoodLabel: string }[];
}

interface Props {
    agents: Agent[];
    leads: Lead[];
    currentAdminId: string;
}

export default function AdminPageClient({ agents, leads, currentAdminId }: Props) {
    const [tab, setTab] = useState<'agents' | 'leads' | 'unassigned'>('unassigned');
    const [search, setSearch] = useState('');
    const [assigning, setAssigning] = useState<string | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const unassignedLeads = leads.filter(l => l.isUnassigned || !l.assignedAgentId);
    const assignedLeads = leads.filter(l => !l.isUnassigned && l.assignedAgentId);

    const filteredLeads = (tab === 'unassigned' ? unassignedLeads : assignedLeads).filter(l =>
        `${l.firstName} ${l.lastName} ${l.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const filteredAgents = agents.filter(a =>
        `${a.name} ${a.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const assignLead = async (leadId: string, agentId: string) => {
        setIsSubmitting(true);
        try {
            await fetch('/api/admin/assign-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, agentId })
            });
            router.refresh();
        } finally {
            setIsSubmitting(false);
            setAssigning(null);
        }
    };

    const getPriorityColor = (score: number) => {
        if (score >= 80) return 'text-rose-700 bg-rose-100';
        if (score >= 50) return 'text-amber-700 bg-amber-100';
        return 'text-slate-600 bg-slate-100';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Tab Nav */}
            <div className="col-span-1">
                <nav className="space-y-1">
                    {[
                        { key: 'unassigned', label: 'Unassigned Leads', icon: AlertCircle, count: unassignedLeads.length, color: 'text-amber-600' },
                        { key: 'leads', label: 'All Leads', icon: Users, count: leads.length, color: 'text-slate-600' },
                        { key: 'agents', label: 'Agent Management', icon: UserPlus, count: agents.length, color: 'text-indigo-600' },
                    ].map(({ key, label, icon: Icon, count, color }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as any)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                tab === key ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="flex items-center gap-2"><Icon className={`w-4 h-4 ${color}`} />{label}</span>
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{count}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Right: Content */}
            <div className="col-span-3">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={tab === 'agents' ? 'Search agents...' : 'Search leads...'}
                            className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
                        />
                    </div>

                    {/* Agent Management Tab */}
                    {tab === 'agents' && (
                        <div className="divide-y divide-slate-50">
                            {filteredAgents.length === 0 && (
                                <div className="py-16 text-center">
                                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No agents yet</p>
                                    <p className="text-slate-400 text-sm mt-1">Agents are created when you invite users with the Agent role.</p>
                                </div>
                            )}
                            {filteredAgents.map(agent => (
                                <div key={agent.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                                            {agent.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{agent.name}</p>
                                            <p className="text-xs text-slate-500">{agent.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                            agent.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {agent.role}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                            agent.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                                        }`}>
                                            {agent.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {leads.filter(l => l.assignedAgentId === agent.supabaseId).length} leads
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Leads Tabs (Unassigned + All) */}
                    {(tab === 'unassigned' || tab === 'leads') && (
                        <div className="divide-y divide-slate-50">
                            {tab === 'unassigned' && filteredLeads.length === 0 && (
                                <div className="py-16 text-center">
                                    <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                                    <p className="text-slate-600 font-medium">All leads are assigned!</p>
                                    <p className="text-slate-400 text-sm mt-1">New leads from the website will appear here.</p>
                                </div>
                            )}
                            {filteredLeads.map(lead => {
                                const score = lead.scores?.[0]?.finalScore || 0;
                                const assignedAgent = agents.find(a => a.supabaseId === lead.assignedAgentId);
                                return (
                                    <div key={lead.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-black text-sm shrink-0">
                                                {lead.firstName.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-sm">{lead.firstName} {lead.lastName}</p>
                                                <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {score > 0 && (
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${getPriorityColor(score)}`}>
                                                    {score} pts
                                                </span>
                                            )}
                                            {assignedAgent && (
                                                <span className="text-xs text-slate-500 hidden sm:block">
                                                    → {assignedAgent.name.split(' ')[0]}
                                                </span>
                                            )}
                                            {assigning === lead.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                                                        value={selectedAgent[lead.id] || ''}
                                                        onChange={e => setSelectedAgent(prev => ({ ...prev, [lead.id]: e.target.value }))}
                                                    >
                                                        <option value="">Select agent...</option>
                                                        {agents.map(a => (
                                                            <option key={a.id} value={a.supabaseId}>{a.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => selectedAgent[lead.id] && assignLead(lead.id, selectedAgent[lead.id])}
                                                        disabled={!selectedAgent[lead.id] || isSubmitting}
                                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                                                    >
                                                        Assign
                                                    </button>
                                                    <button onClick={() => setAssigning(null)} className="text-xs text-slate-400 hover:text-slate-600">×</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setAssigning(lead.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                                >
                                                    <ArrowLeftRight className="w-3 h-3" />
                                                    {assignedAgent ? 'Reassign' : 'Assign'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
