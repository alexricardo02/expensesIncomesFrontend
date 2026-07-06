"use client";

import { useCurrencyDisplay } from "../context/CurrencyDisplayContext";
import { DollarSign } from "lucide-react";

export default function ExchangeRateBar() {
  const { rate, displayMode, setDisplayMode } = useCurrencyDisplay();

  return (
    <div className="flex items-center gap-3">
      {rate && (
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          <DollarSign size={16} className="text-emerald-600" />
          USD/ARS: <span className="font-bold text-slate-900">${rate.venta.toFixed(2)}</span>
        </div>
      )}
      <select
        value={displayMode}
        onChange={(e) => setDisplayMode(e.target.value as any)}
        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium cursor-pointer"
      >
        <option value="ORIGINAL">Sin cambio</option>
        <option value="ARS_TO_USD">ARS a USD</option>
        <option value="USD_TO_ARS">USD a ARS</option>
      </select>
    </div>
  );
}