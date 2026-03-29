import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { env } from '../../config/env';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function runPropertyMatchingForLead(leadId: string) {
    try {
        console.log(`[PropertyMatcher] Starting match run for Lead ID ${leadId}`);
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) throw new Error("Lead not found");

        const properties = await prisma.property.findMany({
            where: { status: 'Available' }
        });
        if (properties.length === 0) {
            console.log(`[PropertyMatcher] No available properties to match against.`);
            return;
        }

        const matchCandidates: any[] = [];

        // 1. Deterministic Scoring
        for (const property of properties) {
            let score = 0;

            // Budget Match (40 points)
            // Use property price against lead budgetMin/budgetMax
            if (lead.budgetMax) {
                if (property.price <= lead.budgetMax) {
                    if (lead.budgetMin && property.price < lead.budgetMin * 0.8) {
                        score += 20; // Too cheap, maybe lower quality? Still technically in budget but under min
                    } else {
                        score += 40; // Sweet spot
                    }
                } else if (property.price <= lead.budgetMax * 1.15) {
                    score += 20; // Slightly over budget (15% stretch)
                }
            } else if (lead.budgetMin && property.price >= lead.budgetMin) {
                score += 40; // No max, but meets min
            }

            // Location Match (30 points)
            let locationMatch = false;
            
            // 2.1 Structured Location Match (UUIDs)
            const leadLocIds = Array.isArray(lead.preferredLocationIds) ? (lead.preferredLocationIds as string[]) : [];
            if (leadLocIds.length > 0 && property.locationId) {
                if (leadLocIds.includes(property.locationId)) {
                    score += 30;
                    locationMatch = true;
                }
            }

            // 2.2 Fallback: Legacy String Match
            if (!locationMatch) {
                const prefArea = (lead.preferredAreas || '').toLowerCase();
                const propLoc = (property.location || '').toLowerCase();
                if (prefArea && propLoc) {
                    if (propLoc.includes(prefArea) || prefArea.includes(propLoc)) {
                        score += 30; // Direct match
                    } else {
                        const prefTokens = prefArea.split(/[, ]+/);
                        const locTokens = propLoc.split(/[, ]+/);
                        const intersect = prefTokens.filter(t => t.length > 3 && locTokens.includes(t));
                        if (intersect.length > 0) score += 15; // Partial overlap
                    }
                }
            }

            // Bedrooms Match (20 points)
            if (lead.bedroomsMin) {
                if (property.bedrooms >= lead.bedroomsMin) {
                    score += 20;
                } else if (property.bedrooms === lead.bedroomsMin - 1) {
                    score += 10; // Exactly 1 bed short
                }
            } else {
                score += 20; // Did not specify, assuming matches
            }

            // Timeline Match (10 points)
            // Property is available, if lead is immediate = 10 points
            const timeline = (lead.moveTimeline || '').toLowerCase();
            if (timeline.includes('immediate') || timeline.includes('asap') || timeline.includes('1-3')) {
                score += 10;
            } else if (timeline.includes('3-6')) {
                score += 5;
            }

            // Push to candidates
            if (score >= 40) {
                matchCandidates.push({ property, score });
            }
        }

        // Sort descending
        matchCandidates.sort((a, b) => b.score - a.score);
        
        // Take top 5 candidates
        const topMatches = matchCandidates.slice(0, 5);
        if (topMatches.length === 0) {
            console.log(`[PropertyMatcher] No properties met minimum threshold (40%).`);
            return;
        }

        // 2. Generate AI reasoning for matches
        for (const candidate of topMatches) {
            // Delete old match if rerunning
            await prisma.propertyMatch.deleteMany({
                where: { leadId: lead.id, propertyId: candidate.property.id }
            });

            let reasoning = 'A strong deterministic match based on client criteria.';
            
            try {
                const prompt = `You are a real estate AI assistant matching a Lead with a Property.
                Write exactly 1-2 short sentences evaluating the fit, speaking to the agent (e.g. "This fits their budget perfectly and...").
                
                Lead details:
                - Budget: ${lead.budgetMin ? '$' + lead.budgetMin : 'Any'} to ${lead.budgetMax ? '$' + lead.budgetMax : 'Any'}
                - Areas: ${lead.preferredAreas || 'Any'}
                - Beds needed: ${lead.bedroomsMin || 'Any'}
                - Timeline: ${lead.moveTimeline || 'Unknown'}

                Property details:
                - Name: ${candidate.property.title}
                - Location: ${candidate.property.location}
                - Price: ${candidate.property.currency}${candidate.property.price}
                - Beds: ${candidate.property.bedrooms} Bed`;

                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'system', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 60
                });

                reasoning = completion.choices[0]?.message?.content?.trim() || reasoning;
            } catch (err) {
                console.error(`[PropertyMatcher] AI Reasoning generation failed for property ${candidate.property.id}. Using fallback.`);
            }

            await prisma.propertyMatch.create({
                data: {
                    leadId: lead.id,
                    propertyId: candidate.property.id,
                    score: candidate.score,
                    reasoning: reasoning
                }
            });
            console.log(`[PropertyMatcher] Saved property match ${candidate.property.id} (Score: ${candidate.score})`);
        }

        console.log(`[PropertyMatcher] Finished evaluating property matches for Lead ID ${leadId}.`);
    } catch (e: any) {
        console.error(`[PropertyMatcher] Error running matcher:`, e.message || e);
    }
}

