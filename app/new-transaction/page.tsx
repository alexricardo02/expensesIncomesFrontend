"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Globe,
  ChevronDown,
} from "lucide-react";

// Define the available categories (Types)
const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Gift",
  "Investment",
  "Other",
];
const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Entertainment",
  "Health",
  "Bills",
  "Shopping",
];

export default function NewTransactionPage() {
  const router = useRouter();
  const [type, setType] = useState<"income" | "expense">("expense");

  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    typeName: "", // This will be sent as 'typeName' to your DTO
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData: any = {
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      date: formData.date,
      description: formData.description,
      userId: 1, // <--- ESTO ES VITAL: Spring lo exige por el @NotNull
    };

    // 2. Ajustamos el nombre del campo de categoría según el DTO
    if (type === "income") {
      transactionData.type = formData.typeName; // IncomeRequestDTO usa 'type'
    } else {
      transactionData.typeName = formData.typeName; // ExpenseRequestDTO usa 'typeName'
    }

    try {
      const endpoint =
        type === "income"
          ? `${process.env.NEXT_PUBLIC_API_URL_INCOMES}`
          : `${process.env.NEXT_PUBLIC_API_URL_EXPENSES}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        alert("Saved successfully!");
        router.push("/");
      } else {
        // ESTO ES LO IMPORTANTE:
        const errorBody = await response.json();
        console.error("DETALLE DEL ERROR DESDE SPRING:", errorBody);

        // Si tienes errores de validación (@NotBlank, etc), Spring los pone en una lista
        if (errorBody.errors) {
          console.table(errorBody.errors);
        }

        alert(
          `Error 400: ${
            errorBody.message ||
            "Check the console (F12) to see which field failed"
          }`
        );
      }
    } catch (error) {
      alert("Backend is offline.");
    }
  };

  // Select which categories to show based on the toggle
  const currentCategories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform cursor-pointer"
          />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-white">
            <h1 className="text-2xl font-bold text-slate-900">
              New Transaction
            </h1>
            <p className="text-slate-500 mt-1">
              Fill in the details for your {type}.
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
                    setFormData({ ...formData, typeName: "" }); // Reset category when switching type
                  }}
                  className={`cursor-pointer flex-1 py-3 rounded-xl font-semibold capitalize transition-all duration-200 ${
                    type === t
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
                  <DollarSign size={16} className="text-indigo-500" /> Amount
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
                  <Globe size={16} className="text-indigo-500" /> Currency
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
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CATEGORY DROPDOWN */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Tag size={16} className="text-indigo-500" /> Category
                </label>
                <div className="relative">
                  <select
                    required
                    className="text-slate-900 w-full appearance-none px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    value={formData.typeName}
                    onChange={(e) =>
                      setFormData({ ...formData, typeName: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {currentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
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
                  <Calendar size={16} className="text-indigo-500" /> Date
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
                <FileText size={16} className="text-indigo-500" /> Description
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
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all text-lg"
            >
              <Save size={22} />
              Confirm Transaction
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
