import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


// PATCH /api/tasks/:id — update status / reschedule / complete
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        
        // Find existing task to check if we are completing it and if it has a leadId
        const existingTask = await (prisma as any).task.findFirst({
            where: { id, agentId: user.id }
        });
        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
        }

        const task = await (prisma as any).task.update({
            where: { id },
            data: {
                ...(body.status ? { status: body.status } : {}),
                ...(body.dueDate ? { dueDate: new Date(body.dueDate) } : {}),
                ...(body.notes !== undefined ? { notes: body.notes } : {}),
                ...(body.title ? { title: body.title } : {}),
            }
        });

        // Log completion to Lead Timeline
        if (body.status === 'completed' && existingTask?.status !== 'completed' && existingTask?.leadId) {
            await (prisma as any).activityLog.create({
                data: {
                    leadId: existingTask.leadId,
                    eventType: 'task_completed',
                    metadata: JSON.stringify({ title: existingTask.title, type: existingTask.taskType })
                }
            });
        }

        return NextResponse.json(task);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE /api/tasks/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify task ownership
        const existingTask = await (prisma as any).task.findFirst({
            where: { id, agentId: user.id }
        });
        if (!existingTask) {
            return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
        }

        await (prisma as any).task.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

