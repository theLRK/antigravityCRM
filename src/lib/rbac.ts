import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export type AgentUserRole = 'admin' | 'agent';

export interface AgentUserContext {
    supabaseId: string;
    role: AgentUserRole;
    name: string;
    email: string;
    isAdmin: boolean;
}

/**
 * Gets the current user's role context. Does NOT redirect.
 * Returns null if the user is not in agent_users (legacy single-user before RBAC).
 * In that case, treat as admin (backward compatibility).
 */
export async function getRoleContext(): Promise<AgentUserContext | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const agentUser = await prisma.agentUser.findUnique({
        where: { supabaseId: user.id }
    });

    // Default strictly to standard agent role if agentUser is not yet provisioned
    if (!agentUser) {
        return {
            supabaseId: user.id,
            role: 'agent',
            name: user.user_metadata?.first_name || user.email || 'Agent',
            email: user.email || '',
            isAdmin: false
        };
    }

    return {
        supabaseId: agentUser.supabaseId,
        role: (agentUser.role === 'admin' ? 'agent' : agentUser.role) as AgentUserRole,
        name: agentUser.name,
        email: agentUser.email,
        isAdmin: false
    };
}

/**
 * Requires the user to be authenticated and have one of the allowed roles.
 * Redirects to /dashboard if role is insufficient, /sign-in if not authenticated.
 */
export async function requireRole(allowedRoles: AgentUserRole[]): Promise<AgentUserContext> {
    const ctx = await getRoleContext();
    if (!ctx) redirect('/sign-in');
    if (!allowedRoles.includes(ctx.role)) redirect('/dashboard');
    return ctx;
}

export function buildLeadFilter(ctx: AgentUserContext): object {
    return { assignedAgentId: ctx.supabaseId };
}


