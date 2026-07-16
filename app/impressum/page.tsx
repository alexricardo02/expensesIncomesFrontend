"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ImpressumPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/login" className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
          <ArrowLeft size={16} className="mr-2" /> {t("common.back")}
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold">{t("legal.impressumTitle")}</h1>

          <section className="space-y-1 text-sm text-slate-700">
            <h2 className="font-semibold text-slate-900">{t("legal.impressumSubtitle")}</h2>
            <p>{t("legal.name")}</p>
            <p>{t("legal.address")}</p>
            <p>{t("legal.city")}</p>
          </section>

          <section className="space-y-1 text-sm text-slate-700">
            <h2 className="font-semibold text-slate-900">{t("legal.contact")}</h2>
            <p>{t("legal.email")}</p>
          </section>

          <section className="space-y-1 text-sm text-slate-700">
            <h2 className="font-semibold text-slate-900">{t("legal.responsible")}</h2>
            <p>{t("legal.responsibleName")}</p>
          </section>

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            {t("legal.disclaimer")}
          </p>
        </div>
      </div>
    </main>
  );
}