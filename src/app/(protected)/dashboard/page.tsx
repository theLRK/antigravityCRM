import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
    Search,
    Bell,
    Download,
    BadgeDollarSign,
    Users,
    ArrowLeftRight,
    Sparkles,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    BrainCircuit,
    MailOpen,
    MousePointerClick,
    MessageSquare,
    Shield,
    Activity,
    BarChart3
} from 'lucide-react';
import Image from 'next/image';
import SetupChecklist from '@/components/ui/dashboard/SetupChecklist';
import ActivityChart from '@/components/ui/dashboard/ActivityChart';
import PipelineChart from '@/components/ui/dashboard/PipelineChart';
import NextBestActionsClient from '@/components/ui/dashboard/NextBestActionsClient';
import ActivityFeedClient from '@/components/ui/dashboard/ActivityFeedClient';
import NotificationDropdown from '@/components/ui/dashboard/NotificationDropdown';
import TaskBoard from '@/components/ui/dashboard/TaskBoard';
import LocationInsightsCard from '@/components/ui/dashboard/LocationInsightsCard';
import EmptyStatePipeline from '@/components/ui/dashboard/EmptyStatePipeline';
import Link from 'next/link';



// --- Sub-components to keep the file clean ---

function MetricCard({ title, amount, change, trend, Icon }: any) {
    const isUp = trend === 'up';
    return (
        <div className="card-modern p-6 flex flex-col group transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F4F4] flex items-center justify-center text-[#853953] group-hover:bg-gradient-to-br group-hover:from-[#853953] group-hover:to-[#612D53] group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" />
                </div>
                {change !== '0%' && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {change}
                    </div>
                )}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-3xl font-black text-[#2C2C2C] tracking-tight">{amount}</h3>
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

    // ---- FETCH REAL CRM METRICS (Optimized) ----
    const totalLeadsCount = await prisma.lead.count({ where: { assignedAgentId: user.id } });
    const activeLeadsCount = await prisma.lead.count({ where: { assignedAgentId: user.id, pipelineStage: { not: 'closed' } } });
    const closedLeadsCount = await prisma.lead.count({ where: { assignedAgentId: user.id, pipelineStage: 'closed' } });
    const conversionRate = totalLeadsCount > 0 ? ((closedLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0.0';

    const highIntentCount = await prisma.lead.count({
        where: {
            assignedAgentId: user.id,
            pipelineStage: 'new',
            scores: { some: { finalScore: { gte: 80 } } }
        }
    });

    const now = new Date();
    const overdueCount = await prisma.lead.count({
        where: {
            assignedAgentId: user.id,
            pipelineStage: { not: 'closed' },
            followUpDate: { lt: now }
        }
    });

    // Fetch only top priorities for the UI component
    const priorityLeads = await prisma.lead.findMany({
        where: {
            assignedAgentId: user.id,
            OR: [
                { pipelineStage: 'new', scores: { some: { finalScore: { gte: 80 } } } },
                { pipelineStage: { not: 'closed' }, followUpDate: { lt: now } }
            ]
        },
        include: {
            scores: { orderBy: { createdAt: 'desc' }, take: 1, include: { reasoningBreakdowns: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    const todayPriorities = priorityLeads.map(l => ({
        ...l,
        topScore: l.scores?.[0]?.finalScore || 0,
        priorityType: l.pipelineStage === 'new' && (l.scores?.[0]?.finalScore || 0) >= 80 ? 'URGENT: HIGH INTENT' : 'URGENT: OVERDUE',
        priorityLevel: 'high',
        suggestedAction: l.scores?.[0]?.suggestedAction || 'Needs attention'
    }));

    // ---- FETCH EMAIL METRICS (Optimized) ----
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const sentToday = await prisma.emailLog.count({
        where: { 
            sentAt: { gte: todayStart },
            lead: { assignedAgentId: user.id }
        }
    });

    const totalSent = await prisma.emailLog.count({ where: { status: 'sent', lead: { assignedAgentId: user.id } } });
    const openedCount = await prisma.emailLog.count({ where: { NOT: { openedAt: null }, lead: { assignedAgentId: user.id } } });
    const clickedCount = await prisma.emailLog.count({ where: { NOT: { clickedAt: null }, lead: { assignedAgentId: user.id } } });

    const openRate = totalSent > 0 ? Math.round((openedCount / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((clickedCount / totalSent) * 100) : 0;

    // ---- ONBOARDING SETUP STATUS ----
    const agentProfile = await prisma.agentProfile.findUnique({ where: { agentId: user.id } });
    const emailConnected = !!(agentProfile?.gmailEmailAddress && (agentProfile as any)?.gmailAppPassword);
    const captureFormExists = await prisma.leadCaptureForm.count({ where: { agentId: user.id } }) > 0;
    const hasFirstLead = totalLeadsCount > 0;
    const hasTemplates = !!(agentProfile?.emailTemplateHotBody);

    // ---- CHART DATA TRANSFORMATIONS ----
    // (Keeping simple for now, but using count is better than filtering full list)
    const last7DaysData = await Promise.all(Array.from({ length: 7 }, async (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0,0,0,0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23,59,59,999);
        
        const count = await prisma.lead.count({
            where: { assignedAgentId: user.id, createdAt: { gte: d, lte: dayEnd } }
        });
        const hotCount = await prisma.lead.count({
            where: { 
                assignedAgentId: user.id,
                createdAt: { gte: d, lte: dayEnd },
                scores: { some: { finalScore: { gte: 80 } } }
            }
        });

        return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            total: count,
            hot: hotCount
        };
    }));

    const pipelineStages = ['new', 'contacted', 'booked_showing', 'closed'];
    const pipelineChartData = await Promise.all(pipelineStages.map(async stage => {
        const count = await prisma.lead.count({ where: { assignedAgentId: user.id, pipelineStage: stage } });
        const colors: any = { new: '#853953', contacted: '#612D53', booked_showing: '#2C2C2C', closed: '#10b981' };
        const labels: any = { new: 'New', contacted: 'In Progress', booked_showing: 'Booked', closed: 'Closed' };
        return { name: labels[stage], value: count, color: colors[stage] };
    }));

    const setupSteps = [
        {
            id: 'email',
            title: 'Connect email → Send automated follow-ups instantly',
            description: 'Add your Gmail so Formative can handle the initial outreach while you sleep.',
            done: emailConnected,
            href: '/settings/email',
            cta: 'Set Up Email'
        },
        {
            id: 'templates',
            title: 'Refine advice → Sound like yourself',
            description: 'Personalise the Hot, Warm, and Cold lead emails to match your expert voice.',
            done: hasTemplates,
            href: '/settings/email-templates',
            cta: 'Edit Templates'
        },
        {
            id: 'form',
            title: 'Share link → Capture qualified leads 24/7',
            description: 'Your public form scores leads instantly and flows them into your pipeline.',
            done: captureFormExists,
            href: '/lead-capture',
            cta: 'Get Form Link'
        },
        {
            id: 'lead',
            title: 'First win → Watch AI handle a lead',
            description: 'When a lead submits, Formative scores it in seconds and sends the perfect first email.',
            done: hasFirstLead,
            href: '/leads',
            cta: 'View Leads'
        }
    ];

    return (
        <div className="flex flex-col w-full min-h-full bg-[#F3F4F4]">
            {/* Top Navigation Header */}
            <header className="flex items-center justify-between h-12 mb-10">
                <div className="relative w-96 group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#853953] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search leads, properties, or files..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-[#853953]/20 outline-none shadow-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                    <Link href="/dashboard/reports" className="flex items-center gap-2 px-5 py-3 bg-white border border-black/5 rounded-xl text-sm font-black text-[#2C2C2C] hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        <BarChart3 className="w-4 h-4 text-[#853953]" />
                        Reports
                    </Link>
                    <Link href="/account" className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#853953]/20 hover:scale-105 transition-all" title="Agent Profile">
                        {firstName.charAt(0).toUpperCase()}
                    </Link>
                </div>
            </header>

            {/* Main Dashboard Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full">
                {/* Setup Onboarding Checklist */}
                <SetupChecklist steps={setupSteps} />

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-[#2C2C2C] tracking-tight mb-2">
                        Welcome back, {firstName}
                    </h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        Formative analyzed <span className="text-[#853953] font-bold">{totalLeadsCount} leads</span> and handled <span className="text-[#853953] font-bold">{totalSent} automated actions</span> for you this month.
                    </p>
                </div>

                {/* ROI Results / Impact Strip */}
                <div className="mb-12 p-1.5 bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-8 p-6 md:p-8 bg-[#F3F4F4]/30 rounded-[22px]">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#853953] to-[#612D53] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#853953]/20">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-2">System Performance</p>
                                <p className="text-base font-bold text-[#2C2C2C]">AI Insights are optimizing your pipeline</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-12 md:gap-20">
                            <div className="text-center">
                                <p className="text-3xl font-black text-[#2C2C2C] leading-none tracking-tight">{totalLeadsCount}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Leads Scored</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-[#2C2C2C] leading-none tracking-tight">{highIntentCount}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">High Intent</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-[#2C2C2C] leading-none tracking-tight">{totalSent}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Automations</p>
                            </div>
                            <div className="text-center border-l border-black/5 pl-12 md:pl-20">
                                <p className="text-3xl font-black text-[#853953] leading-none tracking-tight">{closedLeadsCount}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Success Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <MetricCard
                        title="Active Pipeline"
                        amount={activeLeadsCount.toString()}
                        change={activeLeadsCount > 0 ? '+New' : '0%'}
                        trend="up"
                        Icon={Users}
                    />
                    <MetricCard
                        title="Conv. Efficiency"
                        amount={`${conversionRate}%`}
                        change={closedLeadsCount > 0 ? '+1.5%' : '0%'}
                        trend="up"
                        Icon={ArrowLeftRight}
                    />
                    <MetricCard
                        title="Match Precision"
                        amount={highIntentCount.toString()}
                        change="Priority"
                        trend="up"
                        Icon={Sparkles}
                    />
                </div>

                {/* Dashboard Grid Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">

                    {/* Left Column (2 spans): Actions Area */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Task Board */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-[#2C2C2C] flex items-center gap-3 tracking-tight">
                                <Calendar className="w-7 h-7 text-[#853953]" />
                                Task Command
                            </h2>
                            <TaskBoard />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-[#2C2C2C] flex items-center gap-3 tracking-tight">
                                <BrainCircuit className="w-7 h-7 text-[#853953]" />
                                AI Recommendations
                            </h2>
                            <div className="flex flex-col gap-5">
                                 <NextBestActionsClient />
                            </div>
                        </div>


                        {/* Recent Activity */}
                        <div className="card-modern p-10">
                            <h3 className="text-lg font-black text-[#2C2C2C] mb-2 tracking-tight flex items-center gap-3">
                                <Activity className="w-5 h-5 text-[#853953]" /> Live Activity Feed
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">System & Engagement Timeline</p>
                            <ActivityFeedClient />
                        </div>
                    </div>

                    {/* Right Column: AI Insights */}
                    <div className="space-y-10">
                        <h2 className="text-2xl font-black text-[#2C2C2C] flex items-center gap-3 tracking-tight">
                            <TrendingUp className="w-7 h-7 text-[#853953]" />
                            Match Insights
                        </h2>

                        <div className="space-y-6">
                            {todayPriorities.length === 0 ? (
                                <EmptyStatePipeline />
                            ) : (
                                todayPriorities.slice(0, 3).map((lead: any, idx: number) => (
                                    <div key={`${lead.id}-${idx}`} className="bg-gradient-to-br from-[#853953] to-[#612D53] rounded-3xl p-8 text-white shadow-xl shadow-[#853953]/20 relative overflow-hidden group hover:scale-[1.02] transition-all">
                                        <div className="absolute inset-0 bg-white opacity-[0.03] rotate-45 translate-x-12 -translate-y-12" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur-md border border-white/20 text-white font-black text-[10px]">
                                                    PRIORITY 0{idx + 1}
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest uppercase text-white/60">Pattern Analysis</span>
                                            </div>
                                            <h3 className="text-2xl font-black mb-4 leading-tight tracking-tight">
                                                {lead.firstName} hit {lead.topScore} points
                                            </h3>
                                            <p className="text-white/80 text-sm mb-8 font-medium leading-relaxed opacity-90 line-clamp-3 italic">
                                                &ldquo;{lead.scores?.[0]?.reasoningBreakdowns?.[0]?.reasoningSummary || 'AI analysis suggests immediate follow up.'}&rdquo;
                                            </p>

                                            <div className="bg-black/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-white/50 font-black tracking-widest mb-1 uppercase">Timeline</p>
                                                    <p className="text-lg font-black tracking-tight text-white">{lead.moveTimeline}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-white/50 font-black tracking-widest mb-1 uppercase">Prop. Match</p>
                                                    <p className="text-xl font-black text-emerald-300">{lead.scores?.[0]?.confidenceScore || 0}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Email Engagement Widget */}
                        <div className="card-modern p-8">
                            <h3 className="text-sm font-black text-[#2C2C2C] mb-8 tracking-tight flex items-center gap-3">
                                <MailOpen className="w-4 h-4 text-[#853953]" /> Outreach Efficiency
                            </h3>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-[#2C2C2C] tracking-tight">{sentToday}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Sent</p>
                                </div>
                                <div className="text-center border-l border-black/5">
                                    <p className="text-3xl font-black text-[#2C2C2C] tracking-tight">{openRate}%</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Open</p>
                                </div>
                                <div className="text-center border-l border-black/5">
                                    <p className="text-3xl font-black text-[#2C2C2C] tracking-tight">{clickRate}%</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Click</p>
                                </div>
                            </div>
                        </div>

                        {/* Real Activity Analytics */}
                        <div className="card-modern p-8">
                            <h3 className="text-sm font-black text-[#2C2C2C] mb-2 tracking-tight flex items-center gap-3">
                                <Activity className="w-4 h-4 text-[#853953]" /> Pipeline Velocity
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-6">Last 7 Day Volume</p>
                            <ActivityChart data={last7DaysData} />
                        </div>

                        <LocationInsightsCard />

                        {/* Real Pipeline Breakdown */}
                        <div className="card-modern p-8">
                            <h3 className="text-sm font-black text-[#2C2C2C] mb-2 tracking-tight flex items-center gap-3">
                                <ArrowLeftRight className="w-4 h-4 text-[#853953]" /> Phase Allocation
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-6">Current active stages</p>
                            {pipelineChartData.length > 0 ? (
                                <PipelineChart data={pipelineChartData} />
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400 text-xs font-bold uppercase italic">
                                    Awaiting Data
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

