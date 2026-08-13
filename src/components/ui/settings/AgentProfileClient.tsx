'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Save, CheckCircle, Loader2, User } from 'lucide-react';

export default function AgentProfileClient({ initialProfile }: { initialProfile: any }) {
    const router = useRouter();
    const [profile, setProfile] = useState({
        name: initialProfile?.name || '',
        phone: initialProfile?.phone || '',
        company: initialProfile?.company || '',
        signature: initialProfile?.signature || '',
    });
    const [imageUrl, setImageUrl] = useState(initialProfile?.imageUrl || '');
    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await fetch('/api/profile/upload-image', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.imageUrl) setImageUrl(data.imageUrl);
        } catch {}
        setUploading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, imageUrl })
            });
            if (res.ok) {
                setSavedOk(true);
                router.refresh();
                setTimeout(() => setSavedOk(false), 2500);
            }
        } catch (err) {
            console.error('Save profile error:', err);
        }
        setSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* Avatar Section */}
            <div className="flex items-start gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                    <div className="w-24 h-24 rounded-2xl bg-[#853953]/5 border-2 border-[#853953]/10 flex items-center justify-center overflow-hidden shadow-sm">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Agent" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-[#853953]/30" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <Camera className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-lg">{profile.name || 'Your Name'}</h3>
                    <p className="text-sm text-slate-500">{profile.company || 'Your Company'}</p>
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="mt-2 text-xs font-bold text-[#853953] hover:text-[#853953]/90 flex items-center gap-1.5"
                    >
                        <Camera className="w-3.5 h-3.5" />
                        {imageUrl ? 'Change Photo' : 'Upload Photo'}
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                        value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                        placeholder="Jane Smith"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-[#853953]/20 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Phone</label>
                    <input
                        value={profile.phone}
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+1 555 000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-[#853953]/20 outline-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Company / Agency</label>
                    <input
                        value={profile.company}
                        onChange={e => setProfile(p => ({ ...p, company: e.target.value }))}
                        placeholder="Premier Realty Group"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-[#853953]/20 outline-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Signature</label>
                    <textarea
                        value={profile.signature}
                        onChange={e => setProfile(p => ({ ...p, signature: e.target.value }))}
                        placeholder="Best regards,&#10;Jane Smith | Premier Realty Group&#10;+1 555 000 0000"
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-[#853953]/20 outline-none resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Available in emails as: <code className="bg-slate-100 px-1 rounded">{'{{agent_name}}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{{agent_phone}}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{{agent_company}}'}</code></p>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-all
                    ${savedOk ? 'bg-green-500 text-white' : 'bg-[#853953] hover:bg-[#853953]/90 text-white'}
                    disabled:opacity-60`}
            >
                {savedOk ? <CheckCircle className="w-4 h-4" /> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savedOk ? 'Saved!' : saving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>
    );
}
