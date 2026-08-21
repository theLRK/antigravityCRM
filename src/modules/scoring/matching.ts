import { prisma } from '@/lib/prisma';
import { generateWithGemini } from '@/lib/gemini';
import OpenAI from 'openai';
import { env } from '../../config/env';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY || 're_dummy' });

export interface MatchEvaluationResult {
    score: number;
    matchPercent: number;
    matchReason: string;
    breakdown: {
        budgetFit: string;
        locationFit: string;
        specsFit: string;
        notesFit: string;
    };
    pitchHook: string;
}

/**
 * Intelligent Multi-Factor Property Match Evaluator with Google Gemini
 * Analyzes structured criteria + lead notes + property notes + semantic amenities.
 */
export async function evaluateLeadPropertyMatch(lead: any, property: any, locationMap?: Map<string, any>): Promise<MatchEvaluationResult> {
    let budgetScore = 0;
    let budgetText = 'No budget specified';
    let locationScore = 0;
    let locationText = 'Location criteria flexible';
    let specsScore = 0;
    let specsText = 'Standard residential match';

    // 1. Budget Fit (Max 35 points)
    const price = property.price || 0;
    const maxBudget = lead.budgetMax || 0;
    const minBudget = lead.budgetMin || 0;

    if (maxBudget > 0) {
        if (price <= maxBudget) {
            if (minBudget > 0 && price < minBudget * 0.8) {
                budgetScore = 20;
                budgetText = `${budgetScore}/35 - Below min budget target (${property.currency || '$'}${price.toLocaleString()})`;
            } else {
                budgetScore = 35;
                budgetText = `35/35 - Fits within ${property.currency || '$'}${maxBudget.toLocaleString()} budget perfectly`;
            }
        } else if (price <= maxBudget * 1.1) {
            budgetScore = 20;
            budgetText = `20/35 - Slight stretch (within 10% of ${property.currency || '$'}${maxBudget.toLocaleString()})`;
        } else {
            budgetScore = 0;
            budgetText = `0/35 - Price (${property.currency || '$'}${price.toLocaleString()}) exceeds budget (${property.currency || '$'}${maxBudget.toLocaleString()})`;
        }
    } else if (minBudget > 0) {
        if (price >= minBudget) {
            budgetScore = 30;
            budgetText = `30/35 - Meets ${property.currency || '$'}${minBudget.toLocaleString()} minimum requirement`;
        }
    } else {
        budgetScore = 15;
        budgetText = '15/35 - Flexible budget parameter';
    }

    // 2. Hybrid Location Fit (Max 25 points)
    let leadLocIds: string[] = [];
    if (Array.isArray(lead.preferredLocationIds)) {
        leadLocIds = lead.preferredLocationIds;
    } else if (typeof lead.preferredLocationIds === 'string' && lead.preferredLocationIds.startsWith('[')) {
        try { leadLocIds = JSON.parse(lead.preferredLocationIds); } catch {}
    }

    const propLocId = property.locationId;
    let locMatched = false;

    if (leadLocIds.length > 0 && propLocId) {
        if (leadLocIds.includes(propLocId)) {
            locationScore = 25;
            locationText = `25/25 - Exact location match for ${property.location}`;
            locMatched = true;
        } else if (locationMap) {
            const propLoc = locationMap.get(propLocId);
            if (propLoc?.groupId) {
                const isSibling = leadLocIds.some(lid => locationMap.get(lid)?.groupId === propLoc.groupId);
                if (isSibling) {
                    locationScore = 20;
                    locationText = `20/25 - Adjacent neighborhood in same area group (${propLoc.group?.name || 'region'})`;
                    locMatched = true;
                }
            }
        }
    }

    if (!locMatched) {
        const leadAreaText = [lead.preferredAreas, lead.customLocation].filter(Boolean).join(' ').toLowerCase();
        const propAreaText = (property.location || '').toLowerCase();

        if (leadAreaText && propAreaText) {
            if (propAreaText.includes(leadAreaText) || leadAreaText.includes(propAreaText)) {
                locationScore = 25;
                locationText = `25/25 - Free-text location match (${property.location})`;
            } else {
                const leadTokens = leadAreaText.split(/[, \-/]+/).filter((t: string) => t.length >= 3);
                const propTokens = propAreaText.split(/[, \-/]+/).filter((t: string) => t.length >= 3);
                const overlap = leadTokens.filter((t: string) => propTokens.some((pt: string) => pt.includes(t) || t.includes(pt)));

                if (overlap.length >= 2) {
                    locationScore = 20;
                    locationText = `20/25 - Strong area overlap in ${overlap.join(', ')}`;
                } else if (overlap.length === 1) {
                    locationScore = 15;
                    locationText = `15/25 - Partial city/region match in ${overlap[0]}`;
                } else {
                    locationScore = 0;
                    locationText = `0/25 - Location mismatch (${property.location} vs ${lead.preferredAreas || 'unspecified'})`;
                }
            }
        } else {
            locationScore = 12;
            locationText = '12/25 - Open to general location';
        }
    }

    // 3. Bedrooms & Specs (Max 20 points)
    const minBeds = lead.bedroomsMin || 0;
    const propBeds = property.bedrooms || 0;

    if (minBeds > 0) {
        if (propBeds >= minBeds) {
            specsScore = 20;
            specsText = `20/20 - ${propBeds} beds meets or exceeds ${minBeds}+ target`;
        } else if (propBeds === minBeds - 1) {
            specsScore = 10;
            specsText = `10/20 - ${propBeds} beds is 1 bed under ${minBeds} target`;
        } else {
            specsScore = 0;
            specsText = `0/20 - ${propBeds} beds does not meet ${minBeds}+ target`;
        }
    } else {
        specsScore = 15;
        specsText = `15/20 - ${propBeds} beds (flexible buyer requirement)`;
    }

    const baseScore = budgetScore + locationScore + specsScore;

    // 4. Semantic AI Analysis on Notes & Amenities (Google Gemini 2.0 Flash)
    // Gather lead notes and property notes
    const leadNotesArr = Array.isArray(lead.notes) ? lead.notes.map((n: any) => n.content || n).filter(Boolean) : [];
    const leadNotesCombined = [lead.motivation, ...leadNotesArr].filter(Boolean).join('; ');

    const propNotesArr = Array.isArray(property.notes) ? property.notes.map((n: any) => n.content || n).filter(Boolean) : [];
    const propNotesCombined = [property.description, ...propNotesArr].filter(Boolean).join('; ');

    let aiBonus = 0;
    let notesText = '+0 pts - No specific notes alignment';
    let matchReason = `${lead.firstName} matches ${property.title} with a base compatibility score of ${baseScore}%.`;
    let pitchHook = `I found a wonderful property in ${property.location} that matches your budget and criteria.`;

    // Run Gemini if there are notes to analyze
    if (leadNotesCombined || propNotesCombined) {
        const prompt = `
You are an expert real estate AI matching analyst in Formative CRM.
Evaluate how well the Lead's preferences and private agent notes align with the Property details and property notes.

LEAD PROFILE:
- Name: ${lead.firstName} ${lead.lastName}
- Budget: ${lead.currency || '$'}${lead.budgetMin || 0} to ${lead.currency || '$'}${lead.budgetMax || 'Any'}
- Location: ${lead.preferredAreas || lead.customLocation || 'Any'}
- Beds Needed: ${lead.bedroomsMin || 'Any'}
- Timeline: ${lead.moveTimeline || 'Unknown'}
- Agent & Lead Notes: "${leadNotesCombined || 'None'}"

PROPERTY DETAILS:
- Title: ${property.title}
- Location: ${property.location}
- Price: ${property.currency || '$'}${property.price}
- Beds/Baths: ${property.bedrooms} Beds, ${property.bathrooms} Baths
- Property Type: ${property.propertyType || 'House'}
- Property Notes & Amenities: "${propNotesCombined || 'None'}"

INSTRUCTIONS:
1. Determine an AI Notes Alignment Bonus between -10 and +20 points:
   - Award positive points (+5 to +20) if specific preferences in notes align (e.g. pool, backyard, family space, flexible location around surrounding areas, quiet street).
   - Award negative points (-5 to -10) if notes contradict (e.g. buyer explicitly rejected apartments, or requires pet-friendly and property is not).
   - Return 0 if notes are neutral.
2. Write a concise 1-2 sentence "matchReason" explaining the fit to the agent.
3. Write an ultra-natural 1-sentence "pitchHook" for an email directly speaking to the buyer referencing their specific request (e.g. "Since you mentioned wanting a swimming pool for your kids, you'll love that this property includes...").

Return ONLY valid JSON matching this schema:
{
  "aiBonus": number,
  "notesFit": "string (e.g. +15 pts - Matched pool request from agent notes)",
  "matchReason": "string",
  "pitchHook": "string"
}
`;

        try {
            const geminiRes = await generateWithGemini({
                prompt,
                systemInstruction: "You are an intelligent real estate matching AI. Always respond in valid JSON format.",
                responseJson: true,
                temperature: 0.2
            });

            if (geminiRes) {
                const parsed = JSON.parse(geminiRes);
                aiBonus = Math.max(-10, Math.min(20, Number(parsed.aiBonus) || 0));
                notesText = String(parsed.notesFit || `+${aiBonus} pts - Evaluated by Gemini AI`);
                matchReason = String(parsed.matchReason || matchReason);
                pitchHook = String(parsed.pitchHook || pitchHook);
            }
        } catch (geminiErr: any) {
            console.warn('[PropertyMatcher] Gemini notes analysis fallback:', geminiErr?.message || geminiErr);
        }
    }

    const finalPercent = Math.min(100, Math.max(0, Math.round(baseScore + aiBonus)));

    return {
        score: finalPercent,
        matchPercent: finalPercent,
        matchReason: matchReason,
        breakdown: {
            budgetFit: budgetText,
            locationFit: locationText,
            specsFit: specsText,
            notesFit: notesText
        },
        pitchHook: pitchHook
    };
}

