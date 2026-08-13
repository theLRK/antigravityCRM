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

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            if (typeof reader.result === 'string') {
                const dataUrl = reader.result;
                setImageUrl(dataUrl);

                // Send to backend API as well
                try {
                    const fd = new FormData();
                    fd.append('file', file);
                    const res = await fetch('/api/profile/upload-image', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.imageUrl) setImageUrl(data.imageUrl);
                } catch (apiErr) {
                    console.warn('[Profile Client] API upload warning, retaining Base64 URL:', apiErr);
                }
            }
            setUploading(false);
        };
        reader.onerror = () => {
            setUploading(false);
        };
        reader.readAsDataURL(file);
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative group cursor-pointer shrink-0" onClick={() => fileRef.current?.click()}>
                    <div className="w-24 h-24 rounded-2xl bg-[#853953]/5 border-2 border-[#853953]/10 flex items-center justify-center overflow-hidden shadow-sm">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Agent Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-[#853953]/30" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <Camera className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>

                <div className="flex-1 w-full space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg">{profile.name || 'Your Name'}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="text-xs font-bold text-white bg-[#853953] hover:bg-[#853953]/90 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            {imageUrl ? 'Choose New Photo' : 'Upload Photo'}
                        </button>
                        {imageUrl && (
                            <button
                                type="button"
                                onClick={() => setImageUrl('')}
                                className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>
                    <div className="pt-1">
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Or paste an image URL (e.g. https://...)"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-[#853953]/20 outline-none"
                        />
                    </div>
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
