import Image from "next/image";
import React from "react";
import LogoutButton from "./components/LogoutButton"; // Ajusta la ruta si es necesario
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PlusCircle,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import TransactionList from "./components/TransactionList";
import BalanceChart from "./components/BalanceChart";
import { cookies } from "next/headers";


async function getTransactions() {

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  console.log(token);

  if (!token) return [];

  try {
    const [incomesRes, expensesRes] = await Promise.all([
      fetch(process.env.NEXT_PUBLIC_API_URL_INCOMES!, { headers: {
          "Authorization": `Bearer ${token}`, // <--- AQUÍ ENVIAMOS LA LLAVE
          "Content-Type": "application/json",
        }, cache: "no-store" }),
      fetch(process.env.NEXT_PUBLIC_API_URL_EXPENSES!, { headers: {
          "Authorization": `Bearer ${token}`, // <--- Y AQUÍ TAMBIÉN
          "Content-Type": "application/json",
        }, cache: "no-store" }),
    ]);

    if (!incomesRes.ok || !expensesRes.ok) {
      const text = await incomesRes.text(); 
      console.log("Status:", incomesRes.status);
      console.log("Body del error:", text);
      throw new Error(`Error ${incomesRes.status}`);
    }
      

    const incomes = await incomesRes.json();
    const expenses = await expensesRes.json();

    const combined = [
      ...incomes.map((i: any) => ({
        ...i,
        kind: "income",
        // Usamos i.id o i.incomeId según devuelva tu ResponseDTO
        displayId: `in-${i.id || i.incomeId}`,
      })),
      ...expenses.map((e: any) => ({
        ...e,
        kind: "expense",
        displayId: `ex-${e.id || e.expenseId}`,
      })),
    ];

    return combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

const formatCurrency = (value: number, currency: string) => {
  switch (currency) {
    case "EUR":
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    case "GBP":
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    case "JPY":
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    default:
      break;
  }
};

/**
 * The Home component renders the main dashboard page, showing the user's total balance,
 * their recent income and expenses, and a list of their recent transactions.
 */
export default async function Home() {
  const transactions = await getTransactions();

  const cookieStore = await cookies();
  const userProfileCookie = cookieStore.get("user_profile")?.value;
  let usernameToShow = "Guest";

  if (userProfileCookie) {
    try {
      const profile = JSON.parse(userProfileCookie);
      usernameToShow = profile.username;
    } catch (e) {
      console.error("Error al parsear el perfil", e);
    }
  }

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const lastMonthStr = `${now.getFullYear()}-${String(now.getMonth()).padStart(
    2,
    "0"
  )}`;

  const recentTransactions = transactions.slice(0, 10);

  const totalIncomes = transactions
    .filter((t) => t.kind === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.kind === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncomesThisMonth = transactions
  .filter((t) => t.date.startsWith(currentMonthStr) && t.kind === "income")
  .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpensesThisMonth = transactions
  .filter((t) => t.date.startsWith(currentMonthStr) && t.kind === "expense")
  .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncomesLastMonth = transactions
  .filter((t) => t.date.startsWith(lastMonthStr) && t.kind === "income")
  .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpensesLastMonth = transactions
  .filter((t) => t.date.startsWith(lastMonthStr) && t.kind === "expense")
  .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalance = totalIncomes - totalExpenses;

  const monthlyIncomesCount = transactions.filter(
    (t) => t.kind === "income" && t.date.startsWith(currentMonthStr)
  ).length;

  const monthlyExpensesCount = transactions.filter(
    (t) => t.kind === "expense" && t.date.startsWith(currentMonthStr)
  ).length;

  const totalBalanceThisMonth = totalIncomesThisMonth - totalExpensesThisMonth;
  const totalBalanceLastMonth = totalIncomesLastMonth - totalExpensesLastMonth;

  const monthlyKPIPercentage =
    ((totalBalanceThisMonth * 100) / totalBalanceLastMonth - 100) / 100;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Financial Dashboard
            </h1>
            <p className="text-slate-500 text-sm">
              Welcome, <span className="text-blue-600">{usernameToShow}</span>! Here's today's summary
            </p>
          </div>

          <div className="flex gap-3">
            {/* NEW STATISTICS BUTTON */}
            <LogoutButton></LogoutButton>
            <Link href="/statistics">
              <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                <BarChart3 size={20} />
                View Stats
              </button>
            </Link>

            <Link href="/new-transaction">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer">
                <PlusCircle size={20} />
                New Transaction
              </button>
            </Link>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {/* 1. Total Balance */}
          <div className="col-span-2 md:col-span-1 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Wallet size={18} />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Total Balance
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* REDUCIDO: text-2xl en móvil, text-3xl en PC (antes era 4xl) */}
                <h2 className="text-2xl md:text-2xl font-black text-slate-900 truncate tracking-tight">
                  {formatCurrency(totalBalance, "USD")}
                </h2>
                <div
                  className={`flex items-center text-xs font-bold mt-1 ${
                    totalBalanceThisMonth >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {totalBalanceThisMonth >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  <span>
                    {totalBalanceThisMonth >= 0 ? "+" : ""}
                    {totalBalanceThisMonth.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <BalanceChart
                  transactions={transactions}
                  isPositive={totalBalanceThisMonth >= 0}
                />
              </div>
            </div>
          </div>

          {/* 2. Incomes (Solo PC) */}
          <div className="hidden md:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ArrowUpCircle size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">
                Incomes
              </span>
            </div>
            {/* REDUCIDO: text-2xl para que respire mejor */}
            <h2 className="text-3xl font-bold text-emerald-600 truncate">
              {formatCurrency(totalIncomes, "USD")}
            </h2>
          </div>

          {/* 3. Expenses (Solo PC) */}
          <div className="hidden md:block bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ArrowDownCircle size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase">
                Expenses
              </span>
            </div>
            {/* REDUCIDO: text-2xl para coherencia visual */}
            <h2 className="text-3xl font-bold text-rose-600 truncate">
              {formatCurrency(totalExpenses, "USD")}
            </h2>
          </div>
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="text-slate-400" size={20} />
              <h3 className="font-semibold text-lg">Recent Activity</h3>
            </div>
            <Link href="/edit-transactions">
              <button className="text-indigo-600 text-sm font-medium hover:underline cursor-pointer">
                View all
              </button>
            </Link>
          </div>

          {/* 1. VISTA MOBILE: Se muestra en celulares, se oculta en PC (md:hidden) */}
          <div className="block md:hidden">
            {recentTransactions.length > 0 ? (
              <TransactionList transactions={recentTransactions} />
            ) : (
              <div className="p-10 text-center text-slate-400">
                No transactions.
              </div>
            )}
          </div>

          {/* 2. VISTA DESKTOP: Se oculta en celulares (hidden), se muestra en PC (md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentTransactions.map((t) => (
                  <tr
                    key={t.displayId}
                    className="hover:bg-slate-50/50 transition-colors"
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
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {t.typeName || t.type}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{t.date}</td>
                    <td
                      className={`px-6 py-4 text-right font-semibold ${
                        t.kind === "income"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.kind === "income" ? "+" : "-"}{" "}
                      {formatCurrency(t.amount, t.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
