"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import Input from "@/app/components/Input";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => login(formData),
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo + branding */}
        <div className="flex flex-col items-center mb-8 gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rtcg-logo.png"
            alt="RTCG"
            className="h-16 object-contain bg-white rounded-xl px-4 py-2 shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-white font-bold text-xl tracking-wide">BROADCAST IT SISTEMI</h1>
            <p className="text-slate-400 text-sm mt-1">Administrator</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form action={formAction} className="flex flex-col gap-5">
            <Input
              id="username"
              name="username"
              type="text"
              label="Korisničko ime"
              required
              autoComplete="username"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 hover:border-white/30 focus:border-slate-300 focus:ring-white/10"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Lozinka"
              required
              autoComplete="current-password"
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 hover:border-white/30 focus:border-slate-300 focus:ring-white/10"
            />

            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-sm text-center">{state.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 bg-white text-slate-900 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors tracking-wide"
            >
              {pending ? "Prijavljujem..." : "Prijavi se"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
