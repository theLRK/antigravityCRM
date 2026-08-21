'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Plus,
    Phone,
    Mail,
    CheckCircle2,
    CalendarCheck,
    MessageSquare,
    AlertCircle,
    X,
    Loader2,
    Trash2,
    CheckSquare,
    Square,
    Sparkles,
    Zap,
    MapPin,
    Flame,
    Users,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getLeads, updateLeadStatus, addLeadNote, deleteLead, createLead, getLeadDetails } from '../actions';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export function LeadsClient({ initialLeads }: { initialLeads: any }) {
    const [leads, setLeads] = useState(initialLeads?.leads || (Array.isArray(initialLeads) ? initialLeads : []));
    const [totalCount, setTotalCount] = useState(initialLeads?.totalCount || (Array.isArray(initialLeads) ? initialLeads.length : 0));
    const [page, setPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortOption, setSortOption] = useState('Highest Score');
    const [selectedLead, setSelectedLead] = useState<any | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [addForm, setAddForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        source: '', moveTimeline: '', budgetMin: '', budgetMax: '',
        notes: '', currency: '$', preferredAreas: '', financing: '',
        propertyType: '', preApproval: false
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Polling for new leads - 60s
    useEffect(() => {
        const interval = setInterval(() => {
            getLeads({ take: page * 20, stage: activeFilter, query: searchQuery }).then((res) => {
                setLeads(res.leads as any);
                setTotalCount(res.totalCount);
            });
        }, 60000);
        return () => clearInterval(interval);
    }, [page, activeFilter, searchQuery]);

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        const res = await getLeads({ take: 20, skip: page * 20, stage: activeFilter, query: searchQuery });
        setLeads((prev: any[]) => [...prev, ...(res.leads || [])]);
        setPage(nextPage);
        setIsLoadingMore(false);
    };

    const handleSelectLead = async (lead: any) => {
        try {
            const fullLead = await getLeadDetails(lead.id);
            if (fullLead) setSelectedLead(fullLead);
            else showToast('Lead not found', 'error');
        } catch (e) {
            showToast('Failed to load full lead profile', 'error');
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        startTransition(() => {
            setLeads(leads.map((l: any) => l.id === leadId ? { ...l, pipelineStage: newStatus } : l));
        });
        await updateLeadStatus(leadId, newStatus);
        showToast(`Stage updated to ${formatStage(newStatus)}`);
    };

    const handleDeleteLead = async (leadId: string) => {
        const lead = leads.find((l: any) => l.id === leadId);
        const name = lead ? `${lead.firstName} ${lead.lastName}` : 'Lead';
        startTransition(() => {
            setLeads(leads.filter((l: any) => l.id !== leadId));
            setSelectedLead(null);
        });
        await deleteLead(leadId);
        showToast(`✓ ${name} deleted successfully`);
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        const count = ids.length;
        setIsBulkDeleting(true);
        try {
            setLeads((prev: any[]) => prev.filter((l: any) => !selectedIds.has(l.id)));
            setSelectedLead(null);
            await Promise.all(ids.map(id => deleteLead(id)));
            setSelectedIds(new Set());
            setShowBulkConfirm(false);
            showToast(`✓ ${count} lead${count === 1 ? '' : 's'} deleted successfully`);
        } catch (e) {
            showToast('Failed to delete some leads', 'error');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredLeads.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredLeads.map((l: any) => l.id)));
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.phone || !isValidPhoneNumber(addForm.phone)) {
            showToast('Please fill all required fields correctly, including a valid phone number.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await createLead({
                firstName: addForm.firstName,
                lastName: addForm.lastName,
                email: addForm.email,
                phone: addForm.phone,
                source: addForm.source || 'Manual Entry',
                moveTimeline: addForm.moveTimeline || undefined,
                budgetMin: addForm.budgetMin ? parseInt(addForm.budgetMin) : undefined,
                budgetMax: addForm.budgetMax ? parseInt(addForm.budgetMax) : undefined,
                notes: addForm.notes || undefined,
                currency: addForm.currency,
                preferredAreas: addForm.preferredAreas || undefined,
                financing: addForm.financing || undefined,
                propertyType: addForm.propertyType || undefined,
                preApproval: addForm.preApproval
            });
            const fresh = await getLeads();
            setLeads(fresh as any);
            setShowAddModal(false);
            handleClearForm();
            showToast('✓ New lead created & AI scoring initiated!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearForm = () => {
        setAddForm({
            firstName: '', lastName: '', email: '', phone: '',
            source: '', moveTimeline: '', budgetMin: '', budgetMax: '',
            notes: '', currency: '$', preferredAreas: '', financing: '',
            propertyType: '', preApproval: false
        });
    };

    // Calculate Top Metric Counters
    const hotLeadsCount = leads.filter((l: any) => (l.scores?.[0]?.finalScore || 0) >= 80).length;
    const needsFollowUpCount = leads.filter((l: any) => {
        if (l.pipelineStage === 'closed' || l.pipelineStage === 'lost') return false;
        if (l.pipelineStage === 'new' && (l.scores?.[0]?.finalScore || 0) >= 80) return true;
        if (!l.followUpDate) return false;
        return new Date(l.followUpDate) < new Date();
    }).length;
    const activePipelineCount = leads.filter((l: any) => ['new', 'contacted', 'showing', 'booked_showing', 'negotiation'].includes(l.pipelineStage)).length;

    // Derived filtering
    const filteredLeads = leads.filter((lead: any) => {
        const searchTarget = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone} ${lead.preferredAreas || ''}`.toLowerCase();
        if (searchQuery && !searchTarget.includes(searchQuery.toLowerCase())) return false;

        const score = lead.scores?.[0]?.finalScore || 0;
        if (activeFilter === 'High Intent' && score < 80) return false;
        if (activeFilter === 'Medium Intent' && (score < 50 || score >= 80)) return false;
        if (activeFilter === 'Low Intent' && score >= 50) return false;

        if (activeFilter === 'Needs Follow Up') {
            if (lead.pipelineStage === 'closed' || lead.pipelineStage === 'lost') return false;
            const isHotNew = lead.pipelineStage === 'new' && score >= 80;
            const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();
            if (!isHotNew && !isOverdue) return false;
        }

        if (activeFilter === 'Booked Showing' && lead.pipelineStage !== 'booked_showing' && lead.pipelineStage !== 'showing') return false;
        if (activeFilter === 'Closed' && lead.pipelineStage !== 'closed') return false;

        return true;
    }).sort((a: any, b: any) => {
        const scoreA = a.scores?.[0]?.finalScore || 0;
        const scoreB = b.scores?.[0]?.finalScore || 0;

        switch (sortOption) {
            case 'Highest Score': return scoreB - scoreA;
            case 'Lowest Score': return scoreA - scoreB;
            case 'Newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'Oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'Follow Up Date':
                const dateA = a.followUpDate ? new Date(a.followUpDate).getTime() : 0;
                const dateB = b.followUpDate ? new Date(b.followUpDate).getTime() : 0;
                return dateB - dateA;
            default: return scoreB - scoreA;
        }
    });

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-600/20';
        if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-600/20';
        return 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-500/10';
    };

    const isOverdue = (dateString: string | null) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    const formatStage = (stage: string) => {
        if (!stage) return 'New';
        return stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFC] relative">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold transition-all duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <span className="text-sm font-bold">{selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} selected</span>
                    <div className="w-px h-5 bg-slate-700" />
                    <button
                        onClick={() => setShowBulkConfirm(true)}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold px-2 py-2 rounded-lg transition-colors"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showBulkConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-rose-600">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">Delete {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''}?</h3>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkConfirm(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-60"
                            >
                                {isBulkDeleting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</> : `Delete ${selectedIds.size}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header & KPI Summary Bar */}
            <div className="p-6 pb-4 bg-white border-b border-slate-200/80 sticky top-0 z-10 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            Leads Management
                            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#853953]/10 text-[#853953] border border-[#853953]/20">
                                {totalCount} Total
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            AI-scored buyers, preference matching, and continuous pipeline automation.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center justify-center gap-2 bg-[#853953] hover:bg-[#612D53] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#853953]/20 active:scale-95 w-full md:w-auto"
                        >
                            <Plus className="w-4 h-4" /> Add Lead Manually
                        </button>
                    </div>
                </div>

                {/* 4 Metric Pill Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Leads</span>
                            <span className="text-lg font-black text-slate-900">{totalCount}</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Hot Intent (80+)</span>
                            <span className="text-lg font-black text-emerald-900">{hotLeadsCount}</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Flame className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Action Needed</span>
                            <span className="text-lg font-black text-rose-900">{needsFollowUpCount}</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-[#853953]/5 p-3.5 rounded-2xl border border-[#853953]/15 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-[#853953] uppercase tracking-wider block">Active Pipeline</span>
                            <span className="text-lg font-black text-[#853953]">{activePipelineCount}</span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-[#853953]/10 flex items-center justify-center text-[#853953]">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center pt-2">
                    <div className="flex-1 max-w-md w-full relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#853953] focus:border-transparent outline-none transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        {[
                            { id: 'All', label: 'All' },
                            { id: 'High Intent', label: '🔥 Hot (80+)' },
                            { id: 'Medium Intent', label: 'Warm (50-79)' },
                            { id: 'Low Intent', label: 'Cold (<50)' },
                            { id: 'Needs Follow Up', label: 'Needs Action' },
                            { id: 'Booked Showing', label: 'Showing' },
                            { id: 'Closed', label: 'Closed' }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap transition-all ${
                                    activeFilter === filter.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100/70'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative inline-block text-left w-full sm:w-auto">
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#853953] shadow-2xs"
                        >
                            <option>Highest Score</option>
                            <option>Lowest Score</option>
                            <option>Newest</option>
                            <option>Oldest</option>
                            <option>Follow Up Date</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Leads Table Area */}
            <div className="flex-1 overflow-auto p-6">
                {leads.length === 0 && searchQuery === '' && activeFilter === 'All' ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-2xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm flex flex-col items-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white mb-6 shadow-xl shadow-[#853953]/20">
                            <Sparkles className="w-8 h-8 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Start Capturing Leads</h2>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md mb-8">
                            Formative evaluates buyer intent using AI, recommends matching properties from your inventory, and schedules follow-up tasks automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#853953] text-white rounded-xl text-xs font-extrabold hover:bg-[#612D53] transition-all active:scale-95 shadow-lg shadow-[#853953]/20"
                            >
                                <Plus className="w-4 h-4" /> Add Lead Manually
                            </button>
                            <Link
                                href="/lead-capture"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold hover:bg-slate-50 transition-all active:scale-95 shadow-2xs"
                            >
                                <Zap className="w-4 h-4 text-[#853953]" /> Set Up Public Capture Form
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/80">
                                    <tr>
                                        <th scope="col" className="px-4 py-3.5 w-10">
                                            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 transition-colors">
                                                {selectedIds.size === filteredLeads.length && filteredLeads.length > 0
                                                    ? <CheckSquare className="w-4 h-4 text-[#853953]" />
                                                    : <Square className="w-4 h-4" />}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Lead Profile</th>
                                        <th scope="col" className="px-4 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">AI Score</th>
                                        <th scope="col" className="px-4 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Pipeline Stage</th>
                                        <th scope="col" className="px-4 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Target Locations</th>
                                        <th scope="col" className="px-4 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Budget & Timeline</th>
                                        <th scope="col" className="px-4 py-3.5 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Next Step</th>
                                        <th scope="col" className="relative px-5 py-3.5"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredLeads.map((lead: any) => {
                                        const scoreObj = lead.scores?.[0];
                                        const finalScore = scoreObj?.finalScore || 0;
                                        const overdue = isOverdue(lead.followUpDate) && lead.pipelineStage !== 'closed' && lead.pipelineStage !== 'lost';
                                        const isActionNeeded = (lead.pipelineStage === 'new' && finalScore >= 80) || overdue;

                                        // Format clean budget display
                                        const curr = lead.currency || '$';
                                        const bMin = lead.budgetMin ? `${curr}${Number(lead.budgetMin).toLocaleString()}` : null;
                                        const bMax = lead.budgetMax ? `${curr}${Number(lead.budgetMax).toLocaleString()}` : null;
                                        let budgetText = 'Flexible';
                                        if (bMin && bMax) budgetText = `${bMin} – ${bMax}`;
                                        else if (bMax) budgetText = `Up to ${bMax}`;
                                        else if (bMin) budgetText = `From ${bMin}`;

                                        return (
                                            <tr key={lead.id} className={`hover:bg-slate-50/70 transition-colors group ${selectedIds.has(lead.id) ? 'bg-[#853953]/5' : ''}`}>
                                                {/* Checkbox */}
                                                <td className="px-4 py-4">
                                                    <button onClick={() => toggleSelect(lead.id)} className="text-slate-300 hover:text-[#853953] transition-colors">
                                                        {selectedIds.has(lead.id)
                                                            ? <CheckSquare className="w-4 h-4 text-[#853953]" />
                                                            : <Square className="w-4 h-4" />}
                                                    </button>
                                                </td>

                                                {/* Lead Avatar & Contact */}
                                                <td className="px-5 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white font-black text-xs relative shadow-sm">
                                                            {lead.firstName?.charAt(0) || 'L'}{lead.lastName?.charAt(0) || ''}
                                                            {isActionNeeded && (
                                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-extrabold text-slate-900 group-hover:text-[#853953] transition-colors">
                                                                    {lead.firstName} {lead.lastName}
                                                                </span>
                                                                {isActionNeeded && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 tracking-wider uppercase border border-rose-200">
                                                                        Action
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                                                                <span className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3 text-slate-400" /> {lead.phone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* AI Score */}
                                                <td className="px-4 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {scoreObj ? (
                                                            <>
                                                                <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-black border ${getScoreColor(finalScore)}`}>
                                                                    {finalScore} pts
                                                                </span>
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                                    {scoreObj.likelihoodLabel || 'Intent'}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold text-[#853953] bg-[#853953]/5 border border-[#853953]/20">
                                                                <Loader2 className="w-3 h-3 animate-spin"/> Processing
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Pipeline Stage Dropdown */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <select
                                                        value={lead.pipelineStage}
                                                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                        className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-2.5 pr-6 rounded-xl focus:ring-2 focus:ring-[#853953] outline-none shadow-2xs cursor-pointer"
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="contacted">Contacted</option>
                                                        <option value="showing">Showing</option>
                                                        <option value="booked_showing">Booked Showing</option>
                                                        <option value="negotiation">Negotiation</option>
                                                        <option value="closed">Closed / Won</option>
                                                        <option value="lost">Lost</option>
                                                    </select>
                                                </td>

                                                {/* Target Locations (Cleanly Resolved) */}
                                                <td className="px-4 py-4 cursor-pointer max-w-xs" onClick={() => handleSelectLead(lead)}>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                                        <MapPin className="w-3.5 h-3.5 text-[#853953] flex-shrink-0" />
                                                        <span className="truncate">{lead.preferredAreas || lead.customLocation || 'Flexible'}</span>
                                                    </div>
                                                </td>

                                                {/* Budget & Timeline */}
                                                <td className="px-4 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                                    <div className="text-xs font-extrabold text-slate-900">{budgetText}</div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5 capitalize font-medium">
                                                        {lead.moveTimeline || 'Standard'} • {lead.financing?.replace(/_/g, ' ') || 'Cash'}
                                                    </div>
                                                </td>

                                                {/* Next Step / Suggested Action */}
                                                <td className="px-4 py-4 cursor-pointer max-w-xs" onClick={() => handleSelectLead(lead)}>
                                                    <p className="text-xs text-slate-700 line-clamp-2 font-medium">
                                                        {scoreObj?.suggestedAction || 'Review lead profile and pitch available properties.'}
                                                    </p>
                                                </td>

                                                {/* Quick Action Button */}
                                                <td className="px-5 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleSelectLead(lead)}
                                                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold shadow-2xs group-hover:border-[#853953] group-hover:text-[#853953] transition-colors"
                                                    >
                                                        Profile →
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredLeads.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                <p className="text-sm font-bold text-slate-700">No leads found matching your criteria</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Try resetting your search query or filter selection.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Load More Button */}
                        {leads.length < totalCount && (
                            <div className="mt-8 flex justify-center pb-12">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Loading more...</>
                                    ) : (
                                        <>Load More Leads ({totalCount - leads.length} remaining)</>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Slide-over Detail Drawer */}
            {selectedLead && (
                <LeadDetailDrawer
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteLead}
                />
            )}

            {/* Add Lead Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3.5">
                                <div className="p-3 bg-gradient-to-br from-[#853953] to-[#612D53] rounded-2xl shadow-md shadow-[#853953]/20">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Add New Lead Profile</h2>
                                    <p className="text-xs text-slate-500 font-medium">Capture buyer requirements for immediate AI scoring & matching</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all active:scale-90">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddLead} className="p-7 space-y-6">
                            {/* Essential Contact */}
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Essential Contact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">First Name *</label>
                                        <input required value={addForm.firstName}
                                            onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                            placeholder="John" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Last Name *</label>
                                        <input required value={addForm.lastName}
                                            onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                            placeholder="Smith" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Email Address *</label>
                                        <input required type="email" value={addForm.email}
                                            onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                            placeholder="john.smith@example.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Phone Number *</label>
                                        <div className="phone-wrapper rounded-xl overflow-hidden border border-slate-200 bg-slate-50/50 focus-within:ring-2 focus-within:ring-[#853953] focus-within:bg-white transition-all text-xs">
                                            <PhoneInput
                                                international
                                                defaultCountry="US"
                                                value={addForm.phone}
                                                onChange={val => setAddForm(f => ({ ...f, phone: val || '' }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Property & Location */}
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Property & Location</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Preferred Location</label>
                                        <input value={addForm.preferredAreas}
                                            onChange={e => setAddForm(f => ({ ...f, preferredAreas: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                            placeholder="e.g. Maitama, Wuse 2, Lekki" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Property Type</label>
                                        <select value={addForm.propertyType}
                                            onChange={e => setAddForm(f => ({ ...f, propertyType: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all bg-white">
                                            <option value="">Select type...</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Detached House">Detached House</option>
                                            <option value="Semi-Detached House">Semi-Detached House</option>
                                            <option value="Terrace">Terrace</option>
                                            <option value="Penthouse">Penthouse</option>
                                            <option value="Land">Land</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Budget Parameters</label>
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-3">
                                                <select
                                                    value={addForm.currency}
                                                    onChange={e => setAddForm(f => ({ ...f, currency: e.target.value }))}
                                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all bg-white">
                                                    <option value="$">USD ($)</option>
                                                    <option value="₦">NGN (₦)</option>
                                                    <option value="€">EUR (€)</option>
                                                    <option value="£">GBP (£)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-9 grid grid-cols-2 gap-3">
                                                <input
                                                    type="number" min="0" step="1000" value={addForm.budgetMin}
                                                    onChange={e => setAddForm(f => ({ ...f, budgetMin: e.target.value }))}
                                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                                    placeholder="Min Budget" />
                                                <input
                                                    type="number" min="0" step="1000" value={addForm.budgetMax}
                                                    onChange={e => setAddForm(f => ({ ...f, budgetMax: e.target.value }))}
                                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                                    placeholder="Max Budget" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Readiness & Intent */}
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Readiness & Intent</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Purchase Timeline</label>
                                        <select value={addForm.moveTimeline}
                                            onChange={e => setAddForm(f => ({ ...f, moveTimeline: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all bg-white">
                                            <option value="">Select timeline...</option>
                                            <option value="asap">Immediately / ASAP</option>
                                            <option value="1_month">Within 1 Month</option>
                                            <option value="3_months">1 – 3 Months</option>
                                            <option value="6_plus">6+ Months</option>
                                            <option value="just_looking">Just Browsing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Pre-approval Status</label>
                                        <div className="flex items-center h-[38px] px-1 bg-slate-100 rounded-xl p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setAddForm(f => ({ ...f, preApproval: true }))}
                                                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-bold transition-all ${addForm.preApproval ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                <CheckCircle2 className={`w-3.5 h-3.5 ${addForm.preApproval ? 'text-emerald-500' : 'text-slate-300'}`} /> Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAddForm(f => ({ ...f, preApproval: false }))}
                                                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-bold transition-all ${!addForm.preApproval ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                <X className={`w-3.5 h-3.5 ${!addForm.preApproval ? 'text-slate-400' : 'text-slate-300'}`} /> No
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Additional Notes for AI</label>
                                        <textarea rows={3} value={addForm.notes}
                                            onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all resize-none"
                                            placeholder="Capture intent signals, preferred amenities, family requirements..." />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={handleClearForm}
                                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                                    Clear Form
                                </button>
                                <div className="flex-1" />
                                <button type="button" onClick={() => setShowAddModal(false)}
                                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-[#853953] hover:bg-[#612D53] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#853953]/20 flex items-center gap-2 active:scale-95 disabled:opacity-50">
                                    {isSubmitting ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Save & Score Lead</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
