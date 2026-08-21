import { getProperties, getCachedLocationGroups } from './actions';
import PropertiesClient from './PropertiesClient';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function PropertiesPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect('/sign-in');

    const user = session.user;

    const [properties, agentProfile, locationGroups] = await Promise.all([
        getProperties(undefined, user.id),
        prisma.agentProfile.findUnique({ where: { agentId: user.id } }),
        getCachedLocationGroups()
    ]);

    const agentInfo = {
        name: agentProfile?.name || agentProfile?.emailFromName || user.user_metadata?.full_name || user.user_metadata?.first_name || 'Agent',
        phone: agentProfile?.phone || user.user_metadata?.phone || '',
        company: agentProfile?.company || 'Formative Real Estate'
    };
    
    return (
        <PropertiesClient initialProperties={properties} locationGroups={locationGroups} agentInfo={agentInfo} />
    );
}


