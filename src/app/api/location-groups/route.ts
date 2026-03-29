import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/location-groups
export async function GET() {
    try {
        const groups = await (prisma as any).locationGroup.findMany({
            orderBy: { name: 'asc' },
            include: { locations: { orderBy: { name: 'asc' } } }
        });
        return NextResponse.json(groups);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/location-groups
export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
        const group = await (prisma as any).locationGroup.create({ data: { name: name.trim() } });
        return NextResponse.json(group, { status: 201 });
    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Group name already exists' }, { status: 409 });
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


