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

        let imageUrl = '';
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(path.join(uploadDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
        } catch (fsErr) {
            console.warn('[Upload Image] Serverless filesystem write unavailable, falling back to Base64 Data URL');
            imageUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        }

        // Persist to DB
        await (prisma.agentProfile as any).upsert({
            where: { agentId: user.id },
            create: { agentId: user.id, imageUrl },
            update: { imageUrl }
        });

        // Sync with Supabase Auth
        await supabase.auth.updateUser({
            data: { avatar_url: imageUrl }
        });

        return NextResponse.json({ imageUrl });
    } catch (error: any) {
        console.error('[Upload Image Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

