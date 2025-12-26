"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrar módulos de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function BalanceChart({ transactions, isPositive }: { transactions: any[], isPositive: boolean }) {
  // 1. Procesar datos: Ordenar por fecha y calcular saldo acumulado
  const sortedData = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Tomamos los últimos 10 puntos para el gráfico

  let currentBalance = 0;
  const labels = sortedData.map((t) => t.date);
  const dataPoints = sortedData.map((t) => {
    currentBalance += t.kind === "income" ? t.amount : -t.amount;
    return currentBalance;
  });

  const data = {
    labels,
    datasets: [
      {
        data: dataPoints,
        borderColor: isPositive ? "#10b981" : "#f43f5e",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 40);
          gradient.addColorStop(0, isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          return gradient;
        },
        fill: true,
        tension: 0.4, // Curvatura de la línea
        pointRadius: 0, // Ocultar puntos para look de sparkline
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div className="w-24 h-12 md:w-32 md:h-16">
      <Line data={data} options={options} />
    </div>
  );
}