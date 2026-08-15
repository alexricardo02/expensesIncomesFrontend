"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface TransactionListProps {
  transactions: any[];
  formatCurrency: (value: number, currency: string) => string | undefined;
}

export default function TransactionList({ transactions }: { transactions: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { t } = useLanguage();

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {transactions.map((tx) => {
        const isExpanded = expandedId === tx.displayId;
        const isIncome = tx.kind === "income";
        return (
          <div key={tx.displayId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="px-4 py-4 flex items-center cursor-pointer justify-between" onClick={() => toggleRow(tx.displayId)}>
              <div className="w-14 shrink-0 mr-3">
                <span className={`inline-block w-full text-center py-1 rounded-full text-[9px] font-bold uppercase ${isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {tx.kind}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-[13px] text-left truncate leading-snug">
                  {tx.typeName || tx.type || t("common.uncategorized")}
                </p>
                <p className="text-slate-400 text-[11px] text-left leading-none mt-0.5">{tx.date}</p>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <div className={`text-right text-[13px] font-bold whitespace-nowrap ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                  {isIncome ? "+ " : "- "} {(() => {
                    const safeAmount = tx.amountPrimaryCurrency ?? tx.amountPrimary ?? tx.amount;
                    const safeCurrency = tx.primaryCurrency ?? tx.currency ?? "USD";
                    return formatCurrency(safeAmount, safeCurrency, false, true);
                  })()}
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-height-40 opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
              <div className="px-6 pt-2 grid grid-cols-2 gap-y-3 text-xs border-t border-slate-50 dark:border-slate-800 mt-1">
                <div>
                  <p className="text-slate-400 uppercase font-semibold">{t("common.date")}</p>
                  <p className="text-slate-700 dark:text-slate-300">{tx.date}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold">{t("transactions.table.paymentMethod")}</p>
                  <p className="text-slate-700 dark:text-slate-300">{tx.paymentMethod?.replace("_", " ") || t("common.na")}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-semibold">{t("common.status")}</p>
                  <p className="text-emerald-500 font-medium italic">{t("common.verified")}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}