import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        await prisma.property.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/properties/:id]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

