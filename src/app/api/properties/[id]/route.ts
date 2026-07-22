import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const property = await prisma.property.findFirst({
            where: { id, agentId: user.id }
        });
        if (!property) return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 });
        
        await prisma.property.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/properties/:id]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

