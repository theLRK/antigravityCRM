import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { evaluateLeadPropertyMatch } from '@/modules/scoring/matching';

// GET /api/properties/:id/matching-leads
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [property, leads, allLocations, storedMatches] = await Promise.all([
            prisma.property.findFirst({
                where: { id, agentId: user.id },
                include: { notes: true }
            }),
            prisma.lead.findMany({
                where: {
                    pipelineStage: { notIn: ['closed', 'lost'] },
                    isUnsubscribed: false,
                    assignedAgentId: user.id
                },
                include: { notes: true },
                take: 100
            }),
            (prisma as any).location.findMany({ include: { group: true } }).catch(() => []),
            prisma.propertyMatch.findMany({
                where: { 
                    propertyId: id, 
                    score: { gte: 50 },
                    lead: { assignedAgentId: user.id }
                },
                include: { lead: { include: { notes: true } } },
                orderBy: { score: 'desc' }
            })
        ]);

        if (!property) return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        let formattedMatches: any[] = [];

        if (storedMatches.length > 0) {
            formattedMatches = storedMatches.map(sm => {
                let parsedBreakdown = {
                    budgetFit: 'Calculated budget compatibility',
                    locationFit: 'Evaluated geographic criteria',
                    specsFit: 'Analyzed bedroom/specs match',
                    notesFit: 'Gemini AI evaluated alignment'
                };
                let pitchHook = '';

                try {
                    if (sm.reasoning && sm.reasoning.startsWith('{')) {
                        const parsed = JSON.parse(sm.reasoning);
                        if (parsed.breakdown) parsedBreakdown = parsed.breakdown;
                        if (parsed.pitchHook) pitchHook = parsed.pitchHook;
                    }
                } catch {}

                return {
                    lead: sm.lead,
                    score: sm.score,
                    percent: sm.score,
                    matchReason: sm.matchReason || sm.reasoning || 'Strong client fit',
                    breakdown: parsedBreakdown,
                    pitchHook: pitchHook
                };
            });
        } else {
            // Dynamic evaluation if no stored matches yet
            const computed = await Promise.all(leads.map(async (lead: any) => {
                const evalResult = await evaluateLeadPropertyMatch(lead, property, locationMap);
                return {
                    lead,
                    score: evalResult.matchPercent,
                    percent: evalResult.matchPercent,
                    matchReason: evalResult.matchReason,
                    breakdown: evalResult.breakdown,
                    pitchHook: evalResult.pitchHook
                };
            }));

            formattedMatches = computed.filter(m => m.percent >= 50).sort((a, b) => b.score - a.score);
        }

        return NextResponse.json({ matches: formattedMatches });
    } catch (e: any) {
        console.error('[matching-leads API error]:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

