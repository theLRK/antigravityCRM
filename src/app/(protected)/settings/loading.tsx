import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
    return (
        <div className="flex h-[75vh] w-full flex-col items-center justify-center space-y-4">
            <LoadingSpinner size={50} color="#853953" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">
                Loading Settings & Workspace...
            </p>
        </div>
    );
}
