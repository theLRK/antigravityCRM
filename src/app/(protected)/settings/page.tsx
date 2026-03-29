import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Settings, User, Bell, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
    const supabase = await createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!session || !user) {
        redirect('/sign-in');
    }

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 mt-2">Manage your CRM configuration and workspace defaults.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Settings Sidebar */}
                <div className="col-span-1 border-r border-slate-200 pr-4">
                    <nav className="space-y-1">
                        <Link href="/settings" className="bg-[#853953]/5 text-[#853953] group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                            <Settings className="text-[#853953] flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
                            General
                        </Link>
                        <Link href="/account" className="text-slate-900 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                            <User className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
                            Account Profile
                        </Link>
                        <Link href="/settings/email" className="text-slate-900 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                            <Bell className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
                            Email Connection
                        </Link>
                        <Link href="/settings/email-templates" className="text-slate-900 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors">
                            <Shield className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
                            Email Templates
                        </Link>
                    </nav>
                </div>

                {/* Settings Main Area */}
                <div className="col-span-3">
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl sm:rounded-2xl">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-xl font-semibold leading-7 text-slate-900">Account Information</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Your Formative CRM account details.
                            </p>

                            <dl className="mt-6 space-y-6 divide-y divide-slate-100 border-t border-slate-200 text-sm leading-6">
                                <div className="pt-6 sm:flex">
                                    <dt className="font-medium text-slate-900 sm:w-64 sm:flex-none sm:pr-6">Email Address</dt>
                                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                                        <div className="text-slate-700">{user.email}</div>
                                    </dd>
                                </div>
                                <div className="pt-6 sm:flex">
                                    <dt className="font-medium text-slate-900 sm:w-64 sm:flex-none sm:pr-6">Account ID</dt>
                                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                                        <div className="text-slate-500 font-mono text-xs truncate">{user.id}</div>
                                    </dd>
                                </div>
                                <div className="pt-6 sm:flex">
                                    <dt className="font-medium text-slate-900 sm:w-64 sm:flex-none sm:pr-6">Member Since</dt>
                                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                                        <div className="text-slate-700">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="mt-8 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl sm:rounded-2xl">
                        <div className="px-4 py-6 sm:p-8">
                            <h2 className="text-xl font-semibold leading-7 text-slate-900">Quick Navigation</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">Jump to a specific settings section.</p>
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/account" className="flex flex-col gap-1 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group">
                                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700">Account Profile</p>
                                    <p className="text-xs text-slate-500">Update your name, phone, and profile photo</p>
                                </Link>
                                <Link href="/settings/email" className="flex flex-col gap-1 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group">
                                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700">Email Connection</p>
                                    <p className="text-xs text-slate-500">Connect your Gmail account for automated sends</p>
                                </Link>
                                <Link href="/settings/email-templates" className="flex flex-col gap-1 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group">
                                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700">Email Templates</p>
                                    <p className="text-xs text-slate-500">Customize your HOT, WARM, and COLD templates</p>
                                </Link>
                                <Link href="/engage" className="flex flex-col gap-1 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors group">
                                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700">Engage Dashboard</p>
                                    <p className="text-xs text-slate-500">View email performance metrics and test dispatch</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
