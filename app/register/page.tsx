"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Mail, AlertCircle, ArrowLeft, Eye, EyeOff, Check, Wallet } from "lucide-react";
import LegalFooter from "../components/LegalFooter";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { isValidEmail, PASSWORD_RULES } from "@/lib/validation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();

  const isPasswordValid = PASSWORD_RULES.every((rule) => rule.test(password));
  const isFormValid =
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    isPasswordValid &&
    acceptedPolicy;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEmailError("");

    if (!acceptedPolicy) {
      setError(t("auth.register.policyRequired"));
      setLoading(false);
      return;
    }

    const cleanUsername = username ? username.trim().toLowerCase() : "";
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      setError(t("auth.register.emptyFields"));
      setLoading(false);
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setEmailError(t("auth.register.invalidEmail"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      if (!res.ok) {
        // WHY: The backend may return JSON or plain text, so we parse JSON defensively and fall back to a generic error.
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || t("common.error"));
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
            <Wallet className="text-emerald-600" size={28} />
            Finance<span className="text-emerald-600">Tracker</span>
          </div>
          <p className="text-slate-500 mt-2 text-sm">
            Take control of your money, one transaction at a time.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center text-slate-400 hover:text-slate-600 mb-6 text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="mr-1 cursor-pointer" /> {t("common.backToLogin")}
          </button>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">{t("auth.register.title")}</h1>
            <p className="text-slate-500 mt-1 text-sm">{t("auth.register.subtitle")}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-lg flex items-center text-sm border border-rose-100">
                <AlertCircle size={18} className="mr-2 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("auth.register.usernameLabel")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-slate-900 w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder={t("auth.register.usernamePlaceholder")}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("auth.register.emailLabel")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className={`text-slate-900 w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 transition-all outline-none ${
                    emailError
                      ? "border-rose-400 focus:ring-rose-500 focus:border-rose-500"
                      : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  }`}
                  placeholder={t("auth.register.emailPlaceholder")}
                  required
                />
              </div>
              {emailError && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 animate-in fade-in duration-200">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t("auth.register.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-slate-900 w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder={t("auth.register.passwordPlaceholder")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {password.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password);
                    const label = t(`auth.register.passwordRules.${rule.id}`);
                    return (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                          met ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded-full border transition-colors ${
                            met
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-slate-300"
                          }`}
                        >
                          {met && <Check size={10} strokeWidth={3} className="text-white" />}
                        </span>
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptPolicy"
                checked={acceptedPolicy}
                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                className="mt-1 cursor-pointer accent-emerald-600"
                required
              />
              <label htmlFor="acceptPolicy" className="text-sm text-slate-600 cursor-pointer">
                {t("auth.register.policyText")}{" "}
                <a
                  href="/datenschutzerklarung"
                  target="_blank"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  {t("auth.register.privacyPolicy")}
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {loading ? t("auth.register.creating") : t("auth.register.submit")}
            </button>
          </form>
          <LegalFooter />
        </div>
      </div>
    </div>
  );
}