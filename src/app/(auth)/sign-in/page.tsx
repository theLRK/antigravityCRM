import { login, loginWithGoogle } from '../actions';
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

                <Logo lightText className="relative z-10" />

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

                    <form action={loginWithGoogle}>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl transition-all shadow-sm font-black text-[#2C2C2C] text-sm tracking-wide mb-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="relative flex items-center mb-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] font-black uppercase tracking-widest text-[#853953]/70">Or continue with email</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

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
