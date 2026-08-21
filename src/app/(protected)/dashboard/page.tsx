import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
    Users,
    ArrowLeftRight,
    Sparkles,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    BrainCircuit,
    MailOpen,
    BarChart3,
    Activity,
    Flame,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import SetupChecklist from '@/components/ui/dashboard/SetupChecklist';
import PipelineChart from '@/components/ui/dashboard/PipelineChart';
import NextBestActionsClient from '@/components/ui/dashboard/NextBestActionsClient';
import ActivityFeedClient from '@/components/ui/dashboard/ActivityFeedClient';
import NotificationDropdown from '@/components/ui/dashboard/NotificationDropdown';
import TaskBoard from '@/components/ui/dashboard/TaskBoard';
import LocationInsightsCard from '@/components/ui/dashboard/LocationInsightsCard';
import EmptyStatePipeline from '@/components/ui/dashboard/EmptyStatePipeline';
import DashboardSearchFilter from '@/components/ui/dashboard/DashboardSearchFilter';
import Link from 'next/link';

// --- Reusable Modern Metric Card ---
function MetricCard({ title, amount, change, trend, subtext, Icon, badgeColor = 'bg-[#853953]/10 text-[#853953]' }: {
    title: string;
    amount: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    subtext?: string;
    Icon: any;
    badgeColor?: string;
}) {
    const isUp = trend === 'up';
    const isDown = trend === 'down';
    return (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300 shadow-2xs group">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${badgeColor} flex items-center justify-center transition-all group-hover:scale-105`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {change && (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                            isUp ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                            isDown ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                            'bg-slate-50 text-slate-600 border-slate-200/60'
                        }`}>
                            {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                            {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
                            {change}
                        </div>
                    )}
                </div>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{amount}</h3>
            </div>
            {subtext && (
                <p className="text-xs font-medium text-slate-500 mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {subtext}
                </p>
            )}
        </div>
    );
}

export default async function DashboardPage() {
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

    const firstName = user.user_metadata?.first_name || 'Agent';

    // Auto-claim any unassigned leads submitted via this agent's forms
    try {
        await prisma.lead.updateMany({
            where: {
                assignedAgentId: null,
                sourceForm: { agentId: user.id }
            },
            data: {
                assignedAgentId: user.id,
                isUnassigned: false
            }
        });
    } catch (claimErr: any) {
        console.warn('[Dashboard] Auto-claim warning:', claimErr?.message);
    }

    // ---- FETCH REAL CRM METRICS (Optimized Parallel Batch) ----
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [
        totalLeadsCount,
        activeLeadsCount,
        closedLeadsCount,
        highIntentCount,
        priorityLeads,
        sentToday,
        totalSent,
        openedCount,
        clickedCount,
        agentProfile,
        captureFormCount,
        recentLeads7d,
        leadsLastWeekCount,
        propertyMatchesCount,
        pipelineLeads
    ] = await Promise.all([
        prisma.lead.count({ where: { assignedAgentId: user.id } }),
        prisma.lead.count({ where: { assignedAgentId: user.id, pipelineStage: { notIn: ['closed', 'lost'] } } }),
        prisma.lead.count({ where: { assignedAgentId: user.id, pipelineStage: 'closed' } }),
        prisma.lead.count({
            where: {
                assignedAgentId: user.id,
                pipelineStage: 'new',
                scores: { some: { finalScore: { gte: 80 } } }
            }
        }),
        prisma.lead.findMany({
            where: {
                assignedAgentId: user.id,
                OR: [
                    { pipelineStage: 'new', scores: { some: { finalScore: { gte: 80 } } } },
                    { pipelineStage: { notIn: ['closed', 'lost'] }, followUpDate: { lt: now } }
                ]
            },
            include: {
                scores: { orderBy: { createdAt: 'desc' }, take: 1, include: { reasoningBreakdowns: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 4
        }),
        prisma.emailLog.count({
            where: { 
                sentAt: { gte: todayStart },
                lead: { assignedAgentId: user.id }
            }
        }),
        prisma.emailLog.count({ where: { status: 'sent', lead: { assignedAgentId: user.id } } }),
        prisma.emailLog.count({ where: { NOT: { openedAt: null }, lead: { assignedAgentId: user.id } } }),
        prisma.emailLog.count({ where: { NOT: { clickedAt: null }, lead: { assignedAgentId: user.id } } }),
        prisma.agentProfile.findUnique({ where: { agentId: user.id } }),
        prisma.leadCaptureForm.count({ where: { agentId: user.id } }),
        prisma.lead.findMany({
            where: { assignedAgentId: user.id, createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true, scores: { select: { finalScore: true }, take: 1, orderBy: { createdAt: 'desc' } } }
        }),
        prisma.lead.count({
            where: { assignedAgentId: user.id, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } }
        }),
        prisma.propertyMatch.count({
            where: { 
                lead: { assignedAgentId: user.id },
                property: { agentId: user.id, status: 'Available' }
            }
        }),
        prisma.lead.findMany({
            where: { assignedAgentId: user.id },
            select: { pipelineStage: true }
        })
    ]);

    // True Growth Rate vs Prior 7 Days
    const leadsThisWeekCount = recentLeads7d.length;
    let leadGrowthText = 'Baseline';
    let leadGrowthTrend: 'up' | 'down' | 'neutral' = 'neutral';
    if (leadsLastWeekCount > 0) {
        const delta = Math.round(((leadsThisWeekCount - leadsLastWeekCount) / leadsLastWeekCount) * 100);
        leadGrowthText = delta >= 0 ? `+${delta}%` : `${delta}%`;
        leadGrowthTrend = delta >= 0 ? 'up' : 'down';
    } else if (leadsThisWeekCount > 0) {
        leadGrowthText = `+${leadsThisWeekCount} new`;
        leadGrowthTrend = 'up';
    }

    const conversionRate = totalLeadsCount > 0 ? ((closedLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0.0';
    const openRate = totalSent > 0 ? Math.round((openedCount / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((clickedCount / totalSent) * 100) : 0;

    const emailConnected = !!(agentProfile?.gmailEmailAddress && (agentProfile as any)?.gmailAppPassword);
    const captureFormExists = captureFormCount > 0;
    const hasFirstLead = totalLeadsCount > 0;
    const hasTemplates = !!(agentProfile?.emailTemplateHotBody);

    // In-memory Pipeline Distribution
    const pipelineStages = ['new', 'contacted', 'showing', 'booked_showing', 'closed'];
    const colors: any = { new: '#853953', contacted: '#612D53', showing: '#3b82f6', booked_showing: '#2C2C2C', closed: '#10b981' };
    const labels: any = { new: 'New', contacted: 'Contacted', showing: 'Showing', booked_showing: 'Booked', closed: 'Closed' };
    const pipelineChartData = pipelineStages.map(stage => {
        const count = pipelineLeads.filter(l => l.pipelineStage === stage).length;
        return { name: labels[stage] || stage, value: count, color: colors[stage] || '#64748b' };
    }).filter(d => d.value > 0);

    const setupSteps = [
        {
            id: 'email',
            title: 'Connect Email Integration',
            description: 'Add your Gmail credentials to dispatch automated follow-ups and AI pitches.',
            done: emailConnected,
            href: '/settings/email',
            cta: 'Configure Email'
        },
        {
            id: 'templates',
            title: 'Refine AI Email Templates',
            description: 'Tailor automated Hot, Warm, and Cold outreach to reflect your personal voice.',
            done: hasTemplates,
            href: '/settings/email-templates',
            cta: 'Edit Templates'
        },
        {
            id: 'form',
            title: 'Share Lead Intake Wizard',
            description: 'Publish your lead capture link to score buyer intent 24/7.',
            done: captureFormExists,
            href: '/lead-capture',
            cta: 'Get Form Link'
        },
        {
            id: 'lead',
            title: 'Convert Your First Lead',
            description: 'Let Formative evaluate requirements and pitch matching properties instantly.',
            done: hasFirstLead,
            href: '/leads',
            cta: 'View Leads'
        }
    ];

    return (
        <div className="flex flex-col w-full min-h-full bg-[#FAFAFC] pb-16">
            {/* Top Navigation & Search Bar */}
            <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 h-auto sm:h-14 mb-8">
                <DashboardSearchFilter />

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <NotificationDropdown />
                    <Link 
                        href="/dashboard/reports" 
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs active:scale-95"
                    >
                        <BarChart3 className="w-4 h-4 text-[#853953]" />
                        Reports
                    </Link>
                    <Link 
                        href="/account" 
                        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white font-black text-xs shadow-md shadow-[#853953]/20 hover:scale-105 transition-all" 
                        title="Agent Account"
                    >
                        {firstName.charAt(0).toUpperCase()}
                    </Link>
                </div>
            </header>

            {/* Main Dashboard Body */}
            <main className="flex-1 max-w-7xl mx-auto w-full space-y-8">
                {/* Onboarding Checklist */}
                <SetupChecklist steps={setupSteps} />

                {/* Welcome & Context Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Welcome back, {firstName}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Formative CRM is monitoring <span className="text-[#853953] font-bold">{activeLeadsCount} active leads</span> and verified <span className="text-[#853953] font-bold">{propertyMatchesCount} inventory matches</span>.
                        </p>
                    </div>
                    <Link
                        href="/leads"
                        className="px-5 py-2.5 rounded-2xl bg-[#853953] hover:bg-[#612D53] text-white text-xs font-extrabold shadow-md shadow-[#853953]/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Go to Leads
                    </Link>
                </div>

                {/* 4 Core Scannable Primary KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Active Pipeline"
                        amount={activeLeadsCount.toString()}
                        change={leadGrowthText}
                        trend={leadGrowthTrend}
                        subtext="vs. prior 7 days"
                        Icon={Users}
                        badgeColor="bg-blue-50 text-blue-700"
                    />
                    <MetricCard
                        title="Hot Intent Buyers"
                        amount={highIntentCount.toString()}
                        change={highIntentCount > 0 ? 'Urgent Follow-Up' : undefined}
                        trend={highIntentCount > 0 ? 'up' : 'neutral'}
                        subtext="Scored 80+ by AI"
                        Icon={Flame}
                        badgeColor="bg-rose-50 text-rose-700"
                    />
                    <MetricCard
                        title="Property Matches"
                        amount={propertyMatchesCount.toString()}
                        change={propertyMatchesCount > 0 ? 'Active' : undefined}
                        trend={propertyMatchesCount > 0 ? 'up' : 'neutral'}
                        subtext="Multi-factor inventory fits"
                        Icon={Sparkles}
                        badgeColor="bg-[#853953]/10 text-[#853953]"
                    />
                    <MetricCard
                        title="Win Conversion"
                        amount={`${conversionRate}%`}
                        change={closedLeadsCount > 0 ? `${closedLeadsCount} Won` : undefined}
                        trend={closedLeadsCount > 0 ? 'up' : 'neutral'}
                        subtext="Closed pipeline efficiency"
                        Icon={ShieldCheck}
                        badgeColor="bg-emerald-50 text-emerald-700"
                    />
                </div>

                {/* Dashboard Grid Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Column (2 spans): Actions & Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* AI Suggestions / Next Best Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                                    <BrainCircuit className="w-5 h-5 text-[#853953]" />
                                    AI Action Suggestions
                                </h2>
                                <span className="text-[11px] font-bold text-slate-400">
                                    Real-time Next Best Actions
                                </span>
                            </div>
                            <NextBestActionsClient />
                        </div>

                        {/* Task Command Board */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                                <Calendar className="w-5 h-5 text-[#853953]" />
                                Task Command
                            </h2>
                            <TaskBoard />
                        </div>

                        {/* Live Activity Stream */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-7 shadow-2xs">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                                    <Activity className="w-4 h-4 text-[#853953]" /> Live Activity Feed
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Real-Time Stream
                                </span>
                            </div>
                            <ActivityFeedClient />
                        </div>
                    </div>

                    {/* Right Column (1 span): Priority Radar & Analytics */}
                    <div className="space-y-6">
                        {/* High Intent Radar */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
                                <TrendingUp className="w-5 h-5 text-[#853953]" />
                                Hot Leads Radar
                            </h2>

                            <div className="space-y-3.5">
                                {priorityLeads.length === 0 ? (
                                    <EmptyStatePipeline />
                                ) : (
                                    priorityLeads.slice(0, 3).map((lead: any, idx: number) => {
                                        const score = lead.scores?.[0]?.finalScore || 0;
                                        return (
                                            <div 
                                                key={lead.id || idx} 
                                                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all group"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                        Priority 0{idx + 1}
                                                    </span>
                                                    <span className="text-xs font-black text-[#853953]">
                                                        {score} pts
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 group-hover:text-[#853953] transition-colors">
                                                    {lead.firstName} {lead.lastName}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                                    {lead.scores?.[0]?.reasoningBreakdowns?.[0]?.reasoningSummary || lead.scores?.[0]?.suggestedAction || 'High intent buyer ready for personalized outreach.'}
                                                </p>
                                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-slate-400">
                                                        {lead.moveTimeline || 'Standard timeline'}
                                                    </span>
                                                    <Link 
                                                        href="/leads"
                                                        className="text-xs font-extrabold text-[#853953] hover:underline flex items-center gap-1"
                                                    >
                                                        Open Profile →
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Outreach Metrics Card */}
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
                                <MailOpen className="w-4 h-4 text-[#853953]" /> Outreach Efficiency
                            </h3>
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-xl font-black text-slate-900">{sentToday}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Today</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-xl font-black text-slate-900">{openRate}%</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Opens</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    <p className="text-xl font-black text-slate-900">{clickRate}%</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Clicks</p>
                                </div>
                            </div>
                        </div>

                        {/* Geographic Insights */}
                        <LocationInsightsCard />

                        {/* Pipeline Stage Distribution */}
                        {pipelineChartData.length > 0 && (
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs">
                                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2 tracking-tight">
                                    <ArrowLeftRight className="w-4 h-4 text-[#853953]" /> Pipeline Allocation
                                </h3>
                                <PipelineChart data={pipelineChartData} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
