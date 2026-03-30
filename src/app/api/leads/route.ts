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
            // where: { assignedAgentId: user.id }, // Temporarily removed to allow single-admin to see all leads

            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                confidenceScore: true,
                preferredAreas: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map fields to match user requirements
        const formattedLeads = leads.map((l: any) => ({
            lead_id: l.id,
            lead_name: `${l.firstName} ${l.lastName}`,
            lead_email: l.email,
            lead_score: l.confidenceScore || 0,
            preferred_location: l.preferredAreas || 'Not specified'
        }));

        return NextResponse.json(formattedLeads);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

