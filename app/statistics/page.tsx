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

    const incomes = incomesData.content ? incomesData.content : [];
    const expenses = expensesData.content ? expensesData.content : [];

    const totalIn = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalOut = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    return { totalIn, totalOut, incomes, expenses };
  } catch (error) {
    console.error(error);
    return { totalIn: 0, totalOut: 0, incomes: [], expenses: [] };
  }
}

export default async function Page() {
  const data = await getStats();
  return <StatisticsContent data={data} />;
}