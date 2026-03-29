import { Resend } from 'resend';

// Provide a dummy fallback so Next.js build doesn't crash at module initialization
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_fallback_for_build');

export interface EmailVariables {
    leadName: string;
    propertyTitle: string;
    propertyLocation: string;
    propertyPrice: string;
    bedrooms: number;
    bathrooms: number | string;
    agentName: string;
    agentPhone: string;
    agencyName?: string;
    leadScore: number;
}

export async function sendDynamicPropertyEmail(to: string, vars: EmailVariables) {
    // 1. Determine Tone/Type based on Lead Score
    let emailType = "Cold";
    if (vars.leadScore >= 80) emailType = "Hot";
    else if (vars.leadScore >= 50) emailType = "Warm";

    const subject = `Property in ${vars.propertyLocation} you may like`;
    
    // 2. Build Content
    const html = `
        <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #7c3aed; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">${emailType} Property Match!</h1>
            </div>
            <div style="padding: 32px;">
                <p style="font-size: 16px; line-height: 24px;">Hello ${vars.leadName},</p>
                
                <p style="font-size: 16px; line-height: 24px;">
                    ${emailType === 'Hot' ? "I'm reaching out because we found an exceptional property that aligns perfectly with your high-priority requirements." : 
                      emailType === 'Warm' ? "I came across a property in ${vars.propertyLocation} that matches your preferences, so I wanted to share it with you." :
                      "I thought you might be interested in this new listing that matches some of your search criteria."}
                </p>
                
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #f1f5f9;">
                    <h2 style="margin: 0 0 8px 0; color: #0f172a;">${vars.propertyTitle}</h2>
                    <p style="margin: 0 0 4px 0; font-weight: bold; color: #7c3aed;">${vars.propertyPrice}</p>
                    <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px;">📍 ${vars.propertyLocation}</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">🛏️ ${vars.bedrooms} Bedrooms, 🛁 ${vars.bathrooms} Bathrooms</p>
                </div>

                <p style="font-size: 16px; line-height: 24px;">If this looks like something you'd be interested in, I can arrange a viewing or send more details.</p>
                
                <p style="font-size: 16px; line-height: 24px;">Please let me know what you think.</p>
                
                <div style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <p style="margin: 0; font-weight: bold; color: #0f172a;">Best regards,</p>
                    <p style="margin: 4px 0 0 0; color: #7c3aed; font-weight: 600;">${vars.agentName}</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">${vars.agencyName || 'Formative Properties'}</p>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">${vars.agentPhone}</p>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
                Sent via Formative CRM • <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
            </div>
        </div>
    `;

    return await resend.emails.send({
        from: 'Formative CRM <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
    });
}

// Keep old version for backward compat if needed, but mark as legacy
export async function sendPropertyEmail(args: any) {
    return sendDynamicPropertyEmail(args.to, {
        leadName: args.firstName,
        propertyTitle: args.propertyTitle,
        propertyLocation: args.propertyLocation,
        propertyPrice: args.propertyPrice,
        bedrooms: 0, 
        bathrooms: 0,
        agentName: "Agent",
        agentPhone: "",
        leadScore: 50
    });
}
