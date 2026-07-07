"use client";
import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import toast from "react-hot-toast";

export default function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    setOpen(false);
    setLoading(true);
    const toastId = toast.loading(`Generating ${format.toUpperCase()}...`);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
      const res = await fetch(`${baseUrl}/exports/transactions?format=${format}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded!", { id: toastId });
    } catch {
      toast.error("Could not export data", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold shadow-sm cursor-pointer"
      >
        <Download size={18} /> Export
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden">
          <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer">
            <FileText size={16} /> CSV
          </button>
          <button onClick={() => handleExport("xlsx")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={() => handleExport("pdf")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer">
            <FileType size={16} /> PDF
          </button>
        </div>
      )}
    </div>
  );
}