import { sendUnifiedEmailCore } from '@/modules/email/service';

export async function sendUnifiedEmail(params: any) {
    return await sendUnifiedEmailCore(params);
}
