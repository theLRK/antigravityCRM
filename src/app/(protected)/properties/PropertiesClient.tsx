"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Bed, Bath, Trash2, Home, X, Filter, Edit, Edit2, BedDouble, MoreVertical, FileText, Globe, CheckCircle, Share, ChevronRight } from 'lucide-react';
import { StyledInput } from '@/components/ui/StyledInput';
import { ImageUploadBox } from '@/components/ui/ImageUploadBox';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';
import { createProperty, updateProperty, deleteProperty } from './actions';
import MatchingLeadsSection from '@/components/ui/properties/MatchingLeadsSection';

export default function PropertiesClient({ initialProperties, locationGroups }: { initialProperties: any[], locationGroups?: any[] }) {
    const [properties, setProperties] = useState(initialProperties);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [viewingMatchesOf, setViewingMatchesOf] = useState<any | null>(null);
    const [viewingNotesOf, setViewingNotesOf] = useState<any | null>(null);
    
    // Global Currency
    const [currency, setCurrency] = useState('USD');
    const currencyMap: Record<string, {symbol: string, rate: number}> = {
        'USD': {symbol: '$', rate: 1},
        'EUR': {symbol: '€', rate: 0.92},
        'NGN': {symbol: '₦', rate: 1550},
        'GBP': {symbol: '£', rate: 0.79}
    };

    // Search/Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [bedsFilter, setBedsFilter] = useState('All');
    const [demandFilter, setDemandFilter] = useState('All');
    const [locFilter, setLocFilter] = useState('All');

    // Menu state
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Form state
    const [formParams, setFormParams] = useState({
        title: '',
        locationId: '',
        price: '',
        beds: '',
        baths: '',
        status: 'Available',
        propertyType: 'House'
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notesText, setNotesText] = useState('');

    const convertPrice = (priceUSD: number) => {
        const rate = currencyMap[currency]?.rate || 1;
        const sym = currencyMap[currency]?.symbol || '$';
        return `${sym}${(priceUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    };

    const getDemandLevel = (matchCount: number) => {
        if (matchCount >= 6) return { label: 'High Demand', color: 'bg-emerald-500', text: 'text-white' };
        if (matchCount >= 3) return { label: 'Medium Demand', color: 'bg-amber-500', text: 'text-white' };
        return { label: 'Low Demand', color: 'bg-slate-400', text: 'text-white' };
    };

    const filteredProps = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesType = typeFilter === 'All' || p.propertyType === typeFilter;
        const matchesLoc = locFilter === 'All' || p.locationId === locFilter;
        
        let matchesBeds = true;
        if (bedsFilter !== 'All') {
            if (bedsFilter === '4+') matchesBeds = p.bedrooms >= 4;
            else matchesBeds = p.bedrooms.toString() === bedsFilter;
        }

        let matchesDemand = true;
        const matchCount = p.matches?.length || 0;
        if (demandFilter !== 'All') {
            const dl = getDemandLevel(matchCount).label;
            matchesDemand = dl === demandFilter;
        }

        return matchesSearch && matchesStatus && matchesType && matchesBeds && matchesDemand && matchesLoc;
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const openEdit = (p: any) => {
        setFormParams({
            title: p.title,
            locationId: p.locationId || '',
            price: p.price.toString(),
            beds: p.bedrooms.toString(),
            baths: p.bathrooms.toString(),
            status: p.status,
            propertyType: p.propertyType
        });
        setPreviewUrl(p.images && p.images.length > 0 ? JSON.parse(p.images)[0] : null);
        setEditingId(p.id);
        setIsAdding(true);
    };

    const handleSave = async () => {
        if (!formParams.title || !formParams.locationId) {
            alert("Please fill out at least the title and select a location.");
            return;
        }
        let locName = 'Unknown Location';
        for (const g of (locationGroups || [])) {
            const loc = g.locations.find((l: any) => l.id === formParams.locationId);
            if (loc) {
                locName = loc.name;
                break;
            }
        }
        setIsSubmitting(true);
        try {
            const data = {
                title: formParams.title,
                location: locName,
                locationId: formParams.locationId,
                price: parseInt(formParams.price.replace(/[^0-9]/g, '')) || 0,
                bedrooms: parseInt(formParams.beds) || 0,
                bathrooms: parseFloat(formParams.baths) || 0,
                status: formParams.status,
                propertyType: formParams.propertyType,
                images: previewUrl ? [previewUrl] : []
            };
            if (editingId) {
                const updated = await updateProperty(editingId, data);
                setProperties(properties.map(p => p.id === editingId ? updated : p));
            } else {
                const created = await createProperty({ ...data, currency: 'USD' });
                setProperties([created, ...properties]);
            }
            setIsAdding(false);
            setEditingId(null);
            setFormParams({ title: '', locationId: '', price: '', beds: '', baths: '', status: 'Available', propertyType: 'House' });
            setPreviewUrl(null);
        } catch (error) {
            alert("Failed to save property");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            setProperties(properties.filter(p => p.id !== id));
            setIsDeletingId(null);
        } catch (err: any) {
            alert("Failed to delete property");
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const updated = await updateProperty(id, { status: newStatus });
            setProperties(properties.map(p => p.id === id ? { ...p, status: newStatus } : p));
            setActiveMenuId(null);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    // Outside click for menu
    useEffect(() => {
        const handleClick = () => setActiveMenuId(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    if (isAdding) {
        return (
            <div className="p-8 max-w-4xl mx-auto w-full animation-slide-up">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">{editingId ? 'Edit Property' : 'Add New Property'}</h1>
                    </div>
                    <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-lg">Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Property Title</label>
                            <StyledInput value={formParams.title} onChange={(e) => setFormParams({ ...formParams, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                            <select value={formParams.locationId} onChange={(e) => setFormParams({ ...formParams, locationId: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white">
                                <option value="" disabled>Select Location</option>
                                {(locationGroups || []).map((group: any) => (
                                    <optgroup key={group.id} label={group.name}>
                                        {group.locations.map((loc: any) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Price (USD)</label>
                                <StyledInput type="text" value={formParams.price} onChange={(e) => setFormParams({ ...formParams, price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Beds</label>
                                <StyledInput type="number" min="0" value={formParams.beds} onChange={(e) => setFormParams({ ...formParams, beds: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Baths</label>
                                <StyledInput type="number" min="0" value={formParams.baths} onChange={(e) => setFormParams({ ...formParams, baths: e.target.value })} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                <select value={formParams.status} onChange={e => setFormParams({...formParams, status: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white">
                                    <option value="Available">Available</option>
                                    <option value="Reserved">Reserved</option>
                                    <option value="Under Negotiation">Under Negotiation</option>
                                    <option value="Sold">Sold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Property Type</label>
                                <select value={formParams.propertyType} onChange={e => setFormParams({...formParams, propertyType: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white">
                                    <option value="House">House</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Duplex">Duplex</option>
                                    <option value="Penthouse">Penthouse</option>
                                    <option value="Condo">Condo</option>
                                    <option value="Land">Land</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-slate-700 mb-2 block">Property Images</label>
                            <ImageUploadBox onChange={handleFileChange} selectedFileUrl={previewUrl} />
                        </div>
                        <div className="pt-4">
                            <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-[#853953] hover:bg-[#612D53] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                                <Plus className="w-5 h-5" /> {isSubmitting ? 'Saving...' : 'Save Property'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <Home className="w-8 h-8 text-[#853953]" /> Catalog & Management
                    </h1>
                    <p className="text-slate-500 mt-2">Manage properties, track demand, and send automated pitches to matching leads.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="NGN">NGN (₦)</option>
                        </select>
                    </div>
                    <button onClick={() => { setIsAdding(true); }} className="flex items-center gap-2 bg-[#853953] hover:bg-[#612D53] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                        <Plus className="w-5 h-5" /> Add Property
                    </button>
                </div>
            </div>
            
            {/* Advanced Filters */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 shadow-sm">
                <div className="relative lg:col-span-2">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search Title or Address..." 
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#853953] outline-none h-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={locFilter} onChange={e => setLocFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                    <option value="All">All Locations</option>
                    {(locationGroups || []).map((g: any) => (
                        <optgroup key={g.id} label={g.name}>
                            {g.locations.map((loc: any) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </optgroup>
                    ))}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                    <option value="All">All Types</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Condo">Condo</option>
                </select>
                <select value={bedsFilter} onChange={e => setBedsFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                    <option value="All">Beds: Any</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4+">4+ Beds</option>
                </select>
                <select value={demandFilter} onChange={e => setDemandFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white">
                    <option value="All">Demand: Any</option>
                    <option value="High Demand">High Demand</option>
                    <option value="Medium Demand">Medium Demand</option>
                    <option value="Low Demand">Low Demand</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#853953] bg-white lg:col-span-full xl:col-span-1">
                    <option value="All">Status: All</option>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Under Negotiation">Under Negotiation</option>
                    <option value="Sold">Sold</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProps.map(p => {
                    const images = p.images ? JSON.parse(p.images) : [];
                    const heroImg = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=400&h=300';
                    const matchCount = p.matches?.length || 0;
                    const demand = getDemandLevel(matchCount);

                    return (
                        <div key={p.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full group overflow-visible">
                            {/* Card Image Wrapper */}
                            <div className="h-48 bg-slate-100 relative overflow-hidden rounded-t-3xl shrink-0">
                                <img src={heroImg} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                
                                {/* Badges */}
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${demand.color} ${demand.text}`}>
                                        {demand.label}
                                    </span>
                                </div>
                            </div>

                            {/* Moved Dropdown outside of overflow-hidden image wrapper */}
                            <div className="absolute top-4 right-4 z-40">
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === p.id ? null : p.id); }} className="p-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 rounded-lg shadow-sm">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                {activeMenuId === p.id && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-[100] transform origin-top-right transition-all max-h-[400px] overflow-y-auto scrollbar-hide">
                                        <button onClick={() => { openEdit(p); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium">
                                            <Edit2 className="w-4 h-4 text-slate-400" /> Edit Listing
                                        </button>
                                        <button onClick={() => { setViewingMatchesOf(p); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium">
                                            <Share className="w-4 h-4 text-slate-400" /> Send To Leads
                                        </button>
                                        <button onClick={() => { setViewingNotesOf(p); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium">
                                            <FileText className="w-4 h-4 text-slate-400" /> Internal Notes
                                        </button>
                                        <div className="border-t border-slate-100 my-2"></div>
                                        <div className="px-4 py-1">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 mt-1">Status</div>
                                            <div className="flex flex-col gap-0.5">
                                                {['Available', 'Reserved', 'Under Negotiation', 'Sold'].map(st => (
                                                    <button key={st} onClick={() => handleStatusChange(p.id, st)} className={`w-full text-left px-4 py-2 text-xs font-bold rounded-md hover:bg-slate-100 transition-colors ${p.status === st ? 'bg-[#853953]/5 text-[#853953]' : 'text-slate-600'}`}>
                                                        {st}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <button onClick={(e) => { e.stopPropagation(); setIsDeletingId(p.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                            <Trash2 className="w-4 h-4 text-rose-500" /> Delete Property
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Card Content Wrapper */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-extrabold text-lg text-slate-900 leading-tight line-clamp-2">{p.title}</h3>
                                    <span className="font-black text-[#853953] bg-[#853953]/5 px-2 py-1 rounded-lg text-sm shrink-0 ml-3">
                                        {convertPrice(p.price)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-4">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{p.location}</span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-auto">
                                    <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><BedDouble className="w-3.5 h-3.5 mr-1.5 text-[#853953]" /> {p.bedrooms} Beds</span>
                                    <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"><Bath className="w-3.5 h-3.5 mr-1.5 text-[#853953]" /> {p.bathrooms} Baths</span>
                                    <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 ml-auto whitespace-nowrap">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${p.status === 'Available' ? 'bg-emerald-500' : p.status === 'Sold' ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
                                        {p.status}
                                    </span>
                                </div>
                                
                                {/* Matches Button (Standard layout) */}
                                <div className="mt-5 pt-4 border-t border-slate-100">
                                    <button onClick={() => setViewingMatchesOf(p)} className="flex items-center justify-between w-full p-3 rounded-xl bg-[#853953]/5 hover:bg-[#853953]/10 border-[#853953]/10 hover:border-[#853953]/20 transition-all group/btn">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#612D53] animate-pulse" />
                                            <span className="text-sm font-extrabold text-[#612D53]">{matchCount} Matching Leads</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-[#853953] group-hover/btn:text-[#612D53] group-hover/btn:translate-x-0.5 transition-all" />
                                    </button>
                                </div>
                            </div>
                            {/* Delete Overlay */}
                            {isDeletingId === p.id && (
                                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animation-fade-in rounded-3xl">
                                    <Trash2 className="w-10 h-10 text-rose-500 mb-3" />
                                    <h4 className="font-bold text-slate-900 mb-1">Delete Property?</h4>
                                    <p className="text-sm text-slate-500 mb-6 font-medium">This wipes it and all existing leads matches permanently.</p>
                                    <div className="flex gap-3 w-full">
                                        <button onClick={() => setIsDeletingId(null)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">Cancel</button>
                                        <button onClick={() => handleDelete(p.id)} className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors shadow-sm">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredProps.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100"><Home className="w-8 h-8 text-slate-300" /></div>
                        <h3 className="text-lg font-bold text-slate-900">No properties match your filters</h3>
                        <p className="text-slate-500 font-medium">Try adjusting criteria above or add a new property.</p>
                    </div>
                )}
            </div>

            {viewingMatchesOf && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setViewingMatchesOf(null)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-4xl bg-white shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-5 border-b border-slate-200 flex items-center justify-between z-10 shadow-sm">
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 line-clamp-1 pr-4">{viewingMatchesOf.title}</h2>
                                <p className="text-xs font-bold text-[#853953] uppercase tracking-widest mt-1">Lead Matching Pipeline</p>
                            </div>
                            <button onClick={() => setViewingMatchesOf(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                            <MatchingLeadsSection property={viewingMatchesOf} />
                        </div>
                    </div>
                </>
            )}

            {/* View Notes Modal Wrapper (Using simple component below) */}
            {viewingNotesOf && <PropertyNotesDrawer property={viewingNotesOf} onClose={() => setViewingNotesOf(null)} />}
        </div>
    );
}

// Inline Notes Drawer Component
function PropertyNotesDrawer({ property, onClose }: { property: any, onClose: () => void }) {
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/properties/${property.id}/notes`)
            .then(r => r.json())
            .then(d => { setNotes(d.notes || []); setLoading(false); });
    }, [property.id]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const res = await fetch(`/api/properties/${property.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote })
            });
            const { note } = await res.json();
            setNotes([note, ...notes]);
            setNewNote('');
        } catch (err) {
            alert("Failed to add note");
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform border-l border-slate-200">
                <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-slate-200 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-[#853953]"/> Internal Notes</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1 truncate max-w-[200px]">{property.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full shrink-0"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <textarea 
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="e.g., Owner flexible on price, urgent sale..."
                        className="w-full h-24 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#853953] text-sm resize-none"
                    />
                    <button onClick={handleAddNote} disabled={!newNote.trim()} className="mt-3 w-full bg-[#853953] hover:bg-[#612D53] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm">
                        Save Note
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                    {loading ? <p className="text-slate-400 text-sm text-center py-10">Loading notes...</p> : notes.length === 0 ? <p className="text-slate-400 text-sm text-center py-10 italic">No internal notes yet.</p> : (
                        notes.map(n => (
                            <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-900">{n.agentName}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
