"use client";

import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import BalanceChart from "./BalanceChart";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DashboardKPIs({ transactions }: { transactions: any[] }) {
  const { t } = useLanguage();

  // WHY: By computing aggregates in the client, the UI instantly reacts to Context changes (ARS/USD toggle) without a server roundtrip.
  const sumConverted = (txs: any[]) => txs.reduce((acc, t) => acc + (t.amountPrimary ?? t.amount), 0);

  const targetCurrency = transactions[0]?.primaryCurrency || "USD";

  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  

  const incomes = transactions.filter((t) => t.kind === "income");
  const expenses = transactions.filter((t) => t.kind === "expense");

  const totalIncomes = sumConverted(incomes);
  const totalExpenses = sumConverted(expenses);
  const totalBalance = totalIncomes - totalExpenses;

  const thisMonthIncomes = sumConverted(incomes.filter((t) => t.date.startsWith(currentMonthStr)));
  const thisMonthExpenses = sumConverted(expenses.filter((t) => t.date.startsWith(currentMonthStr)));
  const totalBalanceThisMonth = thisMonthIncomes - thisMonthExpenses;

  const lastMonthIncomes = sumConverted(incomes.filter((t) => t.date.startsWith(lastMonthStr)));
  const lastMonthExpenses = sumConverted(expenses.filter((t) => t.date.startsWith(lastMonthStr)));
  const totalBalanceLastMonth = lastMonthIncomes - lastMonthExpenses;

  const monthlyKPIPercentage = totalBalanceLastMonth === 0 
    ? 0 
    : ((totalBalanceThisMonth * 100) / totalBalanceLastMonth - 100) / 100;

  return (
    <>
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-2 md:col-span-1 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Wallet size={18} />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t("dashboard.kpis.totalBalance")}
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(totalBalance, targetCurrency, true)}
              </h2>
              <div className={`flex items-center text-xs font-bold mt-1 ${totalBalanceThisMonth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {totalBalanceThisMonth >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                <span>{totalBalanceThisMonth >= 0 ? "+" : ""}{monthlyKPIPercentage.toFixed(2)}%</span>
              </div>
            </div>
            <div className="shrink-0">
              <BalanceChart transactions={transactions} isPositive={totalBalanceThisMonth >= 0} />
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpCircle size={20} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase">{t("dashboard.kpis.incomes")}</span>
          </div>
          <h2 className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIncomes, targetCurrency, true)}</h2>
        </div>

        <div className="hidden md:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownCircle size={20} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase">Expenses</span>
          </div>
          <h2 className="text-3xl font-bold text-rose-600">{formatCurrency(totalExpenses, targetCurrency, true)}</h2>
        </div>
      </div>

      {/* MOBILE income/expense row */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowUpCircle size={16} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase">{t("dashboard.kpis.income")}</span>
          </div>
          <h2 className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncomes, targetCurrency, true)}</h2>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><ArrowDownCircle size={16} /></div>
            <span className="text-xs font-bold text-slate-400 uppercase">Expenses</span>
          </div>
          <h2 className="text-xl font-bold text-rose-600">{formatCurrency(totalExpenses, targetCurrency, true)}</h2>
        </div>
      </div>
    </>
  );
}