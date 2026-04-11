import Image from "next/image";
import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PlusCircle,
  History,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import TransactionTable from "../components/TransactionTable";
import { formatCurrency } from "@/lib/utils";
import { cookies } from "next/headers";

async function getTransactions() {

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  try {
    const [incomesRes, expensesRes] = await Promise.all([
      fetch(process.env.NEXT_PUBLIC_API_URL_INCOMES!, { headers: {
          "Authorization": `Bearer ${token}`, // <--- AQUÍ ENVIAMOS LA LLAVE
          "Content-Type": "application/json",
        }, cache: "no-store" }),
      fetch(process.env.NEXT_PUBLIC_API_URL_EXPENSES!, { headers: {
          "Authorization": `Bearer ${token}`, // <--- Y AQUÍ TAMBIÉN
          "Content-Type": "application/json",
        }, cache: "no-store" })
    ]);

    if (!incomesRes.ok || !expensesRes.ok)
      throw new Error("Failed to fetch data");

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

/**
 * The Home component renders the main dashboard page, showing the user's total balance,
 * their recent income and expenses, and a list of their recent transactions.
 */
export default async function EditTransactionsPage() {
  const transactions = await getTransactions();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/"
          className="flex items-center text-slate-500 hover:text-slate-800 mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform cursor-pointer"
          />
          Back to Dashboard
        </Link>

        {/* RECENT ACTIVITY TABLE */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <TransactionTable initialTransactions={transactions} />
        </section>
      </div>
    </main>
  );
}
