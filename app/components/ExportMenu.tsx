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

                // Abrimos la ventana nativa "Guardar como..."
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

                // Escribimos los bytes del archivo directamente en la ruta elegida por el usuario
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();

                toast.success("Downloaded!", { id: toastId });
            }
            // 🔄 OPCIÓN B: Fallback tradicional para navegadores sin soporte completo (Safari / Firefox)
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
            // 💡 Detalle de UX: Si el usuario presiona "Cancelar" en la ventana de Guardar Como,
            // la API arroja un error de tipo 'AbortError'. Lo capturamos para que no muestre un toast de error falso.
            if (error.name === "AbortError") {
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
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-semibold shadow-sm cursor-pointer"
            >
                <Download size={18} /> {t("common.export")}
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