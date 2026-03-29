// Basic Formative MVP Normalizer
export const normalizeLeadData = (data: Record<string, any>): Record<string, any> => {
    const normalized = { ...data };

    // Lowercase and trim email
    if (typeof normalized.email === 'string') {
        normalized.email = normalized.email.trim().toLowerCase();
    }

    // Trim names
    if (typeof normalized.firstName === 'string') {
        normalized.firstName = normalized.firstName.trim();
    }
    if (typeof normalized.lastName === 'string') {
        normalized.lastName = normalized.lastName.trim();
    }

    // Basic phone formatting (strip all non-numeric except leading +)
    if (typeof normalized.phone === 'string') {
        const isPlus = normalized.phone.startsWith('+');
        const digits = normalized.phone.replace(/\D/g, '');
        normalized.phone = isPlus ? `+${digits}` : digits;
    } else {
        normalized.phone = ''; // Satisfy Prisma mandatory field
    }

    // Enforce array for preferred areas based on Zod string/array casting
    if (typeof normalized.preferredAreas === 'string') {
        normalized.preferredAreas = [normalized.preferredAreas];
    } else if (!Array.isArray(normalized.preferredAreas)) {
        normalized.preferredAreas = [];
    }

    return normalized;
};
