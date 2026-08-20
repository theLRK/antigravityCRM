import { requestPasswordReset } from '../actions';
import { Logo } from '@/components/ui/Logo';
import { ArrowRight, Check, Mail, ArrowLeft } from 'lucide-react';

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; success?: string; email?: string }>
}) {
    const params = await searchParams;
    const errorParam = params.error;
    const isSuccess = params.success === 'true';
    const emailParam = params.email;

    return (
        <div className="flex min-h-screen bg-[#F3F4F4]">
            {/* Left: Branding & Value Prop */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#853953] to-[#612D53] p-24 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white opacity-[0.03] rounded-full -mr-96 -mt-96 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.03] rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

                <Logo lightText className="relative z-10" />

                <div className="relative z-10">
                    <h2 className="text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                        Account <br /> Recovery.
                    </h2>
                    <p className="text-white/70 text-2xl font-medium max-w-sm mb-12">
                        Secure access to your agent portal in seconds.
                    </p>
                    
                    <div className="space-y-6">
                        {['Instant Password Reset Link', 'Bank-Grade Auth Security', 'Continuous Session Protection'].map((feature, idx) => (
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
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-[#2C2C2C] mb-3 tracking-tight">Reset Password</h1>
                        <p className="text-gray-400 font-bold">Enter your account email to receive a recovery link.</p>
                    </div>

                    {errorParam && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-8 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-sm text-red-600 font-black tracking-tight">{errorParam}</p>
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-800">Check your inbox</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    We sent a password reset link to <strong className="text-slate-800">{emailParam || 'your email'}</strong>. Click the link in the email to set your new password.
                                </p>
                            </div>
                            <div className="pt-4">
                                <a
                                    href="/sign-in"
                                    className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Sign In
                                </a>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" action={requestPasswordReset}>
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

                            <button
                                type="submit"
                                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-4"
                            >
                                Send Reset Link
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    )}

                    <div className="mt-12 pt-8 border-t border-black/5 text-center">
                        <p className="text-sm font-bold text-gray-400">
                            Remembered your password? <a href="/sign-in" className="text-[#853953] font-black hover:underline ml-1">Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
