import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';


// GET /api/locations — fetch all (public for dropdowns)
export async function GET() {
    try {
        const locations = await (prisma as any).location.findMany({
            orderBy: { name: 'asc' },
            include: { group: true }
        });
        return NextResponse.json(locations);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/locations — create new (admin or on behalf of lead)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, groupId, isCustom, createdByLeadId } = body;
        if (!name || !groupId) return NextResponse.json({ error: 'name and groupId required' }, { status: 400 });

        const location = await (prisma as any).location.create({
            data: { name: name.trim(), groupId, isCustom: isCustom ?? false, createdByLeadId: createdByLeadId ?? null },
            include: { group: true }
        });
        return NextResponse.json(location, { status: 201 });
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Location name already exists' }, { status: 409 });
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

