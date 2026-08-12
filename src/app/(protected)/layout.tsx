import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/dashboard/Sidebar';
import { prisma } from '@/lib/prisma';
import OnboardingWizard from '@/components/ui/OnboardingWizard';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/sign-in');
    }

    // Extract user metadata
    const meta = user!.user_metadata || {};

    // Check if user has completed onboarding — check Supabase Auth metadata first, then Postgres DB
    let isNewUser = false;
    if (meta.onboarding_complete === true) {
        isNewUser = false;
    } else {
        try {
            const agentProfile = await (prisma.agentProfile as any).findUnique({
                where: { agentId: user!.id },
                select: { onboardingComplete: true }
            });
            isNewUser = !agentProfile || !agentProfile.onboardingComplete;
        } catch (err) {
            console.error('[Layout] Onboarding DB check failed, defaulting to false for stability:', err);
            isNewUser = false;
        }
    }
    const googleFullName: string = meta.full_name || meta.name || '';
    const googleParts = (googleFullName.trim().split(' ')).filter(Boolean);

    const firstName: string =
        meta.first_name ||
        (googleParts.length > 0 ? googleParts[0] : '') ||
        '';
    const lastName: string =
        meta.last_name ||
        (googleParts.length > 1 ? googleParts.slice(1).join(' ') : '') ||
        '';

    // For Google users, we also get their avatar to pre-fill profile picture
    const avatarUrl: string = meta.avatar_url || meta.picture || '';

    return (
        <div className="bg-[#F3F4F4] min-h-screen text-[#2C2C2C] font-sans selection:bg-[#853953]/10 selection:text-[#853953] flex">
            {/* Global Left Sidebar Navigation */}
            <Sidebar user={user!} />

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <div className="p-8 lg:p-12">
                     {children}
                </div>
            </div>

            {/* Onboarding Wizard — shown automatically for new users */}
            {isNewUser && (
                <OnboardingWizard
                    userName={firstName}
                    userLastName={lastName}
                    userAvatar={avatarUrl}
                />
            )}
        </div>
    )

}
