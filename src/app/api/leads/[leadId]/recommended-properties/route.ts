import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';


/**
 * Location-aware property matching engine
 *
 * Scoring weights:
 *   Location exact match   → 40 pts
 *   Same location group    → 20 pts
 *   Budget within range    → 25 pts
 *   Bedrooms match         → 20 pts
 *   Property type match    → 15 pts
 *   MAX total              → 100 pts
 */
function calcMatchScore(lead: any, property: any, locationMap: Map<string, any>): { score: number; percent: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // --- Location (40 pts) ---
    const leadLocationIds: string[] = lead.preferredLocationIds ? JSON.parse(lead.preferredLocationIds) : [];
    const propLocId = property.locationId;

    if (leadLocationIds.length > 0 && propLocId) {
        if (leadLocationIds.includes(propLocId)) {
            score += 40;
            const locName = locationMap.get(propLocId)?.name || 'this area';
            reasons.push(`Located in ${locName}, which is on the client's preferred locations list`);
        } else {
            // Check same group
            const propLoc = locationMap.get(propLocId);
            const propGroupId = propLoc?.groupId;
            const leadLocsInSameGroup = leadLocationIds.some(lid => locationMap.get(lid)?.groupId === propGroupId);
            if (leadLocsInSameGroup && propGroupId) {
                score += 20;
                reasons.push(`In the same area group (${propLoc?.group?.name || 'nearby'}) as the client's preferred locations`);
            }
        }
    } else if (leadLocationIds.length === 0) {
        // No location preference — neutral, give partial
        score += 10;
    }

    // --- Budget (25 pts) ---
    const max = lead.budgetMax || 0;
    const min = lead.budgetMin || 0;
    const price = property.price || 0;
    if (max > 0) {
        if (price <= max && price >= min) {
            score += 25;
            reasons.push('Property price fits within the client\'s budget range');
        } else if (price <= max * 1.1) {
            score += 12;
            reasons.push('Property is slightly above budget but may still be considered');
        }
    } else {
        score += 12; // no budget specified — neutral
    }

    // --- Bedrooms (20 pts) ---
    const minBeds = lead.bedroomsMin || 0;
    if (minBeds > 0) {
        if (property.bedrooms >= minBeds) {
            score += 20;
            reasons.push(`Has ${property.bedrooms} bedrooms, meets the minimum requirement of ${minBeds}`);
        } else if (property.bedrooms >= minBeds - 1) {
            score += 10;
            reasons.push(`Has ${property.bedrooms} bedrooms, one less than preferred`);
        }
    } else {
        score += 10; // neutral
    }

    // --- Property type (15 pts) ---
    // We don't have a strict type preference on lead yet; check against keywords in motivation
    const motivation = (lead.motivation || '').toLowerCase();
    const propType = (property.propertyType || '').toLowerCase();
    if (motivation.includes(propType) || motivation.includes('any')) {
        score += 15;
    } else if (!motivation) {
        score += 8; // neutral
    }

    const percent = Math.min(Math.round((score / 100) * 100), 100);
    return { score, percent, reasons };
}

function buildMatchReason(reasons: string[], percent: number): string {
    if (percent >= 80) return `Strong match — ${reasons.slice(0, 2).join('. ')}.`;
    if (percent >= 60) return `Good match — ${reasons[0] || 'Several criteria align'}.`;
    if (percent >= 40) return `Partial match — ${reasons[0] || 'Some criteria align'}.`;
    return 'Low match — location or budget requirements differ significantly.';
}

// GET /api/leads/:leadId/recommended-properties
export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const cookieStore = req.cookies;
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [lead, properties, allLocations] = await Promise.all([
            prisma.lead.findFirst({ where: { id: leadId, assignedAgentId: user.id } }),
            prisma.property.findMany({ where: { status: 'Available', agentId: user.id } }),
            (prisma as any).location.findMany({ include: { group: true } })
        ]);

        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        const matches = properties.map((prop: any) => {
            const { score, percent, reasons } = calcMatchScore(lead, prop, locationMap);
            return {
                property: prop,
                score,
                percent,
                matchReason: buildMatchReason(reasons, percent),
                reasons
            };
        }).sort((a: any, b: any) => b.score - a.score).slice(0, 8);

        return NextResponse.json({ matches });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