/**
 * Runs property matching for a specific property against all agent leads.
 */
export async function runMatchingForProperty(propertyId: string) {
    try {
        console.log(`[PropertyMatcher] Running intelligent match for Property ID ${propertyId}`);
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { notes: true }
        });
        if (!property) throw new Error("Property not found");
        if (property.status !== 'Available') {
            console.log(`[PropertyMatcher] Property is ${property.status}. Skipping match run.`);
            return;
        }

        const [leads, allLocations] = await Promise.all([
            prisma.lead.findMany({
                where: {
                    isUnsubscribed: false,
                    pipelineStage: { notIn: ['closed', 'lost'] },
                    assignedAgentId: property.agentId
                },
                include: { notes: true }
            }),
            (prisma as any).location.findMany({ include: { group: true } }).catch(() => [])
        ]);

        if (leads.length === 0) return;

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        for (const lead of leads) {
            const evalResult = await evaluateLeadPropertyMatch(lead, property, locationMap);

            if (evalResult.matchPercent >= 50) {
                await prisma.propertyMatch.upsert({
                    where: {
                        leadId_propertyId: {
                            leadId: lead.id,
                            propertyId: property.id
                        }
                    },
                    update: {
                        score: evalResult.matchPercent,
                        matchPercent: evalResult.matchPercent,
                        reasoning: JSON.stringify(evalResult),
                        matchReason: evalResult.matchReason
                    },
                    create: {
                        leadId: lead.id,
                        propertyId: property.id,
                        score: evalResult.matchPercent,
                        matchPercent: evalResult.matchPercent,
                        reasoning: JSON.stringify(evalResult),
                        matchReason: evalResult.matchReason
                    }
                });
                console.log(`[PropertyMatcher] Saved verified match for Lead ${lead.firstName} on Property ${property.title} (${evalResult.matchPercent}%)`);
            } else {
                // If it no longer matches, remove old stale match
                await prisma.propertyMatch.deleteMany({
                    where: { leadId: lead.id, propertyId: property.id }
                });
            }
        }
    } catch (e: any) {
        console.error('[PropertyMatcher] Error in runMatchingForProperty:', e.message || e);
    }
}

