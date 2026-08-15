"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, X, Save, Tag, Globe, AlertTriangle, Eraser, DollarSign, Calendar, Filter, ChevronUp, ChevronDown, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { useLanguage } from "@/lib/i18n/LanguageContext";


interface Category {
  categoryId: number;
  name: string;
  type: string;
}

interface TransactionTableProps {
  initialTransactions: any[];
}

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "ARS"];

export default function TransactionTable({
  initialTransactions,
}: TransactionTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const router = useRouter();

  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterMinAmount, setFilterMinAmount] = useState<string>("");
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("auth_token");
      if (!token) return;

      try {
        const response = await fetch("/api/categories", { credentials: "include" });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);


  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.kind === filterType;
    const matchesCategory = filterCategory === "all" || (t.typeName || t.type) === filterCategory;
    const matchesDate = filterDate === "" || t.date === filterDate;
    const parsedMin = parseFloat(filterMinAmount);
    const matchesAmount = filterMinAmount === "" || (!isNaN(parsedMin) && t.amount >= parsedMin);

    return matchesType && matchesCategory && matchesDate && matchesAmount;
  });


  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openEditModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const openDeleteModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedTransaction(null);
  };

  const currentCategories = categories.filter(c => c.type === selectedTransaction?.kind);

  const defaultCategoryId = currentCategories.find(
    c => c.name === (selectedTransaction?.type || selectedTransaction?.typeName)
  )?.categoryId;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = Cookies.get("auth_token");
    if (!token) {
      alert(t("common.expiredSession"));
      return;
    }

    const profileStr = Cookies.get("user_profile");
    let userProfile = null;
    try { userProfile = profileStr ? JSON.parse(profileStr) : null; } catch {}
    const realUserId = userProfile?.userId ?? 1;

    const formData = new FormData(e.currentTarget);
    const kind = selectedTransaction.kind;

    const realId =
      selectedTransaction.incomeId ||
      selectedTransaction.expenseId ||
      selectedTransaction.id;

    const transactionData: any = {
      amount: parseFloat(formData.get("amount") as string),
      currency: formData.get("currency"),
      date: formData.get("date"),
      description: formData.get("description"),
      categoryId: parseInt(formData.get("categoryId") as string, 10),
      userId: realUserId,
      paymentMethod: formData.get("paymentMethod"),
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

      const endpoint = kind === "income" ? `/api/incomes/${realId}` : `/api/expenses/${realId}`;

      const response = await fetch(endpoint, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transactionData) });

      if (response.ok) {
        toast.success(t("transactions.table.updateSuccess"));

        const updatedTxResponse = await response.json();
        setTransactions(prev => prev.map(t => {
          if (t.displayId === selectedTransaction.displayId) {
            return {
              ...t,
              amount: transactionData.amount,
              currency: transactionData.currency,
              date: transactionData.date,
              description: transactionData.description,
              paymentMethod: transactionData.paymentMethod,
              typeName: currentCategories.find(c => c.categoryId === transactionData.categoryId)?.name || t.typeName
            };
          }
          return t;
        }));

        closeModal();
      } else {
        const errorBody = await response.json();
        toast.error(`Error: ${errorBody.message || t("transactions.table.updateError")}`);
      }
    } catch (error) {
      toast.error(t("transactions.table.backendOffline"));
    }
  };

  const confirmDelete = async () => {
    const realId =
      selectedTransaction.incomeId ||
      selectedTransaction.expenseId ||
      selectedTransaction.id;
    const loadingToast = toast.loading(t("transactions.table.deleteLoading"));

    try {
      const endpoint = selectedTransaction.kind === "income"
        ? `/api/incomes/${realId}`
        : `/api/expenses/${realId}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success(t("transactions.table.deleteSuccess"), { id: loadingToast });
        setTransactions(prev => prev.filter(t => t.displayId !== selectedTransaction.displayId));
        closeModal();
      } else {
        toast.error(t("transactions.table.deleteError"), { id: loadingToast });
      }
    } catch (error) {
      toast.error(t("transactions.table.networkError"), { id: loadingToast });
    }
  };

  const uniqueCategoryNames = Array.from(new Set(categories.map(c => c.name)));

  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Filter size={14} /> {t("transactions.filter.type")}
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">{t("transactions.filter.allTypes")}</option>
            <option value="income">{t("transactions.filter.income")}</option>
            <option value="expense">{t("transactions.filter.expense")}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Tag size={14} /> Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">{t("transactions.filter.allCategories")}</option>
            {uniqueCategoryNames.map((catName) => (
              <option key={catName} value={catName}>
                {catName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Calendar size={14} /> {t("transactions.filter.date")}
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <DollarSign size={14} /> {t("transactions.filter.minAmount")}
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={filterMinAmount}
            onChange={(e) => setFilterMinAmount(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <button
          onClick={() => {
            setFilterType("all");
            setFilterCategory("all");
            setFilterDate("");
            setFilterMinAmount("");
          }}
          className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
        >
          <Eraser size={16} /> {t("common.clear")}
        </button>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">{t("transactions.table.type")}</th>
              <th className="px-6 py-4 font-medium">{t("transactions.table.category")}</th>
              <th className="px-6 py-4 font-medium">{t("transactions.table.method")}</th>
              <th className="px-6 py-4 font-medium">{t("transactions.table.date")}</th>
              <th className="px-6 py-4 font-medium text-right">{t("transactions.table.amount")}</th>
              <th className="px-6 py-4 font-medium text-right">{t("transactions.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredTransactions.map((tx) => (
              <tr key={tx.displayId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${tx.kind === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {tx.kind}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {tx.typeName || tx.type || t("common.uncategorized")}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {tx.paymentMethod?.replace('_', ' ') || t("common.na")}
                </td>
                <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                <td className={`px-6 py-4 text-right font-semibold ${tx.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                  {tx.kind === "income" ? "+" : "-"}{" "}
                  {(() => {
                    const safeAmount = tx.amountPrimaryCurrency ?? tx.amountPrimary ?? tx.amount;
                    const safeCurrency = tx.primaryCurrency ?? tx.currency ?? "USD";
                    return formatCurrency(safeAmount, safeCurrency, false, true);
                  })()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(tx)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => openDeleteModal(tx)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-slate-100">
        {filteredTransactions.map((tx) => {
          const isExpanded = expandedId === tx.displayId;
          const isIncome = tx.kind === "income";
          return (
            <div key={tx.displayId} className="bg-white dark:bg-slate-900">
              <div onClick={() => toggleAccordion(tx.displayId)} className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isIncome ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{tx.typeName || tx.type}</p>
                    <p className="text-xs text-slate-500">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                    {isIncome ? "+" : "-"}{" "}
                    {(() => {
                      const safeAmount = tx.amountPrimaryCurrency ?? tx.amountPrimary ?? tx.amount;
                      const safeCurrency = tx.primaryCurrency ?? tx.currency ?? "USD";
                      return formatCurrency(safeAmount, safeCurrency, false, true);
                    })()}
                  </span>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-xs text-slate-400 mb-4 uppercase font-bold tracking-widest">
                    {t("transactions.table.actions")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => openEditModal(tx)} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold shadow-sm active:scale-95 transition-transform">
                      <Pencil size={18} /> {t("transactions.table.edit")}
                    </button>
                    <button onClick={() => openDeleteModal(tx)} className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400 font-bold shadow-sm active:scale-95 transition-transform">
                      <Trash2 size={18} /> {t("transactions.table.delete")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {t("transactions.table.modalTitle", { type: selectedTransaction?.kind || t("common.type") })}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {t("common.amount")}
                  </label>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={selectedTransaction?.amount}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe size={14} /> {t("transactions.table.currency")}
                  </label>
                  <select
                    name="currency"
                    defaultValue={selectedTransaction?.currency}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <CreditCard size={14} /> {t("transactions.table.paymentMethod")}
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue={selectedTransaction?.paymentMethod || "CASH"}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag size={14} /> {t("transactions.table.category")}
                </label>
                <select
                  name="categoryId"
                  defaultValue={defaultCategoryId}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="" disabled>{t("transactions.table.selectCategory")}</option>
                  {currentCategories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {t("transactions.table.date")}
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue={selectedTransaction?.date}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {t("common.description")}
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={selectedTransaction?.description}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 rounded-xl font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={18} /> {t("transactions.table.saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 text-rose-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {t("transactions.table.deleteTitle")}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {t("transactions.table.deleteDescription", { type: selectedTransaction?.kind || t("common.type") })}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-rose-600 rounded-xl font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
