"use client";

import React, { useState, useEffect } from "react";
import { Trash2, ArrowLeft, Tag, PlusCircle, LayoutGrid } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

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

  // Smart URL: Tries to use an environment variable; if it doesn't exist, it adapts the incomes URL
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL_CATEGORIES ||
    process.env.NEXT_PUBLIC_API_URL_INCOMES?.replace('/incomes', '/categories') ||
    "http://localhost:8080/api/categories";

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_URL, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      toast.error("Error loading categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
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
        toast.success("Category created!", { id: toastId });
        setName(""); // Clear the input
        fetchCategories(); // Reload the list
      } else {
        const err = await res.json();
        toast.error(err.message || "Could not create", { id: toastId });
      }
    } catch (error) {
      toast.error("Connection error", { id: toastId });
    }
  };

  const handleDelete = async (id: number) => {
    const toastId = toast.loading("Deleting...");

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Category deleted", { id: toastId });
        fetchCategories(); // Reload the list
      } else {
        toast.error("Could not delete", { id: toastId });
      }
    } catch (error) {
      toast.error("Connection error", { id: toastId });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header and Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="text-indigo-600" /> My Categories
            </h1>
            <p className="text-slate-500 text-sm">Manage your income and expense classes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT PANEL: FORM */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-indigo-500" /> New
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Food, Salary..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    maxLength={30}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                >
                  Save Category
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT PANEL: CATEGORIES LIST */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Tag size={32} className="mx-auto mb-3 opacity-50" />
                  You have no custom categories.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <li key={cat.categoryId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${cat.type === "income" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <div>
                          <p className="font-bold text-slate-800">{cat.name}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-wider">{cat.type}</p>
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