/**
 * Runs property matching for a specific lead against all agent properties.
 */
export async function runPropertyMatchingForLead(leadId: string) {
    try {
        console.log(`[PropertyMatcher] Running intelligent match for Lead ID ${leadId}`);
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { notes: true }
        });
        if (!lead || !lead.assignedAgentId) throw new Error("Lead not found or unassigned");

        // Clean up ANY stale matches where the property is NOT owned by the lead's agent
        await prisma.propertyMatch.deleteMany({
            where: {
                leadId: lead.id,
                OR: [
                    { property: { agentId: { not: lead.assignedAgentId } } },
                    { property: { status: { not: 'Available' } } }
                ]
            }
        });

        const [properties, allLocations] = await Promise.all([
            prisma.property.findMany({
                where: { status: 'Available', agentId: lead.assignedAgentId },
                include: { notes: true }
            }),
            (prisma as any).location.findMany({ include: { group: true } }).catch(() => [])
        ]);

        if (properties.length === 0) return;

        const locationMap = new Map<string, any>();
        allLocations.forEach((l: any) => locationMap.set(l.id, l));

        for (const property of properties) {
            const evalResult = await evaluateLeadPropertyMatch(lead, property, locationMap);

            if (evalResult.matchPercent >= 50) {
                await prisma.propertyMatch.upsert({
                    where: {
                        leadId_propertyId: {
                            leadId: lead.id,
                            propertyId: property.id
                        }
                    },
                    update: {
                        score: evalResult.matchPercent,
                        matchPercent: evalResult.matchPercent,
                        reasoning: JSON.stringify(evalResult),
                        matchReason: evalResult.matchReason
                    },
                    create: {
                        leadId: lead.id,
                        propertyId: property.id,
                        score: evalResult.matchPercent,
                        matchPercent: evalResult.matchPercent,
                        reasoning: JSON.stringify(evalResult),
                        matchReason: evalResult.matchReason
                    }
                });
            } else {
                await prisma.propertyMatch.deleteMany({
                    where: { leadId: lead.id, propertyId: property.id }
                });
            }
        }
    } catch (e: any) {
        console.error('[PropertyMatcher] Error in runPropertyMatchingForLead:', e.message || e);
    }
}
