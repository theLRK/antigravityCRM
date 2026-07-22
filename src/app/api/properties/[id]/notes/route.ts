import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


// GET /api/properties/[id]/notes
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify property ownership
        const property = await prisma.property.findFirst({
            where: { id, agentId: user.id }
        });
        if (!property) return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });

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
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify property ownership
        const property = await prisma.property.findFirst({
            where: { id, agentId: user.id }
        });
        if (!property) return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });

        const body = await req.json();

        if (!body.content || typeof body.content !== 'string') {
            return NextResponse.json({ error: "Note content is required." }, { status: 400 });
        }

        const profile = await prisma.agentProfile.findUnique({
            where: { agentId: user.id }
        });

        const note = await prisma.propertyNote.create({
            data: {
                propertyId: id,
                content: body.content.trim(),
                agentId: user.id,
                agentName: profile?.name || user.email || 'Agent User'
            }
        });

        return NextResponse.json({ success: true, note });
    } catch (error: any) {
        console.error('[POST /api/properties/:id/notes]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

