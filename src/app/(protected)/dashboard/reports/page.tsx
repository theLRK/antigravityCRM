import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-10">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Analytics & Reports</h1>
                            <p className="text-sm text-slate-500 font-medium">Location-driven insights into your pipeline and properties.</p>
                        </div>
                    </div>
                </div>
                <ReportsClient />
            </div>
        </div>
    );
}
