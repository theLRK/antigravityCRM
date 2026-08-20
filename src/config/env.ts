import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    API_BASE_URL: z.string().url().default('https://my-formative-crm.vercel.app'),

    DATABASE_URL: z.string().default(''),

    JWT_SECRET: z.string().min(16).default('default-jwt-secret-key-min-16-chars'),
    JWT_EXPIRES_IN: z.string().default('8h'),
    JWT_REFRESH_SECRET: z.string().min(16).default('default-jwt-refresh-secret-16-chars'),
    FORM_INGEST_KEY: z.string().min(8).default('default-form-ingest-key'),

    GOOGLE_CLIENT_ID: z.string().optional().or(z.literal('')),
    GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal('')),
    GOOGLE_REDIRECT_URI: z.string().optional().or(z.literal('')),
    GMAIL_SENDER_ADDRESS: z.string().optional().or(z.literal('')),

    LLM_PROVIDER: z.enum(['openai', 'anthropic', 'gemini']).default('openai'),
    OPENAI_API_KEY: z.string().optional().or(z.literal('')),
    GEMINI_API_KEY: z.string().optional().or(z.literal('')),
    LLM_MODEL: z.string().default('gpt-4o-mini'),
    LLM_TIMEOUT_MS: z.coerce.number().default(8000),
    LLM_MAX_TOKENS: z.coerce.number().default(500),

    SCORING_RULES_VERSION: z.string().default('v1.0'),

    AGENT_NOTIFICATION_EMAIL: z.string().email().default('agent@formative.io'),
    NOTIFICATION_CHANNEL: z.enum(['email', 'slack', 'fcm']).default('email'),
    SLACK_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
    FCM_SERVER_KEY: z.string().optional().or(z.literal('')),

    RETRY_MAX_ATTEMPTS_EMAIL: z.coerce.number().default(3),
    RETRY_MAX_ATTEMPTS_NOTIFICATION: z.coerce.number().default(3),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.warn('⚠️ Non-critical environment parsing warning:', _env.error.format());
}

export const env = _env.success ? _env.data : envSchema.parse({});
