import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import TaskCalendar from '@/components/ui/engage/TaskCalendar';
import { EngageMetrics } from './components/EngageMetrics';
import { EngageTabs } from './components/EngageTabs';
import { FollowUpsTab } from './components/FollowUpsTab';
import { ManualEmailTab } from './components/ManualEmailTab';
import { EmailHistoryTab } from './components/EmailHistoryTab';
import { EmailSettingsTab } from './components/EmailSettingsTab';
import { ScheduledEmailsTab } from './components/ScheduledEmailsTab';
import { 
    sendTestEmailAction, 
    sendManualEmailAction, 
    markTaskDoneAction,
    rescheduleTaskAction,
    getScheduledEmailsAction
} from './actions';
import { revalidatePath } from 'next/cache';
import { Sparkles, Clock } from 'lucide-react';


export default async function EngageDashboardPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
    const { leadId } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let preselectedLead = null;
    if (leadId) {
        preselectedLead = await prisma.lead.findUnique({ where: { id: leadId } });
    }

    // --- Live Metrics ---
    let emailsSentToday = 0;
    let openRate = 0;
    let replyRate = 0;

    if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const agentLeads = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM leads WHERE assigned_agent_id = ${user.id}`;
        const leadIds = agentLeads.map((l: any) => l.id);

        const [todayLogs, totalLogs] = await Promise.all([
            prisma.emailLog.count({ 
                where: { 
                    sentAt: { gte: today }, 
                    status: 'sent',
                    leadId: { in: leadIds } 
                } 
            }),
            prisma.emailLog.findMany({ 
                where: { 
                    status: 'sent',
                    leadId: { in: leadIds } 
                }, 
                select: { opened: true, replied: true } 
            }),
        ]);

        emailsSentToday = todayLogs;

        if (totalLogs.length > 0) {
            const opened = totalLogs.filter((l: any) => l.opened).length;
            const replied = totalLogs.filter((l: any) => l.replied).length;
            openRate = Math.round((opened / totalLogs.length) * 100);
            replyRate = Math.round((replied / totalLogs.length) * 100);
        }
    }

    // --- Data Fetching for Tabs ---
    const allLeads = await prisma.lead.findMany({
        where: user ? { assignedAgentId: user.id } : {},
        orderBy: { confidenceScore: 'desc' }
    });

    const followUpTasks = await prisma.task.findMany({
        where: {
            agentId: user?.id,
            status: 'pending',
            taskType: { in: ['Follow up', 'Follow up email', 'Call', 'Viewing', 'Reminder'] }
        },
        include: {
            lead: {
                include: {
                    propertyMatches: {
                        include: { property: true },
                        take: 1
                    }
                }
            }
        },
        orderBy: { dueDate: 'asc' }
    });

    const properties = await prisma.property.findMany({ take: 20 });
    
    const emailLogs = await prisma.emailLog.findMany({
        where: user ? { lead: { assignedAgentId: user.id } } : {},
        include: { lead: true },
        orderBy: { sentAt: 'desc' },
        take: 50
    });

    const agentProfile = await prisma.agentProfile.findUnique({
        where: { agentId: user?.id || 'system' }
    });

    const scheduledEmails = await getScheduledEmailsAction();

    // Helper for manual send
    async function handleManualSend(data: any) {
        'use server'
        await sendManualEmailAction(data.leadId, data.subject, data.message, data.propertyId);
    }

    // Helper for mark done
    async function handleMarkDone(taskId: string) {
        'use server'
        await markTaskDoneAction(taskId);
    }

    async function handleReschedule(taskId: string) {
        'use server'
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await rescheduleTaskAction(taskId, tomorrow);
    }

    async function handleCancelScheduled(id: string) {
        'use server'
        await prisma.scheduledEmail.update({
            where: { id },
            data: { status: 'cancelled' }
        });
        revalidatePath('/engage');
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Engage Hub
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">
                        Communication & Outreach Center
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#853953]/5 border border-[#853953]/10 rounded-lg text-[#853953] text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Automation Active
                </div>
            </header>

            <EngageMetrics 
                emailsSentToday={emailsSentToday} 
                openRate={openRate} 
                replyRate={replyRate} 
            />

            <EngageTabs 
                initialTab={leadId ? 'manual' : 'follow-ups'}
                content={{
                    'follow-ups': (
                        <FollowUpsTab 
                            tasks={followUpTasks as any} 
                            onMarkDone={handleMarkDone}
                            onReschedule={handleReschedule}
                            onSendNow={async (id) => {
                                'use server'
                                await sendTestEmailAction('warm', id);
                            }}
                        />
                    ),
                    'manual': (
                        <ManualEmailTab 
                            properties={properties} 
                            onSend={handleManualSend} 
                        />
                    ),
                    'history': (
                        <EmailHistoryTab logs={emailLogs as any} />
                    ),
                    'calendar': (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <TaskCalendar />
                        </div>
                    ),
                    'settings': agentProfile && (
                        <EmailSettingsTab 
                            profile={agentProfile} 
                            onUpdate={async (formData) => {
                                'use server'
                                const name = formData.get('emailFromName') as string;
                                await prisma.agentProfile.update({
                                    where: { id: agentProfile.id },
                                    data: { emailFromName: name }
                                });
                                revalidatePath('/engage');
                            }}
                        />
                    ),
                    'scheduled': (
                        <ScheduledEmailsTab 
                            emails={scheduledEmails as any} 
                            onCancel={handleCancelScheduled} 
                        />
                    )
                }}
            />
        </div>
    );
}

