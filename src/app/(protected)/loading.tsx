import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center shadow-lg shadow-[#853953]/20 animate-pulse">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                Loading Formative AI...
            </p>
        </div>
    );
}
