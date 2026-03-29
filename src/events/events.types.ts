export type LeadCreatedPayload = {
    leadId: string;
    timestamp: Date;
};

export type LeadScoredPayload = {
    leadId: string;
    scoreId: string;
    finalScore: number;
    likelihoodLabel: 'Hot' | 'Warm' | 'Cold';
    confidenceLevel: 'High' | 'Medium' | 'Low';
    suggestedAction: string;
};

export type EmailEventPayload = {
    leadId: string;
    error?: Error;
};

export type NotificationEventPayload = {
    leadId: string;
    error?: Error;
};

// Map of event names to their payload types
export interface AppEvents {
    'lead.created': LeadCreatedPayload;
    'lead.scored': LeadScoredPayload;
    'email.sent': EmailEventPayload;
    'email.failed': EmailEventPayload;
    'notification.sent': NotificationEventPayload;
    'notification.failed': NotificationEventPayload;
}
