import { getAgentForm } from './actions';
import { FormativeLogo } from '@/components/ui/branding/FormativeLogo';
import { LogOut, Link as LinkIcon, Edit, Settings2, BarChart3, GripVertical, Plus, Shield } from 'lucide-react';
import Link from 'next/link';
import { GeneralSettingsForm } from './components/GeneralSettingsForm';
import { CustomFieldsBuilder } from './components/CustomFieldsBuilder';
import { ShareLinkBox } from './components/ShareLinkBox';

export default async function LeadCapturePage() {
    const formConfig = await getAgentForm();
    const totalSubmissions = formConfig.leads?.length || 0;

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lead Capture Configuration</h1>
                    <p className="text-slate-500 mt-2">Manage your public intake form, custom fields, and analytics.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4">
                    <Link href={`/f/${formConfig.publicId}`} target="_blank" className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">
                        <LinkIcon className="w-4 h-4 mr-2 text-slate-500" />
                        Preview Form
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form Builder core settings */}
                <div className="col-span-1 lg:col-span-2 space-y-8">

                    {/* 1. Basic Settings Block */}
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                <Edit className="w-5 h-5 mr-2 text-[#853953]" />
                                General Content
                            </h3>
                            <div className="flex items-center">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${formConfig.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {formConfig.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <GeneralSettingsForm 
                                formId={formConfig.id}
                                title={formConfig.title}
                                description={formConfig.description || ''}
                                welcomeMessage={formConfig.welcomeMessage || ''}
                                successMessage={formConfig.successMessage || ''}
                                isActive={formConfig.isActive}
                                autoSendFirstMessage={formConfig.autoSendFirstMessage}
                                currencySymbol={formConfig.currencySymbol || '$'}
                            />
                        </div>
                    </div>

                    {/* 2. Schema Builder Block */}
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                <Settings2 className="w-5 h-5 mr-2 text-[#853953]" />
                                Form Schema Builder
                            </h3>
                        </div>

                        <div className="p-0">
                            {/* Core Locked Fields */}
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-700 flex items-center"><Shield className="w-4 h-4 mr-2 text-slate-400" /> Core Scoring Fields (Locked)</span>
                                    <span className="text-slate-400 italic text-xs">Always Active</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">These fields map identically to the Formative Intake algorithm and cannot be manipulated.</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">First/Last Name</span>
                                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">Email</span>
                                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">Phone</span>
                                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">Budget Range</span>
                                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">Timeline</span>
                                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">Properties</span>
                                </div>
                            </div>

                            {/* Custom Dynamic Fields */}
                            <div className="p-6 pb-2">
                                <CustomFieldsBuilder
                                    formId={formConfig.id}
                                    initialFieldsJson={formConfig.customFields || '[]'}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Analytics & Quick Links */}
                <div className="col-span-1 space-y-6">

                    {/* URL Box Component */}
                    <ShareLinkBox publicId={formConfig.publicId} />

                    {/* Stats Box */}
                    <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2 text-slate-400" />
                            Form Analytics
                        </h3>
                        <dl className="grid grid-cols-1 gap-5">
                            <div className="overflow-hidden rounded-lg bg-slate-50 px-4 py-5 shadow sm:p-6 ring-1 ring-slate-200/50">
                                <dt className="truncate text-sm font-medium text-slate-500">Total Submissions</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{totalSubmissions}</dd>
                            </div>
                            <div className="overflow-hidden rounded-lg bg-slate-50 px-4 py-5 shadow sm:p-6 ring-1 ring-slate-200/50">
                                <dt className="truncate text-sm font-medium text-slate-500">Form Conversion Rate</dt>
                                <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">N/A</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </main>
    );
}
