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
            const [lead, propertyMatch] = await Promise.all([
                prisma.lead.findFirst({ where: { id: leadId, assignedAgentId: user.id } }),
                prisma.propertyMatch.findUnique({
                    where: { leadId_propertyId: { leadId, propertyId: id } }
                })
            ]);
            if (!lead) continue;

            const propertyLoc = property.locationRef?.name || property.location;
            const propertyPriceStr = `${property.currency || '$'}${property.price.toLocaleString()}`;
            const agentNameStr = agentProfile?.name || agentProfile?.emailFromName || "Your Agent";
            const agencyStr = agentProfile?.company || "Formative Properties";

            let customPitchHook = `I came across a property in <strong>${propertyLoc}</strong> that matches your preferences, so I wanted to share it with you:`;
            if (propertyMatch?.reasoning) {
                try {
                    const parsed = JSON.parse(propertyMatch.reasoning);
                    if (parsed.pitchHook) {
                        customPitchHook = parsed.pitchHook;
                    }
                } catch {}
            }

            const pitchSubject = `Property Match: ${property.title} in ${propertyLoc}`;
            const pitchBody = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <h2 style="color: #853953; margin-bottom: 12px;">Exclusive Property Match</h2>
                <p>Hello ${lead.firstName},</p>
                <p style="font-size: 15px; color: #1e293b; font-weight: 500;">${customPitchHook}</p>
                <div style="background-color: #fdf8f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #f2dbe2;">
                    <h3 style="margin: 0 0 6px 0; color: #1e293b; font-size: 18px;">${property.title}</h3>
                    <p style="margin: 0 0 6px 0; font-weight: 800; color: #853953; font-size: 16px;">${propertyPriceStr}</p>
                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">📍 ${propertyLoc}</p>
                    <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 600;">🛏️ ${property.bedrooms} Beds &nbsp;|&nbsp; 🛁 ${property.bathrooms} Baths &nbsp;|&nbsp; 🏷️ ${property.propertyType || 'Residential'}</p>
                </div>
                <p>Please let me know if you'd like to schedule a private viewing or if you'd like me to send additional details!</p>
                <p style="margin-top: 24px;">Best regards,<br/><strong>${agentNameStr}</strong><br/><span style="color: #64748b; font-size: 13px;">${agencyStr}</span></p>
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

