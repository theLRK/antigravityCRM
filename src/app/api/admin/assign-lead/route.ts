import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// POST /api/admin/assign-lead
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify admin
        const agentUser = await prisma.agentUser.findUnique({ where: { supabaseId: user.id } });
        const isAdmin = !agentUser || agentUser.role === 'admin';
        if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { leadId, agentId } = await req.json();
        if (!leadId || !agentId) return NextResponse.json({ error: 'leadId and agentId required' }, { status: 400 });

        const lead = await prisma.lead.update({
            where: { id: leadId },
            data: { assignedAgentId: agentId, isUnassigned: false }
        });

        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'LEAD_ASSIGNED',
                actor: user.email || 'admin',
                metadata: `Assigned to agent ${agentId}`
            }
        });

        return NextResponse.json({ success: true, lead });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
