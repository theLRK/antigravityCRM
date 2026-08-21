import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/dashboard/Sidebar';
import { prisma } from '@/lib/prisma';
import OnboardingWizard from '@/components/ui/OnboardingWizard';

import { PresenterModeProvider } from '@/components/ui/PresenterModeContext';

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

    // Check if user has completed onboarding and fetch profile image
    let isNewUser = false;
    let dbAvatarUrl = '';
    
    try {
        const agentProfile = await prisma.agentProfile.findUnique({
            where: { agentId: user!.id },
            select: { onboardingComplete: true, imageUrl: true }
        });

        if (agentProfile) {
            if (meta.onboarding_complete !== true && !agentProfile.onboardingComplete) {
                isNewUser = true;
            }
            if (agentProfile.imageUrl) {
                dbAvatarUrl = agentProfile.imageUrl;
            }
        } else {
            // Check if user already has an existing account (e.g. leads, forms, or properties)
            const [leadsCount, formsCount, propertiesCount] = await Promise.all([
                prisma.lead.count({ where: { assignedAgentId: user!.id } }).catch(() => 0),
                prisma.leadCaptureForm.count({ where: { agentId: user!.id } }).catch(() => 0),
                prisma.property.count({ where: { agentId: user!.id } }).catch(() => 0),
            ]);

            if (leadsCount > 0 || formsCount > 0 || propertiesCount > 0 || meta.onboarding_complete === true) {
                isNewUser = false;
                // Auto-create their completed profile in background
                prisma.agentProfile.create({
                    data: {
                        agentId: user!.id,
                        name: meta.full_name || meta.name || 'Agent',
                        onboardingComplete: true,
                    }
                }).catch(() => {});
            } else {
                isNewUser = true;
            }
        }
    } catch (err) {
        console.error('[Layout] DB check failed, defaulting to false for stability:', err);
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

    // Fallback avatar URL from metadata
    const metaAvatarUrl: string = meta.avatar_url || meta.picture || '';
    const finalAvatarUrl = dbAvatarUrl || metaAvatarUrl;

    return (
        <PresenterModeProvider>
            <div className="bg-[#F3F4F4] min-h-screen text-[#2C2C2C] font-sans selection:bg-[#853953]/10 selection:text-[#853953] flex">
                {/* Global Left Sidebar Navigation */}
                <Sidebar user={user!} avatarUrl={finalAvatarUrl} />

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
                        userAvatar={finalAvatarUrl}
                    />
                )}
            </div>
        </PresenterModeProvider>
    );
}
