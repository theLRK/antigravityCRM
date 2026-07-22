import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';


// GET /api/tasks?status=pending|overdue|completed&leadId=...
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

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const leadId = searchParams.get('leadId');

        const where: any = { agentId: user.id };
        if (status) where.status = status;
        if (leadId) where.leadId = leadId;

        // Auto-mark overdue tasks
        await prisma.task.updateMany({
            where: { agentId: user.id, status: 'pending', dueDate: { lt: new Date() } },
            data: { status: 'overdue' }
        });

        const tasks = await prisma.task.findMany({
            where,
            include: {
                lead: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } }
            },
            orderBy: { dueDate: 'asc' }
        });

        const overdue = tasks.filter((t: any) => t.status === 'overdue');
        const today = tasks.filter((t: any) => {
            if (t.status !== 'pending') return false;
            const d = new Date(t.dueDate);
            const now = new Date();
            return d.getFullYear() === now.getFullYear() &&
                   d.getMonth() === now.getMonth() &&
                   d.getDate() === now.getDate();
        });
        const upcoming = tasks.filter((t: any) => t.status === 'pending' && !today.find((x: any) => x.id === t.id));
        const completed = tasks.filter((t: any) => t.status === 'completed');

        return NextResponse.json({ overdue, today, upcoming, completed, all: tasks });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
    try {
        const cookieStore = req.cookies;
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { get: (n) => cookieStore.get(n)?.value } }
        );
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { leadId, title, taskType, dueDate, notes, autoCreated } = body;

        if (!title || !taskType || !dueDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                leadId: leadId || null,
                agentId: user.id,
                title,
                taskType,
                dueDate: new Date(dueDate),
                notes,
                autoCreated: autoCreated || false,
            },
            include: {
                lead: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        if (leadId) {
            await prisma.activityLog.create({
                data: {
                    leadId,
                    eventType: 'task_created',
                    metadata: JSON.stringify({ 
                        title, 
                        type: taskType, 
                        dueDate: task.dueDate.toISOString() 
                    })
                }
            });
        }

        return NextResponse.json(task, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

