'use server';

import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { processScoreForLead } from '@/modules/scoring/orchestrator';
import { notifyNewLead } from '@/modules/notifications/notifier';
import { createClient } from '@/utils/supabase/server';

export async function createLead(formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source?: string;
    moveTimeline?: string;
    budgetMin?: number;
    budgetMax?: number;
    notes?: string;
    currency?: string;
    preferredAreas?: string;
    financing?: string;
    propertyType?: string;
    preApproval?: boolean;
}) {
    const leadId = uuidv4();

    await prisma.lead.create({
        data: {
            id: leadId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            source: formData.source || 'Manual Entry',
            moveTimeline: formData.moveTimeline ?? undefined,
            budgetMin: formData.budgetMin ?? undefined,
            budgetMax: formData.budgetMax ?? undefined,
            currency: formData.currency || '$',
            preferredAreas: formData.preferredAreas ?? undefined,
            financing: formData.financing ?? undefined,
            propertyType: formData.propertyType ?? undefined,
            preApproval: formData.preApproval ?? undefined,
            pipelineStage: 'new',
            activityLogs: {
                create: {
                    eventType: 'lead.created',
                    metadata: JSON.stringify({
                        source: formData.source || 'Manual Entry',
                        manualEntry: true,
                        notes: formData.notes || '',
                        propertyType: formData.propertyType
                    })
                }
            }
        }
    });

    // Trigger the backend orchestrator (Scoring + Email)
    try {
        console.log(`[Actions] Manually triggering AI pipeline for Lead ID: ${leadId}`);
        await processScoreForLead(leadId, {
            id: leadId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            timeline: formData.moveTimeline,
            budgetMin: formData.budgetMin,
            budgetMax: formData.budgetMax,
            financingStatus: formData.financing,
            source: formData.source || 'Manual Entry',
            motivation: formData.notes,
            propertyType: formData.propertyType
        });

        // Fire a notification after scoring
        try {
            if (typeof createClient === 'function') {
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const scoreRow = await prisma.score.findFirst({ where: { leadId }, orderBy: { createdAt: 'desc' } });
                    const finalScore = scoreRow?.finalScore ?? 0;
                    await notifyNewLead(user.id, `${formData.firstName} ${formData.lastName}`, finalScore, leadId);
                }
            }
        } catch (authErr: any) {
            console.warn('[Actions] Failed to send notification (likely expected in test):', authErr.message);
        }
    } catch (e: any) {
        console.error('Failed to trigger backend pipeline for lead:', leadId, e.message);
    }

    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { success: true, leadId };
}

export async function getLeads() {
    // 1. Check for empty state protection.
    const count = await prisma.lead.count();

    if (count === 0) {
        await seedPlaceholderLeads();
    }

    // 2. Fetch all leads with relational data
    const leads = await prisma.lead.findMany({
        include: {
            scores: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: {
                    reasoningBreakdowns: true
                }
            },
            activityLogs: {
                orderBy: { occurredAt: 'desc' }
            },
            emailLogs: {
                orderBy: { sentAt: 'desc' }
            },
            propertyMatches: {
                include: { property: true },
                orderBy: { score: 'desc' }
            },
            sequenceStates: {
                include: { sequence: true },
                orderBy: { nextRunAt: 'asc' }
            }
        },
        orderBy: [
            // Prisma doesn't easily sort by relation computed fields without complex aggregations.
            // We sort by createdAt mostly, and we will sort by Score on the client side since MVP volume is low.
            { createdAt: 'desc' }
        ]
    });

    return leads;
}

