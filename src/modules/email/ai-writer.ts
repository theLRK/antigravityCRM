import { generateWithGemini } from '@/lib/gemini';
import OpenAI from 'openai';
import { env } from '@/config/env';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY || 're_dummy',
});

export async function refineEmailContent(
    baseSubject: string,
    baseBody: string,
    leadData: any,
    agentProfile: any
) {
    const systemInstruction = `You are an expert real estate communications assistant. 
Your goal is to refine a draft email to a high-intent VIP lead to make it sound incredibly personal, professional, and convincing without sounding overly robotic or salesy. 
Return the output as a JSON object with two fields: "subject" and "body" (which should be valid HTML matching the original format). 
Do NOT break the HTML layout. Simply improve the wording, inject context from the lead's profile seamlessly.`;

    const userPrompt = `Here is the lead data:
Name: ${leadData.firstName} ${leadData.lastName}
Timeline: ${leadData.moveTimeline || 'Unknown'}
Financing: ${leadData.financing || 'Unknown'}
Budget: ${leadData.currency || '$'}${leadData.budgetMax || 'Flexible'}
Notes/Intent: ${leadData.motivation || 'N/A'}
Property Matches: ${leadData.propertyMatches ? leadData.propertyMatches.length + ' found' : 'none yet'}
Agent Info: ${agentProfile?.emailFromName || agentProfile?.name || 'Your Agent'}

Base Subject: ${baseSubject}
Base Body:
${baseBody}

Refine the subject and body to be more compelling and personalized. Output JSON with {"subject": "...", "body": "..."}.`;

    // 1. Primary: Google Gemini 2.0 Flash
    try {
        const geminiRes = await generateWithGemini({
            prompt: userPrompt,
            systemInstruction,
            responseJson: true,
            temperature: 0.5
        });

        if (geminiRes) {
            const parsed = JSON.parse(geminiRes);
            return {
                subject: parsed.subject || baseSubject,
                body: parsed.body || baseBody,
                refined: true
            };
        }
    } catch (geminiErr: any) {
        console.warn(`[AIEmailRefiner] Gemini refinement fallback notice:`, geminiErr?.message || geminiErr);
    }

    // 2. Secondary: OpenAI fallback
    if (env.OPENAI_API_KEY && !env.OPENAI_API_KEY.includes('your_')) {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.5,
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                const parsed = JSON.parse(content);
                return {
                    subject: parsed.subject || baseSubject,
                    body: parsed.body || baseBody,
                    refined: true
                };
            }
        } catch (e: any) {
            console.warn(`[AIEmailRefiner] OpenAI fallback notice:`, e.message);
        }
    }

    return { subject: baseSubject, body: baseBody, refined: false };
}
