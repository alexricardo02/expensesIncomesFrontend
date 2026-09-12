"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Something went wrong");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-6 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" /> {t("common.backToLogin")}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{t("auth.forgotPassword.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-4 rounded-lg flex items-start text-sm border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle2 size={18} className="mr-2 shrink-0 mt-0.5" />
            {t("auth.forgotPassword.success")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 p-3 rounded-lg flex items-center text-sm border border-rose-100 dark:border-rose-900/50">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("auth.forgotPassword.emailLabel")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-slate-900 dark:text-slate-100 w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder={t("auth.forgotPassword.emailPlaceholder")}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 dark:shadow-none disabled:opacity-50 cursor-pointer"
            >
              {loading ? t("auth.forgotPassword.sending") : t("auth.forgotPassword.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}