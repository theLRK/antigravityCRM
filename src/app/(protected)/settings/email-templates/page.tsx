import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import EmailTemplatesEditor from '@/components/ui/settings/EmailTemplatesEditor';
import { BackButton } from '@/components/ui/BackButton';


export default async function EmailTemplatesPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    if (!session || !user) redirect('/sign-in');

    const agentProfile = await prisma.agentProfile.findUnique({
        where: { agentId: user.id }
    });

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
            <BackButton label="Back to Settings" href="/settings" />
            <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Email Templates</h1>
                    <p className="text-sm text-slate-500">Customize the automated emails sent to Hot, Warm, and Cold leads.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="col-span-1 border-r border-slate-200 pr-4">
                    <nav className="space-y-1">
                        <Link href="/settings" className="text-slate-600 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                            General
                        </Link>
                        <Link href="/settings/email" className="text-slate-600 hover:bg-slate-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                            Email Connection
                        </Link>
                        <Link href="/settings/email-templates" className="bg-purple-50 text-purple-700 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                            Email Templates
                        </Link>
                    </nav>
                </div>

                {/* Editor */}
                <div className="col-span-3">
                    <EmailTemplatesEditor initialTemplates={agentProfile} />
                </div>
            </div>
        </main>
    );
}

