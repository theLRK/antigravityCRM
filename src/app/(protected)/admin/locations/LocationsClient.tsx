'use client';
import { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, CheckCircle2, X, Tag, Globe, AlertTriangle } from 'lucide-react';

type Location = { id: string; name: string; groupId: string; isCustom: boolean; group: { id: string; name: string } };
type Group = { id: string; name: string; locations: Location[] };

export default function LocationsClient() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    // Group form
    const [newGroupName, setNewGroupName] = useState('');
    const [editingGroup, setEditingGroup] = useState<{ id: string; name: string } | null>(null);

    // Location form
    const [newLocName, setNewLocName] = useState('');
    const [newLocGroup, setNewLocGroup] = useState('');
    const [editingLoc, setEditingLoc] = useState<Location | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const refresh = async () => {
        const [gRes, lRes] = await Promise.all([fetch('/api/location-groups'), fetch('/api/locations')]);
        setGroups(await gRes.json());
        setLocations(await lRes.json());
        setLoading(false);
    };
    useEffect(() => { refresh(); }, []);

    // --- Group actions ---
    const createGroup = async () => {
        if (!newGroupName.trim()) return;
        setSaving(true);
        const res = await fetch('/api/location-groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newGroupName }) });
        if (res.ok) { setNewGroupName(''); await refresh(); } else { const e = await res.json(); setError(e.error); }
        setSaving(false);
    };
    const updateGroup = async () => {
        if (!editingGroup) return;
        await fetch(`/api/location-groups/${editingGroup.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingGroup.name }) });
        setEditingGroup(null);
        await refresh();
    };
    const deleteGroup = async (id: string) => {
        if (!confirm('Delete this group? Locations in it will lose their group.')) return;
        await fetch(`/api/location-groups/${id}`, { method: 'DELETE' });
        await refresh();
    };

    // --- Location actions ---
    const createLocation = async () => {
        if (!newLocName.trim() || !newLocGroup) { setError('Name and group are required'); return; }
        setSaving(true);
        const res = await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newLocName, groupId: newLocGroup }) });
        if (res.ok) { setNewLocName(''); setNewLocGroup(''); await refresh(); } else { const e = await res.json(); setError(e.error); }
        setSaving(false);
    };
    const updateLocation = async () => {
        if (!editingLoc) return;
        await fetch(`/api/locations/${editingLoc.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingLoc.name, groupId: editingLoc.groupId, isCustom: false }) });
        setEditingLoc(null);
        await refresh();
    };
    const deleteLocation = async (id: string) => {
        if (!confirm('Delete this location?')) return;
        await fetch(`/api/locations/${id}`, { method: 'DELETE' });
        await refresh();
    };
    const promoteCustom = async (loc: Location) => {
        await fetch(`/api/locations/${loc.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isCustom: false }) });
        await refresh();
    };

    const customLocations = locations.filter(l => l.isCustom);
    const officialLocations = locations.filter(l => !l.isCustom);

    if (loading) return <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading locations...</div>;

    return (
        <div className="space-y-10">
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* === LOCATION GROUPS === */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <h3 className="text-white font-bold text-sm tracking-wide uppercase">Location Groups</h3>
                        <span className="ml-auto bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">{groups.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {/* Add group form */}
                        <div className="flex gap-2">
                            <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createGroup()}
                                placeholder="New group name (e.g. Island)" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <button onClick={createGroup} disabled={saving || !newGroupName.trim()} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Group list */}
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {groups.map(g => (
                                <div key={g.id} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                                    {editingGroup?.id === g.id ? (
                                        <>
                                            <input value={editingGroup.name} onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                                className="flex-1 bg-white border border-purple-300 rounded-lg px-2 py-1 text-sm focus:outline-none" />
                                            <button onClick={updateGroup} className="text-purple-600 hover:text-purple-800"><CheckCircle2 className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingGroup(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 font-bold text-slate-800 text-sm">{g.name}</span>
                                            <span className="text-xs text-slate-400 font-medium">{g.locations.length} locations</span>
                                            <button onClick={() => setEditingGroup(g)} className="text-slate-400 hover:text-indigo-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteGroup(g.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                                </div>
                            ))}
                            {groups.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No groups yet. Add one above.</p>}
                        </div>
                    </div>
                </div>

                {/* === LOCATIONS === */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-white font-bold text-sm tracking-wide uppercase">Locations</h3>
                        <span className="ml-auto bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">{officialLocations.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {/* Add location form */}
                        <div className="flex gap-2">
                            <input value={newLocName} onChange={e => setNewLocName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createLocation()}
                                placeholder="Location name (e.g. Lekki)" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <select value={newLocGroup} onChange={e => setNewLocGroup(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="">Group</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <button onClick={createLocation} disabled={saving || !newLocName.trim() || !newLocGroup} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Official location list */}
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {officialLocations.map(loc => (
                                <div key={loc.id} className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                                    {editingLoc?.id === loc.id ? (
                                        <>
                                            <input value={editingLoc.name} onChange={e => setEditingLoc({ ...editingLoc, name: e.target.value })}
                                                className="w-28 bg-white border border-purple-300 rounded px-2 py-1 text-sm" />
                                            <select value={editingLoc.groupId} onChange={e => setEditingLoc({ ...editingLoc, groupId: e.target.value })}
                                                className="bg-white border border-slate-200 rounded px-1 py-1 text-xs">
                                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                            </select>
                                            <button onClick={updateLocation} className="text-purple-600 hover:text-purple-800 ml-auto"><CheckCircle2 className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingLoc(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span className="font-semibold text-slate-800 text-sm flex-1">{loc.name}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{loc.group.name}</span>
                                            <button onClick={() => setEditingLoc(loc)} className="text-slate-400 hover:text-indigo-600"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => deleteLocation(loc.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                                </div>
                            ))}
                            {officialLocations.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No locations yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* === CUSTOM LOCATIONS (from leads) === */}
            {customLocations.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 bg-amber-100 border-b border-amber-200 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-amber-600" />
                        <h3 className="text-amber-800 font-bold text-sm uppercase tracking-wide">Pending Review — Lead Submitted Locations</h3>
                        <span className="ml-auto bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{customLocations.length}</span>
                    </div>
                    <div className="p-5 space-y-2">
                        <p className="text-amber-700 text-xs font-medium mb-3">These locations were typed by leads using the "Other" option. Review and add them to your official list.</p>
                        {customLocations.map(loc => (
                            <div key={loc.id} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-amber-200">
                                <Tag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="flex-1 font-semibold text-slate-800 text-sm">{loc.name}</span>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase">Custom</span>
                                <select onChange={e => setEditingLoc({ ...loc, groupId: e.target.value })} className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs" defaultValue="">
                                    <option value="" disabled>Assign group</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <button onClick={() => editingLoc?.id === loc.id ? promoteCustom(editingLoc) : promoteCustom(loc)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                                    Approve
                                </button>
                                <button onClick={() => deleteLocation(loc.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
