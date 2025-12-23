import Image from "next/image";
import React from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  PlusCircle, 
  History, 
  TrendingUp 
} from 'lucide-react';
import Link from "next/link";

// Mock data para previsualización (esto luego vendrá de tu API de Java)
const recentTransactions = [
  { id: 1, type: 'income', category: 'Salario', amount: 2500, date: '2025-12-20' },
  { id: 2, type: 'expense', category: 'Supermercado', amount: 85.50, date: '2025-12-21' },
  { id: 3, type: 'expense', category: 'Suscripción Netflix', amount: 15.99, date: '2025-12-22' },
  { id: 4, type: 'income', category: 'Freelance Design', amount: 450, date: '2025-12-22' },
];

async function getTransactions() {
  try {
    const [incomesRes, expensesRes] = await Promise.all([
      fetch(process.env.NEXT_PUBLIC_API_URL_INCOMES!, { cache: 'no-store' }),
      fetch(process.env.NEXT_PUBLIC_API_URL_EXPENSES!, { cache: 'no-store' })
    ]);

    if (!incomesRes.ok || !expensesRes.ok) throw new Error('Failed to fetch data');

    const incomes = await incomesRes.json();
    const expenses = await expensesRes.json();

    const combined = [
      ...incomes.map((i: any) => ({ 
        ...i, 
        kind: 'income',
        // Usamos i.id o i.incomeId según devuelva tu ResponseDTO
        displayId: `in-${i.id || i.incomeId}` 
      })),
      ...expenses.map((e: any) => ({ 
        ...e, 
        kind: 'expense',
        displayId: `ex-${e.id || e.expenseId}` 
      }))
    ];

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * The Home component renders the main dashboard page, showing the user's total balance,
 * their recent income and expenses, and a list of their recent transactions.
 */
export default async function Home() {
  const transactions = await getTransactions();

  const totalIncomes = transactions
    .filter(t => t.kind === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
  .filter(t=> t.kind === 'expense')
  .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalance = totalIncomes - totalExpenses;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyIncomesCount = transactions.filter(t => 
  t.kind === 'income' && t.date.startsWith(currentMonthStr)
).length;

const monthlyExpensesCount = transactions.filter(t => 
  t.kind === 'expense' && t.date.startsWith(currentMonthStr)
).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
            <p className="text-slate-500">Welcome back, here is your summary for today.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/new-transaction">
            <button className="cursor-pointer flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm">
              <PlusCircle size={20} />
              New Transaction
            </button>
            </Link>
          </div>
        </header>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Balance */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Wallet size={24} />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Balance</span>
            </div>
            <h2 className="text-3xl font-bold">{formatCurrency(totalBalance)}</h2>
            <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium">
              <TrendingUp size={16} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          {/* Incomes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ArrowUpCircle size={24} />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Incomes</span>
            </div>
            <h2 className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIncomes)}</h2>
            <p className="text-sm text-slate-500 mt-4">{monthlyIncomesCount} transactions this month</p>
          </div>

          {/* Expenses */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ArrowDownCircle size={24} />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Expenses</span>
            </div>
            <h2 className="text-3xl font-bold text-rose-600">{formatCurrency(totalExpenses)}</h2>
            <p className="text-sm text-slate-500 mt-4">{monthlyExpensesCount} transactions this month</p>
          </div>
        </div>
 
        {/* RECENT ACTIVITY TABLE */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="text-slate-400" size={20} />
              <h3 className="font-semibold text-lg">Recent Activity</h3>
            </div>
            <button className="text-indigo-600 text-sm font-medium hover:underline cursor-pointer">View all</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t.displayId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium">{t.typeName}</span>
                        <span className="block text-xs text-slate-400 uppercase">{t.kind}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{t.date}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${
                        t.kind === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.kind === 'income' ? '+' : '-'} {t.amount.toFixed(2)} {t.currency}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                      No transactions found. Try adding one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}