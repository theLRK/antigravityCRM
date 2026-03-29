import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [leads, properties, allLocations] = await Promise.all([
            prisma.lead.findMany({ select: { preferredLocationIds: true, pipelineStage: true } }),
            prisma.property.findMany({ select: { locationId: true } }),
            (prisma as any).location.findMany({ include: { group: true } })
        ]);

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        const dataByLoc: Record<string, { leadCount: number, propertyCount: number, DealsClosed: number }> = {};
        allLocations.forEach((l: any) => dataByLoc[l.id] = { leadCount: 0, propertyCount: 0, DealsClosed: 0 });

        // Tally Leads & Deals
        for (const lead of leads) {
            if (!lead.preferredLocationIds) continue;
            try {
                const ids: string[] = JSON.parse(lead.preferredLocationIds);
                for (const id of ids) {
                    if (dataByLoc[id]) {
                        dataByLoc[id].leadCount++;
                        if (lead.pipelineStage === 'closed') {
                            dataByLoc[id].DealsClosed++;
                        }
                    }
                }
            } catch (e) { } // Ignore JSON parse errors
        }

        // Tally Properties
        for (const prop of properties) {
            if (prop.locationId && dataByLoc[prop.locationId]) {
                dataByLoc[prop.locationId].propertyCount++;
            }
        }

        const reportData = allLocations.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            group: loc.group?.name,
            leads: dataByLoc[loc.id].leadCount,
            properties: dataByLoc[loc.id].propertyCount,
            deals: dataByLoc[loc.id].DealsClosed
        })).filter((i: any) => i.leads > 0 || i.properties > 0)
        .sort((a: any, b: any) => b.leads - a.leads);

        return NextResponse.json({ data: reportData });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


