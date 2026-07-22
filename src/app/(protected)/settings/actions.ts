"use server";

import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { sendTestEmail } from '@/modules/email/dispatcher';

export async function syncWebsiteContent(url: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        // Validate URL
        let targetUrl = url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        console.log(`[Website Sync] Attempting to scrape: ${targetUrl}`);

        // Scrape Website
        const res = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'FormativeAgent/1.0 (Real Estate Introspection Crawler)'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch website. HTTP Status: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // Remove noise
        $('script, style, noscript, iframe, nav, footer, header').remove();

        // Extract raw text
        const textContent = $('body').text().replace(/\s+/g, ' ').trim();

        // Summarize or truncate to fit reasonable Postgres/SQLite columns
        const websiteContext = textContent.length > 5000 ? textContent.substring(0, 5000) + '...' : textContent;

        // Upsert into AgentProfile
        await prisma.agentProfile.upsert({
            where: { agentId: user.id },
            update: {
                websiteUrl: targetUrl,
                websiteContext: websiteContext
            },
            create: {
                agentId: user.id,
                websiteUrl: targetUrl,
                websiteContext: websiteContext,
                // Make sure defaults are set for new rows
            }
        });

        console.log(`[Website Sync] Success for ${user.id}. Saved ${websiteContext.length} chars.`);
        return { success: true, message: "Website connection synced successfully." };

    } catch (error: any) {
        console.error("[Website Sync Error]", error.message);
        return { success: false, error: error.message };
    }
}
export async function saveEmailCredentials(credentials: {
    email: string;
    appPassword: string;
    fromName?: string;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        if (!credentials.email || !credentials.appPassword) {
            return { success: false, error: 'Email and App Password are required.' };
        }

        await prisma.agentProfile.upsert({
            where: { agentId: user.id },
            update: {
                gmailEmailAddress: credentials.email,
                gmailAppPassword: credentials.appPassword,
                emailFromName: credentials.fromName || null,
            },
            create: {
                agentId: user.id,
                gmailEmailAddress: credentials.email,
                gmailAppPassword: credentials.appPassword,
                emailFromName: credentials.fromName || null,
            }
        });

        return { success: true };
    } catch (e: any) {
        console.error("Failed to save email credentials", e.message);
        return { success: false, error: e.message };
    }
}

// Keep saveGmailCredentials for backward compatibility (OAuth flow)
export async function saveGmailCredentials(credentials: { email: string, clientId: string, clientSecret: string, refreshToken: string }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.agentProfile.upsert({
            where: { agentId: user.id },
            update: {
                gmailEmailAddress: credentials.email,
                gmailClientId: credentials.clientId,
                gmailClientSecret: credentials.clientSecret,
                gmailRefreshToken: credentials.refreshToken,
            },
            create: {
                agentId: user.id,
                gmailEmailAddress: credentials.email,
                gmailClientId: credentials.clientId,
                gmailClientSecret: credentials.clientSecret,
                gmailRefreshToken: credentials.refreshToken,
            }
        });

        return { success: true };
    } catch (e: any) {
        console.error("Failed to save credentials", e.message);
        return { success: false, error: e.message };
    }
}

export async function disconnectGmail() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.agentProfile.update({
            where: { agentId: user.id },
            data: {
                gmailEmailAddress: null,
                gmailRefreshToken: null,
                gmailAccessToken: null,
                gmailTokenExpiry: null,
                gmailAppPassword: null,
            }
        });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function saveEmailTemplates(templates: {
    hotSubject: string; hotBody: string;
    warmSubject: string; warmBody: string;
    coldSubject: string; coldBody: string;
    fromName?: string;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.agentProfile.upsert({
            where: { agentId: user.id },
            update: {
                emailFromName: templates.fromName,
                emailTemplateHotSubject: templates.hotSubject,
                emailTemplateHotBody: templates.hotBody,
                emailTemplateWarmSubject: templates.warmSubject,
                emailTemplateWarmBody: templates.warmBody,
                emailTemplateColdSubject: templates.coldSubject,
                emailTemplateColdBody: templates.coldBody,
            },
            create: {
                agentId: user.id,
                emailFromName: templates.fromName,
                emailTemplateHotSubject: templates.hotSubject,
                emailTemplateHotBody: templates.hotBody,
                emailTemplateWarmSubject: templates.warmSubject,
                emailTemplateWarmBody: templates.warmBody,
                emailTemplateColdSubject: templates.coldSubject,
                emailTemplateColdBody: templates.coldBody,
            }
        });

        return { success: true };
    } catch (e: any) {
        console.error("Failed to save email templates", e.message);
        return { success: false, error: e.message };
    }
}

export async function sendTestEmailAction() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Unauthorized' };
        return await sendTestEmail(user.id);
    } catch (e: any) {
        return { success: false, message: e.message || 'Failed to send test email' };
    }
}


