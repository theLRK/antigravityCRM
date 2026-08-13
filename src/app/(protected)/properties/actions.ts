"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';


// Ensure OpenAI client can be initialized in frontend server action.
// The OPENAI_API_KEY environment variable should be available to Next.js server side.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function runMatchingForProperty(propertyId: string) {
    try {
        console.log(`[PropertyMatcher] Starting match run for Property ID ${propertyId}`);
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) throw new Error("Property not found");
        if (property.status !== 'Available') {
            console.log(`[PropertyMatcher] Property is not Available. Skipping match.`);
            return;
        }

        const leads = await prisma.lead.findMany({
            where: { isUnsubscribed: false, pipelineStage: { notIn: ['closed', 'lost'] } }
        });

        if (leads.length === 0) return;

        console.log(`[PropertyMatcher] Evaluating ${leads.length} leads against Property ${propertyId}`);

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
            const prefArea = (lead.preferredAreas || '').toLowerCase();
            const propLoc = (property.location || '').toLowerCase();
            if (prefArea && propLoc) {
                if (propLoc.includes(prefArea) || prefArea.includes(propLoc)) score += 30;
                else {
                    const intersect = prefArea.split(/[, ]+/).filter(t => t.length > 3 && propLoc.split(/[, ]+/).includes(t));
                    if (intersect.length > 0) score += 15;
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

export async function getProperties(filters?: {
    search?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const where: any = { agentId: user.id };

    if (filters?.search) {
        where.AND = [
            {
                OR: [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { location: { contains: filters.search, mode: 'insensitive' } }
                ]
            }
        ];
    }
    if (filters?.status && filters.status !== 'All') {
        where.status = filters.status;
    }
    if (filters?.minPrice || filters?.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters?.beds) {
        where.bedrooms = { gte: filters.beds };
    }

    try {
        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                matches: {
                    include: { lead: true },
                    orderBy: { score: 'desc' }
                }
            }
        });
        return properties;
    } catch (error) {
        console.error("Error fetching properties:", error);
        throw new Error("Failed to fetch properties");
    }
}

export async function createProperty(data: {
    title: string;
    price: number;
    currency?: string;
    location: string;
    locationId?: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    description?: string;
    images?: string[];
    propertyType?: string;
    status?: string;
    agentId?: string;
    amenities?: string[];
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const property = await prisma.property.create({
            data: {
                title: data.title,
                price: data.price,
                currency: data.currency || 'USD',
                location: data.location || 'Unspecified',
                locationId: data.locationId || undefined,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                squareFootage: data.squareFootage,
                description: data.description,
                images: JSON.stringify(data.images || []),
                propertyType: data.propertyType || 'House',
                status: data.status || 'Available',
                agentId: user.id,
                amenities: JSON.stringify(data.amenities || []),
            }
        });
        revalidatePath('/properties');
        runMatchingForProperty(property.id).catch(console.error);
        return property;
    } catch (error) {
        console.error("Error creating property:", error);
        throw new Error("Failed to create property");
    }
}

export async function updateProperty(id: string, data: Partial<{
    title: string;
    price: number;
    currency: string;
    location: string;
    locationId: string;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    description: string;
    images: string[];
    propertyType: string;
    status: string;
    amenities: string[];
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await prisma.property.findFirst({
        where: { id, agentId: user.id }
    });
    if (!existing) throw new Error("Property not found or unauthorized");

    try {
        const updateData: any = { ...data };
        if (data.images) updateData.images = JSON.stringify(data.images);
        if (data.amenities) updateData.amenities = JSON.stringify(data.amenities);

        const property = await prisma.property.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/properties');
        runMatchingForProperty(property.id).catch(console.error);
        return property;
    } catch (error) {
        console.error("Error updating property:", error);
        throw new Error("Failed to update property");
    }
}

export async function deleteProperty(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await prisma.property.findFirst({
        where: { id, agentId: user.id }
    });
    if (!existing) throw new Error("Property not found or unauthorized");

    try {
        await prisma.property.delete({
            where: { id }
        });
        revalidatePath('/properties');
        return true;
    } catch (error) {
        console.error("Error deleting property:", error);
        throw new Error("Failed to delete property");
    }
}

