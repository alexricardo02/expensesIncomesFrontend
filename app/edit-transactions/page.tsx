import {
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import TransactionTable from "../components/TransactionTable";
import ExportMenu from "../components/ExportMenu";
import { cookies } from "next/headers"
import { getUsdArsRate } from "@/lib/exchangeRate";
import { fetchWithRetry } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { getTranslation, type Locale } from "@/lib/i18n/translations";

export const maxDuration = 60;

async function getTransactions(): Promise<any[] | { coldStart: boolean }> {

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  try {

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
    
    const [incomesRes, expensesRes] = await Promise.all([
      fetchWithRetry(`${baseUrl}/incomes?size=1000`, { 
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      }),
      fetchWithRetry(`${baseUrl}/expenses?size=1000`, { 
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      })
    ]);

if (incomesRes.coldStart || expensesRes.coldStart) return { coldStart: true };

    const incomesData = incomesRes.ok ? incomesRes.data : { content: [] };
    const expensesData = expensesRes.ok ? expensesRes.data : { content: [] };

    const incomes = Array.isArray(incomesData) ? incomesData : (incomesData?.content || []);
    const expenses = Array.isArray(expensesData) ? expensesData : (expensesData?.content || []);

    const combined = [
      ...incomes.map((i: any) => ({
        ...i,
        kind: "income",
        // Usamos i.id o i.incomeId según devuelva tu ResponseDTO
        displayId: `in-${i.id || i.incomeId}`,
        typeName: i.categoryName || "Uncategorized", // ADD THIS
        type: i.categoryName || "Uncategorized",
      })),
      ...expenses.map((e: any) => ({
        ...e,
        kind: "expense",
        displayId: `ex-${e.id || e.expenseId}`,
        typeName: e.categoryName || "Uncategorized", // ADD THIS
        type: e.categoryName || "Uncategorized",
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

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;
  const locale = (localeCookie === "es" || localeCookie === "de" ? localeCookie : "en") as Locale;
  const t = (path: string, params?: Record<string, string | number>) => {
    const translated = getTranslation(path, locale, params);
    return typeof translated === "string" ? translated : String(translated);
  };

  if (!cookieStore.get("auth_token")?.value) redirect("/login");
  const result = await getTransactions();
  const transactions = Array.isArray(result) ? result : [];
  const isColdStart = !Array.isArray(result) && result?.coldStart;

  const rate = await getUsdArsRate();
  
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center text-slate-500 hover:text-slate-800 group transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft
              size={20}
              className="mr-2 group-hover:-translate-x-1 transition-transform cursor-pointer"
            />
            {t("common.backToDashboard")}
          </Link>
          <ExportMenu />
        </div>

        {/* RECENT ACTIVITY TABLE */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          {isColdStart ? (
            <div className="p-10 text-center text-amber-700 bg-amber-50 font-medium">
              {t("statistics.coldStart")}
            </div>
          ) : (
            <TransactionTable initialTransactions={transactions} />
          )}
        </section>
      </div>
    </main>
  );
}
