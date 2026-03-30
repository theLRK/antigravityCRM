// @ts-nocheck
import { requireRole } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { Shield, Users, UserPlus, ArrowLeftRight } from 'lucide-react';
import AdminPageClient from './AdminPageClient';


export default async function AdminPage() {
    // Only admins can access this page
    const ctx = await requireRole(['admin']);

    // Fetch all AgentUsers
    const agents = await prisma.$queryRaw<any[]>`SELECT id, supabase_id as "supabaseId", name, email, role, is_active as "isActive", created_at as "createdAt" FROM agent_users ORDER BY created_at DESC`;

    // Fetch all leads with assignment info
    const leadsRaw = await prisma.$queryRaw<any[]>`SELECT id, first_name as "firstName", last_name as "lastName", email, phone, pipeline_stage as "pipelineStage", assigned_agent_id as "assignedAgentId", is_unassigned as "isUnassigned", created_at as "createdAt" FROM leads ORDER BY created_at DESC`;
    
    // Attempt to map scores loosely
    const leads = leadsRaw.map(l => ({
        ...l,
        scores: []
    }));

    // System-wide stats
    const totalLeads = leads.length;
    const unassignedLeads = leads.filter(l => l.isUnassigned || !l.assignedAgentId);
    const closedLeads = leads.filter(l => l.pipelineStage === 'closed');

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-10">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-[#853953]/10 rounded-xl">
                        <Shield className="w-6 h-6 text-[#853953]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
                        <p className="text-slate-500 text-sm">Manage agents and assign leads.</p>
                    </div>
                </div>
            </div>

            <AdminPageClient
                agents={agents}
                leads={leads as any}
                currentAdminId={ctx.supabaseId}
            />
        </main>
    );
}

