import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { MapPin } from 'lucide-react';
import LocationsClient from './LocationsClient';

export default async function LocationsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-8 py-10">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Location Management</h1>
                            <p className="text-sm text-slate-500 font-medium">Manage location groups and locations used across leads, properties, and reports.</p>
                        </div>
                    </div>
                </div>
                <LocationsClient />
            </div>
        </div>
    );
}
