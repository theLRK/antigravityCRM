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

    // Pre-fetch the initial leads to avoid client-side loading spinners on first paint
    const initialLeads = await getLeads();

    return <LeadsClient initialLeads={initialLeads} />;
}
