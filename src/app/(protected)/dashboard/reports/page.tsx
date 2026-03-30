import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart3 } from 'lucide-react';
import ReportsClient from './ReportsClient';
import { BackButton } from '@/components/ui/BackButton';

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-8 py-10">
                <BackButton label="Back to Dashboard" href="/dashboard" />
                <div className="mb-8 mt-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#853953]/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-[#853953]" />
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
