import { NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await prisma.agentProfile.findUnique({ where: { agentId: user.id } });
        return NextResponse.json({ profile: profile || { agentId: user.id } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, phone, company, signature } = body;

        const profile = await prisma.agentProfile.upsert({
            where: { agentId: user.id },
            create: { agentId: user.id, name, phone, company, signature },
            update: { name, phone, company, signature }
        });

        return NextResponse.json({ profile });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


