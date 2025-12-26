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
            {/* VISTA PRINCIPAL (3 COLUMNAS REPARTIDAS) */}
            <div 
              className="px-4 py-4 flex items-center cursor-pointer justify-between" 
              onClick={() => toggleRow(t.displayId)}
            >
              {/* 1. Badge (Izquierda - Ancho fijo) */}
              <div className="w-14 flex-shrink-0 mr-3">
                <span className={`inline-block w-full text-center py-1 rounded-full text-[9px] font-bold uppercase ${
                  isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {t.kind}
                </span>
              </div>

              {/* 2. Nombre (Centro - Ocupa el espacio restante y centra el texto) */}
              <div className="flex-1 min-w-0"> 
                <p className="font-semibold text-slate-800 text-[13px] text-left truncate">
                  {t.typeName || t.type || "Uncategorized"}
                </p>
              </div>

              {/* 3. Monto e Icono (Derecha - Alineado al final) */}
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <div className={`text-right text-[13px] font-bold whitespace-nowrap ${
                  isIncome ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {/* El signo y el monto ahora están obligados a estar en la misma línea */}
                  {isIncome ? "+ " : "- "} {formatCurrency(t.amount, t.currency)}
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* CONTENIDO EXPANDIBLE */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-height-40 opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}>
              <div className="px-6 pt-2 grid grid-cols-2 gap-y-3 text-xs border-t border-slate-50 mt-1">
                <div>
                  <p className="text-slate-400 uppercase font-semibold">Date</p>
                  <p className="text-slate-700">{t.date}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold">Full Amount</p>
                  <p className="text-slate-700 font-mono">{t.amount} {t.currency}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold">Status</p>
                  <p className="text-emerald-500 font-medium italic">Verified</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}