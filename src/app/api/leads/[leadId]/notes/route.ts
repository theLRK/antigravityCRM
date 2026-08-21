import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { runPropertyMatchingForLead } from '@/modules/scoring/matching';
import { processScoreForLead } from '@/modules/scoring/orchestrator';

// POST /api/leads/:leadId/notes
export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify lead ownership
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id }
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        const { content } = await req.json();
        if (!content?.trim()) return NextResponse.json({ error: 'Note content is required' }, { status: 400 });

        const note = await (prisma as any).note.create({
            data: {
                leadId,
                agentId: user.id,
                content: content.trim()
            }
        });

        // Log in activity feed
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'NOTE_ADDED',
                actor: user.email || 'agent',
                metadata: content.substring(0, 80)
            }
        });

        // Trigger intelligent AI re-scoring and re-matching with the new note
        processScoreForLead(leadId, { ...lead, notes: content.trim() }).catch(console.error);
        runPropertyMatchingForLead(leadId).catch(console.error);

        return NextResponse.json(note, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET /api/leads/:leadId/notes
export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify lead ownership
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id }
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        const notes = await (prisma as any).note.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(notes);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/leads/:leadId/notes?noteId=xxx
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const { searchParams } = new URL(req.url);
        const noteId = searchParams.get('noteId');
        if (!noteId) return NextResponse.json({ error: 'Missing noteId parameter' }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify lead ownership
        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id }
        });
        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        await (prisma as any).note.delete({
            where: { id: noteId }
        });

        // Trigger real-time self-healing AI re-scoring and re-matching in background
        processScoreForLead(leadId, lead).catch(console.error);
        runPropertyMatchingForLead(leadId).catch(console.error);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
