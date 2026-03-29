import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


// PATCH /api/locations/:id — update name or group
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const location = await (prisma as any).location.update({
            where: { id },
            data: {
                ...(body.name ? { name: body.name.trim() } : {}),
                ...(body.groupId ? { groupId: body.groupId } : {}),
                ...(body.isCustom !== undefined ? { isCustom: body.isCustom } : {}),
            },
            include: { group: true }
        });
        return NextResponse.json(location);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/locations/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await (prisma as any).location.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