export async function runMatchingForProperty(propertyId: string) {
    try {
        console.log(`[PropertyMatcher] Starting match run for Property ID ${propertyId}`);
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) throw new Error("Property not found");
        if (property.status !== 'Available') {
            console.log(`[PropertyMatcher] Property is not Available. Skipping match.`);
            return;
        }

        // Get active leads (e.g. not closed or unsubscribed)
        const leads = await prisma.lead.findMany({
            where: { isUnsubscribed: false, pipelineStage: { notIn: ['closed', 'lost'] } }
        });

        if (leads.length === 0) return;

        console.log(`[PropertyMatcher] Evaluating ${leads.length} leads against Property ${propertyId}`);

        // We will just call the lead matching for each, 
        // OR we can do the reverse logic. The easiest & most accurate is 
        // to just rerun the lead matcher for matching leads, 
        // but that touches old properties too. So let's just do a dedicated reverse loop:

        for (const lead of leads) {
            let score = 0;
            // Budget Match (40)
            if (lead.budgetMax) {
                if (property.price <= lead.budgetMax) {
                    if (lead.budgetMin && property.price < lead.budgetMin * 0.8) score += 20; 
                    else score += 40; 
                } else if (property.price <= lead.budgetMax * 1.15) score += 20;
            } else if (lead.budgetMin && property.price >= lead.budgetMin) score += 40;

            // Location Match (30)
            let locationMatch = false;
            const leadLocIds = Array.isArray(lead.preferredLocationIds) ? (lead.preferredLocationIds as string[]) : [];
            if (leadLocIds.length > 0 && property.locationId) {
                if (leadLocIds.includes(property.locationId)) {
                    score += 30;
                    locationMatch = true;
                }
            }

            if (!locationMatch) {
                const prefArea = (lead.preferredAreas || '').toLowerCase();
                const propLoc = (property.location || '').toLowerCase();
                if (prefArea && propLoc) {
                    if (propLoc.includes(prefArea) || prefArea.includes(propLoc)) score += 30;
                    else {
                        const intersect = prefArea.split(/[, ]+/).filter(t => t.length > 3 && propLoc.split(/[, ]+/).includes(t));
                        if (intersect.length > 0) score += 15;
                    }
                }
            }

            // Beds (20)
            if (lead.bedroomsMin) {
                if (property.bedrooms >= lead.bedroomsMin) score += 20;
                else if (property.bedrooms === lead.bedroomsMin - 1) score += 10;
            } else score += 20;

            // Timeline (10)
            const timeline = (lead.moveTimeline || '').toLowerCase();
            if (timeline.includes('immediate') || timeline.includes('asap') || timeline.includes('1-3')) score += 10;
            else if (timeline.includes('3-6')) score += 5;

            // Only generate an LLM rationale if score >= 40
            if (score >= 40) {
                await prisma.propertyMatch.deleteMany({
                    where: { leadId: lead.id, propertyId: property.id }
                });

                let reasoning = 'A strong deterministic match based on client criteria.';
                try {
                    const prompt = `You are a real estate AI assistant matching a Lead with a Property. Write exactly 1-2 short sentences evaluating the fit, speaking to the agent (e.g. "This fits their budget perfectly and...").
                    
                    Lead details: Budget: ${lead.budgetMin ? '$' + lead.budgetMin : 'Any'} to ${lead.budgetMax ? '$' + lead.budgetMax : 'Any'} | Areas: ${lead.preferredAreas || 'Any'} | Beds needed: ${lead.bedroomsMin || 'Any'} | Timeline: ${lead.moveTimeline || 'Unknown'}
                    Property details: Name: ${property.title} | Location: ${property.location} | Price: ${property.currency}${property.price} | Beds: ${property.bedrooms} Bed`;

                    const completion = await openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'system', content: prompt }],
                        temperature: 0.3,
                        max_tokens: 60
                    });
                    reasoning = completion.choices[0]?.message?.content?.trim() || reasoning;
                } catch (err) {}

                await prisma.propertyMatch.create({
                    data: {
                        leadId: lead.id,
                        propertyId: property.id,
                        score: score,
                        reasoning: reasoning
                    }
                });
                console.log(`[PropertyMatcher] Saved property match ${property.id} for lead ${lead.id} (Score: ${score})`);
            }
        }
    } catch (e: any) {
        console.error(`[PropertyMatcher] Error running reverse matcher:`, e.message || e);
    }
}

