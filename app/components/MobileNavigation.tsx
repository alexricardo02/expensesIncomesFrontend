"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  Menu,
  Settings,
  Tag,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LogoutButton from "./LogoutButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type MobileNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export default function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: MobileNavItem[] = [
    { href: "/", label: t("dashboard.title"), icon: <LayoutDashboard size={22} /> },
    { href: "/edit-transactions", label: t("dashboard.transactions"), icon: <ArrowLeftRight size={22} /> },
    { href: "/statistics", label: t("dashboard.reports"), icon: <BarChart3 size={22} /> },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(15,23,42,0.08)] md:hidden">
        <div className="grid grid-cols-4 gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-label={item.label}
                className={`flex min-h-12 min-w-12 items-center justify-center rounded-2xl transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex min-h-12 min-w-12 items-center justify-center rounded-2xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label={t("common.menu")}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu overlay"
          />

          <div className="absolute inset-x-0 bottom-0 rounded-t-4xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">FinanceTracker</p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Menu</h2>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-2 mb-4">
              <Link
                href="/categories"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Tag size={18} />
                {t("dashboard.categories")}
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings size={18} />
                {t("dashboard.settings")}
              </Link>
            </div>

            <div className="grid gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}