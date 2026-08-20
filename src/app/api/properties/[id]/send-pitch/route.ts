import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendUnifiedEmailCore } from '@/modules/email/service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { leadIds } = body;

        if (!leadIds || leadIds.length === 0) {
            return NextResponse.json({ error: "No leads selected" }, { status: 400 });
        }

        const property = await prisma.property.findFirst({
            where: { id, agentId: user.id },
            include: { locationRef: true }
        });

        if (!property) return NextResponse.json({ error: "Property not found or unauthorized" }, { status: 404 });

        // Fetch Agent Profile for details
        const activeAgentId = user.id;
        const agentProfile = await prisma.agentProfile.findUnique({
            where: { agentId: activeAgentId }
        });

        let sentCount = 0;
        const now = new Date();
        const followUpDate = new Date();
        followUpDate.setDate(now.getDate() + 2); // Follow up in 2 days

        for (const leadId of leadIds) {
            const lead = await prisma.lead.findFirst({ where: { id: leadId, assignedAgentId: user.id } });
            if (!lead) continue;

            const propertyLoc = property.locationRef?.name || property.location;
            const propertyPriceStr = `$${property.price.toLocaleString()}`;
            const agentNameStr = agentProfile?.name || "Your Agent";
            const agencyStr = agentProfile?.company || "Formative Properties";

            const pitchSubject = `Property Match: ${property.title} in ${propertyLoc}`;
            const pitchBody = `<div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #7c3aed;">Property Match!</h2>
                <p>Hello ${lead.firstName},</p>
                <p>I came across a property in <strong>${propertyLoc}</strong> that matches your preferences, so I wanted to share it with you:</p>
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 8px 0; color: #0f172a;">${property.title}</h3>
                    <p style="margin: 0 0 4px 0; font-weight: bold; color: #7c3aed;">${propertyPriceStr}</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">🛏️ ${property.bedrooms} Bedrooms, 🛁 ${property.bathrooms} Bathrooms</p>
                </div>
                <p>Please let me know if you'd like to schedule a viewing or request more details!</p>
                <p>Best regards,<br/><strong>${agentNameStr}</strong><br/>${agencyStr}</p>
            </div>`;

            // Send email using agent's personal email inbox (or fallback if configured)
            try {
                await sendUnifiedEmailCore({
                    leadId: lead.id,
                    agentId: user.id,
                    subject: pitchSubject,
                    body: pitchBody,
                    templateId: 'property_pitch_system',
                    isManual: true
                });
            } catch (err) {
                console.error(`Failed to send property pitch to ${lead.email}:`, err);
            }

            // 2. Log Activity
            await prisma.activityLog.create({
                data: {
                    leadId,
                    eventType: 'property_pitched',
                    actor: 'system',
                    metadata: JSON.stringify({ propertyId: id, propertyTitle: property.title }),
                }
            });

            // 3. Update Lead Timeline and Contacted status
            await prisma.lead.update({
                where: { id: leadId },
                data: { 
                    lastContactedAt: now,
                    followUpDate: followUpDate 
                }
            });

            // 4. Automatically Create Follow Up Task
            await prisma.task.create({
                data: {
                    leadId,
                    agentId: activeAgentId,
                    title: `Follow up with ${lead.firstName} about ${property.title}`,
                    taskType: 'Follow up',
                    dueDate: followUpDate,
                    status: 'pending',
                    notes: `Automated task created after pitching property ${property.title}.`,
                    autoCreated: true
                }
            });

            sentCount++;
        }

        return NextResponse.json({ success: true, sentCount });
    } catch (error: any) {
        console.error('[POST /api/properties/:id/send-pitch]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

