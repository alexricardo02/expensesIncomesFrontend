"use client";
import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ExportMenu() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
        setOpen(false);
        setLoading(true);
        const toastId = toast.loading(t("common.exporting"));

        try {
            const res = await fetch(`/api/exports/transactions?format=${format}`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();

            if ("showSaveFilePicker" in window) {
                const mimeTypes: Record<string, string> = {
                    csv: "text/csv",
                    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    pdf: "application/pdf",
                };

                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: `transactions.${format}`,
                    types: [
                        {
                            description: `${format.toUpperCase()} Document`,
                            accept: {
                                [mimeTypes[format]]: [`.${format}`],
                            },
                        },
                    ],
                });

                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                toast.success("Downloaded!", { id: toastId });
            }
            // WHY: Use the anchor-download fallback for browsers that do not support the File System Access API.
            else {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `transactions.${format}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);

                toast.success("Downloaded!", { id: toastId });
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                // WHY: Treat AbortError as user cancelation so we do not show a false failure toast.
                toast.dismiss(toastId);
            } else {
                console.error("Error exporting:", error);
                toast.error(t("common.exportFailed"), { id: toastId });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors font-semibold shadow-sm cursor-pointer"
            >
                <Download size={18} /> {t("common.export")}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-10 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                    <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300">
                        <FileText size={16} /> CSV
                    </button>
                    <button onClick={() => handleExport("xlsx")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300">
                        <FileSpreadsheet size={16} /> Excel
                    </button>
                    <button onClick={() => handleExport("pdf")} className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:text-slate-300">
                        <FileType size={16} /> PDF
                    </button>
                </div>
            )}
        </div>
    );
}