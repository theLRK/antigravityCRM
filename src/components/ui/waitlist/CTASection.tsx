"use client";

import { WaitlistForm } from "./WaitlistForm";

export function CTASection() {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-[1000px]">
        <div className="bg-[#f3f4f4] rounded-[40px] p-12 md:p-24 text-center border border-black/5 shadow-sm">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#2c2c2c] mb-6">
            Ready to upgrade your workflow?
          </h2>
          <p className="text-[#2c2c2c]/70 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto">
            Get exclusive early access to Formative before we open to the public. Secure your spot on the waitlist today.
          </p>
          <div className="flex justify-center">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
