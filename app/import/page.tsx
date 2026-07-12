"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Row = Record<string, string>;
type KindMode = "signed" | "separate";
type DateFmt = "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
type CurrencyMode = "fixed" | "column";
type Delimiter = "auto" | "," | ";";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "ARS"];
const PAYMENT_METHODS = ["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"];

function parseDate(raw: string, fmt: DateFmt): string | null {
  const clean = raw.trim();
  if (!clean) return null;
  if (fmt === "YYYY-MM-DD") return /^\d{4}-\d{2}-\d{2}/.test(clean) ? clean.slice(0, 10) : null;
  const parts = clean.split(/[\/\-]/);
  if (parts.length !== 3) return null;
  const [a, b, y] = parts;
  const [dd, mm] = fmt === "DD/MM/YYYY" ? [a, b] : [b, a];
  if (!dd || !mm || !y) return null;
  return `${y.padStart(4, "20")}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function parseNumber(raw: string): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.replace(/\./g, "").replace(",", ".")) || parseFloat(raw);
  return isNaN(n) ? null : n;
}

export default function ImportPage() {
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [kindMode, setKindMode] = useState<KindMode>("signed");
  const [dateFmt, setDateFmt] = useState<DateFmt>("YYYY-MM-DD");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState("OTHER");
  const [delimiter, setDelimiter] = useState<Delimiter>("auto");
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("fixed");

  const [map, setMap] = useState<Record<string, string>>({
    date: "", description: "", category: "",
    amount: "", chargeCol: "", creditCol: "", currencyCol: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const forcedDelimiter = delimiter === "auto" ? undefined : delimiter;
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: "greedy",
      encoding: "UTF-8",
      delimiter: forcedDelimiter,
      delimitersToGuess: [",", ";", "\t", "|"],
      transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
      complete: (res) => {
        const fields = res.meta.fields || [];
        const data = res.data;

        if (!forcedDelimiter && fields.length === 1 && fields[0].includes(";")) {
          Papa.parse<Row>(file, {
            header: true,
            skipEmptyLines: "greedy",
            encoding: "UTF-8",
            delimiter: ";",
            transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
            complete: (res2) => {
              setHeaders(res2.meta.fields || []);
              setRows(res2.data);
              setResult(null);
            },
            error: () => toast.error("Could not parse CSV file"),
          });
          return;
        }

        setHeaders(fields);
        setRows(data);
        setResult(null);
      },
      error: () => toast.error("Could not parse CSV file"),
    });
  };

  const buildPayload = () => {
    const payload: any[] = [];
    const skippedRows: string[] = [];

    rows.forEach((r, idx) => {
      const dateRaw = map.date ? r[map.date] : "";
      const date = parseDate(dateRaw || "", dateFmt);
      const currency = currencyMode === "column" && map.currencyCol
        ? (r[map.currencyCol] || "").trim().toUpperCase()
        : defaultCurrency;
      if (!date) { skippedRows.push(`Row ${idx + 1}: invalid/missing date`); return; }

      let kind: "income" | "expense";
      let amount: number | null;

      if (currencyMode === "column" && !currency) {
        skippedRows.push(`Row ${idx + 1}: missing currency value`);
        return;
      }

      if (kindMode === "signed") {
        amount = map.amount ? parseNumber(r[map.amount]) : null;
        if (amount === null) { skippedRows.push(`Row ${idx + 1}: invalid amount`); return; }
        kind = amount < 0 ? "expense" : "income";
        amount = Math.abs(amount);
      } else {
        const charge = map.chargeCol ? parseNumber(r[map.chargeCol]) : null;
        const credit = map.creditCol ? parseNumber(r[map.creditCol]) : null;
        if (charge && charge > 0) { kind = "expense"; amount = charge; }
        else if (credit && credit > 0) { kind = "income"; amount = credit; }
        else { skippedRows.push(`Row ${idx + 1}: no amount in either column`); return; }
      }

      payload.push({
        kind,
        amount,
        currency,
        date,
        categoryName: map.category ? (r[map.category] || "Uncategorized") : "Uncategorized",
        description: map.description ? r[map.description] : "",
        paymentMethod: defaultPaymentMethod,
      });
    });

    return { payload, skippedRows };
  };

  const handleImport = async () => {
    const { payload, skippedRows } = buildPayload();
    if (payload.length === 0) {
      toast.error("No valid rows to import. Check your column mapping.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(`Importing ${payload.length} transactions...`);
    try {
      const res = await fetch("/api/imports/transactions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setResult({
          imported: data.imported,
          skipped: data.skipped + skippedRows.length,
          errors: [...skippedRows, ...(data.errors || [])],
        });
        toast.success(`Imported ${data.imported} transactions!`, { id: toastId });
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Import failed", { id: toastId });
      }
    } catch {
      toast.error("Connection error", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const HeaderSelect = ({ label, field }: { label: string; field: string }) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <select
        value={map[field]}
        onChange={(e) => setMap({ ...map, [field]: e.target.value })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
      >
        <option value="">-- none --</option>
        {headers.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <Toaster position="top-right" />
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.push("/")} className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
          <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><Upload size={20} className="text-indigo-600" /> Import Transactions</h1>
            <p className="text-slate-500 text-sm mt-1">Upload a CSV export from your bank and map its columns.</p>
          </div>

          <label className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-indigo-50 text-indigo-700 border-2 border-dashed border-indigo-200 rounded-xl text-sm font-semibold cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 transition-colors">
            <Upload size={18} />
            {rows.length > 0 ? "Change CSV file" : "Choose CSV file"}
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>

          {headers.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Column separator</label>
                  <select value={delimiter} onChange={(e) => setDelimiter(e.target.value as Delimiter)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                    <option value="auto">Auto-detect</option>
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Select before choosing the file.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount format</label>
                  <select value={kindMode} onChange={(e) => setKindMode(e.target.value as KindMode)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                    <option value="signed">Single column (negative = expense)</option>
                    <option value="separate">Two columns (charges / credits)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date format</label>
                  <select value={dateFmt} onChange={(e) => setDateFmt(e.target.value as DateFmt)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <HeaderSelect label="Date column" field="date" />
                <HeaderSelect label="Description column" field="description" />
                <HeaderSelect label="Category column" field="category" />
                {kindMode === "signed" ? (
                  <HeaderSelect label="Amount column" field="amount" />
                ) : (
                  <>
                    <HeaderSelect label="Charges (expense) column" field="chargeCol" />
                    <HeaderSelect label="Credits (income) column" field="creditCol" />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency source</label>
                  <div className="flex p-1 bg-slate-100 rounded-xl mb-2 w-fit">
                    <button type="button" onClick={() => setCurrencyMode("fixed")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${currencyMode === "fixed" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
                      Fixed currency
                    </button>
                    <button type="button" onClick={() => setCurrencyMode("column")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${currencyMode === "column" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
                      From column
                    </button>
                  </div>

                  {currencyMode === "fixed" ? (
                    <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select value={map.currencyCol} onChange={(e) => setMap({ ...map, currencyCol: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                        <option value="">-- select column --</option>
                        {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <div className="relative group shrink-0">
                        <AlertCircle size={18} className="text-amber-500 cursor-help" />
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-56 bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg z-10">
                          The selected column must contain official currency codes (e.g. USD, EUR, GBP, JPY, ARS).
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment method</label>
                  <select value={defaultPaymentMethod} onChange={(e) => setDefaultPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
                    {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-400">{rows.length} rows detected in file.</p>

              <button
                onClick={handleImport}
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Importing..." : `Import ${rows.length} rows`}
              </button>
            </>
          )}

          {result && (
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                <CheckCircle2 size={18} /> {result.imported} imported
              </div>
              {result.skipped > 0 && (
                <div className="text-amber-700 bg-amber-50 rounded-xl p-3 text-sm space-y-1">
                  <div className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} /> {result.skipped} skipped</div>
                  <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                    {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}