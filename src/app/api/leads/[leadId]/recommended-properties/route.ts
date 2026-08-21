import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { evaluateLeadPropertyMatch } from '@/modules/scoring/matching';

// GET /api/leads/:leadId/recommended-properties
export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [lead, properties, allLocations] = await Promise.all([
            prisma.lead.findFirst({
                where: { id: leadId, assignedAgentId: user.id },
                include: { notes: true }
            }),
            prisma.property.findMany({
                where: { status: 'Available', agentId: user.id },
                include: { notes: true }
            }),
            (prisma as any).location.findMany({ include: { group: true } })
        ]);

        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        const matchPromises = properties.map(async (prop: any) => {
            const evalResult = await evaluateLeadPropertyMatch(lead, prop, locationMap);
            return {
                property: prop,
                score: evalResult.score,
                percent: evalResult.matchPercent,
                matchReason: evalResult.matchReason,
                breakdown: evalResult.breakdown,
                pitchHook: evalResult.pitchHook
            };
        });

        const allResults = await Promise.all(matchPromises);
        const matches = allResults
            .filter((m: any) => m.percent >= 45)
            .sort((a: any, b: any) => b.percent - a.percent)
            .slice(0, 8);

        return NextResponse.json({ matches });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

