import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { User } from 'lucide-react';
import AgentProfileClient from '@/components/ui/settings/AgentProfileClient';
import { BackButton } from '@/components/ui/BackButton';


export default async function AccountPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session || !user) redirect('/sign-in');

    const profile = await prisma.agentProfile.findUnique({ where: { agentId: user.id } });

    return (
        <main className="flex-1 w-full max-w-3xl mx-auto px-8 py-10">
            <BackButton label="Back to Settings" href="/settings" />
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agent Profile</h1>
                </div>
                <p className="text-slate-500 text-sm ml-13">
                    This information powers your email signatures and template variables like <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">{'{{agent_name}}'}</code>.
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <AgentProfileClient initialProfile={profile} />
            </div>
        </main>
    );
}

