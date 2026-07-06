"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PieChart as PieIcon, CreditCard, TrendingUp, Calendar, Filter, Activity } from "lucide-react";
import { Pie, Doughnut, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Filler, BarElement
} from "chart.js";
import { formatCurrency } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler, BarElement);
export default function StatisticsContent({ data }: { data: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!data) return <div className="p-8 text-center text-slate-500">No data available or error loading stats.</div>;

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
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">

        <button onClick={() => router.push("/")} className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* CONTROLES Y FILTROS */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={16} className="text-slate-400 mr-2" />
            <button onClick={() => handlePillClick("thisMonth")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold">This Month</button>
            <button onClick={() => handlePillClick("lastMonth")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold">Last Month</button>
            <button onClick={() => handlePillClick("last3Months")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold">Last 3 Months</button>
            <button onClick={() => handlePillClick("thisYear")} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold">This Year</button>
            <button onClick={() => updateFilter({ startDate: null, endDate: null })} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold">All Time</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="date" value={data.currentParams.startDate || ""} onChange={(e) => updateFilter({ startDate: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            <input type="date" value={data.currentParams.endDate || ""} onChange={(e) => updateFilter({ endDate: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />

            <select value={data.currentParams.type || "ALL"} onChange={(e) => updateFilter({ type: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
              <option value="ALL">All Types</option>
              <option value="INCOME">Only Incomes</option>
              <option value="EXPENSE">Only Expenses</option>
            </select>

            <select value={data.currentParams.categoryId || ""} onChange={(e) => updateFilter({ categoryId: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
              <option value="">All Categories</option>
              {data.categories?.map((c: any) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>

            <select value={data.currentParams.paymentMethod || ""} onChange={(e) => updateFilter({ paymentMethod: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
              <option value="">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 p-6 rounded-3xl">
            <p className="text-emerald-700 font-semibold text-sm">Total Incomes</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-2">${data.totalIn.toFixed(2)}</h2>
          </div>
          <div className="bg-rose-50 p-6 rounded-3xl">
            <p className="text-rose-700 font-semibold text-sm">Total Expenses</p>
            <h2 className="text-3xl font-bold text-rose-600 mt-2">${data.totalOut.toFixed(2)}</h2>
          </div>
          <div className="bg-indigo-50 p-6 rounded-3xl">
            <p className="text-indigo-700 font-semibold text-sm flex items-center gap-2"><Activity size={16} /> Daily Avg. Expense</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">${data.dailyAverage.toFixed(2)}</h2>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-indigo-500" /> Accumulated Balance</h3>
            <div className="w-full h-72">
              <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6">Expenses by Category</h3>
            <div className="w-full max-w-72">
              <Doughnut data={buildChartData(data.expensesByCategory)} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6">Incomes by Category</h3>
            <div className="w-full max-w-72">
              <Pie data={buildChartData(data.incomesByCategory)} />
            </div>
          </div>

          {/* FIX: Nuevo Gráfico de Barras */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6">Expenses comparison</h3>
            <div className="w-full h-72">
              <Bar data={barChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>

        </div>
        {/* FIX: Vista de Libro Mayor (Ledger) solicitada por el usuario */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mt-8">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" /> Movement details (General Ledger)
          </h3>

          {data.transactions && data.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Method</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 text-sm whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 pr-4 text-sm font-medium text-slate-700">{tx.description || "N/A"}</td>
                      <td className="py-3 pr-4 text-sm text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{tx.categoryName}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500">{tx.paymentMethod?.replace('_', ' ')}</td>
                      <td className={`py-3 text-sm font-semibold text-right whitespace-nowrap ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'}`}>
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
            <p className="text-slate-500 text-sm text-center py-4">No transactions found for this period</p>
          )}
        </div>

      </div>
    </main>
  );
}