import { getProperties } from './actions';
import PropertiesClient from './PropertiesClient';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function PropertiesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/sign-in');

    const [properties, agentProfile, groupsRaw, locationsRaw] = await Promise.all([
        getProperties(),
        prisma.agentProfile.findUnique({ where: { agentId: user.id } }),
        prisma.$queryRaw<any[]>`SELECT id, name, created_at as createdAt FROM location_groups ORDER BY name ASC`,
        prisma.$queryRaw<any[]>`SELECT id, name, group_id as groupId, is_custom as isCustom, created_by_lead_id as createdByLeadId, created_at as createdAt FROM locations`
    ]);

    const locationGroups = groupsRaw.map(g => ({
        ...g,
        locations: locationsRaw.filter(l => l.groupId === g.id)
    }));

    const agentInfo = {
        name: agentProfile?.name || agentProfile?.emailFromName || user.user_metadata?.full_name || user.user_metadata?.first_name || 'Agent',
        phone: agentProfile?.phone || user.user_metadata?.phone || '',
        company: agentProfile?.company || 'Formative Real Estate'
    };
    
    return (
        <PropertiesClient initialProperties={properties} locationGroups={locationGroups} agentInfo={agentInfo} />
    );
}


