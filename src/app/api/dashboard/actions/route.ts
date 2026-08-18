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
            take: 15, // Limit for optimal performance
            orderBy: { createdAt: 'desc' }
        });

        // Compute Next Best Actions in parallel
        const results = await Promise.all(
            activeLeads.map(async (lead) => {
                try {
                    const actionData = await computeNextBestAction(lead.id);
                    if (actionData.action !== 'AWAITING_REPLY') {
                        return { lead, actionData };
                    }
                    return null;
                } catch (err) {
                    console.warn(`Failed to compute action for lead ${lead.id}:`, err);
                    return null;
                }
            })
        );

        const actionsWithLeads = results.filter((r): r is { lead: any; actionData: NextBestAction } => r !== null);

        // Sort by Priority (HOT > WARM > COLD)
        const priorityWeight: Record<string, number> = { HOT: 3, WARM: 2, COLD: 1 };
        actionsWithLeads.sort((a, b) => {
            const pA = priorityWeight[a.actionData.priority] || 0;
            const pB = priorityWeight[b.actionData.priority] || 0;
            return pB - pA;
        });

        return NextResponse.json({ actions: actionsWithLeads });
    } catch (error: any) {
        console.error('Failed to fetch dashboard actions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
