"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings as SettingsIcon, Check, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "ARS", label: "Argentine Peso" },
  { code: "JPY", label: "Japanese Yen" },
];

const LANGUAGES: { code: "en" | "es" | "de"; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  const [selected, setSelected] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentCurrency(data.primaryCurrency);
          setSelected(data.primaryCurrency);
        }
      } catch {
        toast.error("Could not load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (selected === currentCurrency) return;
    setSaving(true);
    const token = Cookies.get("auth_token");
    const toastId = toast.loading("Updating primary currency...");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`/api/settings/currency`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ primaryCurrency: selected }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setCurrentCurrency(selected);
        toast.success(
          "Primary currency updated. Historical amounts are being recalculated in the background.",
          { id: toastId, duration: 5000 }
        );
        router.refresh();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Could not update currency", { id: toastId });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Server is waking up (cold start). Please try again in 30 seconds.", { id: toastId, duration: 6000 });
      } else {
        toast.error("Connection error. Server might be down.", { id: toastId });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password");
      return;
    }
    setDeleting(true);
    const toastId = toast.loading("Deleting account...");
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (res.ok) {
        toast.success("Account deleted", { id: toastId });
        Cookies.remove("user_profile");
        router.push("/login");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Incorrect password", { id: toastId });
      }
    } catch {
      toast.error("Connection error", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto space-y-8 md:space-y-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 hover:text-slate-800 group transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">{t("settings.title")}</h1>
              <p className="text-slate-500 text-sm">{t("settings.subtitle")}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="font-semibold text-slate-800 mb-1">{t("settings.currencyTitle")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("settings.currencyDesc")}</p>

              {loading ? (
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setSelected(c.code)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${selected === c.code
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {c.code}
                      {selected === c.code && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading || selected === currentCurrency}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {saving ? t("settings.saving") : t("settings.saveChanges")}
            </button>
          </div>

          {/* Delete account */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6">
              <h2 className="font-semibold text-rose-700 mb-1">{t("settings.deleteTitle")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("settings.deleteDesc")}</p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                {t("settings.deleteButton")}
              </button>
            </div>
          </div>

          { }
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6">
              <h2 className="font-semibold text-slate-800 mb-1">{t("settings.languageTitle")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("settings.languageDesc")}</p>
              <div className="grid grid-cols-3 gap-3">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      Cookies.set("locale", l.code, { path: "/" });
                      router.refresh();
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${locale === l.code
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {l.label}
                    {locale === l.code && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          { }
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-100 text-amber-700 text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              {t("settings.underDev")}
            </div>

            <div className="p-6 space-y-6">
              {/* Change password */}
              <div>
                <h2 className="font-semibold text-slate-800 mb-1">{t("settings.passwordTitle")}</h2>
                <p className="text-sm text-slate-500 mb-4">{t("settings.passwordDesc")}</p>
                <button
                  disabled
                  className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed"
                >
                  {t("settings.changePassword")}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 flex justify-center gap-4 text-xs text-slate-400">
            <Link href="/impressum" className="hover:text-slate-600 hover:underline">
              Impressum
            </Link>
            <span>|</span>
            <Link href="/datenschutzerklarung" className="hover:text-slate-600 hover:underline">
              Datenschutzerklärung
            </Link>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 text-rose-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t("settings.deleteConfirmTitle")}</h3>
              <p className="text-slate-500">{t("settings.deleteConfirmDesc")}</p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                {t("settings.cancel")}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setShowDeletePassword(true); }}
                className="flex-1 py-3 px-4 bg-rose-600 rounded-xl font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {t("settings.continueLabel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{t("settings.deleteConfirmPasswordTitle")}</h3>
              <p className="text-sm text-slate-500 mt-1">{t("settings.deleteConfirmPasswordDesc")}</p>
            </div>
            <div className="p-6">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                className="text-slate-900 dark:text-slate-100 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                autoFocus
              />
            </div>
            <div className="bg-slate-50 p-4 flex gap-3">
              <button
                onClick={() => { setShowDeletePassword(false); setDeletePassword(""); }}
                className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 px-4 bg-rose-600 rounded-xl font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Account"}
                {deleting ? t("settings.deletingLabel") : t("settings.deleteAccountLabel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}