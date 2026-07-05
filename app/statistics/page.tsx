import { cookies } from "next/headers";
import StatisticsContent from "./StatisticsContent";

async function getStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return { totalIn: 0, totalOut: 0, incomes: [], expenses: [] };

  try {
    const [incRes, expRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    if (!incRes.ok || !expRes.ok) {
      return { totalIn: 0, totalOut: 0, incomes: [], expenses: [] };
    }

    const incomesData = await incRes.json();
    const expensesData = await expRes.json();

    const rawIncomes = incomesData.content ? incomesData.content : [];
    const rawExpenses = expensesData.content ? expensesData.content : [];

    // 1. Normalizamos los ingresos
    const normalizedIncomes = rawIncomes.map((i: any) => ({
      id: i.incomeId || i.id,
      amount: i.amount,
      date: i.date,
      description: i.description,
      type: i.type,
      currency: i.currency,
      kind: "income",
      displayId: `in-${i.incomeId || i.id}`,
    }));

    // 2. Normalizamos los gastos
    const normalizedExpenses = rawExpenses.map((e: any) => ({
      id: e.expenseID || e.expenseId || e.id,
      amount: e.expenseAmount || e.amount,         // <-- Propiedad homologada
      date: e.expenseDate || e.date,               // <-- Propiedad homologada
      description: e.expenseDescription || e.description, 
      type: e.expenseType || e.type,               
      currency: e.currency,
      paymentMethod: e.paymentMethod || "OTHER",
      kind: "expense",
      displayId: `ex-${e.expenseID || e.expenseId || e.id}`,
    }));

    const expensesByMethod = normalizedExpenses.reduce((acc: any, curr: any) => {
      const method = curr.paymentMethod.replace('_', ' '); 
      acc[method] = (acc[method] || 0) + curr.amount;
      return acc;
    }, {});

    const totalIn = normalizedIncomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalOut = normalizedExpenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    // 4. Retornamos las listas limpias al frontend
    return { 
      totalIn, 
      totalOut, 
      incomes: normalizedIncomes, 
      expenses: normalizedExpenses,
      expensesByMethod
    };

  } catch (error) {
    console.error(error);
    return { totalIn: 0, totalOut: 0, incomes: [], expenses: [] };
  }
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return <StatisticsContent data={null} />;

  // Await searchParams in Next.js 15+
  const params = await searchParams;
  
  // WHY: Build query string dynamically matching Spring Boot @RequestParam names
  const queryArgs = new URLSearchParams({ size: '1000' }); 
  if (params.startDate) queryArgs.append('startDate', params.startDate);
  if (params.endDate) queryArgs.append('endDate', params.endDate);
  if (params.categoryId) queryArgs.append('categoryId', params.categoryId);
  if (params.paymentMethod) queryArgs.append('paymentMethod', params.paymentMethod);

  const queryStr = queryArgs.toString();

  try {
    const [incRes, expRes, catRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/incomes?${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses?${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store"
      })
    ]);

    const incomesData = incRes.ok ? await incRes.json() : { content: [] };
    const expensesData = expRes.ok ? await expRes.json() : { content: [] };
    const categories = catRes.ok ? await catRes.json() : [];

    const rawIncomes = incomesData.content || [];
    const rawExpenses = expensesData.content || [];

    // Filter by transaction type if specified in UI
    const txType = params.type || "ALL";
    const processIncomes = txType === "ALL" || txType === "INCOME" ? rawIncomes : [];
    const processExpenses = txType === "ALL" || txType === "EXPENSE" ? rawExpenses : [];

    const totalIn = processIncomes.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const totalOut = processExpenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

    // WHY: Data aggregation performed server-side reduces client-side JS payload and battery usage.
    const expensesByCategory = processExpenses.reduce((acc: any, curr: any) => {
      const cat = curr.type || "Other";
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {});

    const incomesByCategory = processIncomes.reduce((acc: any, curr: any) => {
      const cat = curr.type || "Other";
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
    }, {});

    const expensesByMethod = processExpenses.reduce((acc: any, curr: any) => {
      const method = (curr.paymentMethod || "OTHER").replace('_', ' '); 
      acc[method] = (acc[method] || 0) + curr.amount;
      return acc;
    }, {});

    // Balance Over Time Calculation
    const balanceMap = new Map();
    [...processIncomes, ...processExpenses.map((e: any) => ({ ...e, amount: -e.amount }))]
      .forEach(t => {
        balanceMap.set(t.date, (balanceMap.get(t.date) || 0) + t.amount);
      });

    let runningTotal = 0;
    const balanceOverTime = Array.from(balanceMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA as string).getTime() - new Date(dateB as string).getTime())
      .map(([date, dailyNet]) => {
        runningTotal += dailyNet as number;
        return { date, balance: runningTotal };
      });

    // Daily Average Calculation
    const dates = [...processIncomes, ...processExpenses].map(t => new Date(t.date).getTime());
    const daysDiff = dates.length > 0 
      ? Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)))
      : 1;

    return <StatisticsContent data={{ 
      totalIn, totalOut, expensesByCategory, incomesByCategory, 
      expensesByMethod, balanceOverTime, dailyAverage: totalOut / daysDiff, categories, currentParams: params 
    }} />;

  } catch (error) {
    return <StatisticsContent data={null} />;
  }
}