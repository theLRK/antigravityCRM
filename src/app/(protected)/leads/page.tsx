import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { LeadsClient } from './components/LeadsClient';
import { getLeads } from './actions';

export const metadata = {
    title: 'Leads Management | Formative',
    description: 'Manage and convert your active real estate leads.',
};

export default async function LeadsPage() {
    const supabase = await createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/sign-in');
    }

    // Pre-fetch initial leads using the authenticated session user ID directly (0 redundant network calls)
    const initialLeads = await getLeads({}, session.user.id);

    return <LeadsClient initialLeads={initialLeads} />;
}
