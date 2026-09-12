"use client";

import { useState} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, User, AlertCircle, Eye, EyeOff, Info, Wallet } from "lucide-react";
import LegalFooter from "../components/LegalFooter";
import { useLanguage } from "@/lib/i18n/LanguageContext";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanUsername = username ? username.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanUsername || !cleanPassword) {
      setError(t("auth.login.errors.emptyFields"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/login`, {
        method: "POST",
        credentials: "include", // WHY: The proxy sets the auth cookie, so the request must include credentials.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("auth.login.errors.invalidCredentials"));
      }

      Cookies.set("user_profile", JSON.stringify(data), { expires: 7, path: '/' });
      
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50 flex items-center justify-center p-4">

      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
            <Wallet className="text-emerald-600" size={28} />
            Finance<span className="text-emerald-600">Tracker</span>
          </div>
          <p className="text-slate-500 mt-2 text-sm">Take control of your money, one transaction at a time.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">{t("auth.login.title")}</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg flex items-center text-sm border border-rose-100">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("auth.login.userLabel")}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-slate-900 w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder={t("auth.login.usernamePlaceholder")}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("auth.login.passwordLabel")}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-slate-900 w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                placeholder={t("auth.login.passwordPlaceholder")}
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
          </div>

          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-emerald-600 font-medium hover:underline cursor-pointer"
            >
              {t("auth.login.forgotPassword")}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50 cursor-pointer"
          >
            {loading ? t("auth.login.loggingIn") : t("auth.login.submit")}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t("auth.login.registerPrompt")} {" "}
            <button
              onClick={() => router.push("/register")}
              className="text-emerald-600 font-semibold hover:underline cursor-pointer"
            >
              {t("auth.login.register")}
            </button>
          </p>
        </form>

        <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          <div className="space-y-1.5">
            <p className="font-semibold">Service notice</p>
            <p>
              This is a portfolio project running on free-tier hosting, so it
              may occasionally load slowly (cold starts).
            </p>
          </div>
        </div>
        
        <LegalFooter />
        </div>
      </div>
    </div>
  );
}