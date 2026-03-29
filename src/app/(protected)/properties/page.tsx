import { getProperties } from './actions';
import PropertiesClient from './PropertiesClient';
import { prisma } from '@/lib/prisma';

export default async function PropertiesPage() {
    // Fetch properties directly via Prisma on the server side
    const properties = await getProperties();
    const groupsRaw = await prisma.$queryRaw<any[]>`SELECT id, name, created_at as createdAt FROM location_groups ORDER BY name ASC`;
    const locationsRaw = await prisma.$queryRaw<any[]>`SELECT id, name, group_id as groupId, is_custom as isCustom, created_by_lead_id as createdByLeadId, created_at as createdAt FROM locations`;
    const locationGroups = groupsRaw.map(g => ({
        ...g,
        locations: locationsRaw.filter(l => l.groupId === g.id)
    }));
    
    return (
        <PropertiesClient initialProperties={properties} locationGroups={locationGroups} />
    );
}


