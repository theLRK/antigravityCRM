import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/ui/dashboard/Sidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/sign-in');
    }

    return (
        <div className="bg-[#F3F4F4] min-h-screen text-[#2C2C2C] font-sans selection:bg-[#853953]/10 selection:text-[#853953] flex">
            {/* Global Left Sidebar Navigation */}
            <Sidebar user={user} />

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <div className="p-8 lg:p-12">
                     {children}
                </div>
            </div>
        </div>
    )
}
