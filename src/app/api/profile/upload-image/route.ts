import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `agent-${user.id}.${ext}`;

        // Save to /public/uploads/
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);

        const imageUrl = `/uploads/${filename}`;

        // Persist to DB
        await prisma.agentProfile.upsert({
            where: { agentId: user.id },
            create: { agentId: user.id, imageUrl },
            update: { imageUrl }
        });

        return NextResponse.json({ imageUrl });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

