"use client";

import React, { useState } from "react";
import { Pencil, Trash2, X, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TransactionTableProps {
  initialTransactions: any[];
}

export default function TransactionTable({ initialTransactions }: TransactionTableProps) {
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

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {initialTransactions.map((t) => (
              <tr key={t.displayId} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-medium">{t.typeName}</span>
                  <span className="block text-xs text-slate-400 uppercase">{t.kind}</span>
                </td>
                <td className="px-6 py-4 text-slate-500">{t.date}</td>
                <td className={`px-6 py-4 text-right font-semibold ${t.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.kind === "income" ? "+" : "-"} {formatCurrency(t.amount, t.currency)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    >
                      <Pencil size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
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
              <h3 className="text-xl font-bold text-slate-900">Edit {selectedTransaction?.kind}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount</label>
                <input 
                  type="number" 
                  defaultValue={selectedTransaction?.amount}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  defaultValue={selectedTransaction?.description}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" 
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 px-4 bg-indigo-600 rounded-xl font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
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