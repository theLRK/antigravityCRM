import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { computeNextBestAction, NextBestAction } from '@/modules/actions/engine';


export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch leads that are NOT closed (i.e. new, contacted, showing, negotiation)
        const activeLeads = await prisma.lead.findMany({
            where: {
                assignedAgentId: user.id,
                pipelineStage: {
                    in: ['new', 'contacted', 'showing', 'negotiation']
                }
            },
            take: 20, // Limit for dashboard performance
            orderBy: { createdAt: 'desc' }
        });

        // Compute the Next Best Action for each active lead
        const actionsWithLeads: { lead: any; actionData: NextBestAction }[] = [];

        for (const lead of activeLeads) {
            try {
                const actionData = await computeNextBestAction(lead.id);
                // Only show actions that require agent attention
                if (actionData.action !== 'AWAITING_REPLY') {
                    actionsWithLeads.push({ lead, actionData });
                }
            } catch (err) {
                console.warn(`Failed to compute action for lead ${lead.id}:`, err);
            }
        }

        // Sort by Priority (HOT > WARM > COLD)
        actionsWithLeads.sort((a: any, b: any) => {
            const priorityWeight: any = { HOT: 3, WARM: 2, COLD: 1 };
            return priorityWeight[b.actionData.priority] - priorityWeight[a.actionData.priority];
        });

        return NextResponse.json({ actions: actionsWithLeads });
    } catch (error: any) {
        console.error('Failed to fetch dashboard actions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

