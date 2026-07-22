import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendDynamicPropertyEmail } from '@/utils/resend';

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

            // 0. Send Actual Email via Resend
            try {
                await sendDynamicPropertyEmail(lead.email, {
                    leadName: lead.firstName,
                    propertyTitle: property.title,
                    propertyLocation: property.locationRef?.name || property.location,
                    propertyPrice: `$${property.price.toLocaleString()}`,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    agentName: agentProfile?.name || "Your Agent",
                    agentPhone: agentProfile?.phone || "",
                    agencyName: agentProfile?.company || "Formative Properties",
                    leadScore: lead.confidenceScore || 50
                });
            } catch (err) {
                console.error(`Failed to send email to ${lead.email}:`, err);
            }

            // 1. Log the Email
            await prisma.emailLog.create({
                data: {
                    leadId,
                    recipientEmail: lead.email,
                    templateId: 'property_pitch_system',
                    subjectLine: `Property Match: ${property.title}`,
                    bodyTextPreview: `Hi ${lead.firstName}, we found a property matching your criteria in ${property.location}.`,
                    status: 'sent',
                    isManual: true,
                    attemptCount: 1,
                    templateUsed: 'Property Match Pitch'
                }
            });

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

