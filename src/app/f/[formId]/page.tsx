import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PublicFormWizard } from './components/PublicFormWizard';


interface PageProps {
    params: Promise<{
        formId: string;
    }>;
}

export default async function PublicLeadCapturePage({ params }: PageProps) {
    // Resolve the promise if using Next.js 15+ dynamic params
    const resolvedParams = await params;

    // Lookup the form by its unique public URL slug
    const formConfig = await prisma.leadCaptureForm.findUnique({
        where: { publicId: resolvedParams.formId }
    });

    // 404 if the form doesn't exist
    if (!formConfig) {
        notFound();
    }

    // Fetch location groups for the multi-select
    const locationGroups = await prisma.locationGroup.findMany({
        include: { locations: true },
        orderBy: { name: 'asc' }
    });

    // Display a specialized "Form Closed" UI if the agent disabled it
    if (!formConfig.isActive) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center ring-1 ring-slate-200">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-6">
                        <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Form Unavailable</h2>
                    <p className="mt-2 text-slate-500">
                        This Lead Capture form is currently inactive or has been closed by the agent. Please reach out to them directly.
                    </p>
                </div>
            </div>
        );
    }

    // Pass the configurations downward to the interactive Client Wizard
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-[#853953]/10 selection:text-[#853953]">
            <PublicFormWizard
                formId={formConfig.id}
                title={formConfig.title}
                description={formConfig.description || ''}
                welcomeMessage={formConfig.welcomeMessage || ''}
                successMessage={formConfig.successMessage || ''}
                customFieldsJson={formConfig.customFields || '[]'}
                currencySymbol={formConfig.currencySymbol || '$'}
                locationGroups={locationGroups}
            />
        </div>
    );
}

