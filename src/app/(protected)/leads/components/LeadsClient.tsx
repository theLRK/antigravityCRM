'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Plus,
    Phone,
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
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { getLeads, updateLeadStatus, addLeadNote, deleteLead, createLead, getLeadDetails } from '../actions';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
    const [leads, setLeads] = useState(initialLeads.leads || []);
    const [totalCount, setTotalCount] = useState(initialLeads.totalCount || 0);
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

    // Polling for new leads - Reduced to 60s
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
        setLeads(prev => [...prev, ...res.leads]);
        setPage(nextPage);
        setIsLoadingMore(false);
    };

    const handleSelectLead = async (lead: any) => {
        // Show loading state by reusing an existing state or directly setting selectedLead and letting drawer show spinner?
        // Actually, just set an empty skeleton or use a dedicated loading state.
        // For simplicity, we can set `toast` or just wait smoothly.
        const loadingId = toast?.message;
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
            setLeads(leads.map(l => l.id === leadId ? { ...l, pipelineStage: newStatus } : l));
        });
        await updateLeadStatus(leadId, newStatus);
    };

    const handleDeleteLead = async (leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        const name = lead ? `${lead.firstName} ${lead.lastName}` : 'Lead';
        startTransition(() => {
            setLeads(leads.filter(l => l.id !== leadId));
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
            setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
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
            setSelectedIds(new Set(filteredLeads.map(l => l.id)));
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
            // Refresh leads list
            const fresh = await getLeads();
            setLeads(fresh as any);
            setShowAddModal(false);
            handleClearForm();
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

    // Derived filtering
    const filteredLeads = leads.filter(lead => {
        // Search 
        const searchTarget = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`.toLowerCase();
        if (searchQuery && !searchTarget.includes(searchQuery.toLowerCase())) return false;

        // Quick Filters
        const score = lead.scores?.[0]?.finalScore || 0;
        if (activeFilter === 'High Intent' && score < 80) return false;
        if (activeFilter === 'Medium Intent' && (score < 50 || score >= 80)) return false;
        if (activeFilter === 'Low Intent' && score >= 50) return false;

        if (activeFilter === 'Needs Follow Up') {
            if (!lead.followUpDate || lead.pipelineStage === 'closed') return false;
            const now = new Date();
            const followUp = new Date(lead.followUpDate);
            if (followUp > now) return false;
        }

        if (activeFilter === 'Booked Showing' && lead.pipelineStage !== 'booked_showing') return false;
        if (activeFilter === 'Closed' && lead.pipelineStage !== 'closed') return false;

        return true;
    }).sort((a: any, b: any) => {
        // Sorting
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
        if (score >= 80) return 'text-green-700 bg-green-50 ring-green-600/20';
        if (score >= 50) return 'text-orange-700 bg-orange-50 ring-orange-600/20';
        return 'text-slate-600 bg-slate-50 ring-slate-500/10';
    };

    const isOverdue = (dateString: string | null) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    const formatStage = (stage: string) => {
        return stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700">
                    <span className="text-sm font-semibold">{selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''} selected</span>
                    <div className="w-px h-5 bg-slate-600" />
                    <button
                        onClick={() => setShowBulkConfirm(true)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Delete Selected
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" /> Clear
                    </button>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showBulkConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Delete {selectedIds.size} lead{selectedIds.size > 1 ? 's' : ''}?</h3>
                                <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkConfirm(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                            >
                                {isBulkDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : `Yes, delete ${selectedIds.size}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Control Bar */}
            <div className="flex flex-col gap-4 p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Leads</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-[#853953] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#612D53] transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Add Lead
                    </button>
                </div>

                {/* Soft Usage Gate Banner */}
                {leads.length >= 25 && (
                    <div className="mt-2 p-3 bg-[#853953]/5 border border-[#853953]/10 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                <Zap className="w-4 h-4 text-[#853953]" />
                            </div>
                            <p className="text-sm font-medium text-[#2C2C2C]">
                                You're processing <span className="font-bold">{leads.length} leads</span>. Upgrade to Pro for unlimited leads, AI scoring, and automated engagement.
                            </p>
                        </div>
                        <Link 
                            href="/#pricing" 
                            className="px-4 py-1.5 bg-[#853953] text-white text-xs font-bold rounded-lg hover:bg-[#612D53] transition-colors shadow-sm whitespace-nowrap"
                        >
                            View Plans
                        </Link>
                    </div>
                )}

                <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mt-2">
                    <div className="flex-1 max-w-md w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#853953] focus:border-transparent outline-none shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-sm gap-y-2">
                        {['All', 'High Intent', 'Medium Intent', 'Low Intent', 'Needs Follow Up', 'Booked Showing', 'Closed'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${activeFilter === filter
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
                        <div className="relative inline-block text-left">
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none bg-white border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#853953] shadow-sm"
                            >
                                <option>Highest Score</option>
                                <option>Lowest Score</option>
                                <option>Newest</option>
                                <option>Oldest</option>
                                <option>Follow Up Date</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Leads List Table Area */}
            <div className="flex-1 overflow-auto p-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-10">
                                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 transition-colors">
                                        {selectedIds.size === filteredLeads.length && filteredLeads.length > 0
                                            ? <CheckSquare className="w-4 h-4 text-[#853953]" />
                                            : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline / Financing</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow Up</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Action</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Quick Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLeads.map((lead) => {
                                const scoreObj = lead.scores?.[0];
                                const finalScore = scoreObj?.finalScore || 0;
                                const overdue = isOverdue(lead.followUpDate) && lead.pipelineStage !== 'closed';
                                console.log(lead)
                                return (
                                    <tr key={lead.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.has(lead.id) ? 'bg-[#853953]/5' : ''}`}>
                                        <td className="px-4 py-4">
                                            <button onClick={() => toggleSelect(lead.id)} className="text-slate-300 hover:text-[#853953] transition-colors">
                                                {selectedIds.has(lead.id)
                                                    ? <CheckSquare className="w-4 h-4 text-[#853953]" />
                                                    : <Square className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold relative">
                                                    {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                                                    {((lead.pipelineStage === 'new' && finalScore >= 80) || overdue) && (
                                                       <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                           <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                                       </span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 group-hover:text-[#853953]">{lead.firstName} {lead.lastName}</span>
                                                        {((lead.pipelineStage === 'new' && finalScore >= 80) || overdue) && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 tracking-wider uppercase border border-red-200">Action Needed</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => handleSelectLead(lead)}>
                                            <div className="flex flex-col gap-1 items-start">
                                                {scoreObj ? (
                                                    <>
                                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${getScoreColor(finalScore)} w-14 justify-center`}>
                                                            {finalScore} pts
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                            {scoreObj.confidenceLevel || 'N/A'} Conf.
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold text-[#853953] bg-[#853953]/5 ring-1 ring-inset ring-[#853953]/20 whitespace-nowrap">
                                                        <Loader2 className="w-3 h-3 animate-spin"/> Processing
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={lead.pipelineStage}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 pl-2 pr-6 rounded focus:ring-1 focus:ring-[#853953] shadow-sm cursor-pointer"
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="booked_showing">Booked Showing</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                            <div className="text-sm text-slate-900 font-medium">{lead.moveTimeline || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 capitalize">{lead.financing ? lead.financing.replace('_', ' ') : 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                            <div className={`text-sm font-semibold flex items-center gap-1.5 ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                                                {overdue && <AlertCircle className="w-4 h-4" />}
                                                {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : 'None setup'}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">Source: {lead.source || 'Organic'}</div>
                                        </td>
                                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                            <div className="text-sm text-slate-700 line-clamp-2 max-w-xs font-medium">
                                                {scoreObj?.suggestedAction || 'Review lead details'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    title="Mark Contacted"
                                                    onClick={() => handleStatusChange(lead.id, 'contacted')}
                                                    className="p-1.5 text-slate-400 hover:text-[#853953] hover:bg-[#853953]/5 rounded"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Book Showing"
                                                    onClick={() => handleStatusChange(lead.id, 'booked_showing')}
                                                    className="p-1.5 text-slate-400 hover:text-[#853953] hover:bg-[#853953]/5 rounded"
                                                >
                                                    <CalendarCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Add Note (Quick)"
                                                    onClick={(e) => {
                                                        const note = prompt('Add a quick note:');
                                                        if (note) addLeadNote(lead.id, note);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                        No leads found matching your criteria.
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
                            className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Loading more...</>
                            ) : (
                                <>Load More Leads ({totalCount - leads.length} remaining)</>
                            )}
                        </button>
                    </div>
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
                        <div className="flex items-center justify-between p-7 border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-[#853953] to-[#612D53] rounded-2xl shadow-lg shadow-[#853953]/20">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Lead Input Interface</h2>
                                    <p className="text-sm text-slate-500 mt-0.5 font-medium">Capture detailed buyer profile for AI scoring</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all active:scale-90">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddLead} className="p-8 space-y-8">
                            {/* Section: Essential Information */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#853953]" />
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Essential Contact</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">First Name *</label>
                                        <input required value={addForm.firstName}
                                            onChange={e => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white focus:border-transparent outline-none transition-all"
                                            placeholder="John" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Last Name *</label>
                                        <input required value={addForm.lastName}
                                            onChange={e => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white focus:border-transparent outline-none transition-all"
                                            placeholder="Smith" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Email Address *</label>
                                        <input required type="email" value={addForm.email}
                                            onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white focus:border-transparent outline-none transition-all"
                                            placeholder="john.smith@example.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Phone Number *</label>
                                        <div className="phone-wrapper rounded-xl overflow-hidden border border-slate-200 bg-slate-50/50 focus-within:ring-2 focus-within:ring-[#853953] focus-within:bg-white transition-all">
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

                            {/* Section: Property Requirements */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#612D53]" />
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Property & Location</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Preferred Location</label>
                                        <input value={addForm.preferredAreas}
                                            onChange={e => setAddForm(f => ({ ...f, preferredAreas: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white focus:border-transparent outline-none transition-all"
                                            placeholder="e.g. Lagos Island, Victoria Island" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Property Type</label>
                                        <select value={addForm.propertyType}
                                            onChange={e => setAddForm(f => ({ ...f, propertyType: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white focus:border-transparent outline-none transition-all bg-white">
                                            <option value="">Select type...</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="Detached House">Detached House</option>
                                            <option value="Semi-Detached House">Semi-Detached House</option>
                                            <option value="Terrace">Terrace</option>
                                            <option value="Penthouse">Penthouse</option>
                                            <option value="Land">Land</option>
                                            <option value="Office Space">Office Space</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Budget Range</label>
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-3">
                                                <select
                                                    value={addForm.currency}
                                                    onChange={e => setAddForm(f => ({ ...f, currency: e.target.value }))}
                                                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all bg-white">
                                                    <option value="$">USD ($)</option>
                                                    <option value="₦">NGN (₦)</option>
                                                    <option value="€">EUR (€)</option>
                                                    <option value="£">GBP (£)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-9 grid grid-cols-2 gap-3">
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold group-focus-within:text-[#853953] transition-colors">{addForm.currency}</span>
                                                    <input
                                                        type="number" min="0" step="1000" value={addForm.budgetMin}
                                                        onChange={e => setAddForm(f => ({ ...f, budgetMin: e.target.value }))}
                                                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                                        placeholder="Min" />
                                                </div>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold group-focus-within:text-[#853953] transition-colors">{addForm.currency}</span>
                                                    <input
                                                        type="number" min="0" step="1000" value={addForm.budgetMax}
                                                        onChange={e => setAddForm(f => ({ ...f, budgetMax: e.target.value }))}
                                                        className="w-full border border-slate-200 bg-slate-50/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all"
                                                        placeholder="Max" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Intent & Readiness */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Readiness & Intent</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Purchase Timeline</label>
                                        <select value={addForm.moveTimeline}
                                            onChange={e => setAddForm(f => ({ ...f, moveTimeline: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all bg-white">
                                            <option value="">Select timeline...</option>
                                            <option value="asap">Immediately / ASAP</option>
                                            <option value="1_month">Within 1 Month</option>
                                            <option value="3_months">1 – 3 Months</option>
                                            <option value="6_plus">6+ Months</option>
                                            <option value="just_looking">Just Browsing</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Pre-approval Status</label>
                                        <div className="flex items-center h-[42px] px-1 bg-slate-100 rounded-xl p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setAddForm(f => ({ ...f, preApproval: true }))}
                                                className={`flex-1 flex items-center justify-center gap-2 h-full rounded-lg text-xs font-bold transition-all ${addForm.preApproval ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                <CheckCircle2 className={`w-3.5 h-3.5 ${addForm.preApproval ? 'text-emerald-500' : 'text-slate-300'}`} /> Yes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAddForm(f => ({ ...f, preApproval: false }))}
                                                className={`flex-1 flex items-center justify-center gap-2 h-full rounded-lg text-xs font-bold transition-all ${!addForm.preApproval ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                                <X className={`w-3.5 h-3.5 ${!addForm.preApproval ? 'text-slate-400' : 'text-slate-300'}`} /> No
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">Additional Notes</label>
                                        <textarea rows={3} value={addForm.notes}
                                            onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                                            className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#853953] focus:bg-white outline-none transition-all resize-none"
                                            placeholder="Capture intent signals, preferred amenities, or any other signals for AI evaluation..." />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={handleClearForm}
                                    className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 active:scale-95 transition-all">
                                    Clear Form
                                </button>
                                <div className="flex-1" />
                                <button type="button" onClick={() => setShowAddModal(false)}
                                    className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 text-emerald-400" /> Save Lead</>
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
