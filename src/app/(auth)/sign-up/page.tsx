import { signup } from '../actions';
import { GoogleSignInButton } from '@/components/ui/auth/GoogleSignInButton';
import { Logo } from '@/components/ui/Logo';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const errorParam = (await searchParams).error;

    return (
        <div className="flex min-h-screen bg-[#F3F4F4]">
            {/* Left: Branding & Benefits */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#853953] to-[#612D53] p-24 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full -mr-96 -mt-96 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.03] rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <Logo lightText className="relative z-10" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        AI-Powered Matching
                    </div>
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                        Grow with <br /> precision.
                    </h2>
                    <p className="text-white/70 text-2xl font-medium max-w-sm mb-12 leading-relaxed">
                        Join the next generation of real estate command.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-8 max-w-md">
                        <div>
                             <p className="text-4xl font-black text-white mb-1 tracking-tighter">10x</p>
                             <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Efficiency</p>
                        </div>
                        <div>
                             <p className="text-4xl font-black text-white mb-1 tracking-tighter">0%</p>
                             <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Missed Leads</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-12 border-t border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                    Enterprise Ready. Scaleable. Secure.
                </div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 py-16 overflow-y-auto">
                <div className="w-full max-w-lg">
                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-[#2C2C2C] mb-4 tracking-tight">Create Account</h1>
                        <p className="text-gray-400 font-bold">Start your 14-day free trial. No credit card required.</p>
                    </div>

                    {errorParam && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-sm text-red-600 font-black tracking-tight">{errorParam}</p>
                        </div>
                    )}

                    <GoogleSignInButton label="Continue with Google" />

                    <div className="relative flex items-center mb-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] font-black uppercase tracking-widest text-[#853953]/70">Or register with email</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <form className="space-y-6" action={signup}>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    name="fullName"
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="Sarah Chen"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Agency Name</label>
                                <input
                                    name="agencyName"
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="Elite Realty"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Work Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="agent@agency.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Phone Number</label>
                            <input
                                name="phoneNumber"
                                type="tel"
                                required
                                className="input-field"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#2C2C2C] uppercase tracking-widest pl-1">Create Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
                            >
                                Get Instant Access
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <p className="text-[10px] text-gray-400 font-bold mt-4 text-center px-4 uppercase tracking-widest leading-relaxed">
                                By signing up, you agree to our <a href="/terms" className="underline hover:text-[#853953] transition-colors">Terms</a> and <a href="/privacy" className="underline hover:text-[#853953] transition-colors">Privacy Policy</a>.
                            </p>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-black/5 text-center">
                        <p className="text-sm font-bold text-gray-400">
                            Already using Formative? <a href="/sign-in" className="text-[#853953] font-black hover:underline ml-1">Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
