import OpenAI from 'openai';
import { env } from '@/config/env';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export async function refineEmailContent(
    baseSubject: string,
    baseBody: string,
    leadData: any,
    agentProfile: any
) {
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return { subject: baseSubject, body: baseBody, refined: false };
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert real estate communications assistant. 
Your goal is to refine a draft email to a high-intent VIP lead to make it sound incredibly personal, professional, and convincing without sounding overly robotic or salesy. 
Return the output as a JSON object with two fields: "subject" and "body" (which should be valid HTML matching the original format). 
Do NOT break the HTML layout. Simply improve the wording, inject context from the lead's profile seamlessly.`
                },
                {
                    role: "user",
                    content: `Here is the lead data:
Name: ${leadData.firstName} ${leadData.lastName}
Timeline: ${leadData.moveTimeline}
Financing: ${leadData.financing}
Budget: ${leadData.currency || '$'}${leadData.budgetMax}
Notes/Intent: ${leadData.motivation || 'N/A'}
Property Matches: ${leadData.propertyMatches ? leadData.propertyMatches.length + ' found' : 'none yet'}
Agent Info: ${agentProfile?.emailFromName || 'Your Agent'}

Base Subject: ${baseSubject}
Base Body:
${baseBody}

Refine the subject and body to be more compelling and personalized. Output JSON.`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const content = completion.choices[0].message.content;
        if (!content) return { subject: baseSubject, body: baseBody, refined: false };

        const parsed = JSON.parse(content);
        return {
            subject: parsed.subject || baseSubject,
            body: parsed.body || baseBody,
            refined: true
        };

    } catch (e: any) {
        console.error(`[AIEmailRefiner] LLM refinement failed:`, e.message);
        return { subject: baseSubject, body: baseBody, refined: false };
    }
}
