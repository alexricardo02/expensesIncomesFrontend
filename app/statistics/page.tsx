'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function StatisticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [incRes, expRes] = await Promise.all([
          fetch('http://localhost:8080/api/incomes'),
          fetch('http://localhost:8080/api/expenses')
        ]);
        const incomes = await incRes.json();
        const expenses = await expRes.json();

        // Calculate totals for the Pie Chart
        const totalIn = incomes.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        const totalOut = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);

        setData({ totalIn, totalOut });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pieData = {
    labels: ['Incomes', 'Expenses'],
    datasets: [
      {
        data: data ? [data.totalIn, data.totalOut] : [0, 0],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) return <div className="p-8 text-center">Loading statistics...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">Financial Analysis</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PIE CHART CARD */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <PieIcon size={20} className="text-indigo-500" /> Income vs Expenses
            </h3>
            <div className="w-full max-w-[300px]">
              <Pie data={pieData} options={{ maintainAspectRatio: true }} />
            </div>
          </div>

          {/* SUMMARY INFO CARD */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 justify-center flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-emerald-50 rounded-2xl">
                <span className="text-emerald-700 font-medium">Total Incomes</span>
                <span className="font-bold text-emerald-600">${data?.totalIn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-4 bg-rose-50 rounded-2xl">
                <span className="text-rose-700 font-medium">Total Expenses</span>
                <span className="font-bold text-rose-600">${data?.totalOut.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}