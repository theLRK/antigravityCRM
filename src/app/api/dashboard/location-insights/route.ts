import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// GET /api/dashboard/location-insights
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [leads, properties, allLocations] = await Promise.all([
            prisma.lead.findMany({ 
                where: { assignedAgentId: user.id },
                select: { preferredLocationIds: true, createdAt: true } 
            }),
            prisma.property.findMany({ 
                where: { agentId: user.id },
                select: { locationId: true, status: true } 
            }),
            (prisma as any).location.findMany({ include: { group: true } })
        ]);

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        // Count leads per location (this month)
        const thisMonth = new Date();
        thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);

        const leadCountPerLoc: Record<string, number> = {};
        for (const lead of leads) {
            if (!lead.preferredLocationIds) continue;
            const ids: string[] = JSON.parse(lead.preferredLocationIds);
            for (const id of ids) {
                leadCountPerLoc[id] = (leadCountPerLoc[id] || 0) + 1;
            }
        }

        // Count available properties per location
        const propCountPerLoc: Record<string, number> = {};
        for (const prop of properties) {
            if (!prop.locationId || prop.status !== 'Available') continue;
            propCountPerLoc[prop.locationId] = (propCountPerLoc[prop.locationId] || 0) + 1;
        }

        // Build insight entries
        const insights = allLocations.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            group: loc.group?.name,
            leadCount: leadCountPerLoc[loc.id] || 0,
            propertyCount: propCountPerLoc[loc.id] || 0,
            demandScore: propCountPerLoc[loc.id] ? Math.round(((leadCountPerLoc[loc.id] || 0) / propCountPerLoc[loc.id]) * 10) : (leadCountPerLoc[loc.id] || 0) * 10
        })).filter((i: any) => i.leadCount > 0 || i.propertyCount > 0)
            .sort((a: any, b: any) => b.leadCount - a.leadCount);

        const topLocation = insights[0];
        const narrative = topLocation
            ? `Most leads this period are interested in <strong>${topLocation.name}</strong> (${topLocation.leadCount} leads). ${topLocation.propertyCount > 0 ? `${topLocation.propertyCount} properties available there.` : 'No properties currently listed there.'}`
            : 'No location data available yet. Add locations and assign them to properties and leads.';

        return NextResponse.json({ insights: insights.slice(0, 6), narrative });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


