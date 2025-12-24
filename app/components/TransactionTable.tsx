"use client";

import React, { useState } from "react";
import { Pencil, Trash2, X, Save, Tag, Globe } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import router from "next/dist/shared/lib/router/router";

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
const CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

interface TransactionTableProps {
  initialTransactions: any[];
}

 const handleDelete = async (transaction: any) => {
  // 1. Pedir confirmación al usuario por seguridad
  const confirmed = window.confirm(
    `Are you sure you want to delete this ${transaction.kind}?`
  );
  if (!confirmed) return;

  // 2. Obtener el ID real
  const realId =
    transaction.incomeId ||
    transaction.expenseId ||
    transaction.id;

  try {
    // 3. Determinar el endpoint según el tipo
    const baseUrl =
      transaction.kind === "income"
        ? process.env.NEXT_PUBLIC_API_URL_INCOMES
        : process.env.NEXT_PUBLIC_API_URL_EXPENSES;

    const endpoint = `${baseUrl}/${realId}`;

    // 4. Ejecutar la petición DELETE
    const response = await fetch(endpoint, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Transaction deleted successfully");
      // Refrescamos la página para actualizar la lista
      window.location.reload();
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error: ${errorData.message || "Could not delete transaction"}`);
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Backend is offline or unreachable.");
  }
};


export default function TransactionTable({
  initialTransactions,
}: TransactionTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const openEditModal = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
      type: formData.get("typeName"),
      currency: formData.get("currency"),
      date: formData.get("date"),
      description: formData.get("description"),
      userId: 1,
    };

    // 2. Mapeo de categoría según lo que espera tu DTO de Spring
    const categoryValue = formData.get("typeName");

    if (kind === "income") {
      transactionData.type = categoryValue; // IncomeDTO suele usar 'type'
    } else {
      transactionData.typeName = categoryValue; // ExpenseDTO usa 'typeName'
    }

    try {
      // 3. Construimos el endpoint dinámico para PUT
      const baseUrl =
        kind === "income"
          ? process.env.NEXT_PUBLIC_API_URL_INCOMES
          : process.env.NEXT_PUBLIC_API_URL_EXPENSES;

      const endpoint = `${baseUrl}/${realId}`;

      const response = await fetch(endpoint, {
        method: "PUT", // Cambiamos a PUT para edición
        headers: { "Content-Type": "application/json" },
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

 

  return (
    <>
      <div className="overflow-x-auto">
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
            {initialTransactions.map((t) => (
              <tr
                key={t.displayId}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      t.kind === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
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
                  className={`px-6 py-4 text-right font-semibold ${
                    t.kind === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {t.kind === "income" ? "+" : "-"}{" "}
                  {formatCurrency(t.amount, t.currency)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(t)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </>
  );
}
