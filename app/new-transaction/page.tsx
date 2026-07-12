"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, DollarSign, Calendar, Tag, FileText, Globe, ChevronDown, CreditCard } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";
import { useLanguage } from "@/lib/i18n/LanguageContext";


interface Category {
  categoryId: number;
  name: string;
  type: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const idempotencyKeyRef = React.useRef(uuidv4());
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {

      try {
        const res = await fetch("/api/categories", {
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    categoryId: "", // <-- AHORA GUARDAMOS EL ID
    description: "",
    paymentMethod: "DEBIT_CARD"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || formData.categoryId === "") {
      toast.error(t("transactions.table.selectCategory"));
      return;
    }

    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast.error(t("common.amount"));
      return;
    }

    const loadingToast = toast.loading(t("common.loading"));

    const token = Cookies.get("auth_token");
    const profileStr = Cookies.get("user_profile");
    const userProfile = profileStr ? JSON.parse(profileStr) : null;
    const realUserId = userProfile?.userId || 1; // Fallback por seguridad
    const selectedCategory = dynamicCategories.find(c => c.categoryId.toString() === formData.categoryId);

    const transactionData: any = {
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      date: formData.date,
      description: formData.description,
      userId: realUserId,
      categoryId: parseInt(formData.categoryId, 10),
      paymentMethod: formData.paymentMethod
    };

    try {
      const endpoint = type === "income" ? "/api/incomes" : "/api/expenses";

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include", // <-- Agrega esto
        headers: {
          "Content-Type": "application/json",
          // Borra la línea de "Authorization: Bearer..."
        },
        body: JSON.stringify(transactionData),
      });

      if (res.ok) {
        idempotencyKeyRef.current = uuidv4();
        toast.success(t("transactions.table.updateSuccess"), { id: loadingToast });
        setTimeout(() => {
          router.refresh();
          router.push("/");
        }, 1200);
      } else {
        const errorBody = await res.json();
        console.error("DETALLE DEL ERROR DESDE SPRING:", errorBody);

        const errorMessage = errorBody.message || t("common.error");
        toast.error(`Error: ${errorMessage}`, { id: loadingToast });

        if (errorBody.errors) {
          console.table(errorBody.errors);
        }

      }
    } catch (error) {
      toast.error(t("common.backendOffline"), { id: loadingToast });
    }
  };

  // Select which categories to show based on the toggle
  const dynamicCategories = categories.filter(cat => cat.type === type);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">

      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform cursor-pointer"
          />
          {t("common.backToDashboard")}
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white">
            <h1 className="text-2xl font-bold text-slate-900">
              {t("common.newTransaction")}
            </h1>
            <p className="text-slate-500 mt-1">
              {t("transactions.form.subtitle", { type: t(`common.${type}`) })}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* TYPE TOGGLE */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setFormData({ ...formData, categoryId: "" }); // Reseteamos al cambiar de pestaña
                  }}
                  className={`cursor-pointer flex-1 py-3 rounded-xl font-semibold capitalize transition-all duration-200 ${type === t
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AMOUNT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign size={16} className="text-indigo-500" /> {t("common.amount")}
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-lg text-slate-900 placeholder:text-slate-400"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              {/* CURRENCY */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Globe size={16} className="text-indigo-500" /> {t("transactions.table.currency")}
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  >
                    <option value="USD">USD - Dollars</option>
                    <option value="EUR">EUR - Euros</option>
                    <option value="GBP">GBP - Pounds</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="ARS">ARS - Argentine Pesos</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <CreditCard size={16} className="text-indigo-500" /> {t("transactions.table.paymentMethod")}
              </label>
              <div className="relative">
                <select
                  required
                  className="text-slate-900 w-full appearance-none px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CATEGORY DROPDOWN */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Tag size={16} className="text-indigo-500" /> {t("common.category")}
                </label>
                <div className="relative">
                  <select
                    required
                    className="text-slate-900 w-full appearance-none px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    {/* Sustituir las opciones estáticas por este bloque dinámico */}
                    <option value="" disabled>
                      {isLoadingCategories ? t("common.loading") : t("transactions.table.selectCategory")}
                    </option>
                    {dynamicCategories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId.toString()}>
                        {cat.name}
                      </option>
                    ))}
                    {/* Fin del bloque dinámico */}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-900"
                    size={18}
                  />
                </div>
              </div>

              {/* DATE */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-500" /> {t("common.date")}
                </label>
                <input
                  required
                  type="date"
                  className="text-slate-900 w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" /> {t("common.description")}
              </label>
              <textarea
                rows={3}
                placeholder="Add a note..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-medium text-slate-900 placeholder:text-slate-400"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all text-lg"
            >
              <Save size={22} />
              {t("common.save")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