export async function updateLead(leadId: string, data: { pipelineStage?: string; followUpDate?: string | null; email?: string; phone?: string }) {
    const updateData: any = {};
    if (data.pipelineStage) updateData.pipelineStage = data.pipelineStage;
    if (data.followUpDate !== undefined) updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;

    const lead = await prisma.lead.update({
        where: { id: leadId },
        data: updateData
    });

    // 1. Log activity
    if (data.pipelineStage) {
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'status.changed',
                metadata: JSON.stringify({ newStage: data.pipelineStage })
            }
        });
    }

    if (data.followUpDate) {
        await prisma.activityLog.create({
            data: {
                leadId,
                eventType: 'followup.scheduled',
                metadata: JSON.stringify({ date: data.followUpDate })
            }
        });

        // 2. Automatically create a Task if a follow-up date is set
        // Find the agent assigned to this lead (or use the current user)
        // For simplicity, we'll try to find the agent who just updated it
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const agent = await prisma.agentUser.findUnique({ where: { supabaseId: user.id } });
            if (agent) {
                await prisma.task.create({
                    data: {
                        leadId,
                        agentId: agent.id,
                        title: `Follow up with ${lead.firstName}`,
                        taskType: 'Follow Up',
                        dueDate: new Date(data.followUpDate),
                        notes: 'Automated follow-up task created from lead update.'
                    }
                });
            }
        }
    }

    revalidatePath('/leads');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function updateLeadStatus(leadId: string, pipelineStage: string) {
    return updateLead(leadId, { pipelineStage });
}

export async function addLeadNote(leadId: string, noteText: string) {
    await prisma.activityLog.create({
        data: {
            leadId,
            eventType: 'note.added',
            metadata: JSON.stringify({ note: noteText })
        }
    });

    revalidatePath('/leads');
}

