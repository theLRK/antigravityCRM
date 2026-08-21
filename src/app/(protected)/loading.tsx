import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
            <LoadingSpinner size={54} color="#853953" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                Loading Formative CRM...
            </p>
        </div>
    );
}

