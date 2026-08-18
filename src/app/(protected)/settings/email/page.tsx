import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import EmailConnectionCard from '@/components/ui/settings/EmailConnectionCard';
import EmailSetupGuide from '@/components/ui/settings/EmailSetupGuide';
import { BackButton } from '@/components/ui/BackButton';


export default async function EmailSettingsPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session || !user) redirect('/sign-in');

    const agentProfile = await prisma.agentProfile.findUnique({
        where: { agentId: user.id }
    });

    const isConnected = !!(agentProfile?.gmailEmailAddress && (agentProfile as any)?.gmailAppPassword);

    // Count emails sent today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const emailsSentToday = await prisma.emailLog.count({
        where: { status: 'sent', sentAt: { gte: todayStart } }
    });

    const lastEmail = await prisma.emailLog.findFirst({
        where: { status: 'sent' },
        orderBy: { sentAt: 'desc' }
    });

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
            <BackButton label="Back to Settings" href="/settings" />
            {/* Page Title */}
            <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#853953]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#853953]" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Email Connection</h1>
                    <p className="text-sm text-slate-500">Set up your Gmail account to send automated lead emails directly from your own address.</p>
                </div>
            </div>

            {/* Layout: Sidebar Nav | Form | Guide */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Left: Settings Nav */}
                <div className="col-span-1 border-r border-slate-200 pr-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">Settings</p>
                    <nav className="space-y-1">
                        <Link href="/settings" className="text-slate-600 hover:bg-slate-50 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                            General
                        </Link>
                        <Link href="/settings/email" className="bg-[#853953]/10 text-[#853953] flex items-center px-3 py-2 text-sm font-medium rounded-md">
                            Email Connection
                        </Link>
                    </nav>
                </div>

                {/* Centre: Credential Form */}
                <div className="col-span-2">
                    <EmailConnectionCard
                        userId={user.id}
                        initialConnected={isConnected}
                        initialEmail={agentProfile?.gmailEmailAddress || ''}
                        initialFromName={agentProfile?.emailFromName || ''}
                        emailsSentToday={emailsSentToday}
                        lastEmailSent={lastEmail?.sentAt?.toISOString() || null}
                    />
                </div>

                {/* Right: Setup Guide */}
                <div className="col-span-2">
                    <EmailSetupGuide />
                </div>
            </div>
        </main>
    );
}

