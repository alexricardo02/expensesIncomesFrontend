import { cookies } from "next/headers";
import StatisticsContent from "./StatisticsContent";
import { fetchWithRetry } from "@/lib/serverFetch";
export const maxDuration = 60;

// WHY: searchParams is used directly in the Page component, removing the need for a separate getStats() function.
export default async function Page({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return <StatisticsContent data={null} />;

  // Await searchParams in Next.js 15+
  const params = await searchParams;
  
  const queryArgs = new URLSearchParams({ size: '1000' }); 
  if (params.startDate) queryArgs.append('startDate', params.startDate);
  if (params.endDate) queryArgs.append('endDate', params.endDate);
  if (params.categoryId) queryArgs.append('categoryId', params.categoryId);
  if (params.paymentMethod) queryArgs.append('paymentMethod', params.paymentMethod);

  const queryStr = queryArgs.toString();

  let statsData = null;

  try {
    const [incRes, expRes, catRes] = await Promise.all([
      fetchWithRetry(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes?${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetchWithRetry(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses?${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetchWithRetry(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (incRes.coldStart || expRes.coldStart || catRes.coldStart) {
      return (
        <div className="p-8 mt-10 text-center text-amber-700 bg-amber-50 max-w-2xl mx-auto rounded-xl font-medium border border-amber-200">
           El servidor se está despertando. Recarga la página en 20 segundos.
        </div>
      );
    }

    const incomesData = incRes.ok ? incRes.data : { content: [] };
    const expensesData = expRes.ok ? expRes.data : { content: [] };
    const categoriesData = catRes.ok ? catRes.data : [];

    const rawIncomes = incomesData?.content || [];
    const rawExpenses = expensesData?.content || [];
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    const txType = params.type || "ALL";
    const processIncomes = txType === "ALL" || txType === "INCOME" ? rawIncomes.map((t: any) => ({...t, type: 'INCOME'})) : [];
    const processExpenses = txType === "ALL" || txType === "EXPENSE" ? rawExpenses.map((t: any) => ({...t, type: 'EXPENSE'})) : [];
    const allTransactions = [...processIncomes, ...processExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const totalIn = processIncomes.reduce((acc: number, curr: any) => acc + ((curr.amountPrimaryCurrency ?? curr.amount) || 0), 0);
    const totalOut = processExpenses.reduce((acc: number, curr: any) => acc + ((curr.amountPrimaryCurrency ?? curr.amount) || 0), 0);

    const expensesByCategory = processExpenses.reduce((acc: any, curr: any) => {
      const cat = curr.categoryName || "Other";
      acc[cat] = (acc[cat] || 0) + ((curr.amountPrimaryCurrency ?? curr.amount) || 0);
      return acc;
    }, {});

    const incomesByCategory = processIncomes.reduce((acc: any, curr: any) => {
      const cat = curr.categoryName || "Other";  
      acc[cat] = (acc[cat] || 0) + ((curr.amountPrimaryCurrency ?? curr.amount) || 0);
      return acc;
    }, {});

    const expensesByMethod = processExpenses.reduce((acc: any, curr: any) => {
      const method = (curr.paymentMethod || "OTHER").replace('_', ' '); 
      acc[method] = (acc[method] || 0) + ((curr.amountPrimaryCurrency ?? curr.amount) || 0);
      return acc;
    }, {});

    // Balance Over Time Calculation
    const balanceMap = new Map();
    [
      ...processIncomes, 
      ...processExpenses.map((e: any) => ({ ...e, amountPrimaryCurrency: -((e.amountPrimaryCurrency ?? e.amount) || 0) }))
    ].forEach(t => {
      const val = (t.amountPrimaryCurrency ?? t.amount) || 0;
      balanceMap.set(t.date, (balanceMap.get(t.date) || 0) + val);
    });

    // WHY: Using .reduce() instead of .map() with an external variable avoids React immutability 
    // linter errors and adheres to purely functional programming standards.
    const balanceOverTime = Array.from(balanceMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA as string).getTime() - new Date(dateB as string).getTime())
      .reduce((acc: { date: string, balance: number }[], [date, dailyNet]) => {
        const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
        acc.push({ 
          date: date as string, 
          balance: previousBalance + (dailyNet as number) 
        });
        return acc;
      }, []);

    // Daily Average Calculation
    const dates = [...processIncomes, ...processExpenses].map(t => new Date(t.date).getTime());
    const daysDiff = dates.length > 0 
      ? Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)))
      : 1;

    statsData = { 
      totalIn, totalOut, expensesByCategory, incomesByCategory, 
      expensesByMethod, balanceOverTime, dailyAverage: totalOut / daysDiff, categories, currentParams: params,
      transactions: allTransactions
    };

    return <StatisticsContent data={statsData} />;

  } catch (error) {
    // WHY: Printing the error to the console resolves the "unused variable" ESLint warning 
    // and is a good practice for debugging server-side failures in production.
    console.error("Failed to fetch aggregate statistics:", error);
  }

  return <StatisticsContent data={statsData} />;
}