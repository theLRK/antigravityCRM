import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = req.cookies;
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value } }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const leads = await prisma.lead.findMany({
            where: { assignedAgentId: user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                confidenceScore: true,
                preferredAreas: true,
                pipelineStage: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Provide both standard object fields and legacy mapped fields for 100% component compatibility
        const formattedLeads = leads.map((l: any) => {
            const fullName = `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Prospective Client';
            return {
                id: l.id,
                lead_id: l.id,
                firstName: l.firstName || '',
                lastName: l.lastName || '',
                lead_name: fullName,
                email: l.email || '',
                lead_email: l.email || '',
                phone: l.phone || '',
                lead_score: l.confidenceScore || 0,
                confidenceScore: l.confidenceScore || 0,
                preferred_location: l.preferredAreas || 'Not specified',
                preferredAreas: l.preferredAreas || 'Not specified',
                pipelineStage: l.pipelineStage || 'new'
            };
        });

        return NextResponse.json(formattedLeads);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
