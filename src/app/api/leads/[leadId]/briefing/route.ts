import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateWithGemini } from '@/lib/gemini';

// GET /api/leads/:leadId/briefing
export async function GET(req: NextRequest, { params }: { params: Promise<{ leadId: string }> }) {
    try {
        const { leadId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const lead = await prisma.lead.findFirst({
            where: { id: leadId, assignedAgentId: user.id },
            include: {
                notes: { orderBy: { createdAt: 'desc' } },
                callLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
                activityLogs: { orderBy: { occurredAt: 'desc' }, take: 10 },
                propertyMatches: {
                    include: { property: true },
                    orderBy: { score: 'desc' },
                    take: 3
                },
                scores: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
        });

        if (!lead) return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });

        // Compile context for Gemini 2.0 Flash
        const notesSummary = lead.notes.map(n => n.content).join('\n') || 'None recorded yet.';
        const callsSummary = lead.callLogs.map(c => `Outcome: ${c.outcome} | Notes: ${c.notes || 'None'}`).join('\n') || 'No calls logged yet.';
        const topMatches = lead.propertyMatches.map(m => `${m.property.title} (${m.property.location}, ${m.property.currency || '$'}${m.property.price.toLocaleString()}) - Match: ${m.score}%`).join('\n') || 'None';

        const prompt = `
You are an executive real estate sales assistant in Formative CRM.
Generate a high-impact, 3-point "Lead Executive Briefing" so the agent can get caught up in 5 seconds before making their next move or phone call.

LEAD PROFILE:
- Name: ${lead.firstName} ${lead.lastName}
- Phone: ${lead.phone || 'Unknown'} | Email: ${lead.email}
- Budget: ${lead.currency || '$'}${lead.budgetMin || 0} - ${lead.currency || '$'}${lead.budgetMax || 'Any'}
- Target Areas: ${lead.preferredAreas || lead.customLocation || 'Unspecified'}
- Bedrooms: ${lead.bedroomsMin || 'Any'} | Move Timeline: ${lead.moveTimeline || 'Standard'}
- Pipeline Stage: ${lead.pipelineStage} | AI Score: ${lead.scores?.[0]?.finalScore ?? 50}%

CALL HISTORY & LOGGED INTERACTIONS:
${callsSummary}

AGENT & SYSTEM NOTES:
${notesSummary}

BUYER MOTIVATION / REMARKS:
${lead.motivation || 'None provided.'}

TOP PROPERTY MATCHES IN INVENTORY:
${topMatches}

INSTRUCTIONS:
Synthesize all data into crisp, actionable bullet points. Be specific (mention exact prices, locations, amenities, family details from notes).

Return ONLY valid JSON matching this schema:
{
  "sentimentTag": "Hot Buyer" | "Active & Engaged" | "Needs Follow-up" | "On Hold / Inactive" | "New Lead",
  "keyPriorities": ["bullet 1: core budget, locations, and specific preferences/amenities like pool/garden"],
  "lastInteractionHighlights": ["bullet 1: summary of most recent call/note and buyer sentiment"],
  "recommendedNextStep": "One direct, high-leverage action the agent should take immediately"
}
`;

        let briefing = {
            sentimentTag: (lead.scores?.[0]?.finalScore ?? 50) >= 80 ? 'Hot Buyer' : 'Active & Engaged',
            keyPriorities: [
                `Budget: ${lead.currency || '$'}${lead.budgetMin || 0} - ${lead.currency || '$'}${lead.budgetMax || 'Any'} in ${lead.preferredAreas || 'preferred areas'}.`,
                `Looking for ${lead.bedroomsMin ? lead.bedroomsMin + '+ Beds' : 'residential property'} with ${lead.moveTimeline || 'standard'} timeline.`
            ],
            lastInteractionHighlights: [
                lead.callLogs.length > 0 
                    ? `Last call recorded: ${lead.callLogs[0].outcome.replace(/_/g, ' ')}.` 
                    : 'No previous calls logged. Fresh outreach recommended.'
            ],
            recommendedNextStep: lead.propertyMatches.length > 0
                ? `Pitch top matching property: ${lead.propertyMatches[0].property.title}.`
                : 'Call lead to verify specific property requirements.'
        };

        try {
            const geminiRes = await generateWithGemini({
                prompt,
                systemInstruction: "You are an executive real estate sales strategist. Always return valid JSON.",
                responseJson: true,
                temperature: 0.2
            });

            if (geminiRes) {
                const parsed = JSON.parse(geminiRes);
                briefing = {
                    sentimentTag: parsed.sentimentTag || briefing.sentimentTag,
                    keyPriorities: Array.isArray(parsed.keyPriorities) && parsed.keyPriorities.length > 0 ? parsed.keyPriorities : briefing.keyPriorities,
                    lastInteractionHighlights: Array.isArray(parsed.lastInteractionHighlights) && parsed.lastInteractionHighlights.length > 0 ? parsed.lastInteractionHighlights : briefing.lastInteractionHighlights,
                    recommendedNextStep: parsed.recommendedNextStep || briefing.recommendedNextStep
                };
            }
        } catch (geminiErr: any) {
            console.warn('[LeadBriefing] Gemini fallback notice:', geminiErr?.message || geminiErr);
        }

        return NextResponse.json({ briefing });
    } catch (e: any) {
        console.error('[LeadBriefing API error]:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
