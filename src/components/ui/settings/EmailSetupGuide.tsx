import Link from 'next/link';
import { ExternalLink, ShieldCheck, Key, Zap, HelpCircle } from 'lucide-react';

export default function EmailSetupGuide() {
    return (
        <div className="space-y-4">
            {/* How to get App Password */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#853953]" />
                    <h3 className="text-sm font-bold text-slate-800">How to get a Gmail App Password</h3>
                </div>
                <div className="px-4 py-4">
                    <ol className="space-y-3">
                        {[
                            { step: '1', text: 'Go to your Google Account', sub: 'myaccount.google.com', href: 'https://myaccount.google.com/security' },
                            { step: '2', text: 'Enable 2-Step Verification', sub: 'Required to use App Passwords', href: 'https://myaccount.google.com/signinoptions/two-step-verification' },
                            { step: '3', text: 'Search "App Passwords"', sub: 'In the search bar at top of the page', href: 'https://myaccount.google.com/apppasswords' },
                            { step: '4', text: 'Create a new app password', sub: 'Choose "Mail" as the app type', href: 'https://myaccount.google.com/apppasswords' },
                            { step: '5', text: 'Copy the 16-character code', sub: 'Paste into the App Password field ←', href: null }
                        ].map(({ step, text, sub, href }) => (
                            <li key={step} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#853953]/10 text-[#853953] text-xs font-bold flex items-center justify-center mt-0.5">
                                    {step}
                                </span>
                                <div className="min-w-0">
                                    {href ? (
                                        <a href={href} target="_blank" rel="noopener noreferrer"
                                            className="text-sm font-semibold text-slate-800 hover:text-[#853953] inline-flex items-center gap-1">
                                            {text} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <p className="text-sm font-semibold text-slate-800">{text}</p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* Security note */}
            <div className="bg-emerald-50 rounded-2xl ring-1 ring-emerald-200 px-4 py-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-emerald-800">Your credentials are safe</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        App Passwords are stored in an encrypted database and never exposed. You can revoke access from your Google account at any time without changing your main Gmail password.
                    </p>
                </div>
            </div>

            {/* Email Automation info */}
            <div className="bg-blue-50 rounded-2xl ring-1 ring-blue-200 px-4 py-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">What gets sent automatically?</p>
                    <ul className="text-xs text-blue-700 mt-1.5 space-y-1">
                        <li>🔥 <strong>Hot leads</strong> (score ≥ 80) — immediate personalized email</li>
                        <li>🌡️ <strong>Warm leads</strong> (score 50–79) — nurture email within minutes</li>
                        <li>❄️ <strong>Cold leads</strong> (score &lt; 50) — gentle follow-up after 10 min delay</li>
                    </ul>
                    <Link href="/settings/email-templates" className="text-xs text-blue-700 underline font-semibold mt-2 inline-block">
                        Customise templates →
                    </Link>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-800">Common Questions</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        {
                            q: 'Do I need to use my personal Gmail?',
                            a: 'Not necessarily. You can use any Gmail address — your personal one, a business Google Workspace account, or a dedicated email like support@yourdomain.com.'
                        },
                        {
                            q: 'Can I change my sending email later?',
                            a: 'Yes. Just enter new credentials and click Save & Connect. The change takes effect immediately on the next lead submission.'
                        },
                        {
                            q: 'What if I don\'t have Gmail?',
                            a: 'Gmail is required for this integration. If you use another email provider, consider creating a free Gmail account dedicated to sending CRM emails.'
                        },
                        {
                            q: 'Will leads see my real email address?',
                            a: 'Yes — replies from leads go directly to your configured Gmail inbox. This creates a natural, two-way conversation.'
                        },
                    ].map(({ q, a }) => (
                        <div key={q} className="px-4 py-3.5">
                            <p className="text-xs font-semibold text-slate-800 mb-1">{q}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
