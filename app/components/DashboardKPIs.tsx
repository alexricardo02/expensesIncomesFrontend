"use client";

import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
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

  const expensesMonthlyPercentage = lastMonthExpenses === 0
    ? 0
    : ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
              {/* WHY: Unifying icon size across all desktop KPI cards establishes visual harmony. */}
              <Wallet size={20} />
            </div>
            {/* WHY: Standardizing tracking and base size prevents readability issues across breakpoints. */}
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
              {t("dashboard.kpis.totalBalance")}
            </span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* WHY: Aligning font weights and increasing size matches the secondary KPI cards. truncate prevents layout breaks on large numbers. */}
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                {formatCurrency(totalBalance, targetCurrency, true)}
              </h2>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${monthlyKPIPercentage >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>


                {monthlyKPIPercentage >= 0 ? "+" : ""}{monthlyKPIPercentage.toFixed(1)}% {t("dashboard.kpis.vsLastMonth")}
              </span>
            </div>
            <div className="shrink-0">
              <BalanceChart transactions={transactions} isPositive={totalBalanceThisMonth >= 0} />
            </div>
          </div>
        </div>

        <div className="col-span-1 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          {/* WHY: Grouping the icon and label on the left standardizes the header layout across all cards instead of mixing space-between alignments. */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <ArrowUpCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {t("dashboard.kpis.incomes")}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-600 tracking-tight truncate">
            {formatCurrency(totalIncomes, targetCurrency, true)}
          </h2>
        </div>

        <div className="col-span-1 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
              <ArrowDownCircle size={20} />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
              Expenses
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-rose-600 tracking-tight truncate">
            {formatCurrency(totalExpenses, targetCurrency, true)}
          </h2>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${expensesMonthlyPercentage <= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>


            {expensesMonthlyPercentage >= 0 ? "+" : ""}{expensesMonthlyPercentage.toFixed(1)}% {t("dashboard.kpis.vsLastMonth")}
          </span>
        </div>
      </div>

    </>
  );
}