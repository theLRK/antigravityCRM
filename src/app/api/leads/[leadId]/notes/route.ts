import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';


// POST /api/leads/:leadId/notes
export async function POST(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
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

        return NextResponse.json(note, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET /api/leads/:leadId/notes
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

        const notes = await (prisma as any).note.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(notes);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

