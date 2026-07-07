"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings as SettingsIcon, Check } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "ARS", label: "Argentine Peso" },
  { code: "JPY", label: "Japanese Yen" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  const [selected, setSelected] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings/currency`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryCurrency: selected }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        setCurrentCurrency(selected);
        toast.success(
          "Primary currency updated. Historical amounts are being recalculated in the background.",
          { id: toastId, duration: 5000 }
        );
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 hover:text-slate-800 group transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-500 text-sm">Manage how your app behaves</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-slate-800 mb-1">Primary currency</h2>
              <p className="text-sm text-slate-500 mb-4">
                All totals, charts and KPIs are shown in this currency. Transactions
                created in a different currency are automatically converted using
                live exchange rates.
              </p>

              {loading ? (
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setSelected(c.code)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                        selected === c.code
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
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}