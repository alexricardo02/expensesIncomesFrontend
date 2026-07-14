"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PieChart as PieIcon, TrendingUp, Calendar, Filter, Activity } from "lucide-react";
import { Pie, Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Filler, BarElement
} from "chart.js";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler, BarElement);
export default function StatisticsContent({ data }: { data: any }) {
  const { theme } = useTheme();
  const chartTextColor = theme === "dark" ? "#cbd5e1" : "#334155";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  if (!data) return <div className="p-8 text-center text-slate-500">{t("statistics.noData")}</div>;

  const currency = data.primaryCurrency || "USD";

  const updateFilter = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/statistics?${params.toString()}`);
  };

  const handlePillClick = (range: string) => {
    const today = new Date();
    let start = "";
    let end = today.toISOString().split("T")[0];

    if (range === "thisMonth") {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    } else if (range === "lastMonth") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
      end = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
    } else if (range === "last3Months") {
      start = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split("T")[0];
    } else if (range === "thisYear") {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
    }

    updateFilter({ startDate: start || null, endDate: end || null });
  };

  const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#f43f5e"];

  const buildChartData = (sourceData: any) => ({
    labels: sourceData ? Object.keys(sourceData) : [],
    datasets: [{
      data: sourceData ? Object.values(sourceData) : [],
      backgroundColor: colors,
      borderWidth: 0,
    }],
  });

  const lineChartData = {
    labels: data.balanceOverTime?.map((b: any) => b.date) || [],
    datasets: [{
      label: "Accumulated Balance",
      data: data.balanceOverTime?.map((b: any) => b.balance) || [],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      fill: true,
      tension: 0.4,
    }]
  };

  const barChartData = {
    labels: data.expensesByCategory ? Object.keys(data.expensesByCategory) : [],
    datasets: [{
      label: "Expenses",
      data: data.expensesByCategory ? Object.values(data.expensesByCategory) : [],
      backgroundColor: "#6366f1",
      borderRadius: 4,
    }]
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">

        <button onClick={() => router.push("/")} className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          {t("statistics.backToDashboard")}
        </button>

        {/* CONTROLES Y FILTROS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">          <div className="flex flex-wrap gap-2 items-center">
          <Filter size={16} className="text-slate-400 mr-2" />
          <button onClick={() => handlePillClick("thisMonth")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold">{t("statistics.thisMonth")}</button>
          <button onClick={() => handlePillClick("lastMonth")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold">{t("statistics.lastMonth")}</button>
          <button onClick={() => handlePillClick("last3Months")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold">{t("statistics.last3Months")}</button>
          <button onClick={() => handlePillClick("thisYear")} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold">{t("statistics.thisYear")}</button>
          <button onClick={() => updateFilter({ startDate: null, endDate: null })} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold">{t("statistics.allTime")}</button>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="date" value={data.currentParams.startDate || ""} onChange={(e) => updateFilter({ startDate: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm" />
            <input type="date" value={data.currentParams.endDate || ""} onChange={(e) => updateFilter({ endDate: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm" />

            <select value={data.currentParams.type || "ALL"} onChange={(e) => updateFilter({ type: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm">
              <option value="ALL">{t("statistics.allTypes")}</option>
              <option value="INCOME">{t("statistics.onlyIncomes")}</option>
              <option value="EXPENSE">{t("statistics.onlyExpenses")}</option>
            </select>

            <select value={data.currentParams.categoryId || ""} onChange={(e) => updateFilter({ categoryId: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm">
              <option value="">{t("statistics.allCategories")}</option>
              {data.categories?.map((c: any) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>

            <select value={data.currentParams.paymentMethod || ""} onChange={(e) => updateFilter({ paymentMethod: e.target.value })} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm">
              <option value="">{t("statistics.allMethods")}</option>
              <option value="CASH">{t("statistics.cash")}</option>
              <option value="CREDIT_CARD">{t("statistics.creditCard")}</option>
              <option value="DEBIT_CARD">{t("statistics.debitCard")}</option>
              <option value="BANK_TRANSFER">{t("statistics.bankTransfer")}</option>
              <option value="OTHER">{t("statistics.other")}</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl">
            <p className="text-emerald-700 font-semibold text-sm">{t("statistics.totalIncomes")}</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">{formatCurrency(data.totalIn, currency, true)}</h2>
          </div>
          <div className="bg-rose-50 dark:bg-rose-500/10 p-6 rounded-3xl">
            <p className="text-rose-700 font-semibold text-sm">{t("statistics.totalExpenses")}</p>
            <h2 className="text-3xl font-bold text-rose-600 mt-2">{formatCurrency(data.totalOut, currency, true)}</h2>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-3xl">
            <p className="text-indigo-700 font-semibold text-sm flex items-center gap-2"><Activity size={16} /> {t("statistics.dailyAverage")}</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">{formatCurrency(data.dailyAverage, currency, true)}</h2>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50 flex items-center gap-2"><TrendingUp size={20} className="text-indigo-500" /> {t("statistics.accumulatedBalance")}</h3>
            <div className="w-full h-72">
              <Line data={lineChartData} options={{
                maintainAspectRatio: false,
                plugins: { tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y || 0, currency, true) } } },
                scales: { y: { ticks: { callback: (v) => formatCurrency(Number(v), currency, true) } } },
              }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">{t("statistics.expensesByCategory")}</h3>
            <div className="w-full max-w-72">
              <Doughnut data={buildChartData(data.expensesByCategory)} options={{
                plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency((ctx.parsed as number) || 0, currency, true)}` } } },
              }} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">{t("statistics.incomesByCategory")}</h3>
            <div className="w-full max-w-72">
              <Pie data={buildChartData(data.incomesByCategory)} options={{
                plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency((ctx.parsed as number) || 0, currency, true)}` } } },
              }} />
            </div>
          </div>

          {/* FIX: Nuevo Gráfico de Barras */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 lg:col-span-2 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50">{t("statistics.expensesComparison")}</h3>
            <div className="w-full h-72">
              <Bar data={barChartData} options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => formatCurrency(ctx.parsed.y || 0, currency, true) } },
                },
                scales: { y: { ticks: { callback: (v) => formatCurrency(Number(v), currency, true) } } },
              }} />
            </div>
          </div>

        </div>
        {/* FIX: Vista de Libro Mayor (Ledger) solicitada por el usuario */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mt-8">
          <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" /> {t("statistics.ledger")}
          </h3>

          {data.transactions && data.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                    <th className="pb-3 pr-4 font-medium">{t("statistics.tableHeaders.date")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("statistics.tableHeaders.description")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("statistics.tableHeaders.category")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("statistics.tableHeaders.method")}</th>
                    <th className="pb-3 font-medium text-right">{t("statistics.tableHeaders.amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">                      <td className="py-3 pr-4 text-sm whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 pr-4 text-sm font-medium text-slate-700 dark:text-slate-300">{tx.description || t("common.na")}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md text-xs">{tx.categoryName}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{tx.paymentMethod?.replace('_', ' ')}</td>
                      <td className={`py-3 text-sm font-semibold text-right whitespace-nowrap ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {tx.type === 'INCOME' ? '+ ' : '- '}
                        {(() => {
                          return formatCurrency(tx.amount, tx.currency, false, true);
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">{t("statistics.emptyState")}</p>
          )}
        </div>

      </div>
    </main>
  );
}