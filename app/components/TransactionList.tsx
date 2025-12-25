"use client"; // Importante para usar useState

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TransactionListProps {
  transactions: any[];
  formatCurrency: (value: number, currency: string) => string | undefined;
}

export default function TransactionList({ transactions }: { transactions: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="divide-y divide-slate-100">
      {transactions.map((t) => {
        const isExpanded = expandedId === t.displayId;
        const isIncome = t.kind === "income";

        return (
          <div key={t.displayId} className="hover:bg-slate-50/50 transition-colors">
            {/* VISTA PRINCIPAL (SIEMPRE VISIBLE) */}
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleRow(t.displayId)}
            >
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                  isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {t.kind}
                </span>
                <div>
                  <p className="font-medium text-slate-900 leading-none mb-1">
                    {t.typeName || t.type || "Uncategorized"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`text-right font-semibold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                  {isIncome ? "+" : "-"} {formatCurrency(t.amount, t.currency)}
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </div>
            </div>

            {/* CONTENIDO EXPANDIBLE (ACORDEÓN) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-height-40 opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}>
              <div className="px-6 pt-2 grid grid-cols-2 gap-y-3 text-sm border-t border-slate-50 mt-2">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Date</p>
                  <p className="text-slate-700">{t.date}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Full Amount</p>
                  <p className="text-slate-700 font-mono">{t.amount} {t.currency}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-semibold">Status</p>
                  <p className="text-emerald-500 font-medium">Verified</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}