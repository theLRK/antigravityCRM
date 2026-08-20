import { updatePassword } from '../actions';
import { Logo } from '@/components/ui/Logo';
import { ArrowRight, Check, KeyRound } from 'lucide-react';

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams;
    const errorParam = params.error;

    return (
        <div className="flex min-h-screen bg-[#F3F4F4]">
            {/* Left: Branding & Value Prop */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#853953] to-[#612D53] p-24 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full -mr-96 -mt-96 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.03] rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <Logo lightText className="relative z-10" />

                <div className="relative z-10">
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                        Set New <br /> Password.
                    </h2>
                    <p className="text-white/70 text-2xl font-medium max-w-sm mb-12">
                        Create a strong, secure password for your agent account.
                    </p>
                    
                    <div className="space-y-6">
                        {['Minimum 6 characters', 'Encrypted Credentials', 'Instant Dashboard Access'].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-white/90 font-bold">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <Check className="w-3 h-3" />
                                </div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.2em]">
                    Formative CRM Security
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#853953]/10 flex items-center justify-center text-[#853953] mb-4">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black text-[#2C2C2C] mb-3 tracking-tight">New Password</h1>
                        <p className="text-gray-400 font-bold">Enter your new secure password below.</p>
                    </div>

                    {errorParam && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-sm text-red-600 font-black tracking-tight">{errorParam}</p>
                        </div>
                    )}

                    <form className="space-y-6" action={updatePassword}>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">New Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Confirm New Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-4"
                        >
                            Update Password & Sign In
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
