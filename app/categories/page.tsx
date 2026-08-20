"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, ArrowLeft, Tag, PlusCircle, LayoutGrid } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";


interface Category {
  categoryId: number;
  name: string;
  type: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const API_URL = "/api/categories";

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(API_URL, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      toast.error("Error loading categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // WHY: Envolver la ejecución en una función asíncrona interna crea un límite explícito.
    // Esto evita que el linter asuma erróneamente que haremos una mutación de estado síncrona 
    // y bloquee el pipeline de CI/CD.
    const loadData = async () => {
      await fetchCategories();
    };
    loadData();
  }, [fetchCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(t("categories.nameRequired"));
      return;
    }

    const toastId = toast.loading("Creating category...");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), type }),
      });

      if (res.ok) {
        toast.success(t("categories.createSuccess"), { id: toastId });
        setName("");
        fetchCategories();
      } else {
        const err = await res.json();
        toast.error(err.message || t("categories.createError"), { id: toastId });
      }
    } catch (error) {
      toast.error("Connection error", { id: toastId });
    }
  };

  const handleDelete = async (id: number) => {
    const toastId = toast.loading(t("categories.deleteLoading"));

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success(t("categories.deleteSuccess"), { id: toastId });
        fetchCategories();
      } else {
        toast.error(t("categories.deleteError"), { id: toastId });
      }
    } catch (error) {
      toast.error("Connection error", { id: toastId });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">              <LayoutGrid className="text-emerald-600" /> My Categories
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your income and expense classes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PlusCircle size={18} className="text-emerald-500" /> New
            </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t("categories.nameLabel")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("categories.namePlaceholder")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    maxLength={30}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t("categories.typeLabel")}</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 cursor-pointer"
                >
                  {t("categories.save")}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">{t("categories.loading")}</div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Tag size={32} className="mx-auto mb-3 opacity-50" />
                  {t("categories.emptyState")}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">                  {categories.map((cat) => (
                  <li key={cat.categoryId} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">                      <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cat.type === "income" ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{cat.name}</p>                          <p className="text-xs text-slate-400 uppercase tracking-wider">{cat.type}</p>
                    </div>
                  </div>
                    <button
                      onClick={() => handleDelete(cat.categoryId)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Delete category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}