async function seedPlaceholderLeads() {
    const dummyLeads = [
        {
            firstName: "Sarah", lastName: "Jenkins", email: "s.jenkins88@example.com", phone: "555-0102",
            pipelineStage: "new", source: "Website", moveTimeline: "Immediately", preApproval: true, financing: "pre_approved",
            baseScore: 55, llmDelta: 30, finalScore: 85, confidenceLevel: "High", confidenceScore: 92,
            suggestedAction: "Call immediately to schedule showing",
            humanSummary: "This lead scored High because they plan to buy immediately and are pre-approved for financing.",
            detBreakdown: '{"Timeline: Immediately": "+25", "Financing: Pre-approved": "+20", "Source: Website": "+10"}',
            llmReasoning: "Strong urgency combined with verified financing capacity indicates high readiness to transact.",
            daysAgo: 1, followUpDateOffset: 1
        },
        {
            firstName: "Michael", lastName: "Chen", email: "mchen.invest@example.com", phone: "555-0199",
            pipelineStage: "contacted", source: "Zillow", moveTimeline: "1-3 Months", preApproval: true, financing: "cash",
            baseScore: 40, llmDelta: 15, finalScore: 55, confidenceLevel: "Medium", confidenceScore: 78,
            suggestedAction: "Send personalized market report",
            humanSummary: "This lead scored Medium due to cash-on-hand, but lack of immediate timeframe.",
            detBreakdown: '{"Timeline: 1-3 Months": "+10", "Financing: Cash": "+20", "Source: Zillow": "+10"}',
            llmReasoning: "Cash buyer, but timeline extends past 30 days. Nurture with inventory updates.",
            daysAgo: 3, followUpDateOffset: 0
        },
        {
            firstName: "Amanda", lastName: "Rodriguez", email: "amanda.r12@example.com", phone: "555-0144",
            pipelineStage: "booked_showing", source: "Referral", moveTimeline: "Immediately", preApproval: false, financing: "needs_lender",
            baseScore: 40, llmDelta: 35, finalScore: 75, confidenceLevel: "Medium", confidenceScore: 85,
            suggestedAction: "Introduce to preferred lender",
            humanSummary: "High urgency but lacks pre-approval. Connecting with a lender is paramount.",
            detBreakdown: '{"Timeline: Immediately": "+25", "Financing: Needs Lender": "0", "Source: Referral": "+15"}',
            llmReasoning: "Referral source adds trust, but lack of financing is a bottleneck. Lender introduction will increase viability.",
            daysAgo: 5, followUpDateOffset: -1
        },
        {
            firstName: "James", lastName: "Wilson", email: "jwilson_test@example.com", phone: "555-0211",
            pipelineStage: "new", source: "Facebook Ad", moveTimeline: "6+ Months", preApproval: false, financing: "just_looking",
            baseScore: 10, llmDelta: -5, finalScore: 5, confidenceLevel: "High", confidenceScore: 95,
            suggestedAction: "Add to long-term drip campaign",
            humanSummary: "Low intent signals across the board. Just browsing the market.",
            detBreakdown: '{"Timeline: 6+ Months": "0", "Financing: Just Looking": "0", "Source: Facebook Ad": "+10"}',
            llmReasoning: "User clicked an ad but self-reported no immediate timeline or financing. Move to automated nurture.",
            daysAgo: 10, followUpDateOffset: 14
        },
        {
            firstName: "Elena", lastName: "Koval", email: "ekoval44@example.com", phone: "555-0399",
            pipelineStage: "closed", source: "Website", moveTimeline: "Immediately", preApproval: true, financing: "pre_approved",
            baseScore: 60, llmDelta: 30, finalScore: 90, confidenceLevel: "High", confidenceScore: 99,
            suggestedAction: "Send closing gift",
            humanSummary: "Top tier lead that successfully closed.",
            detBreakdown: '{"Timeline: Immediately": "+25", "Financing: Pre-approved": "+20", "Source: Website": "+15"}',
            llmReasoning: "Perfect profile for immediate conversion.",
            daysAgo: 14, followUpDateOffset: null
        }
    ];

    for (const dummy of dummyLeads) {
        const leadId = uuidv4();
        const scoreId = uuidv4();

        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - dummy.daysAgo);

        let followUpDate = null;
        if (dummy.followUpDateOffset !== null) {
            followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + dummy.followUpDateOffset);
        }

        await prisma.lead.create({
            data: {
                id: leadId,
                firstName: dummy.firstName,
                lastName: dummy.lastName,
                email: dummy.email,
                phone: dummy.phone,
                source: dummy.source,
                moveTimeline: dummy.moveTimeline,
                preApproval: dummy.preApproval,
                pipelineStage: dummy.pipelineStage,
                confidenceScore: dummy.confidenceScore,
                confidenceLevel: dummy.confidenceLevel,
                createdAt: createdDate,
                ...((dummy.followUpDateOffset !== null && followUpDate !== null) ? { followUpDate: followUpDate } : {}),
                scores: {
                    create: {
                        id: scoreId,
                        baseScore: dummy.baseScore,
                        llmDelta: dummy.llmDelta,
                        finalScore: dummy.finalScore,
                        likelihoodLabel: dummy.confidenceLevel,
                        confidenceScore: dummy.confidenceScore,
                        confidenceLevel: dummy.confidenceLevel,
                        suggestedAction: dummy.suggestedAction,
                        reasoningBreakdowns: {
                            create: {
                                deterministicFactors: dummy.detBreakdown,
                                llmReasoning: dummy.llmReasoning,
                                reasoningSummary: dummy.humanSummary
                            }
                        }
                    }
                },
                activityLogs: {
                    create: [
                        { eventType: "lead.created", occurredAt: createdDate, metadata: JSON.stringify({ source: dummy.source, isDemo: true }) },
                        { eventType: "score.calculated", occurredAt: createdDate, metadata: JSON.stringify({ finalScore: dummy.finalScore }) }
                    ]
                }
            }
        });
    }
}

export async function deleteLead(leadId: string) {
    // Manually delete logs without Cascade triggers
    await prisma.activityLog.deleteMany({ where: { leadId } });
    await prisma.emailLog.deleteMany({ where: { leadId } });

    // The score models should cascade if relation allows, but to be 100% safe:
    const scores = await prisma.score.findMany({ where: { leadId } });
    const scoreIds = scores.map(s => s.id);
    await prisma.reasoningBreakdown.deleteMany({ where: { scoreId: { in: scoreIds } } });
    await prisma.score.deleteMany({ where: { leadId } });

    // Finally delete lead
    await prisma.lead.deleteMany({ where: { id: leadId } });

    revalidatePath('/leads');
    revalidatePath('/dashboard');
}

