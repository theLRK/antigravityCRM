import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            firstName,
            lastName,
            phone,
            brokerage,
            marketArea,
            propertyTypes,
            avgDealSize,
            avatarUrl,
        } = body;

        const fullName = [firstName, lastName].filter(Boolean).join(' ');

        await (prisma.agentProfile as any).upsert({
            where: { agentId: user.id },
            create: {
                agentId: user.id,
                name: fullName || null,
                phone: phone || null,
                company: brokerage || null,
                marketArea: marketArea || null,
                propertyTypes: propertyTypes?.length ? JSON.stringify(propertyTypes) : null,
                avgDealSize: avgDealSize || null,
                imageUrl: avatarUrl || null,
                onboardingComplete: true,
            },
            update: {
                name: fullName || undefined,
                phone: phone || undefined,
                company: brokerage || undefined,
                marketArea: marketArea || undefined,
                propertyTypes: propertyTypes?.length ? JSON.stringify(propertyTypes) : undefined,
                avgDealSize: avgDealSize || undefined,
                imageUrl: avatarUrl || undefined,
                onboardingComplete: true,
            },
        });

        // Also upsert AgentUser to match role context requirements
        await prisma.agentUser.upsert({
            where: { supabaseId: user.id },
            create: {
                supabaseId: user.id,
                name: fullName || user.email?.split('@')[0] || 'Agent',
                email: user.email || '',
                role: 'agent',
                isActive: true
            },
            update: {
                name: fullName || undefined,
                email: user.email || undefined,
            }
        });

        // Also update user metadata in Supabase Auth for display name
        if (firstName) {
            await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName || undefined,
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding complete error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
