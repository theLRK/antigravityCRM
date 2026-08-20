import { Lead, Sequence, SequenceStep } from '@prisma/client';
import OpenAI from 'openai';
import { dispatchAIEmail } from '../email/dispatcher';
import { generateWithGemini } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 're_dummy'
});

export async function executeSequenceStep(lead: Lead, sequence: Sequence, step: SequenceStep) {
    console.log(`[Executor] Processing Step ${step.stepOrder} for Lead ${lead.id}`);

    const agentProfile = await prisma.agentProfile.findUnique({ 
        where: { agentId: lead.assignedAgentId ?? undefined } 
    });
    if (!agentProfile) {
        console.warn(`[Executor] Skipping sequence step: No agent profile found for lead ${lead.id}`);
        return;
    }
    
    // We get the property matches so the AI can reference them
    const matches = await prisma.propertyMatch.findMany({
        where: { leadId: lead.id },
        include: { property: true },
        orderBy: { score: 'desc' },
        take: 3
    });

    // Build the Prompt Context
    const contextPrompt = `
You are an expert real estate AI assistant writing an email on behalf of an agent named ${agentProfile?.name || 'Agent'}.
Your task is to write step ${step.stepOrder} of a drip campaign called "${sequence.name}".
The email type for this step is: "${step.emailType}".

Here is the data you have on the Lead:
- Name: ${lead.firstName} ${lead.lastName}
- Timeline: ${lead.moveTimeline || 'Unknown'}
- Financing: ${lead.financing || 'Unknown'}
- Budget: ${lead.budgetMin} to ${lead.budgetMax} ${lead.currency}
- Preferred Areas: ${lead.preferredAreas || 'Not specified'}
- Underlying Motivation: ${lead.motivation || 'Not specified'}

Here are the top ${matches.length} properties matched to them:
${matches.map(m => `- ${m.property.title} in ${m.property.location} (${m.property.currency}${m.property.price}) - Match Reason: ${m.reasoning}`).join('\n')}

INSTRUCTIONS:
- Write a highly personalized, human-sounding email.
- The tone should be: ${agentProfile?.emailTone || 'professional and helpful'}.
- Keep it concise.
- Output ONLY valid JSON in the following format:
{
  "subject": "The email subject",
  "body": "The HTML formatted email body (use <br>, <p>, <strong> etc.)"
}
`;

    // 1. Generate via Google Gemini
    let aiSubject = '';
    let aiBody = '';

    try {
        const geminiRes = await generateWithGemini({
            prompt: contextPrompt,
            systemInstruction: "You are an expert real estate AI copywriter. Respond with valid JSON only.",
            responseJson: true,
            temperature: 0.6
        });

        if (geminiRes) {
            const parsed = JSON.parse(geminiRes);
            if (parsed.subject && parsed.body) {
                aiSubject = parsed.subject;
                aiBody = parsed.body;
            }
        }
    } catch (geminiErr: any) {
        console.warn(`[Executor] Gemini sequence generation notice:`, geminiErr?.message || geminiErr);
    }

    // 2. OpenAI Fallback
    if (!aiSubject && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: contextPrompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7
            });

            const aiOutputText = response.choices[0]?.message?.content;
            if (aiOutputText) {
                const parsed = JSON.parse(aiOutputText);
                if (parsed.subject && parsed.body) {
                    aiSubject = parsed.subject;
                    aiBody = parsed.body;
                }
            }
        } catch (openAiErr: any) {
            console.warn(`[Executor] OpenAI sequence generation notice:`, openAiErr?.message || openAiErr);
        }
    }

    // 3. Fallback Heuristic Template if all LLMs are unconfigured
    if (!aiSubject) {
        aiSubject = `Update regarding your property search - ${agentProfile?.name || 'Your Agent'}`;
        aiBody = `<p>Hi ${lead.firstName},</p><p>I'm following up regarding your property search in ${lead.preferredAreas || 'your preferred areas'}. We have active updates matching your criteria.</p><p>Please let me know if you would like to review recent opportunities.</p>`;
    }

    const parsed = { subject: aiSubject, body: aiBody };

    // Replace basic variables if any snuck in
    let htmlBody = parsed.body.replace('{{agent_name}}', agentProfile?.name || 'Your Agent');
    htmlBody = htmlBody.replace('{{lead_name}}', lead.firstName);
    htmlBody += `\n<br><br><div>${agentProfile?.signature || ''}</div>`;

    // Dispatch real email via dispatcher
    // Since it's a drip campaign, we generally want to auto-send, but let's see. 
    // We will use existing dispatcher logic or just a raw dispatch if we want it to be a draft.
    // Drip campaigns are typically sent automatically.
    
    // We need to inject it into the email system
    await dispatchAIEmail(lead.id, 'drip_step', {
        subject: parsed.subject,
        body: htmlBody,
        isDraft: false // Or true if the user wants to review sequence emails manually
    });

    console.log(`[Executor] Successfully dispatched step ${step.stepOrder} for Lead ${lead.id}`);
}

