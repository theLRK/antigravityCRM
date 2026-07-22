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

    // Check if user has completed onboarding — default to true (show wizard) on any error
    let isNewUser = true;
    try {
        const agentProfile = await (prisma.agentProfile as any).findUnique({
            where: { agentId: user!.id },
            select: { onboardingComplete: true }
        });
        isNewUser = !agentProfile || !agentProfile.onboardingComplete;
    } catch (err) {
        console.error('[Layout] Onboarding check failed, showing wizard by default:', err);
        isNewUser = true;
    }


    // Extract name — Google OAuth stores name differently than email sign-up
    // Google: user_metadata.full_name or user_metadata.name
    // Email signup: user_metadata.first_name + user_metadata.last_name
    const meta = user!.user_metadata || {};
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
