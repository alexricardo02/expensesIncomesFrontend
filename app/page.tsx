import LogoutButton from "./components/LogoutButton";
import {
  PlusCircle,
  History,
  BarChart3,
  Tag,
  Settings,
  Upload,
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  Utensils,
  MonitorPlay,
  Gift
} from "lucide-react";
import Link from "next/link";
import TransactionList from "./components/TransactionList";
import { cookies } from "next/headers";
import { formatCurrency } from "@/lib/utils";
import DashboardKPIs from "./components/DashboardKPIs";
import { fetchWithRetry } from "@/lib/serverFetch";
import { redirect } from "next/navigation";
import { getTranslation, type Locale } from "@/lib/i18n/translations";
export const maxDuration = 60;


async function getTransactions(): Promise<any[] | { transactions: any[]; coldStart: boolean }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return [];

  try {

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

    const [incomesRes, expensesRes] = await Promise.all([
      fetchWithRetry(`${baseUrl}/incomes?size=100`, { headers: { Authorization: `Bearer ${token}` } }),
      fetchWithRetry(`${baseUrl}/expenses?size=100`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (incomesRes.coldStart || expensesRes.coldStart) {
      return { transactions: [], coldStart: true };
    }
    const incomesData = incomesRes.ok ? incomesRes.data : { content: [] };
    const expensesData = expensesRes.ok ? expensesRes.data : { content: [] };
    const rawIncomes = Array.isArray(incomesData) ? incomesData : (incomesData?.content || []);
    const rawExpenses = Array.isArray(expensesData) ? expensesData : (expensesData?.content || []);

    const combined = [
      ...rawIncomes.map((i: any) => ({
        id: i.incomeId || i.id,
        amount: Number(i.amount) || 0,
        date: i.date || "1970-01-01",
        description: i.description || "",
        typeName: i.categoryName || "Uncategorized", 
        type: i.categoryName || "Uncategorized",
        currency: i.currency || "USD",
        kind: "income",
        displayId: `in-${i.incomeId || i.id || Math.random()}`,
        amountPrimary: Number(i.amountPrimaryCurrency ?? i.amount) || 0,
        primaryCurrency: i.primaryCurrency || "USD",
      })),
      ...rawExpenses.map((e: any) => ({
        id: e.id || e.expenseId,
        amount: Number(e.amount) || 0,
        date: e.date || "1970-01-01",
        description: e.description || "",
        typeName: e.categoryName || "Uncategorized",
        type: e.categoryName || "Uncategorized",
        currency: e.currency || "USD",
        kind: "expense",
        displayId: `ex-${e.id || e.expenseId || Math.random()}`,
        amountPrimary: Number(e.amountPrimaryCurrency ?? e.amount) || 0,
        primaryCurrency: e.primaryCurrency || "USD",
      })),
    ];

    return combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    return [];
  }
}


/**
 * The Home component renders the main dashboard page, showing the user's total balance,
 * their recent income and expenses, and a list of their recent transactions.
 */
export default async function Home() {
  const result = await getTransactions();

  const transactions = Array.isArray(result) 
    ? result 
    : (result?.transactions || []);

  const isColdStart = !Array.isArray(result) && (result as any)?.coldStart;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const localeCookie = cookieStore.get("locale")?.value;
  const locale = (localeCookie === "es" || localeCookie === "de" ? localeCookie : "en") as Locale;
  const translate = (path: string, params?: Record<string, string | number>) => {
    const translated = getTranslation(path, locale, params);
    return typeof translated === "string" ? translated : String(translated);
  };

  if (!authToken) {
    redirect("/login");
  }
  
  const userProfileCookie = cookieStore.get("user_profile")?.value;
  let usernameToShow = translate("common.guest");

  if (userProfileCookie) {
    try {
      const profile = JSON.parse(userProfileCookie);
      usernameToShow = profile.username;
    } catch (e) {
      console.error("Error al parsear el perfil", e);
    }
  }

  const recentTransactions = transactions.slice(0, 10);

  const getCategoryIcon = (kind: string, type: string) => {
    if (kind === "income") return <Wallet className="text-emerald-500" size={20} />;
    const t = type.toLowerCase();
    if (t.includes("food")) return <Utensils className="text-slate-400" size={20} />;
    if (t.includes("subscription")) return <MonitorPlay className="text-slate-400" size={20} />;
    if (t.includes("gift")) return <Gift className="text-slate-400" size={20} />;
    return <CreditCard className="text-slate-400" size={20} />;
  };

  return (
    // WHY: Cambiamos a un flex layout con 'h-screen' y 'overflow-hidden' para fijar la sidebar a la izquierda y permitir que solo el contenido principal haga scroll.
    <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-slate-50 px-4 py-8 justify-between shrink-0 h-screen">
        <div className="space-y-8">
          <div className="px-4 font-black text-2xl text-slate-900 tracking-tighter">
            Finance<span className="text-emerald-600">Tracker</span>
          </div>

          <nav className="space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-slate-200/50 text-slate-900 rounded-xl font-semibold transition-colors">
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
            <Link href="/edit-transactions" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <ArrowLeftRight size={20} />
              Transactions
            </Link>
            <Link href="/categories" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <Tag size={20} />
              Categories
            </Link>
            <Link href="/statistics" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <BarChart3 size={20} />
              Reports
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <Settings size={20} />
              Settings
            </Link>
          </nav>
        </div>
        
        <div className="px-4">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* HEADER SECTION */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {translate("dashboard.title")}
              </h1>
              <p className="text-slate-500 text-sm">
                  {translate("dashboard.welcome", { name: usernameToShow })}
                  {translate("dashboard.summary")}
              </p>
            </div>

            {/* WHY: Las acciones secundarias se movieron a la Sidebar, dejando la cabecera limpia solo para la inserción de datos (Import/New). */}
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <div className="flex flex-col md:flex-row gap-3 md:items-center w-full">
                <Link href="/import" className="w-full md:w-auto">
                  <button className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors font-semibold shadow-sm cursor-pointer">
                    <Upload size={20} />
                    {translate("common.import")}
                  </button>
                </Link>

                <Link href="/new-transaction" className="w-full md:w-auto">
                  <button className="flex items-center justify-center w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 cursor-pointer">
                    <PlusCircle size={20} />
                    {translate("common.newTransaction")}
                  </button>
                </Link>
              </div>
            </div>
          </header>

          <DashboardKPIs transactions={transactions} />

          {isColdStart && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 mt-6 rounded-xl text-center font-medium shadow-sm">
              {translate("dashboard.coldStart")}
            </div>
          )}

          {/* RECENT ACTIVITY TABLE */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="text-slate-400" size={20} />
                <h3 className="font-semibold text-lg">{translate("dashboard.recentActivity")}</h3>
              </div>
              <Link href="/edit-transactions">
                <button className="text-indigo-600 text-sm font-medium hover:underline cursor-pointer">
                  {translate("common.viewAll")}
                </button>
              </Link>
            </div>

            <div className="block md:hidden">
              {recentTransactions.length > 0 ? (
                <TransactionList transactions={recentTransactions} />
              ) : (
                <div className="p-10 text-center text-slate-400">
                  {translate("common.noTransactions")}
                </div>
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">{translate("common.type")}</th>
                    <th className="px-6 py-4 font-medium">{translate("common.category")}</th>
                    <th className="px-6 py-4 font-medium">{translate("common.date")}</th>
                    <th className="px-6 py-4 font-medium text-right">{translate("common.amount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentTransactions.map((t) => (
                    <tr
                      key={t.displayId}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        {getCategoryIcon(t.kind, t.type)}
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.kind === "income"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                            }`}
                        >
                          {t.kind}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {t.type}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{t.date}</td>
                      <td
                        className={`px-6 py-4 text-right font-semibold ${t.kind === "income"
                            ? "text-emerald-600"
                            : "text-rose-600"
                          }`}
                      >
                        {t.kind === "income" ? "+" : "-"}{" "}
                        {formatCurrency(t.amount, t.currency, false, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
