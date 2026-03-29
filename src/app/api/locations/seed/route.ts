import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_GROUPS = ['Island', 'Mainland', 'Abuja', 'Other'];
const DEFAULT_LOCATIONS: { name: string; group: string }[] = [
    // Island
    { name: 'Lekki', group: 'Island' }, { name: 'Ikoyi', group: 'Island' },
    { name: 'Victoria Island', group: 'Island' }, { name: 'Ajah', group: 'Island' },
    { name: 'Banana Island', group: 'Island' }, { name: 'Chevron', group: 'Island' },
    // Mainland
    { name: 'Yaba', group: 'Mainland' }, { name: 'Surulere', group: 'Mainland' },
    { name: 'Ikeja', group: 'Mainland' }, { name: 'Maryland', group: 'Mainland' },
    { name: 'Gbagada', group: 'Mainland' }, { name: 'Ojodu Berger', group: 'Mainland' },
    { name: 'Ojota', group: 'Mainland' }, { name: 'Ketu', group: 'Mainland' },
    // Abuja
    { name: 'Maitama', group: 'Abuja' }, { name: 'Asokoro', group: 'Abuja' },
    { name: 'Wuse', group: 'Abuja' }, { name: 'Gwarinpa', group: 'Abuja' },
    { name: 'Jabi', group: 'Abuja' }, { name: 'Garki', group: 'Abuja' },
];

export async function POST() {
    try {
        // Create groups
        for (const name of DEFAULT_GROUPS) {
            await (prisma as any).locationGroup.upsert({ where: { name }, update: {}, create: { name } });
        }
        // Fetch groups to get IDs
        const groups = await (prisma as any).locationGroup.findMany();
        const groupMap: Record<string, string> = {};
        for (const g of groups) groupMap[g.name] = g.id;

        // Create locations
        for (const loc of DEFAULT_LOCATIONS) {
            await (prisma as any).location.upsert({ where: { name: loc.name }, update: {}, create: { name: loc.name, groupId: groupMap[loc.group] } });
        }

        return NextResponse.json({ success: true, message: `Seeded ${DEFAULT_GROUPS.length} groups and ${DEFAULT_LOCATIONS.length} locations` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET() {
    return POST(); // allow GET for easy browser-triggered seed
}


