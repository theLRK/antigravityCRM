import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';


function calcLeadMatch(lead: any, property: any, locationMap: Map<string, any>) {
    let score = 0;
    const reasons: string[] = [];

    const leadLocationIds: string[] = lead.preferredLocationIds ? JSON.parse(lead.preferredLocationIds) : [];
    const propLocId = property.locationId;

    if (leadLocationIds.length > 0 && propLocId) {
        if (leadLocationIds.includes(propLocId)) {
            score += 40;
            reasons.push(`Interested in ${locationMap.get(propLocId)?.name || 'this area'}`);
        } else {
            const propGroupId = locationMap.get(propLocId)?.groupId;
            if (propGroupId && leadLocationIds.some((lid: string) => locationMap.get(lid)?.groupId === propGroupId)) {
                score += 20;
                reasons.push('Interested in nearby area');
            }
        }
    } else { score += 10; }

    const max = lead.budgetMax || 0;
    if (max > 0) {
        if (property.price <= max) { score += 25; reasons.push('Budget matches'); }
        else if (property.price <= max * 1.1) score += 12;
    } else score += 12;

    if (lead.bedroomsMin > 0) {
        if (property.bedrooms >= lead.bedroomsMin) { score += 20; reasons.push('Bedrooms match'); }
        else if (property.bedrooms >= lead.bedroomsMin - 1) score += 10;
    } else score += 10;

    const percent = Math.min(Math.round((score / 95) * 100), 100);
    const matchReason = percent >= 70 ? reasons.slice(0, 2).join(', ') : (reasons[0] || 'Partial match');
    return { score, percent, matchReason };
}

// GET /api/properties/:id/matching-leads
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = req.cookies;
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [property, leads, allLocations] = await Promise.all([
            prisma.property.findFirst({ where: { id, agentId: user.id } }),
            prisma.lead.findMany({ where: { pipelineStage: { not: 'closed' }, assignedAgentId: user.id }, take: 200 }),
            (prisma as any).location.findMany({ include: { group: true } })
        ]);

        if (!property) return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        const matches = leads.map((lead: any) => {
            const { score, percent, matchReason } = calcLeadMatch(lead, property, locationMap);
            return { lead, score, percent, matchReason };
        }).sort((a: any, b: any) => b.score - a.score).slice(0, 8);

        return NextResponse.json({ matches });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

