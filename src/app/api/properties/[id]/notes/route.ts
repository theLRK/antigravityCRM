import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


// GET /api/properties/[id]/notes
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const notes = await prisma.propertyNote.findMany({
            where: { propertyId: id },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ notes });
    } catch (error: any) {
        console.error('[GET /api/properties/:id/notes]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/properties/[id]/notes
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        if (!body.content || typeof body.content !== 'string') {
            return NextResponse.json({ error: "Note content is required." }, { status: 400 });
        }

        const note = await prisma.propertyNote.create({
            data: {
                propertyId: id,
                content: body.content.trim(),
                agentId: 'system',       // Replace with session.user.id when Auth is fully active
                agentName: 'Agent User'  // Replace with dynamic agent name
            }
        });

        return NextResponse.json({ success: true, note });
    } catch (error: any) {
        console.error('[POST /api/properties/:id/notes]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

