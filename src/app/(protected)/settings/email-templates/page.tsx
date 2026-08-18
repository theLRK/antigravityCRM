import { redirect } from 'next/navigation';

export default function EmailTemplatesPage() {
    // Templates are now centralized directly in the Lead Capture workflow
    redirect('/lead-capture');
}
