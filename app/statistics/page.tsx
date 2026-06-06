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
      kind: "expense",
      displayId: `ex-${e.expenseID || e.expenseId || e.id}`,
    }));

    const totalIn = normalizedIncomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalOut = normalizedExpenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    // 4. Retornamos las listas limpias al frontend
    return { 
      totalIn, 
      totalOut, 
      incomes: normalizedIncomes, 
      expenses: normalizedExpenses 
    };

  } catch (error) {
    console.error(error);
    return { totalIn: 0, totalOut: 0, incomes: [], expenses: [] };
  }
}

export default async function Page() {
  const data = await getStats();
  return <StatisticsContent data={data} />;
}