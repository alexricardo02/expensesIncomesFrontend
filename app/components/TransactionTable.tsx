"use client";

import React, { useState } from "react";
import { Pencil, Trash2, X, Save, Tag, Globe, AlertTriangle, Eraser, DollarSign, Calendar, Filter, ChevronUp, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import router from "next/dist/shared/lib/router/router";
import toast, { Toaster } from "react-hot-toast";

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
const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

interface TransactionTableProps {
  initialTransactions: any[];
}


export default function TransactionTable({
  initialTransactions,
}: TransactionTableProps) {
  // Estados para Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- ESTADOS PARA FILTROS ---
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterMinAmount, setFilterMinAmount] = useState<string>("");

  const filteredTransactions = initialTransactions.filter((t) => {
    const matchesType = filterType === "all" || t.kind === filterType;
    const matchesCategory = filterCategory === "all" || (t.typeName || t.type) === filterCategory;
    const matchesDate = filterDate === "" || t.date === filterDate;
    const matchesAmount = filterMinAmount === "" || t.amount >= parseFloat(filterMinAmount);

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

  const currentCategories =
    selectedTransaction?.kind === "income"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Capturamos los datos directamente del formulario
    const formData = new FormData(e.currentTarget);
    const kind = selectedTransaction.kind;

    // Obtenemos el ID real (quitando el prefijo 'in-' o 'ex-')
    const realId =
      selectedTransaction.incomeId ||
      selectedTransaction.expenseId ||
      selectedTransaction.id;

    const transactionData: any = {
      amount: parseFloat(formData.get("amount") as string),
      typeName: formData.get("typeName"),
      currency: formData.get("currency"),
      date: formData.get("date"),
      description: formData.get("description"),
      userId: 1,
    };

    // 2. Mapeo de categoría según lo que espera tu DTO de Spring
    const categoryValue = formData.get("typeName");

    try {
      // 3. Construimos el endpoint dinámico para PUT
      const baseUrl =
        kind === "income"
          ? process.env.NEXT_PUBLIC_API_URL_INCOMES
          : process.env.NEXT_PUBLIC_API_URL_EXPENSES;

      const endpoint = `${baseUrl}/${realId}`;

      const response = await fetch(endpoint, {
        method: "PUT", // Cambiamos a PUT para edición
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // <--- ¡ESTO ES VITAL!
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        alert("Transaction updated successfully!");
        closeModal();
        // Esto refresca los datos del Server Component sin recargar la página completa
        window.location.reload();
      } else {
        const errorBody = await response.json();
        console.error("Error desde el servidor:", errorBody);
        alert(`Error: ${errorBody.message || "Could not update transaction"}`);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Backend is offline or unreachable.");
    }
  };

  const confirmDelete = async () => {
    const realId =
      selectedTransaction.incomeId ||
      selectedTransaction.expenseId ||
      selectedTransaction.id;
    const loadingToast = toast.loading("Deleting...");

    try {
      const baseUrl =
        selectedTransaction.kind === "income"
          ? process.env.NEXT_PUBLIC_API_URL_INCOMES
          : process.env.NEXT_PUBLIC_API_URL_EXPENSES;
      const response = await fetch(`${baseUrl}/${realId}`, {
        method: "DELETE",
        headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}` // <--- ¡ESTO ES VITAL!
  }
      });

      if (response.ok) {
        toast.success("Deleted successfully!", { id: loadingToast });
        closeModal();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Could not delete", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error", { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      {/* --- SECCIÓN DE FILTROS --- */}
      <div className="bg-slate-50 p-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Filtro Tipo */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Filter size={14} /> Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Filtro Categoría */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Tag size={14} /> Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Fecha */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Calendar size={14} /> Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Filtro Monto Mínimo */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <DollarSign size={14} /> Min Amount
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={filterMinAmount}
            onChange={(e) => setFilterMinAmount(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Botón Limpiar */}
        <button
          onClick={() => {
            setFilterType("all");
            setFilterCategory("all");
            setFilterDate("");
            setFilterMinAmount("");
          }}
          className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
        >
          <Eraser size={16} /> Clear
        </button>
      </div>

      {/* --- VISTA DESKTOP (TABLA) --- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTransactions.map((t) => (
              <tr
                key={t.displayId}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${t.kind === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {t.kind}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">
                    {t.typeName || t.type || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{t.date}</td>
                <td
                  className={`px-6 py-4 text-right font-semibold ${t.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {t.kind === "income" ? "+" : "-"}{" "}
                  {formatCurrency(t.amount, t.currency)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(t)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- VISTA MÓVIL (ACORDEÓN) --- */}
      <div className="md:hidden divide-y divide-slate-100">
        {filteredTransactions.map((t) => {
          const isExpanded = expandedId === t.displayId;
          const isIncome = t.kind === "income";

          return (
            <div key={t.displayId} className="bg-white">
              {/* Parte Visible */}
              <div
                onClick={() => toggleAccordion(t.displayId)}
                className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${isIncome ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  <div>
                    <p className="font-bold text-slate-900">
                      {t.typeName || t.type}
                    </p>
                    <p className="text-xs text-slate-500">{t.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {isIncome ? "+" : "-"}{" "}
                    {formatCurrency(t.amount, t.currency)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </div>
              </div>

              {/* Parte Expandible (Acciones) */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 bg-slate-50/50 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-xs text-slate-400 mb-4 uppercase font-bold tracking-widest">
                    Actions
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openEditModal(t)}
                      className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-indigo-600 font-bold shadow-sm active:scale-95 transition-transform"
                    >
                      <Pencil size={18} /> Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(t)}
                      className="flex items-center justify-center gap-2 py-3 bg-white border border-rose-100 rounded-xl text-rose-600 font-bold shadow-sm active:scale-95 transition-transform"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- MODAL DE EDICIÓN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                Edit {selectedTransaction?.kind}
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
                {/* AMOUNT */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Amount
                  </label>
                  <input
                    name="amount" // IMPORTANTE
                    type="number"
                    step="0.01"
                    defaultValue={selectedTransaction?.amount}
                    className="..."
                  />
                </div>

                {/* CURRENCY */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe size={14} /> Currency
                  </label>
                  <select
                    name="currency" // IMPORTANTE
                    defaultValue={selectedTransaction?.currency}
                    className="..."
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag size={14} /> Category
                </label>
                <select
                  name="typeName" // IMPORTANTE
                  defaultValue={selectedTransaction?.typeName}
                  className="..."
                >
                  {currentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE (Añadido para que la fecha no se pierda al editar) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Date
                </label>
                <input
                  name="date" // IMPORTANTE
                  type="date"
                  defaultValue={selectedTransaction?.date}
                  className="..."
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description" // IMPORTANTE
                  rows={2}
                  defaultValue={selectedTransaction?.description}
                  className="..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 rounded-xl font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- NUEVO: MODAL DE CONFIRMACIÓN DE BORRADO --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-100 text-rose-600 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Are you sure?
              </h3>
              <p className="text-slate-500">
                You are about to delete this {selectedTransaction?.kind}. This
                action cannot be undone.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-rose-600 rounded-xl font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
