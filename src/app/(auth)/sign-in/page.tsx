import { login } from '../actions';
import { Logo } from '@/components/ui/Logo';
import { ArrowRight, ChevronRight, Check } from 'lucide-react';

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const errorParam = (await searchParams).error;

    return (
        <div className="flex min-h-screen bg-[#F3F4F4]">
            {/* Left: Branding & Value Prop */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#853953] to-[#612D53] p-24 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full -mr-96 -mt-96 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.03] rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <Logo className="invert brightness-0 relative z-10" />

                <div className="relative z-10">
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                        Welcome <br /> back.
                    </h2>
                    <p className="text-white/70 text-2xl font-medium max-w-sm mb-12">
                        Manage leads. Close deals. <br /> Grow faster with AI.
                    </p>
                    
                    <div className="space-y-6">
                        {['94% Average Lead Accuracy', 'Automated Daily Workflows', 'Smart Property Matching'].map((feature, idx) => (
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
                    Trusted by 2,000+ elite agents
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-[#2C2C2C] mb-4 tracking-tight">Sign In</h1>
                        <p className="text-gray-400 font-bold">Enter your credentials to access your command center.</p>
                    </div>

                    {errorParam && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-sm text-red-600 font-black tracking-tight">{errorParam}</p>
                        </div>
                    )}

                    <form className="space-y-6" action={login}>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Work Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="agent@formative.io"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center pl-1">
                                <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[10px] font-black text-[#853953] uppercase tracking-wider hover:underline transition-all">Forgot?</a>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center gap-3 pl-1">
                            <input type="checkbox" className="w-4 h-4 rounded-md border-gray-300 text-[#853953] focus:ring-[#853953]" />
                            <span className="text-xs font-bold text-gray-500">Remember me for 30 days</span>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-4"
                        >
                            Sign In to Platform
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-black/5 text-center">
                        <p className="text-sm font-bold text-gray-400">
                            Don't have an account? <a href="/sign-up" className="text-[#853953] font-black hover:underline ml-1">Create one free</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
