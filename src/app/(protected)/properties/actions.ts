"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { runMatchingForProperty } from '@/modules/scoring/matching';

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

    const sanitizedLocId = (data.locationId && typeof data.locationId === 'string' && data.locationId.trim() !== '') ? data.locationId.trim() : null;

    try {
        const property = await prisma.property.create({
            data: {
                title: data.title,
                price: data.price,
                currency: data.currency || 'USD',
                location: data.location || 'Unspecified',
                locationId: sanitizedLocId,
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
    } catch (error: any) {
        console.error("Error creating property:", error?.message || error);
        throw new Error(`Failed to create property: ${error?.message || 'Database error'}`);
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
        if ('locationId' in data) {
            updateData.locationId = (data.locationId && typeof data.locationId === 'string' && data.locationId.trim() !== '') ? data.locationId.trim() : null;
        }

        const property = await prisma.property.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/properties');
        runMatchingForProperty(property.id).catch(console.error);
        return property;
    } catch (error: any) {
        console.error("Error updating property:", error?.message || error);
        throw new Error(`Failed to update property: ${error?.message || 'Database error'}`);
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

