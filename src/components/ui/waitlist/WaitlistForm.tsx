"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinWaitlist } from "@/app/actions/waitlist";
import { Loader2, ArrowRight } from "lucide-react";

export function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await joinWaitlist(formData);

    if (result.success) {
      router.push("/waitlist-success");
    } else {
      setError(result.error || "An error occurred");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative animate-fade-in-up stagger-2">
      <div className="relative group">
        <input
          type="email"
          name="email"
          placeholder="Enter your work email"
          required
          disabled={loading}
          className="w-full h-[64px] pl-6 pr-40 text-lg rounded-[16px] border border-black/10 bg-white placeholder-gray-400 text-[#2c2c2c] focus:outline-none focus:ring-2 focus:ring-[#853953] transition-all shadow-sm group-hover:shadow-md disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-[#853953] hover:bg-[#612d53] text-white font-bold rounded-[12px] transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group/btn"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="absolute -bottom-7 left-0 right-0 text-center text-sm font-medium text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
